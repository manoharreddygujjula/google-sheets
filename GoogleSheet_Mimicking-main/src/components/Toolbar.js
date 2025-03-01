import React from "react";

const Toolbar = () => {
  const handleSave = () => {
    // Add save functionality
  };

  const handleLoad = () => {
    // Add load functionality
  };

  return (
    <div className="toolbar">
      <button onClick={handleSave}>Save</button>
      <button onClick={handleLoad}>Load</button>
    </div>
  );
};

export default Toolbar;
