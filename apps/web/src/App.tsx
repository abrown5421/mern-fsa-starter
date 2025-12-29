import React from 'react';

const App: React.FC = () => {

  return (
    <div data-testid="tailwind-check" className="w-screen h-screen">
      <div className="flex flex-row">
        <div className="flex flex-col flex-1">A</div>
        <div className="flex flex-col flex-1">B</div>
      </div>
    </div>
  );
};

export default App;
