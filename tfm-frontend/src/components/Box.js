import React from 'react';
import './Box.css';

const Box = ({ name, onClick, backgroundColor }) => {
  return (
    <div className="box" onClick={onClick} style={{ backgroundColor }}>
      <h3>{name}</h3>
    </div>
  );
};

export default Box;