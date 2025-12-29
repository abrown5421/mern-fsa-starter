import React from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { useAppDispatch } from '../../app/store/hooks';
import { openDrawer } from '../drawer/drawerSlice';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();

  const getGreeting = () => {
    const hour = new Date().getHours();
    
        if (hour < 12) {
            return 'Good Morning';
        } else if (hour < 19) {
            return 'Good Afternoon';
        } else {
            return 'Good Evening';
        }
    };

  const handleClick = () => {
    dispatch(
      openDrawer({
        open: true,
        drawerContent: 'navbar',
        anchor: 'right',
        title: getGreeting(),
      })
    );
  };  

  return (
    <div className="bg-neutral flex flex-row justify-between items-center px-4 nav relative z-10 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
      <div className="font-primary">Logo</div>
      <div className="hidden lg:flex items-center">
        <Link className="px-4" to="/">
          Home
        </Link>
        <Link className="px-4" target="_blank" to="https://google.com">
          Test
        </Link>
        <Link
          className="ml-4 px-4 py-2 bg-primary text-primary-contrast rounded-xl"
          to="/auth"
        >
          Login
        </Link>
      </div>
      <button
        onClick={handleClick}
        className="lg:hidden"
        aria-label="Open menu"
      >
        <Bars3Icon className="w-7 h-7 text-neutral-contrast" />
      </button>
    </div>
  );
};

export default Navbar;
