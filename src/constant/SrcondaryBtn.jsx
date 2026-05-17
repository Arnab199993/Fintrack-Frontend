import React from 'react';

const SecondaryBtn = ({ handleClick, children }) => {
  return (
    <button onClick={handleClick} type="button" className="btn-secondary p-2 cursor-pointer">
        {children}
    </button>
  );
};

export default SecondaryBtn;