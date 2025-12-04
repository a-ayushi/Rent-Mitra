import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CityProvider } from "./contexts/CityContext";
import { I18nextProvider } from "react-i18next";
import i18n from "./utils/i18n";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <CityProvider>
        <App />
      </CityProvider>
    </I18nextProvider>
  </StrictMode>
);
