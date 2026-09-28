import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getTailors: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTailorById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateTailorProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyTailorProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleFavorite: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCities: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=tailor.controller.d.ts.map