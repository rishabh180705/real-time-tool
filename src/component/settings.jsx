import React, { useContext, useState } from 'react';
import { StoreContext } from '../context/storeContext';
import { SlidersHorizontal, X } from 'lucide-react';
import jsPDF from 'jspdf';

const Settings = ({ canvas }) => {
  const {
    background,
    setBackgroundColor,
    strockeWidth,
    setStrokeWidth,
    strokeColor,
    setStrokeColor,
  } = useContext(StoreContext);

  const [open, setOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const clearCanvas = () => {
    if (!canvas) return;
    canvas.getObjects().forEach(obj => canvas.remove(obj));
    canvas.renderAll();
  };

  

  const downloadCanvas = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png' });
    const link = document.createElement('a');
    link.download = 'canvas.png';
    link.href = dataURL;
    link.click();
  };

  const exportPDF = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png' });

    const img = new Image();
    img.src = dataURL;
    img.onload = () => {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(img, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('canvas.pdf');
    };
  };

  const toggleGrid = () => {
    if (!canvas) return;
    setShowGrid(prev => {
      const next = !prev;
      canvas.setBackgroundImage(next ? createGridPattern() : null, canvas.renderAll.bind(canvas));
      return next;
    });
  };

  const createGridPattern = () => {
    const size = 20;
    const canvasEl = document.createElement('canvas');
    canvasEl.width = canvasEl.height = size;
    const ctx = canvasEl.getContext('2d');
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, size);
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();
    return canvasEl;
  };

  const toggleDarkMode = () => {
    const isDark = background === '#000000';
    setBackgroundColor(isDark ? '#ffffff' : '#000000');
    setStrokeColor(isDark ? '#000000' : '#ffffff');
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-full bg-black shadow hover:bg-black"
        >
          <SlidersHorizontal />
        </button>
      ) : (
        <div className="bg-black shadow-xl p-4 rounded-xl w-72">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Canvas Settings</h3>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="mb-3">
            <label className="text-sm font-medium">Background Color</label>
            <input
              type="color"
              value={background}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-8 rounded mt-1"
            />
          </div>

          <div className="mb-3">
            <label className="text-sm font-medium">Stroke Color</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-full h-8 rounded mt-1"
            />
          </div>

          <div className="mb-3">
            <label className="text-sm font-medium">Stroke Width: {strockeWidth}</label>
            <input
              type="range"
              min={1}
              max={10}
              value={strockeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={clearCanvas}
              className="bg-red-500 text-white py-1 rounded hover:bg-red-600"
            >
              Clear
            </button>
            <button
              onClick={downloadCanvas}
              className="bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
            >
              Download
            </button>
            <button
              onClick={exportPDF}
              className="bg-green-600 text-white py-1 rounded hover:bg-green-700"
            >
              Export PDF
            </button>
            <button
              onClick={toggleGrid}
              className="bg-gray-700 text-white py-1 rounded hover:bg-gray-800"
            >
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </button>
            <button
              onClick={toggleDarkMode}
              className="col-span-2 bg-black text-white py-1 rounded hover:bg-gray-900"
            >
              Toggle Dark Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
