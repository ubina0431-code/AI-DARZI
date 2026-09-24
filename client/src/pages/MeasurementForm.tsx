import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMeasurement, getMeasurementAdvice, type GarmentType, type MeasurementAdvice, type MeasurementGender, type MeasurementValues } from '../api/measurement';

const initialMeasurements: MeasurementValues = {
  chest: 0,
  waist: 0,
  shoulder: 0,
  sleeve: 0,
  kameezeLength: 0,
  trouserLength: 0,
};

const fields: Array<{ key: keyof MeasurementValues; label: string }> = [
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'shoulder', label: 'Shoulders' },
  { key: 'sleeve', label: 'Sleeves' },
  { key: 'kameezeLength', label: 'Shirt Length' },
  { key: 'trouserLength', label: 'Trouser Length' },
];

const MeasurementForm = () => {
  const navigate = useNavigate();
  const [gender, setGender] = useState<MeasurementGender>('female');
  const [garment, setGarment] = useState<GarmentType>('kameez');
  const [name, setName] = useState('My Measurements');
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [advice, setAdvice] = useState<MeasurementAdvice | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAdvising, setIsAdvising] = useState(false);

  const handleAdvice = async () => {
    setError('');
    setAdvice(null);
    if (!height || !weight) {
      setError('Enter height in centimetres and weight in kilograms first.');
      return;
    }

    setIsAdvising(true);
    try {
      const result = await getMeasurementAdvice({
        height: Number(height),
        weight: Number(weight),
        gender,
        garment,
      });
      setAdvice(result);
      setMeasurements((current) => ({ ...current, ...result.estimates }));
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err.response as { data?: { message?: string } }).data?.message
        : undefined;
      setError(message || 'Unable to generate AI advice. Please try again.');
    } finally {
      setIsAdvising(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      await createMeasurement({ gender, garment, name, measurements, unit: 'inches' });
      navigate('/measurements/saved', { replace: true });
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err.response as { data?: { message?: string } }).data?.message
        : undefined;
      setError(message || 'Unable to save measurements. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="measurement-form" onSubmit={handleSubmit}>
      <h2>Customer Measurements</h2>
      <p>Enter exact measurements in inches.</p>

      {error && <p role="alert">{error}</p>}

      <label>
        Profile name
        <input value={name} onChange={(event) => setName(event.target.value)} required />
      </label>

      <fieldset>
        <legend>Garment wearer</legend>
        <label>
          <input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={() => setGender('female')} />
          Female
        </label>
        <label>
          <input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={() => setGender('male')} />
          Male
        </label>
      </fieldset>

      <label>
        Garment
        <select value={garment} onChange={(event) => setGarment(event.target.value as GarmentType)}>
          <option value="kameez">Kameez</option>
          <option value="shalwar">Shalwar</option>
          <option value="suit">Suit</option>
          <option value="waistcoat">Waistcoat</option>
        </select>
      </label>

      <section className="advisor-panel" aria-labelledby="advisor-title">
        <p className="eyebrow">Smart fitting assistant</p>
        <h3 id="advisor-title">AI Measurement Advisor</h3>
        <p>Use your height and weight to generate a standard baseline. Treat it as a starting point, not a tailor-verified measurement.</p>
        <div className="advisor-inputs">
          <label>Height (cm)<input type="number" min="1" step="0.1" value={height} onChange={(event) => setHeight(event.target.value)} /></label>
          <label>Weight (kg)<input type="number" min="1" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} /></label>
        </div>
        <button type="button" onClick={handleAdvice} disabled={isAdvising}>{isAdvising ? 'Generating advice...' : 'Get AI measurement advice'}</button>
        {advice && <div className="advisor-result" role="status"><strong>Recommended fabric: {advice.recommendedFabricMeters} meters</strong><span>Confidence: {advice.confidence}% · Source: {advice.model === 'fallback' ? 'baseline mock' : 'Gemini AI'}</span><p>{advice.notes}</p></div>}
      </section>

      <div className="measurement-grid">
        {fields.map(({ key, label }) => (
          <label key={key}>
            {label} (in)
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={measurements[key] || ''}
              onChange={(event) => setMeasurements({ ...measurements, [key]: Number(event.target.value) })}
              required
            />
          </label>
        ))}
      </div>

      <button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Measurements'}</button>
    </form>
  );
};

export default MeasurementForm;