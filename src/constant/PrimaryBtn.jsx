import React from 'react';

const PrimaryBtn = ({ handleClick, children,size, disabled=false }) => {
  return (
    <>
      <button
      onClick={handleClick}
      disabled={disabled}
      className={size === "large" ? 'btn-primary flex-1 p-2 cursor-pointer justify-between items-center rounded-sm' : 'btn-primary px-5 py-2.5 text-sm flex justify-between items-center gap-2 cursor-pointer rounded-sm'}
    >
      {children}
    </button>
    </>
  );
};

export default PrimaryBtn;