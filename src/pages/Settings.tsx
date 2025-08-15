import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Settings: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setEmail(data.user.email || '');
        setNewEmail(data.user.email || '');
        // Fetch username from profiles table
        const { data: profile } = await supabase.from('profiles').select('username').eq('id', data.user.id).single();
        setUsername(profile?.username || '');
        setNewUsername(profile?.username || '');
      }
    };
    fetchUser();
  }, []);
  const handleEmailChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    setLoading(true);
    if (!newEmail.trim()) {
      setEmailError('Email cannot be empty.');
      setLoading(false);
      return;
    }
    if (newEmail === email) {
      setEmailError('Email is unchanged.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      setEmailError(error.message);
    } else {
      setEmailSuccess(true);
      setEmail(newEmail);
    }
    setLoading(false);
  };

  const handleUsernameChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameError(null);
    setUsernameSuccess(false);
    setLoading(true);
    if (!newUsername.trim()) {
      setUsernameError('Username cannot be empty.');
      setLoading(false);
      return;
    }
    // Check if username is taken
    const { data: taken } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', newUsername)
      .single();
    if (taken && taken.username && newUsername !== username) {
      setUsernameError('Username is already taken.');
      setLoading(false);
      return;
    }
    // Update username in profiles table
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      setUsernameError('User not found.');
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername })
      .eq('id', userId);
    if (error) {
      setUsernameError(error.message);
    } else {
      setUsernameSuccess(true);
      setUsername(newUsername);
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    setLoading(true);
    if (!password || !confirmPassword) {
      setPasswordError('Please fill out both fields.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 400, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>Settings</h2>
      <div style={{ marginBottom: '2rem' }}>
        <strong>Current Username:</strong> {username || '(none)'}<br />
        <strong>Current Email:</strong> {email || '(none)'}
      </div>
      <form onSubmit={handleUsernameChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <label htmlFor="username">Change Username</label>
        <input
          id="username"
          type="text"
          value={newUsername}
          onChange={e => setNewUsername(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
        />
        {usernameError && <div style={{ color: 'red' }}>{usernameError}</div>}
        {usernameSuccess && <div style={{ color: 'green' }}>Username updated!</div>}
        <button type="submit" disabled={loading} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5rem', cursor: 'pointer' }}>
          {loading ? 'Processing...' : 'Update Username'}
        </button>
      </form>
      <form onSubmit={handleEmailChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <label htmlFor="email">Change Email</label>
        <input
          id="email"
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
        />
        {emailError && <div style={{ color: 'red' }}>{emailError}</div>}
        {emailSuccess && <div style={{ color: 'green' }}>Email updated!</div>}
        <button type="submit" disabled={loading} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5rem', cursor: 'pointer' }}>
          {loading ? 'Processing...' : 'Update Email'}
        </button>
      </form>
      <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label htmlFor="password">Change Password</label>
        <input
          id="password"
          type="password"
          placeholder="New Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
        />
        {passwordError && <div style={{ color: 'red' }}>{passwordError}</div>}
        {passwordSuccess && <div style={{ color: 'green' }}>Password updated!</div>}
        <button type="submit" disabled={loading} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5rem', cursor: 'pointer' }}>
          {loading ? 'Processing...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
