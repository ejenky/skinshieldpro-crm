import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function SignupPage() {
  const { signup, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup(name, email, password, passwordConfirm);
    } catch (err) {
      setError(err.message || 'Failed to create account');
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg" />
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <div className="login-shield">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="login-brand-text">
            <span className="login-brand-name">SKINSHIELD PRO</span>
            <span className="login-brand-sub">CRM</span>
          </div>
        </div>

        <p className="login-subtitle">Create your account</p>

        {error && <div className="login-error">{error}</div>}

        <div className="login-field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
            autoFocus
          />
        </div>

        <div className="login-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
          />
        </div>

        <div className="login-field">
          <label htmlFor="passwordConfirm">Confirm Password</label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="login-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
