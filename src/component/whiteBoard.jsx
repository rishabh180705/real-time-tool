import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Pencil, Square, Circle, Type, MousePointer, Minus, Undo, Redo, Download, 
  Trash2, Hand, ArrowRight, Copy, RotateCcw, Maximize2, Grid3X3,
  Palette, Settings, Lock, Unlock, Eye, EyeOff, ZoomIn, ZoomOut, Home,
  Triangle, Star, Diamond, Plus, Save, FolderOpen, Image, Layers
} from 'lucide-react';

const Whiteboard = () => {
  // Canvas references
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Core state
  const [tool, setTool] = useState('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState([]);
  const [currentElement, setCurrentElement] = useState(null);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedElements, setSelectedElements] = useState([]);
  const [clipboard, setClipboard] = useState([]);
  
  // Drawing state
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  
  // Text input state
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [showTextInput, setShowTextInput] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  
  // Style state
  const [strokeColor, setStrokeColor] = useState('#1a1a1a');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState('transparent');
  const [opacity, setOpacity] = useState(1);
  const [strokeDashArray, setStrokeDashArray] = useState([]);
  
  // Canvas state
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  
  // UI state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('light');
  const [layers, setLayers] = useState([{ id: 1, name: 'Layer 1', visible: true, locked: false }]);
  const [activeLayer, setActiveLayer] = useState(1);

  // Utility functions
  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom
    };
  }, [panOffset, zoom]);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const snapToGridPoint = (point) => {
    if (!snapToGrid) return point;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  };

  // Enhanced createElement with more properties
  const createElement = useCallback((x1, y1, x2, y2, type) => {
    const snappedStart = snapToGridPoint({ x: x1, y: y1 });
    const snappedEnd = snapToGridPoint({ x: x2, y: y2 });
    
    const element = {
      id: generateId(),
      x1: snappedStart.x,
      y1: snappedStart.y,
      x2: snappedEnd.x,
      y2: snappedEnd.y,
      type,
      strokeColor,
      strokeWidth,
      fillColor,
      opacity,
      strokeDashArray,
      layer: activeLayer,
      locked: false,
      visible: true,
      rotation: 0,
      points: type === 'pen' ? [snappedStart] : [],
      roughness: 1
    };
    
    if (type === 'text') {
      element.text = textInput;
      element.fontSize = fontSize;
      element.fontFamily = fontFamily;
    }
    
    return element;
  }, [strokeColor, strokeWidth, fillColor, opacity, strokeDashArray, activeLayer, textInput, fontSize, fontFamily, snapToGrid, gridSize]);

  // Enhanced element bounds calculation
  const getElementBounds = (element) => {
    if (element.type === 'pen') {
      const xs = element.points.map(p => p.x);
      const ys = element.points.map(p => p.y);
      return {
        x1: Math.min(...xs),
        y1: Math.min(...ys),
        x2: Math.max(...xs),
        y2: Math.max(...ys)
      };
    }
    
    return {
      x1: Math.min(element.x1, element.x2),
      y1: Math.min(element.y1, element.y2),
      x2: Math.max(element.x1, element.x2),
      y2: Math.max(element.y1, element.y2)
    };
  };

  // Enhanced point in element detection
  const isPointInElement = (point, element) => {
    const bounds = getElementBounds(element);
    const tolerance = Math.max(5, element.strokeWidth || 2);
    
    const { x, y } = point;
    
    if (element.type === 'pen') {
      return element.points.some((p, i) => {
        if (i === 0) return false;
        const prevPoint = element.points[i - 1];
        return isPointNearLine(point, prevPoint, p, tolerance);
      });
    }
    
    if (element.type === 'circle') {
      const centerX = (bounds.x1 + bounds.x2) / 2;
      const centerY = (bounds.y1 + bounds.y2) / 2;
      const radius = Math.sqrt(Math.pow(bounds.x2 - bounds.x1, 2) + Math.pow(bounds.y2 - bounds.y1, 2)) / 2;
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      return Math.abs(distance - radius) <= tolerance;
    }
    
    return x >= bounds.x1 - tolerance && x <= bounds.x2 + tolerance &&
           y >= bounds.y1 - tolerance && y <= bounds.y2 + tolerance;
  };

  const isPointNearLine = (point, lineStart, lineEnd, tolerance) => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B) <= tolerance;
    
    const param = dot / lenSq;
    let xx, yy;
    
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }
    
    const dx = point.x - xx;
    const dy = point.y - yy;
    
    return Math.sqrt(dx * dx + dy * dy) <= tolerance;
  };

  // Enhanced drawing function with more shape support
  const drawElement = useCallback((ctx, element) => {
    if (!element.visible) return;
    
    ctx.save();
    
    // Apply opacity
    ctx.globalAlpha = element.opacity || 1;
    
    // Set styles
    ctx.strokeStyle = element.strokeColor || '#000000';
    ctx.lineWidth = element.strokeWidth || 2;
    ctx.fillStyle = element.fillColor || 'transparent';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Apply dash pattern
    if (element.strokeDashArray && element.strokeDashArray.length > 0) {
      ctx.setLineDash(element.strokeDashArray);
    }
    
    // Apply rotation if exists
    if (element.rotation) {
      const centerX = (element.x1 + element.x2) / 2;
      const centerY = (element.y1 + element.y2) / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(element.rotation);
      ctx.translate(-centerX, -centerY);
    }

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
        
      case 'triangle':
        const midX = (element.x1 + element.x2) / 2;
        ctx.beginPath();
        ctx.moveTo(midX, element.y1);
        ctx.lineTo(element.x1, element.y2);
        ctx.lineTo(element.x2, element.y2);
        ctx.closePath();
        if (element.fillColor !== 'transparent') {
          ctx.fill();
        }
        ctx.stroke();
        break;
        
      case 'diamond':
        const diamondMidX = (element.x1 + element.x2) / 2;
        const diamondMidY = (element.y1 + element.y2) / 2;
        ctx.beginPath();
        ctx.moveTo(diamondMidX, element.y1);
        ctx.lineTo(element.x2, diamondMidY);
        ctx.lineTo(diamondMidX, element.y2);
        ctx.lineTo(element.x1, diamondMidY);
        ctx.closePath();
        if (element.fillColor !== 'transparent') {
          ctx.fill();
        }
        ctx.stroke();
        break;
        
      case 'star':
        drawStar(ctx, element);
        break;
        
      case 'text':
        ctx.font = `${element.fontSize || 16}px ${element.fontFamily || 'Arial'}`;
        ctx.fillStyle = element.strokeColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(element.text || '', element.x1, element.y1);
        break;
        
      case 'arrow':
        drawArrow(ctx, element);
        break;
    }
    
    ctx.restore();
  }, []);

  const drawStar = (ctx, element) => {
    const centerX = (element.x1 + element.x2) / 2;
    const centerY = (element.y1 + element.y2) / 2;
    const outerRadius = Math.min(Math.abs(element.x2 - element.x1), Math.abs(element.y2 - element.y1)) / 2;
    const innerRadius = outerRadius * 0.4;
    const spikes = 5;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    
    if (element.fillColor !== 'transparent') {
      ctx.fill();
    }
    ctx.stroke();
  };

  const drawArrow = (ctx, element) => {
    ctx.beginPath();
    ctx.moveTo(element.x1, element.y1);
    ctx.lineTo(element.x2, element.y2);
    ctx.stroke();
    
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
  };

  // Draw grid
  const drawGrid = useCallback((ctx) => {
    if (!showGrid) return;
    
    const canvas = canvasRef.current;
    ctx.save();
    ctx.strokeStyle = theme === 'dark' ? '#333' : '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    
    const startX = Math.floor((-panOffset.x / zoom) / gridSize) * gridSize;
    const startY = Math.floor((-panOffset.y / zoom) / gridSize) * gridSize;
    const endX = startX + (canvas.width / zoom) + gridSize;
    const endY = startY + (canvas.height / zoom) + gridSize;
    
    ctx.beginPath();
    for (let x = startX; x < endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y < endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();
    
    ctx.restore();
  }, [showGrid, theme, panOffset, zoom, gridSize]);

  // Draw selection bounds
  const drawSelectionBounds = useCallback((ctx) => {
    selectedElements.forEach(element => {
      const bounds = getElementBounds(element);
      ctx.save();
      ctx.strokeStyle = '#007acc';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([5 / zoom, 5 / zoom]);
      ctx.strokeRect(bounds.x1 - 5, bounds.y1 - 5, bounds.x2 - bounds.x1 + 10, bounds.y2 - bounds.y1 + 10);
      
      // Draw resize handles
      const handles = [
        { x: bounds.x1, y: bounds.y1 },
        { x: bounds.x2, y: bounds.y1 },
        { x: bounds.x2, y: bounds.y2 },
        { x: bounds.x1, y: bounds.y2 }
      ];
      
      ctx.fillStyle = '#007acc';
      ctx.setLineDash([]);
      handles.forEach(handle => {
        ctx.fillRect(handle.x - 4, handle.y - 4, 8, 8);
      });
      
      ctx.restore();
    });
  }, [selectedElements, zoom]);

  // Main canvas redraw function
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(panOffset.x / zoom, panOffset.y / zoom);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw elements by layer
    layers.forEach(layer => {
      if (layer.visible) {
        elements
          .filter(el => el.layer === layer.id)
          .forEach(element => drawElement(ctx, element));
      }
    });
    
    // Draw current element
    if (currentElement) {
      drawElement(ctx, currentElement);
    }
    
    // Draw selection bounds
    drawSelectionBounds(ctx);
    
    ctx.restore();
  }, [elements, currentElement, zoom, panOffset, drawGrid, drawElement, drawSelectionBounds, layers]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    const pos = getMousePos(e);
    
    if (tool === 'hand') {
      setIsPanning(true);
      setDragStart(pos);
      return;
    }
    
    if (tool === 'select') {
      const clickedElement = elements.find(el => isPointInElement(pos, el));
      
      if (clickedElement) {
        if (!selectedElements.includes(clickedElement)) {
          if (e.ctrlKey || e.metaKey) {
            setSelectedElements([...selectedElements, clickedElement]);
          } else {
            setSelectedElements([clickedElement]);
          }
        }
        setDragStart(pos);
        setIsDragging(true);
      } else {
        setSelectedElements([]);
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
  }, [tool, elements, selectedElements, getMousePos, createElement]);

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
    
    if (tool === 'select' && isDragging && selectedElements.length > 0 && dragStart) {
      const deltaX = pos.x - dragStart.x;
      const deltaY = pos.y - dragStart.y;
      
      const updatedElements = elements.map(el => {
        if (selectedElements.includes(el)) {
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
        points: [...prev.points, pos]
      }));
    } else {
      setCurrentElement(prev => ({
        ...prev,
        x2: pos.x,
        y2: pos.y
      }));
    }
  }, [isDrawing, currentElement, tool, elements, selectedElements, dragStart, getMousePos, isPanning, zoom, isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      setDragStart(null);
      return;
    }
    
    if (tool === 'select') {
      setIsDragging(false);
      setDragStart(null);
      return;
    }
    
    if (isDrawing && currentElement) {
      const newElements = [...elements, currentElement];
      setElements(newElements);
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      setCurrentElement(null);
    }
    
    setIsDrawing(false);
  }, [isDrawing, currentElement, elements, history, historyIndex, tool, isPanning]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'c':
            e.preventDefault();
            copyElements();
            break;
          case 'v':
            e.preventDefault();
            pasteElements();
            break;
          case 'a':
            e.preventDefault();
            selectAll();
            break;
          case 's':
            e.preventDefault();
            exportImage();
            break;
        }
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElements, history, historyIndex]);

  // Action functions
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
      setSelectedElements([]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
      setSelectedElements([]);
    }
  };

  const copyElements = () => {
    if (selectedElements.length > 0) {
      setClipboard([...selectedElements]);
    }
  };

  const pasteElements = () => {
    if (clipboard.length > 0) {
      const newElements = clipboard.map(el => ({
        ...el,
        id: generateId(),
        x1: el.x1 + 20,
        y1: el.y1 + 20,
        x2: el.x2 + 20,
        y2: el.y2 + 20,
        points: el.points ? el.points.map(p => ({ x: p.x + 20, y: p.y + 20 })) : []
      }));
      
      const updatedElements = [...elements, ...newElements];
      setElements(updatedElements);
      setSelectedElements(newElements);
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updatedElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const deleteSelected = () => {
    if (selectedElements.length > 0) {
      const newElements = elements.filter(el => !selectedElements.includes(el));
      setElements(newElements);
      setSelectedElements([]);
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const selectAll = () => {
    setSelectedElements([...elements]);
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElements([]);
    setHistory([[]]);
    setHistoryIndex(0);
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      const newElement = createElement(textPosition.x, textPosition.y, textPosition.x, textPosition.y, 'text');
      const newElements = [...elements, newElement];
      setElements(newElements);
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    
    setShowTextInput(false);
    setTextInput('');
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5));
  }, []);

  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Canvas resize effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const themeClasses = {
    bg: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    toolbar: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    button: theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200',
    activeButton: theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white',
    text: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
    input: theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300',
    panel: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  };

  return (
    <div className={`w-full h-screen ${themeClasses.bg} flex flex-col`}>
      {/* Enhanced Toolbar */}
      <div className={`${themeClasses.toolbar} border-b p-3 flex items-center justify-between flex-wrap gap-2`}>
        {/* Left Section - Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tool Groups */}
          <div className="flex gap-1 border-r pr-2">
            {[
              { tool: 'select', icon: MousePointer, title: 'Select (V)' },
              { tool: 'hand', icon: Hand, title: 'Pan (H)' },
            ].map(({ tool: t, icon: Icon, title }) => (
              <button
                key={t}
                onClick={() => setTool(t)}
                className={`p-2 rounded-lg transition-colors ${
                  tool === t ? themeClasses.activeButton : themeClasses.button
                }`}
                title={title}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>

          <div className="flex gap-1 border-r pr-2">
            {[
              { tool: 'rectangle', icon: Square, title: 'Rectangle (R)' },
              { tool: 'circle', icon: Circle, title: 'Circle (C)' },
              { tool: 'triangle', icon: Triangle, title: 'Triangle (T)' },
              { tool: 'diamond', icon: Diamond, title: 'Diamond (D)' },
              { tool: 'star', icon: Star, title: 'Star (S)' },
            ].map(({ tool: t, icon: Icon, title }) => (
              <button
                key={t}
                onClick={() => setTool(t)}
                className={`p-2 rounded-lg transition-colors ${
                  tool === t ? themeClasses.activeButton : themeClasses.button
                }`}
                title={title}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>

          <div className="flex gap-1 border-r pr-2">
            <button
              onClick={() => setTool('text')}
              className={`p-2 rounded-lg transition-colors ${
                tool === 'text' ? themeClasses.activeButton : themeClasses.button
              }`}
              title="Text (T)"
            >
              <Type size={18} />
            </button>
          </div>

          {/* Style Controls */}
          <div className="flex items-center gap-2 border-r pr-2">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`p-2 rounded-lg ${themeClasses.button} border-2`}
                style={{ borderColor: strokeColor }}
                title="Stroke Color"
              >
                <Palette size={18} />
              </button>
              {showColorPicker && (
                <div className={`absolute top-12 left-0 ${themeClasses.panel} border rounded-lg shadow-lg p-3 z-50`}>
                  <div className="grid grid-cols-6 gap-2 mb-3">
                    {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
                      '#ff00ff', '#00ffff', '#ffa500', '#800080', '#ffc0cb', '#a52a2a'].map(color => (
                      <button
                        key={color}
                        onClick={() => setStrokeColor(color)}
                        className="w-8 h-8 rounded border-2 border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-full h-8 rounded border"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-sm ${themeClasses.text}`}>Stroke:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-16"
              />
              <span className={`text-sm ${themeClasses.text} w-8`}>{strokeWidth}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-r pr-2">
            <span className={`text-sm ${themeClasses.text}`}>Fill:</span>
            <input
              type="color"
              value={fillColor === 'transparent' ? '#ffffff' : fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-8 h-8 rounded border"
            />
            <button
              onClick={() => setFillColor('transparent')}
              className={`px-2 py-1 text-xs rounded ${
                fillColor === 'transparent' ? themeClasses.activeButton : themeClasses.button
              }`}
            >
              None
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm ${themeClasses.text}`}>Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-16"
            />
            <span className={`text-sm ${themeClasses.text} w-8`}>{Math.round(opacity * 100)}%</span>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Edit Actions */}
          <div className="flex gap-1 border-r pr-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded-lg transition-colors ${themeClasses.button} disabled:opacity-50`}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded-lg transition-colors ${themeClasses.button} disabled:opacity-50`}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo size={18} />
            </button>
          </div>

          <div className="flex gap-1 border-r pr-2">
            <button
              onClick={copyElements}
              disabled={selectedElements.length === 0}
              className={`p-2 rounded-lg transition-colors ${themeClasses.button} disabled:opacity-50`}
              title="Copy (Ctrl+C)"
            >
              <Copy size={18} />
            </button>
            <button
              onClick={pasteElements}
              disabled={clipboard.length === 0}
              className={`p-2 rounded-lg transition-colors ${themeClasses.button} disabled:opacity-50`}
              title="Paste (Ctrl+V)"
            >
        
            </button>
            <button
              onClick={deleteSelected}
              disabled={selectedElements.length === 0}
              className={`p-2 rounded-lg transition-colors ${themeClasses.button} disabled:opacity-50`}
              title="Delete (Del)"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* View Controls */}
          <div className="flex gap-1 border-r pr-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors ${
                showGrid ? themeClasses.activeButton : themeClasses.button
              }`}
              title="Toggle Grid"
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setZoom(prev => Math.min(prev * 1.2, 5))}
              className={`p-2 rounded-lg transition-colors ${themeClasses.button}`}
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.1))}
              className={`p-2 rounded-lg transition-colors ${themeClasses.button}`}
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={resetView}
              className={`p-2 rounded-lg transition-colors ${themeClasses.button}`}
              title="Reset View"
            >
              <Home size={18} />
            </button>
          </div>

          {/* Zoom Display */}
          <div className={`px-2 py-1 rounded ${themeClasses.button} text-sm ${themeClasses.text}`}>
            {Math.round(zoom * 100)}%
          </div>

          {/* Export & Settings */}
          <div className="flex gap-1">
            <button
              onClick={exportImage}
              className={`p-2 rounded-lg transition-colors ${themeClasses.button}`}
              title="Export Image (Ctrl+S)"
            >
              <Download size={18} />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-lg transition-colors bg-red-500 hover:bg-red-600 text-white"
              title="Clear Canvas"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? themeClasses.activeButton : themeClasses.button
              }`}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex relative">
        {/* Settings Panel */}
        {showSettings && (
          <div className={`w-80 ${themeClasses.panel} border-r p-4 overflow-y-auto`}>
            <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>Settings</h3>
            
            {/* Theme Toggle */}
            <div className="mb-6">
              <h4 className={`text-sm font-medium mb-2 ${themeClasses.text}`}>Theme</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 text-sm rounded ${
                    theme === 'light' ? themeClasses.activeButton : themeClasses.button
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 text-sm rounded ${
                    theme === 'dark' ? themeClasses.activeButton : themeClasses.button
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Grid Settings */}
            <div className="mb-6">
              <h4 className={`text-sm font-medium mb-2 ${themeClasses.text}`}>Grid</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded"
                  />
                  <span className={`text-sm ${themeClasses.text}`}>Show Grid</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                    className="rounded"
                  />
                  <span className={`text-sm ${themeClasses.text}`}>Snap to Grid</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${themeClasses.text}`}>Size:</span>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className={`text-sm ${themeClasses.text}`}>{gridSize}px</span>
                </div>
              </div>
            </div>

            {/* Text Settings */}
            <div className="mb-6">
              <h4 className={`text-sm font-medium mb-2 ${themeClasses.text}`}>Text</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${themeClasses.text}`}>Size:</span>
                  <input
                    type="range"
                    min="8"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className={`text-sm ${themeClasses.text}`}>{fontSize}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${themeClasses.text}`}>Font:</span>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className={`flex-1 px-2 py-1 rounded ${themeClasses.input}`}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Layers */}
            <div className="mb-6">
              <h4 className={`text-sm font-medium mb-2 ${themeClasses.text}`}>Layers</h4>
              <div className="space-y-1">
                {layers.map(layer => (
                  <div key={layer.id} className={`flex items-center gap-2 p-2 rounded ${
                    activeLayer === layer.id ? 'bg-blue-500 bg-opacity-20' : ''
                  }`}>
                    <button
                      onClick={() => {
                        const updatedLayers = layers.map(l => 
                          l.id === layer.id ? { ...l, visible: !l.visible } : l
                        );
                        setLayers(updatedLayers);
                      }}
                      className={`p-1 rounded ${themeClasses.button}`}
                    >
                      {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => setActiveLayer(layer.id)}
                      className={`flex-1 text-left text-sm ${themeClasses.text}`}
                    >
                      {layer.name}
                    </button>
                    <button
                      onClick={() => {
                        const updatedLayers = layers.map(l => 
                          l.id === layer.id ? { ...l, locked: !l.locked } : l
                        );
                        setLayers(updatedLayers);
                      }}
                      className={`p-1 rounded ${themeClasses.button}`}
                    >
                      {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newLayer = {
                      id: Math.max(...layers.map(l => l.id)) + 1,
                      name: `Layer ${layers.length + 1}`,
                      visible: true,
                      locked: false
                    };
                    setLayers([...layers, newLayer]);
                  }}
                  className={`w-full p-2 rounded ${themeClasses.button} text-sm`}
                >
                  <Plus size={16} className="inline mr-1" />
                  Add Layer
                </button>
              </div>
            </div>

            {/* Element Properties */}
            {selectedElements.length > 0 && (
              <div className="mb-6">
                <h4 className={`text-sm font-medium mb-2 ${themeClasses.text}`}>
                  Selected Elements ({selectedElements.length})
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${themeClasses.text}`}>Opacity:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={selectedElements[0]?.opacity || 1}
                      onChange={(e) => {
                        const newOpacity = Number(e.target.value);
                        const updatedElements = elements.map(el => 
                          selectedElements.includes(el) ? { ...el, opacity: newOpacity } : el
                        );
                        setElements(updatedElements);
                      }}
                      className="flex-1"
                    />
                    <span className={`text-sm ${themeClasses.text}`}>
                      {Math.round((selectedElements[0]?.opacity || 1) * 100)}%
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const updatedElements = elements.map(el => 
                        selectedElements.includes(el) ? { ...el, locked: !el.locked } : el
                      );
                      setElements(updatedElements);
                    }}
                    className={`w-full p-2 rounded ${themeClasses.button} text-sm`}
                  >
                    {selectedElements[0]?.locked ? <Unlock size={16} /> : <Lock size={16} />}
                    <span className="ml-1">
                      {selectedElements[0]?.locked ? 'Unlock' : 'Lock'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div>
              <h4 className={`text-sm font-medium mb-2 ${themeClasses.text}`}>Statistics</h4>
              <div className={`text-sm ${themeClasses.text} space-y-1`}>
                <div>Elements: {elements.length}</div>
                <div>Selected: {selectedElements.length}</div>
                <div>Layers: {layers.length}</div>
                <div>History: {history.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Canvas Container */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            className="absolute inset-0"
            style={{
              cursor: tool === 'hand' ? (isPanning ? 'grabbing' : 'grab') : 
                      tool === 'select' ? 'default' : 'crosshair',
              background: theme === 'dark' ? '#1a1a1a' : '#ffffff'
            }}
          />
          
          {/* Text Input Modal */}
          {showTextInput && (
            <div
              className={`absolute ${themeClasses.panel} border rounded-lg shadow-lg p-3 z-50`}
              style={{
                left: Math.min(textPosition.x * zoom + panOffset.x, window.innerWidth - 200),
                top: Math.min(textPosition.y * zoom + panOffset.y, window.innerHeight - 100)
              }}
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTextSubmit();
                  if (e.key === 'Escape') {
                    setShowTextInput(false);
                    setTextInput('');
                  }
                }}
                placeholder="Type text..."
                className={`w-48 px-3 py-2 rounded ${themeClasses.input}`}
                style={{ fontSize: `${fontSize}px`, fontFamily }}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleTextSubmit}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput('');
                  }}
                  className={`px-3 py-1 rounded text-sm ${themeClasses.button}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Status Bar */}
          <div className={`absolute bottom-4 left-4 ${themeClasses.panel} border rounded-lg px-3 py-1 text-sm ${themeClasses.text}`}>
            {tool === 'select' && selectedElements.length > 0 && (
              <span>{selectedElements.length} selected</span>
            )}
            {tool !== 'select' && (
              <span>Tool: {tool}</span>
            )}
            <span className="ml-4">Zoom: {Math.round(zoom * 100)}%</span>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className={`absolute bottom-4 right-4 ${themeClasses.panel} border rounded-lg p-3 text-xs ${themeClasses.text} max-w-64`}>
            <div className="font-medium mb-2">Shortcuts:</div>
            <div className="space-y-1">
              <div>Ctrl+Z: Undo</div>
              <div>Ctrl+C/V: Copy/Paste</div>
              <div>Ctrl+A: Select All</div>
              <div>Del: Delete Selected</div>
              <div>Mouse Wheel: Zoom</div>
              <div>Space+Drag: Pan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;


// 




// import React, { useEffect, useRef, useState } from "react";
// import { Pencil, Move, Eraser, Type, Square, Circle, Undo, Redo, Trash2, Download, ZoomIn, ZoomOut, Upload, Palette, Settings } from "lucide-react";

// const Whiteboard = () => {
//   const canvasRef = useRef(null);
//   const [canvas, setCanvas] = useState(null);
//   const [tool, setTool] = useState("pencil");
//   const [color, setColor] = useState("#000000");
//   const [lineWidth, setLineWidth] = useState(2);
//   const [history, setHistory] = useState([]);
//   const [redoStack, setRedoStack] = useState([]);
//   const [isDrawing, setIsDrawing] = useState(false);

//   // Dynamic fabric loading
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
//     script.onload = () => {
//       initCanvas();
//     };
//     document.head.appendChild(script);

//     return () => {
//       document.head.removeChild(script);
//     };
//   }, []);

//   const initCanvas = () => {
//     if (typeof fabric !== 'undefined') {
//       const canvasInstance = new fabric.Canvas("canvas", {
//         isDrawingMode: true,
//         backgroundColor: "#ffffff",
//         width: window.innerWidth - 320,
//         height: window.innerHeight - 100,
//         selection: false,
//       });
      
//       canvasRef.current = canvasInstance;
//       setCanvas(canvasInstance);

//       // Add event listeners
//       canvasInstance.on('path:created', saveHistory);
//       canvasInstance.on('object:added', saveHistory);
//       canvasInstance.on('object:removed', saveHistory);
//       canvasInstance.on('object:modified', saveHistory);
//     }
//   };

//   useEffect(() => {
//     if (!canvas) return;
    
//     if (tool === "pencil") {
//       canvas.isDrawingMode = true;
//       canvas.freeDrawingBrush.width = lineWidth;
//       canvas.freeDrawingBrush.color = color;
//       canvas.selection = false;
//     } else if (tool === "eraser") {
//       canvas.isDrawingMode = true;
//       canvas.freeDrawingBrush.width = lineWidth * 2;
//       canvas.freeDrawingBrush.color = "#ffffff";
//       canvas.selection = false;
//     } else {
//       canvas.isDrawingMode = false;
//       canvas.selection = true;
//     }
//   }, [tool, color, lineWidth, canvas]);

//   const handleAddText = () => {
//     if (!canvas) return;
//     const textbox = new fabric.Textbox("Type here", {
//       left: 100,
//       top: 100,
//       fontSize: 20,
//       fill: color,
//       fontFamily: 'Arial',
//       cornerStyle: 'circle',
//       cornerColor: '#4F46E5',
//       cornerSize: 8,
//       transparentCorners: false,
//     });
//     canvas.add(textbox);
//     canvas.setActiveObject(textbox);
//     saveHistory();
//   };

//   const handleAddShape = (shape) => {
//     if (!canvas) return;
//     let shapeObj;
//     if (shape === "rectangle") {
//       shapeObj = new fabric.Rect({
//         left: 100,
//         top: 100,
//         fill: 'transparent',
//         stroke: color,
//         strokeWidth: lineWidth,
//         width: 100,
//         height: 60,
//         cornerStyle: 'circle',
//         cornerColor: '#4F46E5',
//         cornerSize: 8,
//         transparentCorners: false,
//       });
//     } else if (shape === "circle") {
//       shapeObj = new fabric.Circle({
//         left: 100,
//         top: 100,
//         fill: 'transparent',
//         stroke: color,
//         strokeWidth: lineWidth,
//         radius: 40,
//         cornerStyle: 'circle',
//         cornerColor: '#4F46E5',
//         cornerSize: 8,
//         transparentCorners: false,
//       });
//     }
//     canvas.add(shapeObj);
//     canvas.setActiveObject(shapeObj);
//     saveHistory();
//   };

//   const saveHistory = () => {
//     if (!canvas) return;
//     const currentState = JSON.stringify(canvas.toJSON());
//     setHistory(prev => [...prev.slice(-19), currentState]); // Keep only last 20 states
//     setRedoStack([]);
//   };

//   const handleUndo = () => {
//     if (history.length === 0 || !canvas) return;
//     const prev = history[history.length - 1];
//     setRedoStack(prev => [...prev, JSON.stringify(canvas.toJSON())]);
//     canvas.loadFromJSON(prev, () => {
//       canvas.renderAll();
//       setHistory(prev => prev.slice(0, -1));
//     });
//   };

//   const handleRedo = () => {
//     if (redoStack.length === 0 || !canvas) return;
//     const next = redoStack[redoStack.length - 1];
//     setHistory(prev => [...prev, JSON.stringify(canvas.toJSON())]);
//     canvas.loadFromJSON(next, () => {
//       canvas.renderAll();
//       setRedoStack(prev => prev.slice(0, -1));
//     });
//   };

//   const handleClear = () => {
//     if (!canvas) return;
//     canvas.clear();
//     canvas.backgroundColor = "#ffffff";
//     saveHistory();
//   };

//   const handleDownload = () => {
//     if (!canvas) return;
//     const dataURL = canvas.toDataURL({
//       format: "png",
//       quality: 1,
//     });
//     const link = document.createElement("a");
//     link.href = dataURL;
//     link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
//     link.click();
//   };

//   const handleZoom = (factor) => {
//     if (!canvas) return;
//     let zoom = canvas.getZoom();
//     zoom *= factor;
//     if (zoom > 5) zoom = 5;
//     if (zoom < 0.1) zoom = 0.1;
//     canvas.setZoom(zoom);
//     canvas.setViewportTransform(canvas.viewportTransform);
//   };

//   const handlePan = () => {
//     if (!canvas) return;

//     let isPanning = false;

//     const onMouseDown = (e) => {
//       if (tool === "pan") {
//         isPanning = true;
//         canvas.selection = false;
//       }
//     };

//     const onMouseMove = (e) => {
//       if (isPanning && e && e.e) {
//         const delta = new fabric.Point(e.e.movementX, e.e.movementY);
//         canvas.relativePan(delta);
//       }
//     };

//     const onMouseUp = () => {
//       isPanning = false;
//     };

//     canvas.off("mouse:down");
//     canvas.off("mouse:move");
//     canvas.off("mouse:up");

//     canvas.on("mouse:down", onMouseDown);
//     canvas.on("mouse:move", onMouseMove);
//     canvas.on("mouse:up", onMouseUp);
//   };

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file || !canvas) return;
//     const reader = new FileReader();
//     reader.onload = function (f) {
//       fabric.Image.fromURL(f.target.result, (img) => {
//         img.scaleToWidth(400);
//         img.set({
//           left: 50,
//           top: 50,
//           cornerStyle: 'circle',
//           cornerColor: '#4F46E5',
//           cornerSize: 8,
//           transparentCorners: false,
//         });
//         canvas.add(img);
//         canvas.setActiveObject(img);
//         saveHistory();
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   useEffect(() => {
//     if (canvas) {
//       handlePan();
//     }
//   }, [tool, canvas]);

//   const ToolButton = ({ onClick, isActive, icon: Icon, label, shortcut }) => (
//     <button
//       onClick={onClick}
//       className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
//         isActive 
//           ? 'bg-indigo-600 text-white shadow-lg' 
//           : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
//       } border border-gray-200`}
//       title={`${label} ${shortcut ? `(${shortcut})` : ''}`}
//     >
//       <Icon size={18} />
//       <span className="text-sm font-medium">{label}</span>
//     </button>
//   );

//   const presetColors = [
//     '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
//     '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
//   ];

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <div className="w-80 bg-white shadow-lg border-r border-gray-200 p-4 overflow-y-auto">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-800 mb-2">Whiteboard</h1>
//           <p className="text-sm text-gray-600">Professional drawing tool</p>
//         </div>

//         {/* Tools */}
//         <div className="mb-6">
//           <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//             <Settings size={16} />
//             Tools
//           </h3>
//           <div className="grid grid-cols-2 gap-2">
//             <ToolButton
//               onClick={() => setTool("pencil")}
//               isActive={tool === "pencil"}
//               icon={Pencil}
//               label="Pencil"
//               shortcut="P"
//             />
//             <ToolButton
//               onClick={() => setTool("pan")}
//               isActive={tool === "pan"}
//               icon={Move}
//               label="Pan"
//               shortcut="H"
//             />
//             <ToolButton
//               onClick={() => setTool("eraser")}
//               isActive={tool === "eraser"}
//               icon={Eraser}
//               label="Eraser"
//               shortcut="E"
//             />
//             <ToolButton
//               onClick={handleAddText}
//               isActive={false}
//               icon={Type}
//               label="Text"
//               shortcut="T"
//             />
//             <ToolButton
//               onClick={() => handleAddShape("rectangle")}
//               isActive={false}
//               icon={Square}
//               label="Rectangle"
//               shortcut="R"
//             />
//             <ToolButton
//               onClick={() => handleAddShape("circle")}
//               isActive={false}
//               icon={Circle}
//               label="Circle"
//               shortcut="C"
//             />
//           </div>
//         </div>

//         {/* Color Palette */}
//         <div className="mb-6">
//           <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//             <Palette size={16} />
//             Colors
//           </h3>
//           <div className="grid grid-cols-5 gap-2 mb-3">
//             {presetColors.map((presetColor) => (
//               <button
//                 key={presetColor}
//                 onClick={() => setColor(presetColor)}
//                 className={`w-10 h-10 rounded-lg border-2 transition-all ${
//                   color === presetColor ? 'border-indigo-500 scale-110' : 'border-gray-300'
//                 }`}
//                 style={{ backgroundColor: presetColor }}
//               />
//             ))}
//           </div>
//           <input
//             type="color"
//             value={color}
//             onChange={(e) => setColor(e.target.value)}
//             className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
//           />
//         </div>

//         {/* Brush Size */}
//         <div className="mb-6">
//           <h3 className="text-sm font-semibold text-gray-700 mb-3">Brush Size</h3>
//           <input
//             type="range"
//             min="1"
//             max="30"
//             value={lineWidth}
//             onChange={(e) => setLineWidth(parseInt(e.target.value))}
//             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//           />
//           <div className="flex justify-between text-xs text-gray-500 mt-1">
//             <span>1px</span>
//             <span className="font-medium">{lineWidth}px</span>
//             <span>30px</span>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="space-y-2">
//           <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
          
//           <div className="flex gap-2">
//             <button
//               onClick={handleUndo}
//               disabled={history.length === 0}
//               className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//             >
//               <Undo size={16} />
//               Undo
//             </button>
//             <button
//               onClick={handleRedo}
//               disabled={redoStack.length === 0}
//               className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//             >
//               <Redo size={16} />
//               Redo
//             </button>
//           </div>

//           <div className="flex gap-2">
//             <button
//               onClick={() => handleZoom(1.1)}
//               className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
//             >
//               <ZoomIn size={16} />
//               Zoom In
//             </button>
//             <button
//               onClick={() => handleZoom(0.9)}
//               className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
//             >
//               <ZoomOut size={16} />
//               Zoom Out
//             </button>
//           </div>

//           <label className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all">
//             <Upload size={16} />
//             Upload Image
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               className="hidden"
//             />
//           </label>

//           <button
//             onClick={handleDownload}
//             className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
//           >
//             <Download size={16} />
//             Download
//           </button>

//           <button
//             onClick={handleClear}
//             className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
//           >
//             <Trash2 size={16} />
//             Clear All
//           </button>
//         </div>
//       </div>

//       {/* Canvas Area */}
//       <div className="flex-1 flex flex-col">
//         <div className="flex-1 p-4">
//           <div className="bg-white rounded-lg shadow-lg p-4 h-full">
//             <canvas 
//               id="canvas" 
//               className="border border-gray-200 rounded-lg"
//               style={{ cursor: tool === 'pan' ? 'grab' : 'crosshair' }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Whiteboard;


// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { 
//   Pencil, Move, Eraser, Type, Square, Circle, Triangle, ArrowRight, 
//   Undo, Redo, Trash2, Download, ZoomIn, ZoomOut, Upload, Palette, 
//   Settings, Save, FolderOpen, Copy, Scissors, Layers, Grid, 
//   RotateCw, FlipHorizontal, FlipVertical, Lock, Unlock, Eye, EyeOff,
//   MousePointer, Minus, Plus, MoreHorizontal, Maximize, Minimize
// } from "lucide-react";

// const Whiteboard = () => {
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const [canvas, setCanvas] = useState(null);
//   const [tool, setTool] = useState("pencil");
//   const [color, setColor] = useState("#000000");
//   const [fillColor, setFillColor] = useState("#ffffff");
//   const [lineWidth, setLineWidth] = useState(2);
//   const [history, setHistory] = useState([]);
//   const [redoStack, setRedoStack] = useState([]);
//   const [selectedObjects, setSelectedObjects] = useState([]);
//   const [zoom, setZoom] = useState(1);
//   const [showGrid, setShowGrid] = useState(false);
//   const [snapToGrid, setSnapToGrid] = useState(false);
//   const [brushType, setBrushType] = useState("PencilBrush");
//   const [fontSize, setFontSize] = useState(20);
//   const [fontFamily, setFontFamily] = useState("Arial");
//   const [opacity, setOpacity] = useState(1);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [layers, setLayers] = useState([]);
//   const [activeLayer, setActiveLayer] = useState(0);
//   const [canvasSettings, setCanvasSettings] = useState({
//     width: 1200,
//     height: 800,
//     backgroundColor: "#ffffff"
//   });

//   // Clipboard functionality
//   const [clipboard, setClipboard] = useState(null);

//   // Dynamic fabric loading
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
//     script.onload = () => {
//       initCanvas();
//     };
//     document.head.appendChild(script);

//     return () => {
//       if (document.head.contains(script)) {
//         document.head.removeChild(script);
//       }
//     };
//   }, []);

//   // Keyboard shortcuts
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.ctrlKey || e.metaKey) {
//         switch (e.key) {
//           case 'z':
//             e.preventDefault();
//             if (e.shiftKey) {
//               handleRedo();
//             } else {
//               handleUndo();
//             }
//             break;
//           case 'c':
//             e.preventDefault();
//             handleCopy();
//             break;
//           case 'v':
//             e.preventDefault();
//             handlePaste();
//             break;
//           case 'x':
//             e.preventDefault();
//             handleCut();
//             break;
//           case 'a':
//             e.preventDefault();
//             handleSelectAll();
//             break;
//           case 's':
//             e.preventDefault();
//             handleSave();
//             break;
//           case 'd':
//             e.preventDefault();
//             handleDuplicate();
//             break;
//         }
//       } else {
//         switch (e.key) {
//           case 'p':
//             setTool("pencil");
//             break;
//           case 'h':
//             setTool("pan");
//             break;
//           case 'e':
//             setTool("eraser");
//             break;
//           case 't':
//             setTool("select");
//             break;
//           case 'r':
//             handleAddShape("rectangle");
//             break;
//           case 'c':
//             handleAddShape("circle");
//             break;
//           case 'Delete':
//             handleDeleteSelected();
//             break;
//           case 'g':
//             setShowGrid(!showGrid);
//             break;
//         }
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [canvas, selectedObjects, clipboard, showGrid]);

//   const initCanvas = () => {
//     if (typeof fabric !== 'undefined') {
//       const canvasInstance = new fabric.Canvas("canvas", {
//         isDrawingMode: true,
//         backgroundColor: canvasSettings.backgroundColor,
//         width: canvasSettings.width,
//         height: canvasSettings.height,
//         selection: false,
//         preserveObjectStacking: true,
//       });
      
//       canvasRef.current = canvasInstance;
//       setCanvas(canvasInstance);

//       // Add grid
//       addGrid(canvasInstance);

//       // Enhanced event listeners
//       canvasInstance.on('path:created', (e) => {
//         e.path.set({
//           stroke: color,
//           strokeWidth: lineWidth,
//           opacity: opacity
//         });
//         saveHistory();
//       });

//       canvasInstance.on('object:added', saveHistory);
//       canvasInstance.on('object:removed', saveHistory);
//       canvasInstance.on('object:modified', saveHistory);
      
//       canvasInstance.on('selection:created', (e) => {
//         setSelectedObjects(e.selected);
//       });
      
//       canvasInstance.on('selection:updated', (e) => {
//         setSelectedObjects(e.selected);
//       });
      
//       canvasInstance.on('selection:cleared', () => {
//         setSelectedObjects([]);
//       });

//       // Mouse wheel zoom
//       canvasInstance.on('mouse:wheel', (opt) => {
//         const delta = opt.e.deltaY;
//         let zoom = canvasInstance.getZoom();
//         zoom *= 0.999 ** delta;
//         if (zoom > 5) zoom = 5;
//         if (zoom < 0.1) zoom = 0.1;
//         canvasInstance.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
//         setZoom(zoom);
//         opt.e.preventDefault();
//         opt.e.stopPropagation();
//       });

//       saveHistory();
//     }
//   };

//   const addGrid = (canvasInstance) => {
//     if (!showGrid) return;
    
//     const gridSize = 20;
//     const width = canvasSettings.width;
//     const height = canvasSettings.height;
    
//     // Remove existing grid
//     const existingGrid = canvasInstance.getObjects().filter(obj => obj.id === 'grid');
//     existingGrid.forEach(obj => canvasInstance.remove(obj));
    
//     // Add vertical lines
//     for (let i = 0; i < width / gridSize; i++) {
//       const line = new fabric.Line([i * gridSize, 0, i * gridSize, height], {
//         stroke: '#e0e0e0',
//         strokeWidth: 0.5,
//         selectable: false,
//         evented: false,
//         id: 'grid'
//       });
//       canvasInstance.add(line);
//       canvasInstance.sendToBack(line);
//     }
    
//     // Add horizontal lines
//     for (let i = 0; i < height / gridSize; i++) {
//       const line = new fabric.Line([0, i * gridSize, width, i * gridSize], {
//         stroke: '#e0e0e0',
//         strokeWidth: 0.5,
//         selectable: false,
//         evented: false,
//         id: 'grid'
//       });
//       canvasInstance.add(line);
//       canvasInstance.sendToBack(line);
//     }
//   };

//   useEffect(() => {
//     if (canvas) {
//       addGrid(canvas);
//       canvas.renderAll();
//     }
//   }, [showGrid, canvas]);

//   useEffect(() => {
//     if (!canvas) return;
    
//     if (tool === "pencil") {
//       canvas.isDrawingMode = true;
//       canvas.freeDrawingBrush = new fabric[brushType](canvas);
//       canvas.freeDrawingBrush.width = lineWidth;
//       canvas.freeDrawingBrush.color = color;
//       canvas.freeDrawingBrush.opacity = opacity;
//       canvas.selection = false;
//     } else if (tool === "eraser") {
//       canvas.isDrawingMode = false;
//       canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
//       canvas.freeDrawingBrush.width = lineWidth * 2;
//       canvas.freeDrawingBrush.color = canvasSettings.backgroundColor;
//       canvas.selection = false;
//     } else if (tool === "select") {
//       canvas.isDrawingMode = false;
//       canvas.selection = true;
//     } else {
//       canvas.isDrawingMode = false;
//       canvas.selection = false;
//     }
//   }, [tool, color, lineWidth, canvas, brushType, opacity]);

//   const handleAddText = () => {
//     if (!canvas) return;
//     const textbox = new fabric.Textbox("Type here", {
//       left: 100,
//       top: 100,
//       fontSize: fontSize,
//       fill: color,
//       fontFamily: fontFamily,
//       opacity: opacity,
//       cornerStyle: 'circle',
//       cornerColor: '#4F46E5',
//       cornerSize: 8,
//       transparentCorners: false,
//     });
//     canvas.add(textbox);
//     canvas.setActiveObject(textbox);
//     saveHistory();
//   };

//   const handleAddShape = (shape) => {
//     if (!canvas) return;
//     let shapeObj;
//     const commonProps = {
//       left: 100,
//       top: 100,
//       fill: fillColor === "#ffffff" ? 'transparent' : fillColor,
//       stroke: color,
//       strokeWidth: lineWidth,
//       opacity: opacity,
//       cornerStyle: 'circle',
//       cornerColor: '#4F46E5',
//       cornerSize: 8,
//       transparentCorners: false,
//     };

//     switch (shape) {
//       case "rectangle":
//         shapeObj = new fabric.Rect({
//           ...commonProps,
//           width: 100,
//           height: 60,
//         });
//         break;
//       case "circle":
//         shapeObj = new fabric.Circle({
//           ...commonProps,
//           radius: 40,
//         });
//         break;
//       case "triangle":
//         shapeObj = new fabric.Triangle({
//           ...commonProps,
//           width: 80,
//           height: 80,
//         });
//         break;
//       case "line":
//         shapeObj = new fabric.Line([50, 50, 150, 50], {
//           stroke: color,
//           strokeWidth: lineWidth,
//           opacity: opacity,
//         });
//         break;
//       case "arrow":
//         const arrowPath = "M 10,5 L 0,0 L 0,3 L 10,3 L 10,5 z";
//         shapeObj = new fabric.Path(arrowPath, {
//           ...commonProps,
//           fill: color,
//           scaleX: 3,
//           scaleY: 3,
//         });
//         break;
//     }
    
//     canvas.add(shapeObj);
//     canvas.setActiveObject(shapeObj);
//     saveHistory();
//   };

//   const saveHistory = useCallback(() => {
//     if (!canvas) return;
//     const currentState = JSON.stringify(canvas.toJSON());
//     setHistory(prev => [...prev.slice(-19), currentState]);
//     setRedoStack([]);
//   }, [canvas]);

//   const handleUndo = () => {
//     if (history.length === 0 || !canvas) return;
//     const prev = history[history.length - 1];
//     setRedoStack(prev => [...prev, JSON.stringify(canvas.toJSON())]);
//     canvas.loadFromJSON(prev, () => {
//       canvas.renderAll();
//       setHistory(prev => prev.slice(0, -1));
//     });
//   };

//   const handleRedo = () => {
//     if (redoStack.length === 0 || !canvas) return;
//     const next = redoStack[redoStack.length - 1];
//     setHistory(prev => [...prev, JSON.stringify(canvas.toJSON())]);
//     canvas.loadFromJSON(next, () => {
//       canvas.renderAll();
//       setRedoStack(prev => prev.slice(0, -1));
//     });
//   };

//   const handleClear = () => {
//     if (!canvas) return;
//     canvas.clear();
//     canvas.backgroundColor = canvasSettings.backgroundColor;
//     addGrid(canvas);
//     saveHistory();
//   };

//   const handleSave = () => {
//     if (!canvas) return;
//     const dataStr = JSON.stringify(canvas.toJSON());
//     const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
//     const exportFileDefaultName = `whiteboard-${new Date().toISOString().slice(0, 10)}.json`;
    
//     const linkElement = document.createElement('a');
//     linkElement.setAttribute('href', dataUri);
//     linkElement.setAttribute('download', exportFileDefaultName);
//     linkElement.click();
//   };

//   const handleLoad = (e) => {
//     const file = e.target.files[0];
//     if (!file || !canvas) return;
    
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       try {
//         const jsonData = JSON.parse(event.target.result);
//         canvas.loadFromJSON(jsonData, () => {
//           canvas.renderAll();
//           saveHistory();
//         });
//       } catch (error) {
//         alert('Error loading file: Invalid format');
//       }
//     };
//     reader.readAsText(file);
//   };

//   const handleDownload = () => {
//     if (!canvas) return;
//     const dataURL = canvas.toDataURL({
//       format: "png",
//       quality: 1,
//       multiplier: 2, // Higher resolution
//     });
//     const link = document.createElement("a");
//     link.href = dataURL;
//     link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
//     link.click();
//   };

//   const handleZoom = (factor) => {
//     if (!canvas) return;
//     let newZoom = zoom * factor;
//     if (newZoom > 5) newZoom = 5;
//     if (newZoom < 0.1) newZoom = 0.1;
//     canvas.setZoom(newZoom);
//     setZoom(newZoom);
//   };

//   const handleResetZoom = () => {
//     if (!canvas) return;
//     canvas.setZoom(1);
//     setZoom(1);
//     canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
//   };

//   // Selection operations
//   const handleCopy = () => {
//     if (!canvas || selectedObjects.length === 0) return;
//     const activeObjects = canvas.getActiveObjects();
//     setClipboard(activeObjects.map(obj => obj.toObject()));
//   };

//   const handleCut = () => {
//     handleCopy();
//     handleDeleteSelected();
//   };

//   const handlePaste = () => {
//     if (!clipboard || !canvas) return;
//     clipboard.forEach((objData, index) => {
//       fabric.util.enlivenObjects([objData], (objects) => {
//         const clonedObj = objects[0];
//         clonedObj.set({
//           left: clonedObj.left + 10,
//           top: clonedObj.top + 10,
//         });
//         canvas.add(clonedObj);
//         if (index === clipboard.length - 1) {
//           canvas.setActiveObject(clonedObj);
//         }
//       });
//     });
//     saveHistory();
//   };

//   const handleDuplicate = () => {
//     handleCopy();
//     handlePaste();
//   };

//   const handleDeleteSelected = () => {
//     if (!canvas || selectedObjects.length === 0) return;
//     const activeObjects = canvas.getActiveObjects();
//     activeObjects.forEach(obj => canvas.remove(obj));
//     canvas.discardActiveObject();
//     saveHistory();
//   };

//   const handleSelectAll = () => {
//     if (!canvas) return;
//     const allObjects = canvas.getObjects().filter(obj => obj.id !== 'grid');
//     const selection = new fabric.ActiveSelection(allObjects, {
//       canvas: canvas,
//     });
//     canvas.setActiveObject(selection);
//     canvas.renderAll();
//   };

//   // Transform operations
//   const handleFlipHorizontal = () => {
//     if (!canvas || selectedObjects.length === 0) return;
//     const activeObjects = canvas.getActiveObjects();
//     activeObjects.forEach(obj => {
//       obj.set('flipX', !obj.flipX);
//     });
//     canvas.renderAll();
//     saveHistory();
//   };

//   const handleFlipVertical = () => {
//     if (!canvas || selectedObjects.length === 0) return;
//     const activeObjects = canvas.getActiveObjects();
//     activeObjects.forEach(obj => {
//       obj.set('flipY', !obj.flipY);
//     });
//     canvas.renderAll();
//     saveHistory();
//   };

//   const handleRotate = () => {
//     if (!canvas || selectedObjects.length === 0) return;
//     const activeObjects = canvas.getActiveObjects();
//     activeObjects.forEach(obj => {
//       obj.set('angle', (obj.angle || 0) + 90);
//     });
//     canvas.renderAll();
//     saveHistory();
//   };

//   const handleLockSelected = () => {
//     if (!canvas || selectedObjects.length === 0) return;
//     const activeObjects = canvas.getActiveObjects();
//     activeObjects.forEach(obj => {
//       obj.set({
//         lockMovementX: true,
//         lockMovementY: true,
//         lockRotation: true,
//         lockScalingX: true,
//         lockScalingY: true,
//         selectable: false,
//       });
//     });
//     canvas.renderAll();
//     saveHistory();
//   };

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file || !canvas) return;
//     const reader = new FileReader();
//     reader.onload = function (f) {
//       fabric.Image.fromURL(f.target.result, (img) => {
//         img.scaleToWidth(400);
//         img.set({
//           left: 50,
//           top: 50,
//           opacity: opacity,
//           cornerStyle: 'circle',
//           cornerColor: '#4F46E5',
//           cornerSize: 8,
//           transparentCorners: false,
//         });
//         canvas.add(img);
//         canvas.setActiveObject(img);
//         saveHistory();
//       });
//     };
//     reader.readAsDataURL(file);
//   };

//   const handlePan = () => {
//     if (!canvas) return;

//     let isPanning = false;

//     const onMouseDown = (e) => {
//       if (tool === "pan") {
//         isPanning = true;
//         canvas.selection = false;
//         canvas.setCursor('grabbing');
//       }
//     };

//     const onMouseMove = (e) => {
//       if (isPanning && e && e.e) {
//         const delta = new fabric.Point(e.e.movementX, e.e.movementY);
//         canvas.relativePan(delta);
//       }
//     };

//     const onMouseUp = () => {
//       if (isPanning) {
//         isPanning = false;
//         canvas.setCursor('grab');
//       }
//     };

//     canvas.off("mouse:down");
//     canvas.off("mouse:move");
//     canvas.off("mouse:up");

//     canvas.on("mouse:down", onMouseDown);
//     canvas.on("mouse:move", onMouseMove);
//     canvas.on("mouse:up", onMouseUp);
//   };

//   useEffect(() => {
//     if (canvas) {
//       handlePan();
//     }
//   }, [tool, canvas]);

//   // Component for tool buttons
//   const ToolButton = ({ onClick, isActive, icon: Icon, label, shortcut, disabled = false }) => (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
//         isActive 
//           ? 'bg-indigo-600 text-white shadow-lg' 
//           : disabled
//           ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//           : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
//       } border border-gray-200`}
//       title={`${label} ${shortcut ? `(${shortcut})` : ''}`}
//     >
//       <Icon size={18} />
//       <span className="text-sm font-medium">{label}</span>
//     </button>
//   );

//   const presetColors = [
//     '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
//     '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
//     '#8B4513', '#A0522D', '#228B22', '#4682B4', '#DC143C'
//   ];

//   const brushTypes = [
//     { value: 'PencilBrush', label: 'Pencil' },
//     { value: 'CircleBrush', label: 'Circle' },
//     { value: 'SprayBrush', label: 'Spray' },
//     { value: 'PatternBrush', label: 'Pattern' }
//   ];

//   const fontFamilies = [
//     'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
//     'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Lucida Console'
//   ];

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <div className={`${isFullscreen ? 'w-64' : 'w-80'} bg-white shadow-lg border-r border-gray-200 overflow-y-auto transition-all duration-300`}>
//         <div className="p-4">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">Whiteboard</h1>
//               <p className="text-sm text-gray-600">Professional drawing tool</p>
//             </div>
//             <button
//               onClick={() => setIsFullscreen(!isFullscreen)}
//               className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//             >
//               {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
//             </button>
//           </div>

//           {/* Tools */}
//           <div className="mb-6">
//             <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//               <Settings size={16} />
//               Tools
//             </h3>
//             <div className="grid grid-cols-2 gap-2">
//               <ToolButton
//                 onClick={() => setTool("select")}
//                 isActive={tool === "select"}
//                 icon={MousePointer}
//                 label="Select"
//                 shortcut="T"
//               />
//               <ToolButton
//                 onClick={() => setTool("pencil")}
//                 isActive={tool === "pencil"}
//                 icon={Pencil}
//                 label="Pencil"
//                 shortcut="P"
//               />
//               <ToolButton
//                 onClick={() => setTool("pan")}
//                 isActive={tool === "pan"}
//                 icon={Move}
//                 label="Pan"
//                 shortcut="H"
//               />
//               <ToolButton
//                 onClick={() => setTool("eraser")}
//                 isActive={tool === "eraser"}
//                 icon={Eraser}
//                 label="Eraser"
//                 shortcut="E"
//               />
//               <ToolButton
//                 onClick={handleAddText}
//                 isActive={false}
//                 icon={Type}
//                 label="Text"
//                 shortcut="T"
//               />
//               <ToolButton
//                 onClick={() => handleAddShape("rectangle")}
//                 isActive={false}
//                 icon={Square}
//                 label="Rectangle"
//                 shortcut="R"
//               />
//               <ToolButton
//                 onClick={() => handleAddShape("circle")}
//                 isActive={false}
//                 icon={Circle}
//                 label="Circle"
//                 shortcut="C"
//               />
//               <ToolButton
//                 onClick={() => handleAddShape("triangle")}
//                 isActive={false}
//                 icon={Triangle}
//                 label="Triangle"
//               />
//               <ToolButton
//                 onClick={() => handleAddShape("line")}
//                 isActive={false}
//                 icon={Minus}
//                 label="Line"
//               />
//               <ToolButton
//                 onClick={() => handleAddShape("arrow")}
//                 isActive={false}
//                 icon={ArrowRight}
//                 label="Arrow"
//               />
//             </div>
//           </div>

//           {/* Brush Settings */}
//           <div className="mb-6">
//             <h3 className="text-sm font-semibold text-gray-700 mb-3">Brush Settings</h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs text-gray-600 mb-1">Brush Type</label>
//                 <select
//                   value={brushType}
//                   onChange={(e) => setBrushType(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded-lg text-sm"
//                 >
//                   {brushTypes.map(brush => (
//                     <option key={brush.value} value={brush.value}>{brush.label}</option>
//                   ))}
//                 </select>
//               </div>
              
//               <div>
//                 <label className="block text-xs text-gray-600 mb-1">Brush Size</label>
//                 <input
//                   type="range"
//                   min="1"
//                   max="50"
//                   value={lineWidth}
//                   onChange={(e) => setLineWidth(parseInt(e.target.value))}
//                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="flex justify-between text-xs text-gray-500 mt-1">
//                   <span>1px</span>
//                   <span className="font-medium">{lineWidth}px</span>
//                   <span>50px</span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs text-gray-600 mb-1">Opacity</label>
//                 <input
//                   type="range"
//                   min="0.1"
//                   max="1"
//                   step="0.1"
//                   value={opacity}
//                   onChange={(e) => setOpacity(parseFloat(e.target.value))}
//                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="flex justify-between text-xs text-gray-500 mt-1">
//                   <span>10%</span>
//                   <span className="font-medium">{Math.round(opacity * 100)}%</span>
//                   <span>100%</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Colors */}
//           <div className="mb-6">
//             <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//               <Palette size={16} />
//               Colors
//             </h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs text-gray-600 mb-2">Stroke Color</label>
//                 <div className="grid grid-cols-5 gap-2 mb-2">
//                   {presetColors.map((presetColor) => (
//                     <button
//                       key={presetColor}
//                       onClick={() => setColor(presetColor)}
//                       className={`w-8 h-8 rounded-lg border-2 transition-all ${
//                         color === presetColor ? 'border-indigo-500 scale-110' : 'border-gray-300'
//                       }`}
//                       style={{ backgroundColor: presetColor }}
//                     />
//                   ))}
//                 </div>
//                 <input
//                   type="color"
//                   value={color}
//                   onChange={(e) => setColor(e.target.value)}
//                   className="w-full h-8 rounded-lg border border-gray-300 cursor-pointer"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs text-gray-600 mb-2">Fill Color</label>
//                 <input
//                   type="color"
//                   value={fillColor}
//                   onChange={(e) => setFillColor(e.target.value)}
//                   className="w-full h-8 rounded-lg border border-gray-300 cursor-pointer"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Text Settings */}
//           <div className="mb-6">
//             <h3 className="text-sm font-semibold text-gray-700 mb-3">Text Settings</h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs text-gray-600 mb-1">Font Family</label>
//                 <select
//                   value={fontFamily}
//                   onChange={(e) => setFontFamily(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded-lg text-sm"
//                 >
//                   {fontFamilies.map(font => (
//                     <option key={font} value={font}>{font}</option>
//                   ))}
//                 </select>
//               </div>
              
//               <div>
//                 <label className="block text-xs text-gray-600 mb-1">Font Size</label>
//                 <input
//                   type="range"
//                   min="8"
//                   max="72"
//                   value={fontSize}
//                   onChange={(e) => setFontSize(parseInt(e.target.value))}
//                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="flex justify-between text-xs text-gray-500 mt-1">
//                   <span>8px</span>
//                   <span className="font-medium">{fontSize}px</span>
//                   <span>72px</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Transform Tools */}
//          ...
// {/* Final sidebar section */}
// {selectedObjects.length > 0 && (
//   <div className="mb-6">
//     <h3 className="text-sm font-semibold text-gray-700 mb-3">Transform</h3>
//     <div className="grid grid-cols-2 gap-2">
//       <button
//         onClick={handleFlipHorizontal}
//         className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
//       >
//         <FlipHorizontal size={16} />
//         <span className="text-sm">Flip H</span>
//       </button>
//       <button
//         onClick={handleFlipVertical}
//         className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
//       >
//         <FlipVertical size={16} />
//         <span className="text-sm">Flip V</span>
//       </button>
//       <button
//         onClick={handleRotate}
//         className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
//       >
//         <RotateCw size={16} />
//         <span className="text-sm">Rotate</span>
//       </button>
//       <button
//         onClick={handleLockSelected}
//         className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
//       >
//         <Lock size={16} />
//         <span className="text-sm">Lock</span>
//       </button>
//     </div>
//   </div>
// )}

// {/* Download */}
// <div className="mb-6">
//   <h3 className="text-sm font-semibold text-gray-700 mb-3">Export</h3>
//   <div className="grid grid-cols-2 gap-2">
//     <ToolButton
//       onClick={handleDownload}
//       isActive={false}
//       icon={Download}
//       label="PNG"
//     />
//     <ToolButton
//       onClick={handleSave}
//       isActive={false}
//       icon={Save}
//       label="Save JSON"
//     />
//     <ToolButton
//       onClick={() => fileInputRef.current?.click()}
//       isActive={false}
//       icon={FolderOpen}
//       label="Load JSON"
//     />
//     <ToolButton
//       onClick={handleClear}
//       isActive={false}
//       icon={Trash2}
//       label="Clear"
//     />
//   </div>
//   <input
//     type="file"
//     ref={fileInputRef}
//     accept=".json"
//     className="hidden"
//     onChange={handleLoad}
//   />
// </div>
// </div>
// </div>

// {/* Canvas Area */}
// <div className="flex-1 relative bg-white">
//   <canvas id="canvas" width={canvasSettings.width} height={canvasSettings.height} />
//   <input
//     type="file"
//     accept="image/*"
//     ref={fileInputRef}
//     className="hidden"
//     onChange={handleImageUpload}
//   />
// </div>
// </div>
// );
// };

// export default Whiteboard;
