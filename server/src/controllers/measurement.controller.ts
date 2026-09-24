import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MeasurementProfile } from '../models/MeasurementProfile';
import { MeasurementSession } from '../models/MeasurementSession';
import { geminiService } from '../ai/gemini.service';
import path from 'path';
import fs from 'fs';

export const getMyMeasurements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profiles = await MeasurementProfile.find({ customerId: req.user!.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch measurements.' });
  }
};

export const getMeasurementById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await MeasurementProfile.findOne({ _id: req.params.id, customerId: req.user!.id });
    if (!profile) {
      res.status(404).json({ success: false, message: 'Measurement profile not found.' });
      return;
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch measurement.' });
  }
};

export const createMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, measurements, unit, notes, gender, garment } = req.body;
    const profile = await MeasurementProfile.create({
      customerId: req.user!.id,
      gender,
      garment,
      name: name || 'My Measurements',
      measurements: measurements || {},
      unit: unit || 'inches',
      notes,
      isVerified: true,
      verifiedAt: new Date(),
    });
    res.status(201).json({ success: true, message: 'Measurements saved.', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save measurements.' });
  }
};

export const adviseMeasurements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { height, weight, gender, garment } = req.body;
    if (!Number.isFinite(Number(height)) || !Number.isFinite(Number(weight)) || Number(height) <= 0 || Number(weight) <= 0) {
      res.status(400).json({ success: false, message: 'Height and weight must be positive numbers.' });
      return;
    }
    if (!['male', 'female'].includes(gender)) {
      res.status(400).json({ success: false, message: 'Gender must be male or female.' });
      return;
    }

    const result = await geminiService.adviseMeasurements(Number(height), Number(weight), gender, garment || 'suit');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Measurement advisor error:', error);
    res.status(500).json({ success: false, message: 'Unable to generate measurement advice.' });
  }
};

export const updateMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await MeasurementProfile.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user!.id },
      { ...req.body, version: { $inc: 1 } },
      { new: true, runValidators: true }
    );
    if (!profile) {
      res.status(404).json({ success: false, message: 'Measurement profile not found.' });
      return;
    }
    res.json({ success: true, message: 'Measurements updated.', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update measurements.' });
  }
};

export const deleteMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await MeasurementProfile.findOneAndDelete({ _id: req.params.id, customerId: req.user!.id });
    if (!profile) {
      res.status(404).json({ success: false, message: 'Measurement profile not found.' });
      return;
    }
    res.json({ success: true, message: 'Measurement profile deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete measurement.' });
  }
};

export const startAIMeasurementSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { privacyAcknowledged } = req.body;
    if (!privacyAcknowledged) {
      res.status(400).json({ success: false, message: 'Privacy acknowledgment is required.' });
      return;
    }
    const session = await MeasurementSession.create({
      customerId: req.user!.id,
      status: 'uploading',
      privacyAcknowledged: true,
    });
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to start measurement session.' });
  }
};

export const processAIMeasurement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { description } = req.body;

    const session = await MeasurementSession.findOne({ _id: sessionId, customerId: req.user!.id });
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found.' });
      return;
    }

    // Collect uploaded file paths
    const files = req.files as Express.Multer.File[] || [];
    const imagePaths = files.map(f => f.path);

    await MeasurementSession.findByIdAndUpdate(sessionId, {
      status: 'processing',
      uploadedImages: imagePaths,
    });

    // Use Gemini to estimate measurements from description
    const bodyDescription = description || 'Standard adult body measurements requested';
    const result = await geminiService.extractMeasurementsFromDescription(bodyDescription);

    await MeasurementSession.findByIdAndUpdate(sessionId, {
      status: 'completed',
      aiEstimates: result.estimates,
      aiConfidence: result.confidence,
      aiNotes: result.notes,
    });

    res.json({
      success: true,
      message: 'AI measurement estimation complete. Please review and correct values.',
      data: {
        sessionId,
        estimates: result.estimates,
        confidence: result.confidence,
        notes: result.notes,
        disclaimer: 'These are AI estimates only. Please verify all measurements before placing an order.',
      },
    });
  } catch (error) {
    console.error('AI measurement error:', error);
    res.status(500).json({ success: false, message: 'AI measurement processing failed. Please enter measurements manually.' });
  }
};

export const saveMeasurementsFromSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { measurements, name, unit, deleteImages = true } = req.body;

    const session = await MeasurementSession.findOne({ _id: sessionId, customerId: req.user!.id });
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found.' });
      return;
    }

    const profile = await MeasurementProfile.create({
      customerId: req.user!.id,
      name: name || 'AI Assisted Measurements',
      measurements,
      unit: unit || 'inches',
      aiGenerated: true,
      aiSessionId: session._id,
      isVerified: true,
      verifiedAt: new Date(),
    });

    // Privacy: delete temporary measurement images
    if (deleteImages && session.uploadedImages?.length) {
      for (const imgPath of session.uploadedImages) {
        try {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        } catch (e) { /* silent */ }
      }
      await MeasurementSession.findByIdAndUpdate(sessionId, {
        status: 'measurements_saved',
        finalMeasurements: measurements,
        imagesDeleted: true,
        imagesDeletedAt: new Date(),
      });
    }

    res.json({ success: true, message: 'Measurements saved successfully. Temporary photos deleted.', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save measurements.' });
  }
};
