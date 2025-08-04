import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
 const [background, setBackgroundColor] = useState('#ffffff'); // Default background color
const [opacity, setOpacity] = useState(1); // Default opacity
const [strockeWidth, setStrokeWidth] = useState(2); // Default stroke width
const [strokeColor, setStrokeColor] = useState('#000000'); // Default stroke color
const [fillColor, setFillColor] = useState('rgba(0, 0, 255, 0.1)'); // Default fill color




  const contextValue = {
    // Add any state or functions you want to provide to the context
    background,
    setBackgroundColor,
    opacity,
    setOpacity,
    strockeWidth,
    setStrokeWidth,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
    
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};