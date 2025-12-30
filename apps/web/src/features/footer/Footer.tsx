import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral flex justify-center items-center px-4 py-3 nav relative z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.1)]">
      <p className="text-sm text-neutral-600">
        © {year} All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
