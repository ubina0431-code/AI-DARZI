"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketIO = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const ChatMessage_1 = require("../models/ChatMessage");
const ChatConversation_1 = require("../models/ChatConversation");
const notification_service_1 = require("../services/notification.service");
const initSocketIO = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: config_1.config.clientUrl,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    // JWT authentication middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            socket.data.user = decoded;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.data.user;
        console.log(`🔌 Socket connected: ${user.firstName} ${user.lastName} (${user.role})`);
        // Join user's personal notification room
        socket.join(`user:${user.id}`);
        // Join a conversation room
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
            console.log(`📨 ${user.firstName} joined conversation ${conversationId}`);
        });
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
        });
        // Send message via socket
        socket.on('send_message', async (data) => {
            try {
                const conversation = await ChatConversation_1.ChatConversation.findById(data.conversationId);
                if (!conversation)
                    return;
                const isParticipant = conversation.participants.some(p => p.toString() === user.id);
                if (!isParticipant)
                    return;
                const message = await ChatMessage_1.ChatMessage.create({
                    conversationId: data.conversationId,
                    senderId: user.id,
                    senderRole: user.role,
                    content: data.content,
                    type: data.type || 'text',
                    designRef: data.designRef,
                });
                await ChatConversation_1.ChatConversation.findByIdAndUpdate(data.conversationId, {
                    lastMessage: data.content.substring(0, 100),
                    lastMessageAt: new Date(),
                });
                const populated = await ChatMessage_1.ChatMessage.findById(message._id)
                    .populate('senderId', 'firstName lastName avatar role');
                // Broadcast to all in the conversation room
                io.to(`conversation:${data.conversationId}`).emit('new_message', populated);
                // Notify the other participant
                const otherParticipantId = conversation.participants.find(p => p.toString() !== user.id);
                if (otherParticipantId) {
                    await notification_service_1.notificationService.create({
                        userId: otherParticipantId.toString(),
                        type: 'chat_message',
                        title: `New message from ${user.firstName}`,
                        message: data.content.substring(0, 80),
                        orderId: conversation.orderId.toString(),
                    });
                    io.to(`user:${otherParticipantId}`).emit('notification', {
                        type: 'chat_message',
                        message: `New message from ${user.firstName}`,
                    });
                }
            }
            catch (error) {
                console.error('Socket message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        // Typing indicator
        socket.on('typing', (data) => {
            socket.to(`conversation:${data.conversationId}`).emit('typing', {
                userId: user.id,
                firstName: user.firstName,
                isTyping: data.isTyping,
            });
        });
        // Mark messages as read
        socket.on('mark_read', async (conversationId) => {
            await ChatMessage_1.ChatMessage.updateMany({ conversationId, senderId: { $ne: user.id }, isRead: false }, { isRead: true, readAt: new Date() });
            socket.to(`conversation:${conversationId}`).emit('messages_read', { userId: user.id });
        });
        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${user.firstName} ${user.lastName}`);
        });
    });
    return io;
};
exports.initSocketIO = initSocketIO;
//# sourceMappingURL=socket.server.js.map