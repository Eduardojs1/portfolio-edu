import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./estilos/base.css";
import "./estilos/desktop.css";
import "./estilos/intellij.css";
import "./estilos/site.css";
import "./estilos/datagrip.css";
import "./estilos/spotify.css";
import "./estilos/intro.css";
import "./estilos/navegador.css";
import "./estilos/guia.css";
import "./estilos/bloco.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
