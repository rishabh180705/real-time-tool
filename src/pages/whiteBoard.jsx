// import React, { useState } from 'react';
// import { Tools } from '../component/tools';

// const WhiteBoard = () => {
//   const [tool, setTool] = useState('Pencil');
//   const [fill, setFill] = useState('#000000');
//   const [opacity, setOpacity] = useState(100);
//   const [stroke, setStroke] = useState(2);

//   const handleToolChange = (type, value) => {
//     if (type === 'fill') setFill(value);
//     else if (type === 'opacity') setOpacity(value);
//     else if (type === 'stroke') setStroke(value);
//     else setTool(type);
//   };

//   return (
//     <div className="w-full h-screen flex flex-col bg-gray-100 overflow-hidden">
//       {/* Toolbox Top */}
//       <div className="shrink-0">
//         <Tools onChange={handleToolChange} />
//       </div>

//       {/* Canvas Area */}
//       <div className="flex-1 p-4 overflow-hidden">
//         <canvas className="w-full h-full border border-gray-400 bg-white rounded-md shadow-md" />
//       </div>
//     </div>
//   );
// };

// export default WhiteBoard;


import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Tools } from '../component/tools';

const WhiteBoard = () => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const isPanning = useRef(false);
  const [tool, setTool] = useState('Pencil');
  const [fill, setFill] = useState('#000000');
  const [opacity, setOpacity] = useState(100);
  const [stroke, setStroke] = useState(2);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const zoom = useRef(1);

  // Toolbar handler
  const handleToolChange = (type, value) => {
    if (type === 'fill') setFill(value);
    else if (type === 'opacity') setOpacity(value);
    else if (type === 'stroke') setStroke(value);
    else setTool(type);
  };

  // Init Fabric.js
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 100,
      backgroundColor: '#ffffff',
      selection: true,
    });

    fabricRef.current = canvas;

    canvas.on('object:added', () => saveHistory());
    canvas.on('object:modified', () => saveHistory());
    canvas.on('object:removed', () => saveHistory());

    // Infinite pan with Alt key or middle mouse
    canvas.on('mouse:down', (opt) => {
      if (opt.e.altKey || opt.e.button === 1) {
        isPanning.current = true;
        canvas.setCursor('grab');
      } else if (tool !== 'Pencil') {
        const pointer = canvas.getPointer(opt.e);
        let shape;
        const commonProps = {
          left: pointer.x,
          top: pointer.y,
          fill: fill,
          opacity: opacity / 100,
          stroke: fill,
          strokeWidth: stroke,
        };

        if (tool === 'Rectangle') {
          shape = new fabric.Rect({ width: 100, height: 60, ...commonProps });
        } else if (tool === 'Circle') {
          shape = new fabric.Circle({ radius: 30, ...commonProps });
        }

        if (shape) {
          canvas.add(shape);
        }
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (isPanning.current) {
        const delta = new fabric.Point(opt.e.movementX, opt.e.movementY);
        canvas.relativePan(delta);
      }
    });

    canvas.on('mouse:up', () => {
      isPanning.current = false;
      canvas.setCursor('default');
    });

    // Initial tool setup
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = stroke;
    canvas.freeDrawingBrush.color = fill;
    canvas.freeDrawingBrush.opacity = opacity / 100;

    window.addEventListener('resize', () => {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight - 100);
    });

    return () => canvas.dispose();
  }, []);

  // Tool update
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (tool === 'Pencil') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = fill;
      canvas.freeDrawingBrush.width = stroke;
      canvas.freeDrawingBrush.opacity = opacity / 100;
    } else if (tool === 'Eraser') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = '#ffffff';
      canvas.freeDrawingBrush.width = stroke + 10;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [tool, fill, stroke, opacity]);

  // Save canvas state
  const saveHistory = () => {
    const canvas = fabricRef.current;
    const json = canvas.toJSON();
    setHistory((prev) => [...prev.slice(-20), json]); // limit history to 20
    setRedoStack([]); // clear redo stack
  };

  // Undo
  const handleUndo = () => {
    if (!history.length) return;
    const canvas = fabricRef.current;
    const last = history[history.length - 1];
    setRedoStack((r) => [...r, canvas.toJSON()]);
    canvas.loadFromJSON(last, () => canvas.renderAll());
    setHistory((h) => h.slice(0, -1));
  };

  // Redo
  const handleRedo = () => {
    if (!redoStack.length) return;
    const canvas = fabricRef.current;
    const last = redoStack[redoStack.length - 1];
    setHistory((h) => [...h, canvas.toJSON()]);
    canvas.loadFromJSON(last, () => canvas.renderAll());
    setRedoStack((r) => r.slice(0, -1));
  };

  // Zoom In
  const zoomIn = () => {
    const canvas = fabricRef.current;
    zoom.current *= 1.1;
    canvas.setZoom(zoom.current);
  };

  // Zoom Out
  const zoomOut = () => {
    const canvas = fabricRef.current;
    zoom.current /= 1.1;
    canvas.setZoom(zoom.current);
  };

  // Export Canvas
  const downloadImage = () => {
    const canvas = fabricRef.current;
    const dataURL = canvas.toDataURL({
      format: 'png',
      multiplier: 2,
    });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'whiteboard.png';
    link.click();
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Tools */}
      <div className="p-2 flex items-center justify-between bg-white shadow-md z-10">
        <Tools onChange={handleToolChange} />

        <div className="flex gap-2 px-2">
          <button onClick={zoomIn} className="px-2 py-1 bg-blue-500 text-white rounded">Zoom In</button>
          <button onClick={zoomOut} className="px-2 py-1 bg-blue-500 text-white rounded">Zoom Out</button>
          <button onClick={handleUndo} className="px-2 py-1 bg-yellow-500 text-white rounded">Undo</button>
          <button onClick={handleRedo} className="px-2 py-1 bg-yellow-500 text-white rounded">Redo</button>
          <button onClick={downloadImage} className="px-2 py-1 bg-green-500 text-white rounded">Export</button>
        </div>
      </div>

      {/* Fabric Canvas */}
      <div className="flex-1 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full border border-gray-400 bg-white rounded-md shadow-md"
        />
      </div>
    </div>
  );
};

export default WhiteBoard;

