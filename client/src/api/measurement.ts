import api from './axios';

export type MeasurementGender = 'male' | 'female';
export type GarmentType = 'kameez' | 'shalwar' | 'suit' | 'waistcoat';

export interface MeasurementValues {
  shoulder: number;
  chest: number;
  waist: number;
  sleeve: number;
  kameezeLength: number;
  trouserLength: number;
}

export interface MeasurementPayload {
  gender: MeasurementGender;
  garment: GarmentType;
  name: string;
  measurements: MeasurementValues;
  unit: 'inches';
}

export const createMeasurement = async (payload: MeasurementPayload) => {
  const { data } = await api.post('/measurements', payload);
  return data;
};

export interface SavedMeasurement {
  _id: string;
  name: string;
  gender?: MeasurementGender;
  garment?: GarmentType;
  measurements: MeasurementValues;
  unit: 'inches' | 'cm';
  createdAt: string;
}

export const getMyMeasurements = async (): Promise<SavedMeasurement[]> => {
  const { data } = await api.get('/measurements');
  return data.data;
};

export interface MeasurementAdvice {
  estimates: MeasurementValues;
  recommendedFabricMeters: number;
  confidence: number;
  notes: string;
  model: string;
}

export const getMeasurementAdvice = async (payload: {
  height: number;
  weight: number;
  gender: MeasurementGender;
  garment: GarmentType;
}): Promise<MeasurementAdvice> => {
  const { data } = await api.post('/measurements/ai/advisor', payload);
  return data.data;
};