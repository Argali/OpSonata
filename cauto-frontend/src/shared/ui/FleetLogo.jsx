import React from "react";

function FleetLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#0C2033" />
      <path d="M26 74 C 42 52, 60 38, 74 26"
            fill="none" stroke="#27C281" strokeWidth="8" strokeLinecap="round"/>
      <circle cx="26" cy="74" r="10" fill="#FF9A3C"/>
      <circle cx="74" cy="26" r="10" fill="#FF9A3C"/>
    </svg>
  );
}

export default FleetLogo;
