import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/home/Home";
import Auth from "./pages/auth/Auth";
import Navbar from "./features/navbar/Navbar";
import Alert from "./features/alert/Alert";
import Drawer from "./features/drawer/Drawer";
import { useGetCurrentUserQuery } from "./app/store/api/authApi";
import Profile from "./pages/profile/Profile";
import Modal from "./features/modal/Modal";
import Footer from "./features/footer/Footer";
import Loader from "./features/loader/Loader";
const App: React.FC = () => {
  const location = useLocation();
  const { isLoading } = useGetCurrentUserQuery();

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-neutral-contrast flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-neutral-contrast font-secondary">
      <Navbar />
      <div className='minus-nav'>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />{" "}
            {/* new routes inserted here */}
          </Routes>
        </AnimatePresence>
        <Alert />
        <Drawer />
        <Modal />
        <Footer />
      </div>
    </div>
  );
};

export default App;
