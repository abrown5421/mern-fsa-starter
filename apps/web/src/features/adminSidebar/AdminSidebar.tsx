import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  EllipsisVerticalIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch } from "../../app/store/hooks";
import { openDrawer } from "../drawer/drawerSlice";

const AdminSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const links = [
    {
      title: "Users",
      url: "/admin-user",
      icon: <UserIcon className="w-6 h-6 mr-3" />,
    },
    {
      title: "BlogPosts",
      url: "/admin-blogPost",
      icon: <CubeIcon className="w-6 h-6 mr-3" />,
    },
    {
      title: "Products",
      url: "/admin-product",
      icon: <CubeIcon className="w-6 h-6 mr-3" />,
    },
    {
      title: "Orders",
      url: "/admin-order",
      icon: <CubeIcon className="w-6 h-6 mr-3" />,
    },
  ];

  const handleOpenSidebar = () => {
    dispatch(
      openDrawer({
        open: true,
        drawerContent: "sidebar",
        anchor: "left",
        title: "Ecommerce Admin",
      }),
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="sup-min-nav max-w-86.25 transition-all bg-neutral-700 text-white py-6 md:p-4 flex md:flex-2 md:flex-col shadow-[2px_0_4px_rgba(0,0,0,0.1)] md:relative z-20 absolute sm:left-0 top-1/2 transform"
    >
      <EllipsisVerticalIcon
        onClick={handleOpenSidebar}
        className="flex md:hidden w-6 h-6 text-white"
      />
      <nav className="hidden md:flex flex-col space-y-3">
        {links.map((link) => {
          const isActive = location.pathname === link.url;
          return (
            <Link
              key={link.title}
              to={link.url}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 text-lg
                ${isActive ? "border-2 border-primary bg-primary text-white" : "bg-neutral3 text-neutral-contrast border-2 border-transparent hover:text-white hover:bg-transparent hover:border-white"}`}
            >
              {link.icon}
              <span className="font-medium">{link.title}</span>
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default AdminSidebar;
