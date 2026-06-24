import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (isRegister) {
        // Register in Firebase Auth first
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Sync role claims on the Backend Admin API
        await axios.post(`${API_URL}/api/auth/sync-role`, {
          uid: user.uid,
          role: role
        });

        // Force token refresh on Firebase side to update current claims local state
        await user.getIdToken(true);
        setMessage('Registration successful! Logging in...');
        setTimeout(() => {
          if (role === 'manager') {
            navigate('/manager');
          } else {
            navigate('/student');
          }
        }, 1500);
      } else {
        // Login flow
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const idTokenResult = await user.getIdTokenResult(true);
        const userRole = idTokenResult.claims.role || 'student';

        if (userRole === 'manager') {
          navigate('/manager');
        } else {
          navigate('/student');
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-header">{isRegister ? 'Register Account' : 'Portal Sign In'}</h2>
      {error && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
      {message && <div style={{ color: 'green', fontSize: '12px', marginBottom: '10px' }}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {isRegister && (
          <div className="form-row">
            <label className="form-label">Account Role</label>
            <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="manager">FYP Coordinator (Manager)</option>
            </select>
          </div>
        )}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}>
          {isRegister ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      <span className="auth-link" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Sign in' : 'New user? Create a profile'}
      </span>
    </div>
  );
}
