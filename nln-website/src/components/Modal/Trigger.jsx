import React from 'react';
import './Modal.css';

const Trigger = ({ triggerText, objRef, showModal }) => {
  return (
    <a className="nav-link" ref={objRef} style={{cursor:'pointer'}} onClick={showModal}>{triggerText}</a>
  );
};
export default Trigger;
