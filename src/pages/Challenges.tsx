import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Challenges.css';
import { supabase } from '../supabaseClient';

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newExpiration, setNewExpiration] = useState('');
  const [newStart, setNewStart] = useState('');
  const [user, setUser] = useState<any>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('challenges').select('*');
      if (error) setError(error.message);
      else setChallenges(data || []);
      setLoading(false);
    };
    fetchChallenges();
  }, [showCreate]);

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
  if (!newTitle.trim() || !user || !newExpiration || !newStart) return;
    setError(null);
    const { error } = await supabase.from('challenges').insert({
      title: newTitle,
      creator_id: user.id,
      participants: [user.id],
      expiration_date: newExpiration,
      start_date: newStart,
    });
    if (error) setError(error.message);
    else {
      setShowCreate(false);
      setNewTitle('');
      setNewExpiration('');
      setNewStart('');
    }
  };

  const handleJoin = async (challenge: any) => {
    if (!user) return;
    if (challenge.participants?.includes(user.id)) return;
    const updated = [...(challenge.participants || []), user.id];
    const { error } = await supabase.from('challenges').update({ participants: updated }).eq('id', challenge.id);
    if (error) setError(error.message);
    else {
      setChallenges(challenges.map(c => c.id === challenge.id ? { ...c, participants: updated } : c));
    }
  };

  // Mock history for now
  const mockHistory = [
    { id: 1, title: 'Squat Challenge', result: 'Completed! 🏆', date: '2024-06-01' },
    { id: 2, title: '5K Run', result: 'Finished! 🥇', date: '2024-05-15' },
  ];

  return (
    <div className="challenges-page">
      {/* Banner/Header */}
      <div className="challenges-banner">
        <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80" alt="Athletes competing" className="banner-img" />
        <div className="banner-overlay">
          <h1 className="challenges-title">Your Fitness Challenges</h1>
          <h2 className="challenges-sub">Take on rivals, beat personal records, and rise to the top!</h2>
        </div>
      </div>

      {/* Current Challenges */}
      <section className="current-challenges">
        <h3>Current Challenges</h3>
        {loading ? <div>Loading...</div> : null}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div className="challenge-cards">
          {challenges.map(challenge => {
            // Calculate time progress
            let percent = 0;
            let timeLabel = 'No expiration';
            if (challenge.expiration_date && challenge.start_date) {
              const now = new Date();
              const start = new Date(challenge.start_date);
              const end = new Date(challenge.expiration_date);
              if (now < start) {
                percent = 0;
                const msUntilStart = start.getTime() - now.getTime();
                const days = Math.floor(msUntilStart / (1000 * 60 * 60 * 24));
                const hours = Math.floor((msUntilStart / (1000 * 60 * 60)) % 24);
                const mins = Math.floor((msUntilStart / (1000 * 60)) % 60);
                timeLabel = `Starts in: ${days}d ${hours}h ${mins}m`;
              } else {
                const total = end.getTime() - start.getTime();
                const elapsed = now.getTime() - start.getTime();
                percent = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
                const msLeft = end.getTime() - now.getTime();
                if (msLeft > 0) {
                  const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
                  const mins = Math.floor((msLeft / (1000 * 60)) % 60);
                  timeLabel = `Time left: ${days}d ${hours}h ${mins}m`;
                } else {
                  timeLabel = 'Challenge expired';
                  percent = 100;
                }
              }
            }
            return (
              <div className="challenge-card" key={challenge.id}>
                <div className="challenge-header">
                  <span className="challenge-title">{challenge.title}</span>
                  <span className="challenge-timer">{timeLabel}</span>
                </div>
                <div className="challenge-progress">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="progress-label">Time Progress: {percent}%</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  {user && !challenge.participants?.includes(user.id) ? (
                    <button className="view-details-btn" onClick={() => handleJoin(challenge)}>
                      Join Challenge
                    </button>
                  ) : (
                    <button className="view-details-btn" disabled>
                      Joined
                    </button>
                  )}
                  <button className="view-details-btn" onClick={() => navigate(`/challenges/${challenge.id}`)}>View Details</button>
                  {user && challenge.creator_id === user.id && (
                    <button className="view-details-btn" style={{ background: '#c00', color: '#fff' }} onClick={async () => {
                      const { error } = await supabase.from('challenges').delete().eq('id', challenge.id);
                      if (!error) setChallenges(challenges.filter(c => c.id !== challenge.id));
                    }}>Delete</button>
                  )}
                </div>
                {/* Leaderboard placeholder */}
                <div className="leaderboard">
                  <h4>Leaderboard</h4>
                  <div className="leaderboard-list">
                    {/* TODO: Replace with real leaderboard data */}
                    <div className="leaderboard-row">
                      <span className="rank">#1</span>
                      <span className="username">You</span>
                      <span className="points">0 pts</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Floating Create Challenge Button */}
        <button className="create-challenge-btn" onClick={() => setShowCreate(true)}>+ Create New Challenge</button>
        {showCreate && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleCreateChallenge} style={{ background: '#222', color: '#fff', padding: '2rem', borderRadius: 12, boxShadow: '0 4px 16px #0008', minWidth: 320 }}>
              <h3>Create Challenge</h3>
              <input
                type="text"
                placeholder="Challenge Title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                style={{ padding: '0.7rem', borderRadius: 8, border: '1px solid #fff', width: '100%', marginBottom: '1rem', background: '#181818', color: '#fff' }}
                required
              />
              <label style={{ marginBottom: '0.5rem' }}>Start Date</label>
              <input
                type="datetime-local"
                value={newStart}
                onChange={e => setNewStart(e.target.value)}
                style={{ padding: '0.7rem', borderRadius: 8, border: '1px solid #fff', width: '100%', marginBottom: '1rem', background: '#181818', color: '#fff' }}
                required
              />
              <label style={{ marginBottom: '0.5rem' }}>Expiration Date</label>
              <input
                type="datetime-local"
                value={newExpiration}
                onChange={e => setNewExpiration(e.target.value)}
                style={{ padding: '0.7rem', borderRadius: 8, border: '1px solid #fff', width: '100%', marginBottom: '1rem', background: '#181818', color: '#fff' }}
                required
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="view-details-btn">Create</button>
                <button type="button" className="view-details-btn" onClick={() => setShowCreate(false)} style={{ background: '#444', color: '#fff' }}>Cancel</button>
              </div>
              {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
            </form>
          </div>
        )}
      </section>

      {/* Challenge History */}
      <section className="challenge-history">
        <button className="history-toggle" onClick={() => setHistoryOpen(open => !open)}>
          {historyOpen ? 'Hide Challenge History' : 'Show Challenge History'}
        </button>
        {historyOpen && (
          <div className="history-list">
            {mockHistory.map(item => (
              <div className="history-item" key={item.id}>
                <span className="history-title">{item.title}</span>
                <span className="history-result">{item.result}</span>
                <span className="history-date">{item.date}</span>
                <span className="history-trophy animated-trophy">🏆</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Challenges;

// ...existing code...