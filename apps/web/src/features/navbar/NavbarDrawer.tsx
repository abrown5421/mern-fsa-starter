import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import { closeDrawer } from "../drawer/drawerSlice";
import { useLogoutMutation } from "../../app/store/api/authApi";

const NavbarDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation().pathname;
  const closeOnClick = () => dispatch(closeDrawer());
  const [logout] = useLogoutMutation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const classString = (path?: string) =>
    `py-4 ${location === path ? "text-primary hover:text-accent" : "hover:text-primary"}`;

  const handleLogout = async () => {
    closeOnClick();
    try {
      await logout().unwrap();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Link onClick={closeOnClick} className={classString("/")} to="/">
        Home
      </Link>
      <Link
        onClick={closeOnClick}
        className={classString()}
        target="blank"
        to="https://google.com"
      >
        Test
      </Link>

      {/* new links inserted here */}

      {!isAuthenticated && (
        <Link
          onClick={closeOnClick}
          className="mt-auto px-4 py-2 text-center border-2 bg-primary border-primary text-primary-contrast hover:bg-neutral hover:border-primary hover:text-primary rounded-xl transition-all"
          to="/auth"
        >
          Login
        </Link>
      )}
      {isAuthenticated && user && (
        <div className="flex flex-col h-full">
          <div className="my-4 h-px w-full bg-neutral-contrast/10" />
          <Link
            onClick={closeOnClick}
            className={classString("/profile")}
            to="/profile"
          >
            Profile
          </Link>
          <Link
            onClick={handleLogout}
            className="mt-auto px-4 py-2 text-center border-2 bg-red-500 text-primary-contrast rounded-xl hover:bg-neutral hover:border-red-500 hover:text-red-500 transition-all"
            to="/auth"
          >
            Logout
          </Link>
        </div>
      )}
    </div>
  );
};

export default NavbarDrawer;
