// import React, { useState, useRef, useEffect } from 'react';
// import {
//   Pencil, Square, Circle, Type, MousePointer, Minus, Undo, Redo, Download,
//   Trash2, Hand, ArrowRight, RotateCcw, Grid3X3, Palette, Settings,
//   ZoomIn, ZoomOut, Triangle, Diamond
// } from 'lucide-react';

// const essentialTools = [
//   { name: 'Pencil', icon: Pencil },
//   { name: 'Square', icon: Square },
//   { name: 'Circle', icon: Circle },
//   { name: 'Line', icon: Minus },
//   { name: 'Pointer', icon: MousePointer },
//   { name: 'Text', icon: Type },
//   { name: 'Triangle', icon: Triangle },
//   { name: 'Diamond', icon: Diamond },
//   { name: 'Undo', icon: Undo },
//   { name: 'Redo', icon: Redo },
//   { name: 'Trash', icon: Trash2 },
//   { name: 'Download', icon: Download },
//   { name: 'ZoomIn', icon: ZoomIn },
//   { name: 'ZoomOut', icon: ZoomOut },
//   { name: 'Settings', icon: Settings, isToggle: true },
// ];

// const extraTools = [
//   { name: 'Rotate', icon: RotateCcw },
//   { name: 'Grid', icon: Grid3X3 },
//   { name: 'Hand', icon: Hand },
//   { name: 'Arrow', icon: ArrowRight },
// ];

// export const Tools = () => {
//   const [showExtras, setShowExtras] = useState(false);
//   const [stroke, setStroke] = useState(2);
//   const [opacity, setOpacity] = useState(100);
//   const [fill, setFill] = useState('#000000');
//   const popupRef = useRef(null);

//   const handleClick = (tool) => {
//     if (tool.name === 'Settings') {
//       setShowExtras(prev => !prev);
//     } else {
//       console.log(`${tool.name} clicked`);
//     }
//   };

//   useEffect(() => {
//     const handleOutsideClick = (e) => {
//       if (popupRef.current && !popupRef.current.contains(e.target)) {
//         setShowExtras(false);
//       }
//     };
//     if (showExtras) {
//       document.addEventListener('mousedown', handleOutsideClick);
//     }
//     return () => {
//       document.removeEventListener('mousedown', handleOutsideClick);
//     };
//   }, [showExtras]);

//   return (
//     <div className="relative bg-gray-900 p-3 rounded-lg shadow-xl w-16 flex flex-col items-center gap-4">
//       {essentialTools.map((tool, index) => {
//         const Icon = tool.icon;
//         return (
//           <div
//             key={index}
//             onClick={() => handleClick(tool)}
//             className="p-2 hover:bg-gray-700 rounded transition cursor-pointer"
//             title={tool.name}
//           >
//             <Icon className="w-5 h-5 text-white" />
//           </div>
//         );
//       })}

//       {/* Settings Popup */}
//       {showExtras && (
//         <div
//           ref={popupRef}
//           className="absolute left-20 top-0 bg-gray-800 p-4 rounded-lg shadow-lg z-50 w-56"
//         >
//           <h3 className="text-white font-semibold mb-2">Tool Settings</h3>

//           {/* Stroke Size */}
//           <div className="mb-4">
//             <label className="text-gray-300 text-sm mb-1 block">Stroke Size: {stroke}px</label>
//             <input
//               type="range"
//               min="1"
//               max="10"
//               value={stroke}
//               onChange={(e) => setStroke(e.target.value)}
//               className="w-full"
//             />
//           </div>

//           {/* Fill Color */}
//           <div className="mb-4">
//             <label className="text-gray-300 text-sm mb-1 block">Fill Color</label>
//             <input
//               type="color"
//               value={fill}
//               onChange={(e) => setFill(e.target.value)}
//               className="w-full h-8 rounded"
//             />
//           </div>

//           {/* Opacity */}
//           <div className="mb-2">
//             <label className="text-gray-300 text-sm mb-1 block">Opacity: {opacity}%</label>
//             <input
//               type="range"
//               min="10"
//               max="100"
//               step="1"
//               value={opacity}
//               onChange={(e) => setOpacity(e.target.value)}
//               className="w-full"
//             />
//           </div>

