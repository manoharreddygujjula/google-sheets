import React, { useState } from 'react';
import './FormulaBar.css';

const FormulaBar = ({ currentCell, setCurrentCell }) => {
  const [formula, setFormula] = useState(currentCell.value);

  const handleChange = (e) => {
    setFormula(e.target.value);
  };

  const handleBlur = () => {
    setCurrentCell({ ...currentCell, value: formula });
  };

  return (
    <div className="formula-bar">
      <input
        type="text"
        value={formula}
        onChange={handleChange}
        onBlur={handleBlur}
        className="formula-input"
      />
    </div>
  );
};

export default FormulaBar;
