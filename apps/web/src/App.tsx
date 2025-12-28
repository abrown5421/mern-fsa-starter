import React from 'react';
import { Route, Routes } from "react-router-dom";
import HomePage from './pages/homePage/HomePage';
import AuthPage from './pages/authPage/AuthPage';

const App: React.FC = () => {

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
};

export default App;
