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
import PageNotFound from "./pages/pageNotFound/PageNotFound";
import AdminDashboard from "./pages/adminDashboard/AdminDashboard";
import AdminBar from "./features/adminBar/AdminBar";
import AdminSidebar from "./features/adminSidebar/AdminSidebar";
import AdminUser from "./pages/adminUser/AdminUser";
import AdminBlogPost from "./pages/adminBlogPost/AdminBlogPost";
import AdminProduct from "./pages/adminProduct/AdminProduct";
import AdminOrder from "./pages/adminOrder/AdminOrder";
import Blog from "./pages/blog/Blog";
import BlogPost from "./pages/blogPost/BlogPost";
import Staff from "./pages/staff/Staff";
import Contact from "./pages/contact/Contact";
import Checkout from "./pages/checkout/Checkout";
import Cart from "./pages/cart/Cart";
import Orders from "./pages/orders/Orders";
import OrderComplete from "./pages/orderComplete/OrderComplete";
import Product from "./pages/product/Product";
import Products from "./pages/products/Products";
const App: React.FC = () => {
  const location = useLocation();
  const { data: activeUser, isLoading } = useGetCurrentUserQuery();

  const canOpen = activeUser?.type === "editor" || activeUser?.type === "admin";
  const adminRoute = location.pathname.startsWith("/admin");

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-neutral-contrast flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-neutral-contrast font-secondary relative">
      <AdminBar enabled={canOpen} />
      {!adminRoute && <Navbar />}
      <div className="minus-nav">
        <AnimatePresence mode="wait">
          <div className={adminRoute ? "flex flex-row" : ""}>
            {adminRoute && <AdminSidebar />}
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile/:id" element={<Profile />} />{" "}
              {/* new routes inserted here */}
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/order-complete/:id" element={<OrderComplete />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin-order" element={<AdminOrder />} />
              <Route path="/admin-order/:id" element={<AdminOrder />} />
              <Route path="/admin-order/new" element={<AdminOrder />} />
              <Route path="/admin-product" element={<AdminProduct />} />
              <Route path="/admin-product/:id" element={<AdminProduct />} />
              <Route path="/admin-product/new" element={<AdminProduct />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/admin-blogPost" element={<AdminBlogPost />} />
              <Route path="/admin-blogPost/:id" element={<AdminBlogPost />} />
              <Route path="/admin-blogPost/new" element={<AdminBlogPost />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/admin-user" element={<AdminUser />} />
              <Route path="/admin-user/:id" element={<AdminUser />} />
              <Route path="/admin-user/new" element={<AdminUser />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </div>
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
