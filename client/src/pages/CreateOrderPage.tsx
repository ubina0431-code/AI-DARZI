import { useState } from 'react';
import { createOrder } from '../api/order';
import { useAuth } from '../context/AuthContext';

const CreateOrderPage = ({ tailorId }: { tailorId: string }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createOrder({
        tailorProfileId: tailorId,
        title: formData.title,
        description: formData.description,
        isOverseasOrder: false,
      });
      alert('Order requested successfully');
    } catch (err) {
      console.error('Order request failed', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Request Order</h2>
      <input type="text" placeholder="Title" onChange={(e) => setFormData({...formData, title: e.target.value})} required />
      <textarea placeholder="Description" onChange={(e) => setFormData({...formData, description: e.target.value})} />
      <button type="submit">Submit Request</button>
    </form>
  );
};

export default CreateOrderPage;
