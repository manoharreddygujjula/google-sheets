import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, 
  Save, FileUp, Palette, Plus, Minus, Search, Replace
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import 'src/styles/Spreadsheet.css';

const INITIAL_COLUMNS = 'ABCDEFGHIJKLMNOP'.split('');
const INITIAL_ROWS = Array.from({ length: 100 }, (_, i) => i + 1);

const EnhancedSpreadsheet = () => {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [cellData, setCellData] = useState({});
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [cellStyles, setCellStyles] = useState({});
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // Enhanced formula evaluation function
  const evaluateFormula = (formula, cellId) => {
    if (!formula?.startsWith('=')) return formula;
    
    try {
      let result;
      const formulaUpper = formula.toUpperCase();
      
      // Handle range operations
      const rangeMatch = formulaUpper.match(/([A-Z]+[0-9]+):([A-Z]+[0-9]+)/);
      if (rangeMatch) {
        const [fullMatch, start, end] = rangeMatch;
        const values = getRangeValues(start, end);
        const numericValues = values.map(getNumericValue);

        if (formulaUpper.includes('SUM')) {
          result = numericValues.reduce((sum, val) => sum + val, 0);
        } else if (formulaUpper.includes('AVERAGE')) {
          result = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
        } else if (formulaUpper.includes('MAX')) {
          result = Math.max(...numericValues);
        } else if (formulaUpper.includes('MIN')) {
          result = Math.min(...numericValues);
        } else if (formulaUpper.includes('COUNT')) {
          result = numericValues.filter(v => v !== 0).length;
        } else if (formulaUpper.includes('REMOVE_DUPLICATES')) {
          result = [...new Set(values)].join(', ');
        }
      } else {
        // Handle single cell operations
        const cellRefs = formula.match(/[A-Z]+[0-9]+/g) || [];
        let evaluatedFormula = formula.substring(1);
        
        cellRefs.forEach(ref => {
          const value = getCellValue(ref);
          evaluatedFormula = evaluatedFormula.replace(ref, getNumericValue(value));
        });

        if (formulaUpper.includes('TRIM')) {
          const targetRef = cellRefs[0];
          result = targetRef ? String(getCellValue(targetRef)).trim() : '';
        } else if (formulaUpper.includes('UPPER')) {
          const targetRef = cellRefs[0];
          result = targetRef ? String(getCellValue(targetRef)).toUpperCase() : '';
        } else if (formulaUpper.includes('LOWER')) {
          const targetRef = cellRefs[0];
          result = targetRef ? String(getCellValue(targetRef)).toLowerCase() : '';
        } else {
          result = eval(evaluatedFormula);
        }
      }

      return isNaN(result) ? result : Number(result.toFixed(2));
    } catch (error) {
      return '#ERROR';
    }
  };

  // Handle find and replace
  const handleFindReplace = () => {
    const newCellData = { ...cellData };
    Object.keys(newCellData).forEach(cellId => {
      if (newCellData[cellId].value?.includes(findText)) {
        newCellData[cellId].value = newCellData[cellId].value.replace(
          new RegExp(findText, 'g'),
          replaceText
        );
      }
    });
    setCellData(newCellData);
    setShowFindReplace(false);
  };

  // Add column
  const addColumn = () => {
    const lastCol = columns[columns.length - 1];
    const nextCol = String.fromCharCode(lastCol.charCodeAt(0) + 1);
    setColumns([...columns, nextCol]);
  };

  // Remove column
  const removeColumn = () => {
    if (columns.length > 1) {
      setColumns(columns.slice(0, -1));
    }
  };

  // Add row
  const addRow = () => {
    const nextRow = rows[rows.length - 1] + 1;
    setRows([...rows, nextRow]);
  };

  // Remove row
  const removeRow = () => {
    if (rows.length > 1) {
      setRows(rows.slice(0, -1));
    }
  };

  // Rest of the component implementation...
  // (Previous functions like getCellValue, handleCellChange, etc. remain the same)

  return (
    <div className="spreadsheet-container">
      {/* Menu Bar */}
      <div className="menu-bar">
        {/* Previous menu bar implementation... */}
        <div className="toolbar-group">
          <Button onClick={() => setShowFindReplace(true)} className="toolbar-button">
            <Search size={16} />
          </Button>
          <Button onClick={addColumn} className="toolbar-button">
            <Plus size={16} /> Col
          </Button>
          <Button onClick={removeColumn} className="toolbar-button">
            <Minus size={16} /> Col
          </Button>
          <Button onClick={addRow} className="toolbar-button">
            <Plus size={16} /> Row
          </Button>
          <Button onClick={removeRow} className="toolbar-button">
            <Minus size={16} /> Row
          </Button>
        </div>
      </div>

      {/* Find and Replace Dialog */}
      <Dialog open={showFindReplace} onOpenChange={setShowFindReplace}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Find and Replace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Find text..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
            />
            <Input
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
            />
            <Button onClick={handleFindReplace}>Replace All</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Previous implementation of toolbar, formula bar, and grid... */}
    </div>
  );
};

export default EnhancedSpreadsheet;