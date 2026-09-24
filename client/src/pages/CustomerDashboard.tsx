import { useEffect, useState } from 'react';
import { createOrder, getOrders } from '../api/order';
import type { IOrder } from '@shared/types';
import { getMyMeasurements, type SavedMeasurement } from '../api/measurement';
import { getTailors, type TailorOption } from '../api/tailor';
import { useAuth } from '../context/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [tailors, setTailors] = useState<TailorOption[]>([]);
  const [tailorProfileId, setTailorProfileId] = useState('');
  const [measurementProfileId, setMeasurementProfileId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    const [savedMeasurements, customerOrders, availableTailors] = await Promise.all([
      getMyMeasurements(),
      getOrders(),
      getTailors(),
    ]);
    setMeasurements(savedMeasurements);
    setOrders(customerOrders);
    setTailors(availableTailors);
    setTailorProfileId((current) => current || availableTailors[0]?._id || '');
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role !== 'customer') return;
    loadDashboard().catch(() => setMessage('Unable to load your dashboard.'));
  }, [user]);

  const handleOrderSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      await createOrder({
        tailorProfileId,
        measurementProfileId: measurementProfileId || undefined,
        title,
        description,
      });
      setTitle('');
      setDescription('');
      setMessage('Order submitted successfully.');
      setOrders(await getOrders());
    } catch {
      setMessage('Unable to submit the order. Check the selected tailor and try again.');
    }
  };

  if (!user || user.role !== 'customer') return <div className="dashboard-card">Access denied.</div>;
  if (loading) return <div className="dashboard-card">Loading dashboard...</div>;

  return (
    <main className="dashboard-layout">
      <header className="dashboard-card dashboard-header">
        <p className="eyebrow">Customer workspace</p>
        <h1>Welcome, {user.firstName}</h1>
        <p>Keep your fit details ready and follow every order from request to delivery.</p>
      </header>

      <section className="dashboard-section">
        <div className="section-heading"><div><p className="eyebrow">Saved profiles</p><h2>Digital measurements</h2></div><span>{measurements.length} profiles</span></div>
        {measurements.length === 0 ? <p className="empty-state">No saved measurements yet.</p> : <div className="dashboard-grid">{measurements.map((profile) => <article className="dashboard-card" key={profile._id}><h3>{profile.name}</h3><p>{profile.gender || 'Profile'} · {profile.garment || 'Custom garment'} · {profile.unit}</p><div className="measurement-summary">{Object.entries(profile.measurements).filter(([, value]) => typeof value === 'number').map(([key, value]) => <span key={key}>{key}: {value}</span>)}</div></article>)}</div>}
      </section>

      <section className="dashboard-section dashboard-card">
        <p className="eyebrow">New request</p><h2>Submit an order</h2>
        {message && <p role="status">{message}</p>}
        <form className="order-form" onSubmit={handleOrderSubmit}>
          <label>Tailor<select value={tailorProfileId} onChange={(event) => setTailorProfileId(event.target.value)} required><option value="" disabled>Select a tailor</option>{tailors.map((tailor) => <option value={tailor._id} key={tailor._id}>{tailor.businessName} · {tailor.userId.firstName} {tailor.userId.lastName}</option>)}</select></label>
          <label>Measurement profile<select value={measurementProfileId} onChange={(event) => setMeasurementProfileId(event.target.value)}><option value="">No profile selected</option>{measurements.map((profile) => <option value={profile._id} key={profile._id}>{profile.name}</option>)}</select></label>
          <label>Order title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
          <label>Details<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          <button type="submit" disabled={!tailorProfileId}>Submit order</button>
        </form>
      </section>

      <section className="dashboard-section"><div className="section-heading"><div><p className="eyebrow">Progress</p><h2>Order status</h2></div><span>{orders.length} orders</span></div>{orders.length === 0 ? <p className="empty-state">No orders yet.</p> : <div className="dashboard-grid">{orders.map((order) => <article className="dashboard-card" key={order._id}><div className="card-row"><h3>{order.title}</h3><strong>{order.status.replaceAll('_', ' ')}</strong></div><p>{order.description || 'No additional details.'}</p><small>Updated {new Date(order.updatedAt).toLocaleDateString()}</small></article>)}</div>}</section>
    </main>
  );
};

export default CustomerDashboard;