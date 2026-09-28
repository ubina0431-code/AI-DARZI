import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getDashboardStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const suspendUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const reactivateUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const verifyTailor: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPendingTailors: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAdminOrders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getComplaints: (req: AuthRequest, res: Response) => Promise<void>;
export declare const resolveComplaint: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAuditLogs: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map