import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Auth: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState<boolean>(location.state?.signUp || false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resetSent, setResetSent] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (isSignUp) {
      if (!username.trim()) {
        setError('Username is required');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Automatically log in after signup
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) setError(loginError.message);
        else navigate('/');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else if (data.user) navigate('/');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setError(null);
    setResetSent(false);
    if (!email) {
      setError('Please enter your email to reset password.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth',
    });
    if (error) setError(error.message);
    else setResetSent(true);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 400, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {isSignUp && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
        />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5rem', cursor: 'pointer' }}>
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
        </button>
        {!isSignUp && (
          <button
            type="button"
            onClick={handleResetPassword}
            style={{ background: 'transparent', color: '#222', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginTop: '0.5rem' }}
          >
            Forgot password?
          </button>
        )}
        {resetSent && <div style={{ color: 'green' }}>Password reset email sent!</div>}
      </form>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button onClick={() => setIsSignUp((s: boolean) => !s)} style={{ background: 'transparent', color: '#222', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
