import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '../api/order';
import type { IOrder, OrderStatus } from '@shared/types';
import { useAuth } from '../context/AuthContext';

type PopulatedOrder = IOrder & {
  customerId: { firstName: string; lastName: string; email?: string };
  measurementProfileId?: {
    _id: string;
    name: string;
    gender?: string;
    garment?: string;
    measurements: Record<string, number>;
    unit: string;
  };
};

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: 'created', label: 'Pending' },
  { value: 'stitching', label: 'Stitched' },
  { value: 'delivered', label: 'Delivered' },
];

const TailorDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PopulatedOrder[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'tailor') return;
    getOrders()
      .then((loadedOrders) => setOrders(loadedOrders as PopulatedOrder[]))
      .catch(() => setMessage('Unable to load incoming orders.'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleStatusChange = async (order: PopulatedOrder, status: OrderStatus) => {
    setMessage('');
    try {
      await updateOrderStatus(order._id, status);
      setOrders((current) => current.map((item) => item._id === order._id ? { ...item, status } : item));
    } catch {
      setMessage('That status change is not available for this order yet.');
    }
  };

  if (!user || user.role !== 'tailor') return <div className="dashboard-card">Access denied.</div>;
  if (loading) return <div className="dashboard-card">Loading dashboard...</div>;

  return (
    <main className="dashboard-layout">
      <header className="dashboard-card dashboard-header"><p className="eyebrow">Tailor workspace</p><h1>Incoming orders</h1><p>Review client details and keep customers informed as each piece moves forward.</p></header>
      {message && <p role="alert">{message}</p>}
      {orders.length === 0 ? <p className="empty-state">No incoming orders yet.</p> : <div className="dashboard-grid">{orders.map((order) => <article className="dashboard-card order-card" key={order._id}>
        <div className="card-row"><div><p className="eyebrow">Customer order</p><h2>{order.title}</h2><p>{order.customerId.firstName} {order.customerId.lastName}</p></div><select aria-label={`Status for ${order.title}`} value={statusOptions.some((option) => option.value === order.status) ? order.status : 'created'} onChange={(event) => handleStatusChange(order, event.target.value as OrderStatus)}>{statusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></div>
        <p>{order.description || 'No additional details.'}</p>
        <section className="client-measurements"><h3>Assigned measurements</h3>{order.measurementProfileId ? <><p>{order.measurementProfileId.name} · {order.measurementProfileId.gender || 'Custom'} · {order.measurementProfileId.garment || 'Garment'}</p><div className="measurement-summary">{Object.entries(order.measurementProfileId.measurements).map(([key, value]) => <span key={key}>{key}: {value} {order.measurementProfileId?.unit}</span>)}</div></> : <p>No measurement profile attached.</p>}</section>
      </article>)}</div>}
    </main>
  );
};

export default TailorDashboard;
