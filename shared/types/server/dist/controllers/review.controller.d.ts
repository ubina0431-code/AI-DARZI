import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createReview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTailorReviews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const respondToReview: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=review.controller.d.ts.map