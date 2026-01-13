import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGetCurrentUserQuery, useLogoutMutation } from "../../app/store/api/authApi";

type Phase = "avatar" | "transition" | "logout";

const DURATION = 0.25;

const AdminAvatarLogout = () => {
  const navigate = useNavigate();
  const { data: activeUser } = useGetCurrentUserQuery();
  const [logout] = useLogoutMutation();

  const [phase, setPhase] = useState<Phase>("avatar");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        phase === "logout" &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPhase("transition");
        setTimeout(() => setPhase("avatar"), DURATION * 1000);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [phase]);

  const expandLogout = () => {
    setPhase("transition");
    setTimeout(() => setPhase("logout"), DURATION * 1000);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate("/");
      setTimeout(() => {window.location.reload()}, 50)
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex items-center gap-3">
        <span className="hidden md:block text-xs">Welcome back, {activeUser?.firstName}</span>
        <div ref={containerRef} className="flex items-center overflow-hidden">
        <motion.div
            animate={{
            width: phase === "avatar" ? 40 : 0,
            opacity: phase === "avatar" ? 1 : 0,
            }}
            transition={{ duration: DURATION, ease: "easeInOut" }}
            className="h-10 overflow-hidden"
        >
            <div
            onClick={expandLogout}
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer bg-primary text-primary-contrast font-semibold"
            >
            {activeUser?.profileImage ? (
                <img
                src={activeUser.profileImage}
                alt={activeUser.firstName}
                className="w-full h-full object-cover"
                />
            ) : (
                <>
                {activeUser?.firstName?.[0]}
                {activeUser?.lastName?.[0]}
                </>
            )}
            </div>
        </motion.div>

        <motion.button
            onClick={handleLogout}
            animate={{
            width: phase === "logout" ? 160 : 0,
            opacity: phase === "logout" ? 1 : 0,
            }}
            transition={{ duration: DURATION, ease: "easeInOut" }}
            className="ml-2 overflow-hidden whitespace-nowrap rounded-md cursor-pointer"
            style={{
            pointerEvents: phase === "logout" ? "auto" : "none",
            }}
        >
            <div className='btn-error'>Logout</div>
            
        </motion.button>
        </div>
    </div>
  );
};

export default AdminAvatarLogout;
