import React from 'react';

const footerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '50px',
  backgroundColor: '#343a40',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  zIndex: 1000,
};

export const Footer: React.FC = () => {
  return (
    <footer style={footerStyle}>
      Fixed Footer
    </footer>
  );
};
