import React, { useState, useContext } from "react";
import {
  Pencil,
  Square,
  Circle,
  Type,
  MousePointer,
  Minus,
  Undo,
  Redo,
  Download,
  Trash2,
  Hand,
  ArrowRight,
  Grid3X3,
  Settings,
  ZoomIn,
  ZoomOut,
  Triangle,
  Diamond,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasControls } from "../hooks/useCanvasControls";
import { StoreContext } from "../context/storeContext";

import jsPDF from "jspdf";

const essentialTools = [
  { name: "Pencil", icon: Pencil },
  { name: "Square", icon: Square },
  { name: "Circle", icon: Circle },
  { name: "Line", icon: Minus },
  { name: "Text", icon: Type },
  { name: "Triangle", icon: Triangle },
  { name: "Diamond", icon: Diamond },
  { name: "Arrow", icon: ArrowRight },
  { name: "Pointer", icon: MousePointer },
  { name: "Hand", icon: Hand },
  { name: "Undo", icon: Undo },
  { name: "Redo", icon: Redo },
  { name: "Trash", icon: Trash2 },
  { name: "Download", icon: Download },
  { name: "ZoomIn", icon: ZoomIn },
  { name: "ZoomOut", icon: ZoomOut },
  { name: "Settings", icon: Settings, isToggle: true },
];

const extraTools = [];

export const Tools = ({ canvas, setTool, history, redoStack }) => {
  const [showExtras, setShowExtras] = useState(false);
  const [activeTool, setActiveTool] = useState("");
  const {
    opacity,
    setOpacity,
    strokeWidth,
    setStrokeWidth,
    fillColor,
    setFillColor,
    strokeColor,
    setStrokeColor,
    background,
    setBackgroundColor,
  } = useContext(StoreContext);

  const {
    handleUndo,
    handleRedo,
    handleClear,
    handleDownload,
    handleZoomIn,
    handleZoomOut,
    zoom,
  } = useCanvasControls({ canvas, history, redoStack });

  const exportPDF = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: "png",
      multiplier: 2,
      left: 0,
      top: 0,
      width: canvas.width,
      height: canvas.height,
    });

    const img = new Image();
    img.src = dataURL;
    img.onload = () => {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("canvas.pdf");
    };
  };

  const handleClick = (tool) => {
    switch (tool.name) {
      case "Settings":
        setShowExtras((prev) => !prev);
        break;
      case "Undo":
        handleUndo();
        break;
      case "Redo":
        handleRedo();
        break;
      case "Trash":
        handleClear();
        break;
      case "Download":
        handleDownload();
        break;
      case "ZoomIn":
        handleZoomIn();
        break;
      case "ZoomOut":
        handleZoomOut();
        break;

      default:
        setTool(tool.name);
        setActiveTool(tool.name);
        break;
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex bg-gray-900 p-2 rounded-lg shadow-xl items-center gap-2">
        {essentialTools.map((tool, index) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.name;
          const isSettings = tool.name === "Settings";

          return (
            <div
              key={index}
              onClick={() => handleClick(tool)}
              className={`p-2 rounded cursor-pointer transition 
                ${
                  isSettings && showExtras
                    ? "bg-gray-700"
                    : isActive
                    ? "bg-gray-700"
                    : "hover:bg-gray-700"
                }`}
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 bg-gray-800 p-4 rounded-lg shadow-lg z-50 w-64"
          >
            <h3 className="text-white font-semibold mb-2">Tool Settings</h3>

            {/* Stroke Size */}
            <div className="mb-4">
              <label className="text-gray-300 text-sm mb-1 block">
                Stroke Size:{strokeWidth}px
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step={1}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Fill Stroke Color */}
            <div className="mb-4">
              <label className="text-gray-300 text-sm mb-1 block">
                Stroke Color
              </label>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-full h-8 rounded"
              />
            </div>

            {/* Fill Color */}
            <div className="mb-4">
              <label className="text-gray-300 text-sm mb-1 block">
                Fill Color
              </label>
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-full h-8 rounded"
              />
            </div>

            {/* Opacity */}
            <div className="mb-2">
              <label className="text-gray-300 text-sm mb-1 block">
                Opacity: {opacity}/100
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mb-2">
              <label className="text-sm font-medium">Background Color</label>
              <input
                type="color"
                value={background}
                onChange={(e) => {
                  const color = e.target.value;
                  setBackgroundColor(color);
                  canvas.backgroundColor = color;
                  canvas.renderAll();
                }}
                className="w-full h-8 rounded mt-1"
              />
            </div>

            <button
              onClick={exportPDF}
              className="bg-stone-600 text-white py-1 px-3 rounded hover:bg-grey-700"
            >
              Export PDF
            </button>

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
                    onClick={() => handleClick(tool)}
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
