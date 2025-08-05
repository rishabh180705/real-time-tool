import React, { useRef, useState, useEffect, useContext, use } from 'react';
import { Canvas, Rect } from 'fabric';
import { Tools } from '../component/tools';
import { useShapeTool } from '../hooks/useShapeTool';
import { useFreeDrawTool } from '../hooks/useFreeDrawTool';
import { usePanTool } from '../hooks/usePanTool';
import { StoreContext } from '../context/storeContext';
import { useArrowTool } from '../hooks/useArrowTool';
import TeamChatBox from '../component/chatBox';

export default function WhiteBoard() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedTool, setTool] = useState('');



  const history = useRef([]);
  const redoStack = useRef([]);
  const [zoom, setZoom] = useState(1);
   const {  opacity, 
    strokeWidth, 
     fillColor,
          strokeColor,    background,
    setBackgroundColor,} = useContext(StoreContext);

  const options = { 
    stroke: strokeColor || '#000', // Default stroke color
    opacity: opacity / 100, // Convert to fraction for Fabric.js
    fill: fillColor || 'rgba(0, 0, 255, 0.1)', // Default fill color
    strokeWidth : strokeWidth || 2,
  };

  // hooks..
    usePanTool(canvas, selectedTool === 'Hand');
    useShapeTool(canvas, selectedTool, options);
    useFreeDrawTool(canvas, selectedTool, options);
    useArrowTool(canvas, selectedTool, options);
 
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
          width: window.innerWidth * 0.95,
          height: window.innerHeight * 0.95,
        });
        canvas.setBackgroundColor(background), // Update background color on resize
        canvas.renderAll();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvas,setBackgroundColor, background]);

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
    


     

      {/* Canvas Element */}



      <canvas
        ref={canvasRef} 
        className="border-4 border-black  w-11/12 h-11/12 overflow-visible"

  style={{
          borderColor: background === '#000' ? '#fff' : '#000',
          borderStyle: 'solid',
          borderWidth: '2px',
        }}

      />
      <TeamChatBox/>
      {/* Settings Component */}
      {/* <ElementSettings canvas={canvas} /> */}
    
    </div>
  );
}