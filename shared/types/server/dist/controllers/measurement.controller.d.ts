import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getMyMeasurements: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMeasurementById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createMeasurement: (req: AuthRequest, res: Response) => Promise<void>;
export declare const adviseMeasurements: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateMeasurement: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteMeasurement: (req: AuthRequest, res: Response) => Promise<void>;
export declare const startAIMeasurementSession: (req: AuthRequest, res: Response) => Promise<void>;
export declare const processAIMeasurement: (req: AuthRequest, res: Response) => Promise<void>;
export declare const saveMeasurementsFromSession: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=measurement.controller.d.ts.map