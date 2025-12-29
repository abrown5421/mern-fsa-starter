import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/home/Home';
import Auth from './pages/auth/Auth';

const App: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-screen h-screen bg-neutral-contrast font-secondary">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default App;
