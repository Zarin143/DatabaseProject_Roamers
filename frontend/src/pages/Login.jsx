import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ import useNavigate

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate(); // ✅ initialize navigate

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', form);
      setMsg(res.data.message || 'Login successful!');
      
      // ✅ Redirect after successful login
      navigate('/home');
    } catch (err) {
      console.log(err.response?.data); // ✅ log backend error
      setMsg(err.response?.data?.error || 'Login failed');
    }
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80vh',
    background: '#f5f5f5',
  };

  const formStyle = {
    background: '#fff',
    padding: '30px 40px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const inputStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
  };

  const buttonStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
  };

  const msgStyle = {
    textAlign: 'center',
    color: 'red',
    fontSize: '14px',
    marginTop: '5px',
  };

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Login</h2>
        <input
          style={inputStyle}
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          style={inputStyle}
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button style={buttonStyle} type="submit">Login</button>
        <p style={msgStyle}>{msg}</p>
      </form>
    </div>
  );
}
