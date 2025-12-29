import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <div className="bg-neutral flex flex-row justify-between items-center px-4 nav relative z-10 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col font-primary">Logo</div>
            <div className="flex flex-row items-center">
                <Link className='px-4' to="/">Home</Link>
                <Link className='px-4' target='blank' to="https://google.com">Test</Link>
                <Link className='ml-4 px-4 py-2 bg-primary text-primary-contrast rounded-xl' to="/auth">Login</Link>
            </div>
        </div>
    );
};

export default Navbar;
