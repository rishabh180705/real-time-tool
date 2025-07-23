import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Square, Circle, Type, MousePointer, Minus, Undo, Redo, Download, Trash2, Hand, ArrowRight } from 'lucide-react';

const Whiteboard = () => {
  // Canvas reference for drawing operations
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  
  // State management for drawing and UI
  const [tool, setTool] = useState('pen'); // Current selected tool
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState([]); // All drawn elements
  const [currentElement, setCurrentElement] = useState(null); // Element being drawn
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [showTextInput, setShowTextInput] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState('transparent');
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Utility function to get mouse position relative to canvas
  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom
    };
  }, [panOffset, zoom]);

  // Generate unique ID for elements
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Create new element based on tool type
  const createElement = useCallback((x1, y1, x2, y2, type) => {
    const element = {
      id: generateId(),
      x1,
      y1,
      x2,
      y2,
      type,
      strokeColor,
      strokeWidth,
      fillColor,
      roughness: 1,
      points: type === 'pen' ? [{ x: x1, y: y1 }] : []
    };
    
    if (type === 'text') {
      element.text = textInput;
      element.fontSize = 16;
      element.fontFamily = 'Arial';
    }
    
    return element;
  }, [strokeColor, strokeWidth, fillColor, textInput]);

  // Drawing functions for different element types
  const drawElement = useCallback((ctx, element) => {
    ctx.save();
    ctx.strokeStyle = element.strokeColor || '#000000';
    ctx.lineWidth = element.strokeWidth || 2;
    ctx.fillStyle = element.fillColor || 'transparent';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (element.type) {
      case 'pen':
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
          ctx.stroke();
        }
        break;
        
      case 'line':
        ctx.beginPath();
        ctx.moveTo(element.x1, element.y1);
        ctx.lineTo(element.x2, element.y2);
        ctx.stroke();
        break;
        
      case 'rectangle':
        const width = element.x2 - element.x1;
        const height = element.y2 - element.y1;
        if (element.fillColor !== 'transparent') {
          ctx.fillRect(element.x1, element.y1, width, height);
        }
        ctx.strokeRect(element.x1, element.y1, width, height);
        break;
        
      case 'circle':
        const centerX = (element.x1 + element.x2) / 2;
        const centerY = (element.y1 + element.y2) / 2;
        const radius = Math.sqrt(Math.pow(element.x2 - element.x1, 2) + Math.pow(element.y2 - element.y1, 2)) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        if (element.fillColor !== 'transparent') {
          ctx.fill();
        }
        ctx.stroke();
        break;
        
      case 'text':
        ctx.font = `${element.fontSize || 16}px ${element.fontFamily || 'Arial'}`;
        ctx.fillStyle = element.strokeColor;
        ctx.fillText(element.text || '', element.x1, element.y1);
        break;
        
      case 'arrow':
        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(element.x1, element.y1);
        ctx.lineTo(element.x2, element.y2);
        ctx.stroke();
        
        // Draw arrow head
        const angle = Math.atan2(element.y2 - element.y1, element.x2 - element.x1);
        const headLength = 15;
        ctx.beginPath();
        ctx.moveTo(element.x2, element.y2);
        ctx.lineTo(
          element.x2 - headLength * Math.cos(angle - Math.PI / 6),
          element.y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(element.x2, element.y2);
        ctx.lineTo(
          element.x2 - headLength * Math.cos(angle + Math.PI / 6),
          element.y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  }, []);

  // Render all elements on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom and pan transformations
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(panOffset.x / zoom, panOffset.y / zoom);
    
    // Draw all elements
    elements.forEach(element => {
      drawElement(ctx, element);
    });
    
    // Draw current element being created
    if (currentElement) {
      drawElement(ctx, currentElement);
    }
    
    ctx.restore();
  }, [elements, currentElement, drawElement, zoom, panOffset]);

  // Handle mouse down events
  const handleMouseDown = useCallback((e) => {
    const pos = getMousePos(e);
    
    if (tool === 'hand') {
      setIsPanning(true);
      setDragStart(pos);
      return;
    }
    
    if (tool === 'select') {
      // Check if clicking on existing element
      const clickedElement = elements.find(el => isPointInElement(pos, el));
      if (clickedElement) {
        setSelectedElement(clickedElement);
        setDragStart(pos);
        setDragOffset({
          x: pos.x - clickedElement.x1,
          y: pos.y - clickedElement.y1
        });
      } else {
        setSelectedElement(null);
      }
      return;
    }
    
    if (tool === 'text') {
      setTextPosition(pos);
      setShowTextInput(true);
      return;
    }
    
    setIsDrawing(true);
    const newElement = createElement(pos.x, pos.y, pos.x, pos.y, tool);
    setCurrentElement(newElement);
  }, [tool, elements, getMousePos, createElement]);

  // Handle mouse move events
  const handleMouseMove = useCallback((e) => {
    const pos = getMousePos(e);
    
    if (isPanning && dragStart) {
      const deltaX = (pos.x - dragStart.x) * zoom;
      const deltaY = (pos.y - dragStart.y) * zoom;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      return;
    }
    
    if (tool === 'select' && selectedElement && dragStart) {
      const deltaX = pos.x - dragStart.x;
      const deltaY = pos.y - dragStart.y;
      
      const updatedElements = elements.map(el => {
        if (el.id === selectedElement.id) {
          return {
            ...el,
            x1: el.x1 + deltaX,
            y1: el.y1 + deltaY,
            x2: el.x2 + deltaX,
            y2: el.y2 + deltaY,
            points: el.points ? el.points.map(p => ({ x: p.x + deltaX, y: p.y + deltaY })) : []
          };
        }
        return el;
      });
      
      setElements(updatedElements);
      setDragStart(pos);
      return;
    }
    
    if (!isDrawing || !currentElement) return;
    
    if (tool === 'pen') {
      setCurrentElement(prev => ({
        ...prev,
        points: [...prev.points, { x: pos.x, y: pos.y }]
      }));
    } else {
      setCurrentElement(prev => ({
        ...prev,
        x2: pos.x,
        y2: pos.y
      }));
    }
  }, [isDrawing, currentElement, tool, elements, selectedElement, dragStart, getMousePos, isPanning, zoom]);

  // Handle mouse up events
  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      setDragStart(null);
      return;
    }
    
    if (tool === 'select') {
      setDragStart(null);
      return;
    }
    
    if (isDrawing && currentElement) {
      const newElements = [...elements, currentElement];
      setElements(newElements);
      
      // Add to history for undo/redo
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      setCurrentElement(null);
    }
    
    setIsDrawing(false);
  }, [isDrawing, currentElement, elements, history, historyIndex, tool, isPanning]);

  // Check if point is inside element (for selection)
  const isPointInElement = (point, element) => {
    const { x, y } = point;
    const { x1, y1, x2, y2 } = element;
    
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  };

  // Handle text input submission
  const handleTextSubmit = () => {
    if (textInput.trim()) {
      const newElement = createElement(textPosition.x, textPosition.y, textPosition.x, textPosition.y, 'text');
      const newElements = [...elements, newElement];
      setElements(newElements);
      
      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    
    setShowTextInput(false);
    setTextInput('');
  };

  // Undo functionality
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  // Redo functionality
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    setElements([]);
    setHistory([[]]);
    setHistoryIndex(0);
  };

  // Export canvas as image
  const exportImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // Handle zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5));
  };

  // Update canvas when elements change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Resize canvas to fit container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    
    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4 flex-wrap">
        {/* Tool Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setTool('select')}
            className={`p-2 rounded ${tool === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Select"
          >
            <MousePointer size={20} />
          </button>
          <button
            onClick={() => setTool('hand')}
            className={`p-2 rounded ${tool === 'hand' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Pan"
          >
            <Hand size={20} />
          </button>
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded ${tool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Pen"
          >
            <Pencil size={20} />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`p-2 rounded ${tool === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Line"
          >
            <Minus size={20} />
          </button>
          <button
            onClick={() => setTool('rectangle')}
            className={`p-2 rounded ${tool === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Rectangle"
          >
            <Square size={20} />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded ${tool === 'circle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Circle"
          >
            <Circle size={20} />
          </button>
          <button
            onClick={() => setTool('arrow')}
            className={`p-2 rounded ${tool === 'arrow' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Arrow"
          >
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded ${tool === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Text"
          >
            <Type size={20} />
          </button>
        </div>

        {/* Stroke Controls */}
        <div className="flex items-center gap-2">
          <label className="text-sm">Stroke:</label>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-8 h-8 rounded border"
          />
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm">{strokeWidth}px</span>
        </div>

        {/* Fill Controls */}
        <div className="flex items-center gap-2">
          <label className="text-sm">Fill:</label>
          <input
            type="color"
            value={fillColor === 'transparent' ? '#ffffff' : fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            className="w-8 h-8 rounded border"
          />
          <button
            onClick={() => setFillColor('transparent')}
            className={`px-2 py-1 text-sm rounded ${fillColor === 'transparent' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            None
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded bg-gray-200 disabled:opacity-50"
            title="Undo"
          >
            <Undo size={20} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded bg-gray-200 disabled:opacity-50"
            title="Redo"
          >
            <Redo size={20} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded bg-red-500 text-white"
            title="Clear"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={exportImage}
            className="p-2 rounded bg-green-500 text-white"
            title="Export"
          >
            <Download size={20} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.max(prev * 0.9, 0.1))}
            className="px-2 py-1 rounded bg-gray-200"
          >
            -
          </button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(prev => Math.min(prev * 1.1, 5))}
            className="px-2 py-1 rounded bg-gray-200"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-2 py-1 rounded bg-gray-200 text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="absolute inset-0 cursor-crosshair"
          style={{
            cursor: tool === 'hand' ? 'grab' : tool === 'select' ? 'pointer' : 'crosshair'
          }}
        />
        
        {/* Text Input Modal */}
        {showTextInput && (
          <div
            className="absolute bg-white border rounded shadow-lg p-2"
            style={{
              left: textPosition.x * zoom + panOffset.x,
              top: textPosition.y * zoom + panOffset.y
            }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTextSubmit();
                if (e.key === 'Escape') setShowTextInput(false);
              }}
              placeholder="Type text..."
              className="border rounded px-2 py-1 min-w-32"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleTextSubmit}
                className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Add
              </button>
              <button
                onClick={() => setShowTextInput(false)}
                className="px-2 py-1 bg-gray-300 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;