import React, { useState } from "react";
import "../styles/Cell.css";

const Cell = ({ row, col, format, onEdit }) => {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    setValue(e.target.value);
    onEdit(row, col, e.target.value);
  };

  const applyFormatting = () => {
    const styles = {};
    if (format.bold) styles.fontWeight = "bold";
    if (format.italic) styles.fontStyle = "italic";
    if (format.color) styles.color = format.color;
    if (format.fontSize) styles.fontSize = `${format.fontSize}px`;
    return styles;
  };

  return (
    <div className="cell">
      <input
        style={applyFormatting()}
        value={value}
        onChange={handleChange}
        placeholder={`${row}${col}`}
      />
    </div>
  );
};

export default Cell;
