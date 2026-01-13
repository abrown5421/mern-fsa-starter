import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  AdjustmentsHorizontalIcon,
  UserIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { useLocation, useNavigate } from "react-router-dom";
import AdminAvatarLogout from "./AdminAvatarLogout";

const AdminBar: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!enabled) return null;

  if (location.pathname.startsWith("/admin")) {
    return (
      <div className="bg-neutral flex justify-between items-center px-4 nav relative z-20 shadow">
        <div
          onClick={() => navigate("/admin-dashboard")}
          className="text-xl font-bold cursor-pointer"
        >
          Ecommerce Admin
        </div>
        
        <AdminAvatarLogout />
        
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="admin-bar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 text-neutral px-4 py-2 flex items-center justify-between"
          >
            <div className="flex flex-row gap-3">
              <button
                onClick={() => navigate("/admin-dashboard")}
                className="flex items-center gap-2 rounded-md px-4 py-2 bg-neutral-800 hover:bg-primary transition cursor-pointer"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                
                <span className="hidden lg:block">Dashboard</span>
              </button>
              {/* Add hot links here               */}
            </div>

            
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded bg-neutral-800 hover:bg-primary"
            >
              <ArrowsPointingInIcon className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-4 right-4 z-50 bg-neutral-800 p-3 rounded-full hover:bg-primary cursor-pointer"
          >
            <ArrowsPointingOutIcon className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminBar;
