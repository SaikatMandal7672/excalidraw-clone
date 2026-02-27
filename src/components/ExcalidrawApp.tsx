"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

export default function ExcalidrawApp() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Excalidraw />
    </div>
  );
}