//           {/* Extra Tool Icons */}
//           <hr className="my-3 border-gray-600" />
//           <div className="flex flex-wrap gap-3">
//             {extraTools.map((tool, idx) => {
//               const Icon = tool.icon;
//               return (
//                 <div
//                   key={idx}
//                   className="p-2 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer"
//                   title={tool.name}
//                   onClick={() => console.log(`${tool.name} clicked`)}
//                 >
//                   <Icon className="w-5 h-5 text-white" />
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


import React, { useState, useRef, useEffect } from 'react';
import {
  Pencil, Square, Circle, Type, MousePointer, Minus, Undo, Redo, Download,
  Trash2, Hand, ArrowRight, RotateCcw, Grid3X3, Palette, Settings,
  ZoomIn, ZoomOut, Triangle, Diamond
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const essentialTools = [
  { name: 'Pencil', icon: Pencil },
  { name: 'Square', icon: Square },
  { name: 'Circle', icon: Circle },
  { name: 'Line', icon: Minus },
  { name: 'Pointer', icon: MousePointer },
  { name: 'Text', icon: Type },
  { name: 'Triangle', icon: Triangle },
  { name: 'Diamond', icon: Diamond },
  { name: 'Undo', icon: Undo },
  { name: 'Redo', icon: Redo },
  { name: 'Trash', icon: Trash2 },
  { name: 'Download', icon: Download },
  { name: 'ZoomIn', icon: ZoomIn },
  { name: 'ZoomOut', icon: ZoomOut },
  { name: 'Settings', icon: Settings, isToggle: true },
];

const extraTools = [
  { name: 'Rotate', icon: RotateCcw },
  { name: 'Grid', icon: Grid3X3 },
  { name: 'Hand', icon: Hand },
  { name: 'Arrow', icon: ArrowRight },
];

export const Tools = () => {
  const [showExtras, setShowExtras] = useState(false);
  const [stroke, setStroke] = useState(2);
  const [opacity, setOpacity] = useState(100);
  const [fill, setFill] = useState('#000000');
  const [activeTool, setActiveTool] = useState(null);
  const popupRef = useRef(null);

  const handleClick = (tool) => {
    if (tool.name === 'Settings') {
      setShowExtras(prev => !prev);
    } else {
      setActiveTool(tool.name);
      console.log(`${tool.name} clicked`);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowExtras(false);
      }
    };
    if (showExtras) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showExtras]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex bg-gray-900 p-2 rounded-lg shadow-xl items-center gap-2">
        {essentialTools.map((tool, index) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.name;
          const isSettings = tool.name === 'Settings';

          return (
            <div
              key={index}
              onClick={() => handleClick(tool)}
              className={`p-2 rounded cursor-pointer transition 
                ${isSettings && showExtras
                  ? 'bg-gray-700'
                  : isActive
                  ? 'bg-gray-700'
                  : 'hover:bg-gray-700'}`}
              title={tool.name}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          );
        })}
      </div>

      {/* Animated Settings Popup */}
      <AnimatePresence>
        {showExtras && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 bg-gray-800 p-4 rounded-lg shadow-lg z-50 w-64"
          >
            <h3 className="text-white font-semibold mb-2">Tool Settings</h3>

            {/* Stroke Size */}
            <div className="mb-4">
              <label className="text-gray-300 text-sm mb-1 block">Stroke Size: {stroke}px</label>
              <input
                type="range"
                min="1"
                max="10"
                value={stroke}
                onChange={(e) => setStroke(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Fill Color */}
            <div className="mb-4">
              <label className="text-gray-300 text-sm mb-1 block">Fill Color</label>
              <input
                type="color"
                value={fill}
                onChange={(e) => setFill(e.target.value)}
                className="w-full h-8 rounded"
              />
            </div>

            {/* Opacity */}
            <div className="mb-2">
              <label className="text-gray-300 text-sm mb-1 block">Opacity: {opacity}%</label>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={opacity}
                onChange={(e) => setOpacity(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Extra Tool Icons */}
            <hr className="my-3 border-gray-600" />
            <div className="flex flex-wrap gap-3">
              {extraTools.map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={idx}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer"
                    title={tool.name}
                    onClick={() => console.log(`${tool.name} clicked`)}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
