import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ChatMessage } from '../models/ChatMessage';
import { ChatConversation } from '../models/ChatConversation';
import { notificationService } from '../services/notification.service';

interface SocketUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export const initSocketIO = (httpServer: Server): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: config.clientUrl,
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
      const decoded = jwt.verify(token, config.jwtSecret) as SocketUser;
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user: SocketUser = socket.data.user;
    console.log(`🔌 Socket connected: ${user.firstName} ${user.lastName} (${user.role})`);

    // Join user's personal notification room
    socket.join(`user:${user.id}`);

    // Join a conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`📨 ${user.firstName} joined conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Send message via socket
    socket.on('send_message', async (data: {
      conversationId: string;
      content: string;
      type?: string;
      designRef?: string;
    }) => {
      try {
        const conversation = await ChatConversation.findById(data.conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(p => p.toString() === user.id);
        if (!isParticipant) return;

        const message = await ChatMessage.create({
          conversationId: data.conversationId,
          senderId: user.id,
          senderRole: user.role,
          content: data.content,
          type: data.type || 'text',
          designRef: data.designRef,
        });

        await ChatConversation.findByIdAndUpdate(data.conversationId, {
          lastMessage: data.content.substring(0, 100),
          lastMessageAt: new Date(),
        });

        const populated = await ChatMessage.findById(message._id)
          .populate('senderId', 'firstName lastName avatar role');

        // Broadcast to all in the conversation room
        io.to(`conversation:${data.conversationId}`).emit('new_message', populated);

        // Notify the other participant
        const otherParticipantId = conversation.participants.find(p => p.toString() !== user.id);
        if (otherParticipantId) {
          await notificationService.create({
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
      } catch (error) {
        console.error('Socket message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing', {
        userId: user.id,
        firstName: user.firstName,
        isTyping: data.isTyping,
      });
    });

    // Mark messages as read
    socket.on('mark_read', async (conversationId: string) => {
      await ChatMessage.updateMany(
        { conversationId, senderId: { $ne: user.id }, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      socket.to(`conversation:${conversationId}`).emit('messages_read', { userId: user.id });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${user.firstName} ${user.lastName}`);
    });
  });

  return io;
};
