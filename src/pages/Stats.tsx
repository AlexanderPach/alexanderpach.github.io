import React from "react";

const Stats: React.FC = () => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100vw' }}>
      <h1>Stats</h1>
      <p>Here you can view your fitness statistics and progress!</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>📊 Workout History</li>
        <li>🏆 Achievements</li>
        <li>📈 Progress Tracking</li>
      </ul>
    </div>
  );
}

export default Stats;