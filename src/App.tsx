
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Challenges from './pages/Challenges';
import ChallengeDetails from './pages/ChallengeDetails';
import Stats from './pages/Stats';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="challenges/:id" element={<ChallengeDetails />} />
          <Route path="stats" element={<Stats />} />
          <Route path="auth" element={<Auth />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
