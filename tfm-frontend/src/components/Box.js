import React from 'react';
import './Box.css';

const Box = ({ name, onClick }) => {
  return (
    <div className="box" onClick={onClick}>
      <h3>{name}</h3>
    </div>
  );
};

export default Box;