import React, { useState } from 'react';
import {
  Bold, Italic, Type, AlignLeft, AlignCenter, AlignRight, ChevronDown,
  Plus, Minus, Search, Settings, Download, Upload, Trash2, PaintBucket,
  ArrowDownUp
} from 'lucide-react';

const INITIAL_COLUMNS = 'ABCDEFGHIJKLMNOP'.split('');
const INITIAL_ROWS = Array.from({ length: 100 }, (_, i) => i + 1);

const isInRange = (cellId, start, end) => {
  if (!start || !end) return false;
  const startCol = start.match(/[A-Z]+/)[0];
  const startRow = parseInt(start.match(/[0-9]+/)[0]);
  const endCol = end.match(/[A-Z]+/)[0];
  const endRow = parseInt(end.match(/[0-9]+/)[0]);
  const currentCol = cellId.match(/[A-Z]+/)[0];
  const currentRow = parseInt(cellId.match(/[0-9]+/)[0]);
  
  return currentCol >= startCol && currentCol <= endCol &&
         currentRow >= startRow && currentRow <= endRow;
};

const getCellReference = (formula) => {
  if (!formula) return null;
  const match = formula.match(/\(([A-Z]+[0-9]+)\)/);
  return match ? match[1] : null;
};

const EnhancedSpreadsheet = () => {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [cellData, setCellData] = useState({});
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [cellStyles, setCellStyles] = useState({});
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findReplaceValues, setFindReplaceValues] = useState({ find: '', replace: '' });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const evaluateFormula = (formula, cellId) => {
    if (!formula?.startsWith('=')) return formula;
    
    try {
      const range = formula.match(/[A-Z]+[0-9]+:[A-Z]+[0-9]+/);
      
      if (range) {
        const [start, end] = range[0].split(':');
        const startCol = start.match(/[A-Z]+/)[0];
        const startRow = parseInt(start.match(/[0-9]+/)[0]);
        const endCol = end.match(/[A-Z]+/)[0];
        const endRow = parseInt(end.match(/[0-9]+/)[0]);
        
        let values = [];
        for (let col = startCol; col <= endCol; col = String.fromCharCode(col.charCodeAt(0) + 1)) {
          for (let row = startRow; row <= endRow; row++) {
            const value = cellData[`${col}${row}`]?.value || 0;
            if (!isNaN(Number(value))) {
              values.push(Number(value));
            }
          }
        }

        if (formula.includes('SUM')) {
          return values.reduce((a, b) => a + b, 0);
        } else if (formula.includes('AVERAGE')) {
          return values.reduce((a, b) => a + b, 0) / values.length;
        } else if (formula.includes('MAX')) {
          return Math.max(...values);
        } else if (formula.includes('MIN')) {
          return Math.min(...values);
        } else if (formula.includes('COUNT')) {
          return values.length;
        }
      }

      // Handle single cell reference formulas
      const referencedCell = getCellReference(formula);
      if (referencedCell) {
        const cellValue = cellData[referencedCell]?.value || '';
        
        if (formula.startsWith('=TRIM')) {
          return cellValue.trim();
        } else if (formula.startsWith('=UPPER')) {
          return cellValue.toUpperCase();
        } else if (formula.startsWith('=LOWER')) {
          return cellValue.toLowerCase();
        }
      }

      return formula;
    } catch (error) {
      return '#ERROR';
    }
  };

  const getCellDisplayValue = (cellId) => {
    const cell = cellData[cellId];
    if (!cell) return '';
    return cell.formula ? evaluateFormula(cell.formula, cellId) : cell.value;
  };

  const handleCellChange = (cellId, value) => {
    setCellData(prev => ({
      ...prev,
      [cellId]: {
        ...prev[cellId],
        value: value,
        formula: value.startsWith('=') ? value : null
      }
    }));
  };

  const handleCellSelect = (cellId, event) => {
    if (event.shiftKey && selectedCell) {
      setSelectedRange({ start: selectedCell, end: cellId });
    } else {
      setSelectedCell(cellId);
      setSelectedRange(null);
    }
    setFormulaBarValue(cellData[cellId]?.formula || cellData[cellId]?.value || '');
  };

  const applyStyle = (styleType, value) => {
    if (!selectedCell && !selectedRange) return;

    const applyToCells = (cellId) => {
      setCellStyles(prev => ({
        ...prev,
        [cellId]: {
          ...prev[cellId],
          [styleType]: value
        }
      }));
    };

    if (selectedRange) {
      const { start, end } = selectedRange;
      const startCol = start.match(/[A-Z]+/)[0];
      const startRow = parseInt(start.match(/[0-9]+/)[0]);
      const endCol = end.match(/[A-Z]+/)[0];
      const endRow = parseInt(end.match(/[0-9]+/)[0]);

      for (let col = startCol; col <= endCol; col = String.fromCharCode(col.charCodeAt(0) + 1)) {
        for (let row = startRow; row <= endRow; row++) {
          applyToCells(`${col}${row}`);
        }
      }
    } else {
      applyToCells(selectedCell);
    }
  };

  const handleFindReplace = () => {
    const { find, replace } = findReplaceValues;
    setCellData(prev => {
      const newData = { ...prev };
      Object.keys(newData).forEach(cellId => {
        if (newData[cellId]?.value === find) {
          newData[cellId].value = replace;
        }
      });
      return newData;
    });
  };

  const ColorPicker = () => (
    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white p-4 shadow-lg rounded-lg border">
      <div className="grid grid-cols-6 gap-2">
        {['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'gray', 'pink', 'brown', 'cyan', 'magenta'].map(color => (
          <button
            key={color}
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: color }}
            onClick={() => {
              applyStyle('color', color);
              setShowColorPicker(false);
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col">
     <div className="bg-white border-b p-2 flex items-center justify-between">
  <div className="flex items-center space-x-4">
    {/* First Group: Download, Upload, Search */}
    <div className="flex items-center space-x-2 border-r pr-4">
      <button className="p-2 hover:bg-gray-100 rounded">
        <Download size={16} />
      </button>
      <button className="p-2 hover:bg-gray-100 rounded">
        <Upload size={16} />
      </button>
      <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setShowFindReplace(true)}>
        <Search size={16} />
      </button>
    </div>

    {/* Second Group: Font Family and Font Size */}
    <div className="flex items-center space-x-2 border-r pr-4">
      <select className="border rounded p-2 text-sm">
        <option>Arial</option>
        <option>Times New Roman</option>
        <option>Courier New</option>
      </select>
      <select 
        className="border rounded p-2 text-sm w-16"
        onChange={(e) => applyStyle('fontSize', `${e.target.value}px`)}
      >
        {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36].map(size => (
          <option key={size}>{size}</option>
        ))}
      </select>
    </div>

    {/* Third Group: Bold, Italic, Color Picker */}
    <div className="flex items-center space-x-2 border-r pr-4">
      <button 
        className="p-2 hover:bg-gray-100 rounded"
        onClick={() => applyStyle('fontWeight', 'bold')}
      >
        <Bold size={16} />
      </button>
      <button 
        className="p-2 hover:bg-gray-100 rounded"
        onClick={() => applyStyle('fontStyle', 'italic')}
      >
        <Italic size={16} />
      </button>
      <button
        className="p-2 hover:bg-gray-100 rounded"
        onClick={() => setShowColorPicker(!showColorPicker)}
      >
        <PaintBucket size={16} />
      </button>
    </div>

    {/* Fourth Group: Text Alignment */}
    <div className="flex items-center space-x-2">
      <button 
        className="p-2 hover:bg-gray-100 rounded"
        onClick={() => applyStyle('textAlign', 'left')}
      >
        <AlignLeft size={16} />
      </button>
      <button 
        className="p-2 hover:bg-gray-100 rounded"
        onClick={() => applyStyle('textAlign', 'center')}
      >
        <AlignCenter size={16} />
      </button>
      <button 
        className="p-2 hover:bg-gray-100 rounded"
        onClick={() => applyStyle('textAlign', 'right')}
      >
        <AlignRight size={16} />
      </button>
    </div>
  </div>
</div>

      

      {showColorPicker && <ColorPicker />}

      <div className="bg-white border-b p-2 flex items-center">
        <div className="w-10 text-center border-r">fx</div>
        <input
          type="text"
          className="flex-1 px-2 focus:outline-none"
          value={formulaBarValue}
          onChange={(e) => {
            setFormulaBarValue(e.target.value);
            if (selectedCell) {
              handleCellChange(selectedCell, e.target.value);
            }
          }}
        />
      </div>

      {showFindReplace && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white p-4 shadow-lg rounded-lg border">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Find"
              className="border p-1 rounded"
              value={findReplaceValues.find}
              onChange={(e) => setFindReplaceValues(prev => ({ ...prev, find: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Replace with"
              className="border p-1 rounded"
              value={findReplaceValues.replace}
              onChange={(e) => setFindReplaceValues(prev => ({ ...prev, replace: e.target.value }))}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={handleFindReplace}
              >
                Replace All
              </button>
              <button
                className="px-3 py-1 bg-gray-200 rounded"
                onClick={() => setShowFindReplace(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="w-10 h-8 bg-gray-100 border sticky top-0 left-0 z-20"></th>
              {columns.map(col => (
                <th key={col} className="w-24 h-8 bg-gray-100 border sticky top-0 z-10">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row}>
                <td className="w-10 h-6 bg-gray-100 border text-center text-sm sticky left-0 z-10">
                  {row}
                </td>
                {columns.map(col => {
                  const cellId = `${col}${row}`;
                  const cellStyle = cellStyles[cellId] || {};
                  return (
                    <td
                      key={cellId}
                      className={`w-24 h-6 border ${
                        selectedCell === cellId ? 'bg-blue-50' : ''
                      } ${
                        selectedRange && isInRange(cellId, selectedRange.start, selectedRange.end) 
                          ? 'bg-blue-50' 
                          : ''
                      }`}
                      onClick={(e) => handleCellSelect(cellId, e)}
                    >
                      <input
                        type="text"
                        className="w-full h-full px-1 border-none focus:outline-none bg-transparent"
                        value={getCellDisplayValue(cellId)}
                        onChange={(e) => handleCellChange(cellId, e.target.value)}
                        style={cellStyle}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnhancedSpreadsheet;