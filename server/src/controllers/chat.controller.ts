import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ChatConversation } from '../models/ChatConversation';
import { ChatMessage } from '../models/ChatMessage';
import { Order } from '../models/Order';

export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const isParticipant =
      order.customerId.toString() === req.user!.id ||
      order.tailorId.toString() === req.user!.id ||
      req.user!.role === 'admin';

    if (!isParticipant) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const conversation = await ChatConversation.findOne({ orderId })
      .populate('customerId', 'firstName lastName avatar')
      .populate('tailorId', 'firstName lastName avatar');

    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch conversation.' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { page = '1', limit = '50' } = req.query as Record<string, string>;

    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    const isParticipant = conversation.participants.some(p => p.toString() === req.user!.id);
    if (!isParticipant && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [messages, total] = await Promise.all([
      ChatMessage.find({ conversationId })
        .populate('senderId', 'firstName lastName avatar role')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      ChatMessage.countDocuments({ conversationId }),
    ]);

    // Mark messages as read
    await ChatMessage.updateMany(
      { conversationId, senderId: { $ne: req.user!.id }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text', designRef } = req.body;

    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    const isParticipant = conversation.participants.some(p => p.toString() === req.user!.id);
    if (!isParticipant) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const message = await ChatMessage.create({
      conversationId,
      senderId: req.user!.id,
      senderRole: req.user!.role,
      content,
      type,
      designRef,
    });

    await ChatConversation.findByIdAndUpdate(conversationId, {
      lastMessage: content.substring(0, 100),
      lastMessageAt: new Date(),
    });

    const populated = await ChatMessage.findById(message._id)
      .populate('senderId', 'firstName lastName avatar role');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};

export const getMyConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversations = await ChatConversation.find({
      participants: req.user!.id,
      isActive: true,
    })
      .populate('orderId', 'title status')
      .populate('customerId', 'firstName lastName avatar')
      .populate('tailorId', 'firstName lastName avatar')
      .sort({ lastMessageAt: -1 })
      .limit(20);

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch conversations.' });
  }
};
