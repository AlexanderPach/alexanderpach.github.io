import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Home: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        // Try to get username from user_metadata
        const metaUsername = data.user.user_metadata?.username;
        setUsername(metaUsername || null);
      } else {
        setUsername(null);
      }
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metaUsername = session.user.user_metadata?.username;
        setUsername(metaUsername || null);
      } else {
        setUsername(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100vw' }}>
      <h1>Welcome to Fitness Rivalry</h1>
      {username && <h2>Hello, {username}!</h2>}
      <p>Challenge your friends, track your progress, and become the ultimate fitness rival!</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>🏆 Compete in fitness challenges</li>
        <li>📈 Track your workouts and stats</li>
        <li>🤝 Connect with friends and rivals</li>
      </ul>
    </div>
  );
};

export default Home;
