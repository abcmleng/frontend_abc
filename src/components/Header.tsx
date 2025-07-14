import React from 'react';

const headerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '60px',
  backgroundColor: '#007bff',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  fontWeight: 'bold',
  zIndex: 1000,
};

export const Header: React.FC = () => {
  return (
    <header style={headerStyle}>
      Fixed Header
    </header>
  );
};
