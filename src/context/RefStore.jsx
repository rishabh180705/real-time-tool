import { createContext, useState } from "react";

export const RefContext = createContext(null);

export const RefContextProvider = ({ children }) => {
  
  const contextValue = {
  
  };

  return (
    <RefContext.Provider value={contextValue}>
      {children}
    </RefContext.Provider>
  );
};