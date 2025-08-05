import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { StoreContextProvider } from "./context/storeContext.jsx";
import { RefContextProvider } from "./context/RefStore.jsx";
createRoot(document.getElementById("root")).render(
  <RefContextProvider>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
  </RefContextProvider>
);
