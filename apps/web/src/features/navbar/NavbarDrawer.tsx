import React from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../app/store/hooks';
import { closeDrawer } from '../drawer/drawerSlice';

const DrawerNavbar: React.FC = () => {
    const dispatch = useAppDispatch();
    const closeOnClick = () => dispatch(closeDrawer())

    return (
        <div className="flex flex-col h-full">
            <Link onClick={closeOnClick} className='py-4' to="/">Home</Link>
            <Link onClick={closeOnClick} className='py-4' target='blank' to="https://google.com">Test</Link>
            <Link onClick={closeOnClick} className='mt-auto px-4 py-2 text-center bg-primary text-primary-contrast rounded-xl' to="/auth">Login</Link>
        </div>
    );
};

export default DrawerNavbar;
