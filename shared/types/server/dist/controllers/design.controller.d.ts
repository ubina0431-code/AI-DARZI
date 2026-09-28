import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getMyDesigns: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getDesignById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const generateDesignFromPrompt: (req: AuthRequest, res: Response) => Promise<void>;
export declare const refineDesign: (req: AuthRequest, res: Response) => Promise<void>;
export declare const saveDesign: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteDesign: (req: AuthRequest, res: Response) => Promise<void>;
export declare const duplicateDesign: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createManualDesign: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=design.controller.d.ts.map