import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getConversation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMessages: (req: AuthRequest, res: Response) => Promise<void>;
export declare const sendMessage: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyConversations: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=chat.controller.d.ts.map