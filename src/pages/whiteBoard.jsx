import React, { useRef, useState, useEffect, use } from 'react';
import { Canvas, Rect } from 'fabric';
import { Tools } from '../component/tools';
import { useShapeTool } from '../hooks/useShapeTool';
import { useFreeDrawTool } from '../hooks/useFreeDrawTool';
import { usePanTool } from '../hooks/usePanTool';


export default function WhiteBoard() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedTool, setTool] = useState('');
  const [background, setBackgroundColor] = useState('#000'); // Default background color
  const history = useRef([]);
  const redoStack = useRef([]);
  const [zoom, setZoom] = useState(1);

  const options = { 
    stroke: '#ffffff', 
    fill: 'rgba(0, 0, 255, 0.1)', 
    strokeWidth: 2 
  };

  // hooks..
    usePanTool(canvas, selectedTool === 'Hand');
    useShapeTool(canvas, selectedTool, options);
    useFreeDrawTool(canvas, selectedTool, options);
  
 
  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: window.innerWidth * 0.98,
        height: window.innerHeight *0.98,
           preserveObjectStacking: true,
         selection: false,
         skipTargetFind:false,
          controlsAboveOverlay: true,
         renderOnAddRemove:true,
        hoverCursor: 'pointer',
        defaultCursor: 'default',
        selectionColor: 'rgba(100, 100, 250, 0.3)',
        backgroundColor: background, // Fixed: was 'backgroundcolor'
      });

      setCanvas(initCanvas);

      return () => {
        initCanvas.dispose();
      };
    }
  }, []);

    useEffect(() => {
    if (!canvas) return;

    const saveState = () => {
      const json = canvas.toJSON();
      history.current.push(json);
      redoStack.current = [];
      if (history.current.length > 50) history.current.shift();
    };

    const recordableEvents = ['object:added', 'object:removed', 'object:modified'];
    recordableEvents.forEach(evt => canvas.on(evt, saveState));

    saveState(); // Initial state

    return () => {
      recordableEvents.forEach(evt => canvas.off(evt, saveState));
    };
  }, [canvas]);

  useEffect(() => {
    const handleResize = () => {
      if (canvas) {
        canvas.setDimensions({
          width: window.innerWidth * 0.9,
          height: window.innerHeight * 0.9,
        });
        canvas.backgroundColor = background;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvas,setBackgroundColor]);

  useEffect(() => {
  if (canvas) {
    canvas.selection = selectedTool !== 'Hand';
    canvas.forEachObject(obj => obj.selectable = selectedTool !== 'Hand');
  }
}, [canvas, selectedTool]);




  return (
    <div
      className=" flex justify-center items-center"
      style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: background }}
    >
      <Tools canvas={canvas} setTool={setTool} history={history} redoStack={redoStack} />
      <canvas
        ref={canvasRef} 
        className="border-4 border-white w-11/12 h-11/12 overflow-visible"
        // style={{ backgroundColor: background }}
      />
      {/* <ElementSettings canvas={canvas} /> */}
    
    </div>
  );
}