import { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'customer' as 'customer' | 'tailor',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      console.error('Registration failed', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input type="text" placeholder="First Name" onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
      <input type="text" placeholder="Last Name" onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
      <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} />
      <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
      <select onChange={(e) => setFormData({...formData, role: e.target.value as 'customer' | 'tailor'})}>
        <option value="customer">Customer</option>
        <option value="tailor">Tailor</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterPage;
