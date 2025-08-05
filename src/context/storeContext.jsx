import { createContext, useState } from "react";

export const StoreContext = createContext(null);

export const StoreContextProvider = ({ children }) => {
  // Canvas settings
  const [background, setBackgroundColor] = useState('#ffffff'); // Canvas background color
  const [opacity, setOpacity] = useState(100);                    // Object opacity
  const [strokeWidth, setStrokeWidth] = useState(5);            // Stroke width
  const [strokeColor, setStrokeColor] = useState('#000000');    // Stroke color
  const [fillColor, setFillColor] = useState('#ffffff'); // Fill color

  const contextValue = {
    background,
    setBackgroundColor,
    opacity,
    setOpacity,
    strokeWidth,
    setStrokeWidth,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};
