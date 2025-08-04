import { useEffect, useRef, useState } from 'react';

export function useCanvasControls({ canvas, history, redoStack }) {

  const [zoom, setZoom] = useState(1);

// 
 const handleUndo = () => {
    if (!canvas || history.current.length < 1) return;
    redoStack.current.push(history.current.pop());
    const prev = history.current[history.current.length - 1];
    canvas.loadFromJSON(prev, () => canvas.renderAll());
  };

  const handleRedo = () => {
    if (!canvas || redoStack.current.length === 0) return;
    const next = redoStack.current.pop();
    history.current.push(next);
    canvas.loadFromJSON(next, () => canvas.renderAll());
  };

  const handleClear = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.requestRenderAll();
    history.current = [];
    redoStack.current = [];
  };

  // Download canvas as image
  const handleDownload = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png' });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'whiteboard.png';
    link.click();
  };

  // Zoom In (zoom around canvas center)
  const handleZoomIn = () => {
    if (!canvas) return;
    const newZoom = zoom * 1.1;
    zoomToCenter(newZoom);
  };

  // Zoom Out (zoom around canvas center)
  const handleZoomOut = () => {
    if (!canvas) return;
    const newZoom = zoom / 1.1;
    zoomToCenter(newZoom);
  };

  const zoomToCenter = (newZoom) => {
    const center = canvas.getCenter();
    canvas.zoomToPoint({ x: center.left, y: center.top }, newZoom);
    setZoom(newZoom);
    canvas.requestRenderAll();
  };

  return {
    handleUndo,
    handleRedo,
    handleClear,
    handleDownload,
    handleZoomIn,
    handleZoomOut,
    zoom,
  };
}
