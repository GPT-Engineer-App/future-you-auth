import './index.css';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    900: "#1a365d", // Dark Blue
    800: "#153e75", // Medium Blue
    700: "#2a69ac", // Light Blue
    600: "#3b82f6", // Lighter Blue
    500: "#60a5fa", // Even Lighter Blue
    400: "#93c5fd", // Lightest Blue
    300: "#bfdbfe", // Very Light Blue
    200: "#dbeafe", // Extremely Light Blue
    100: "#eff6ff", // Almost White Blue
    50: "#f0f9ff",  // Near White Blue
  },
  accent: {
    900: "#9b2c2c", // Dark Red
    800: "#c53030", // Medium Red
    700: "#e53e3e", // Light Red
    600: "#f56565", // Lighter Red
    500: "#fc8181", // Even Lighter Red
    400: "#feb2b2", // Lightest Red
    300: "#fed7d7", // Very Light Red
    200: "#fff5f5", // Extremely Light Red
    100: "#fffafa", // Almost White Red
    50: "#fff5f5",  // Near White Red
  },
  neutral: {
    900: "#1a202c", // Dark Gray
    800: "#2d3748", // Medium Gray
    700: "#4a5568", // Light Gray
    600: "#718096", // Lighter Gray
    500: "#a0aec0", // Even Lighter Gray
    400: "#cbd5e0", // Lightest Gray
    300: "#e2e8f0", // Very Light Gray
    200: "#edf2f7", // Extremely Light Gray
    100: "#f7fafc", // Almost White Gray
    50: "#f9fafb",  // Near White Gray
  },
};

const theme = extendTheme({ colors });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);