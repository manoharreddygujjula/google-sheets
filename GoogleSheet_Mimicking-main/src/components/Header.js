import React from "react";
import "../styles/Header.css";

const Header = ({ onFormatChange }) => {
  return (
    <div className="header">
      <div className="menu-bar">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Insert</span>
        <span>Format</span>
        <span>Data</span>
        <span>Tools</span>
        <span>Extensions</span>
        <span>Help</span>
      </div>
      <div className="toolbar">
        <button onClick={() => onFormatChange("bold")}>
          <b>B</b>
        </button>
        <button onClick={() => onFormatChange("italic")}>
          <i>I</i>
        </button>
        <select onChange={(e) => onFormatChange("fontSize", e.target.value)}>
          <option value="10">10</option>
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
        </select>
        <input
          type="color"
          onChange={(e) => onFormatChange("color", e.target.value)}
        />
      </div>
    </div>
  );
};

export default Header;
