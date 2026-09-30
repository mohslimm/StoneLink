import React from 'react';

const ClinicLogo = ({ size = 24, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4.5 9.5C4.5 4.5 8 3 12 3C16 3 19.5 4.5 19.5 9.5C19.5 13.5 17 15.5 16 17C15 18.5 15.5 21 12 21C8.5 21 9 18.5 8 17C7 15.5 4.5 13.5 4.5 9.5Z" />
      <path d="M12 3C12 7 9.5 9 7 9" />
      <path d="M12 3C12 7 14.5 9 17 9" />
      <path d="M12 21V18" />
    </svg>
  );
};

export default ClinicLogo;
