"use client";

import dynamic from "next/dynamic";

const ExcalidrawApp = dynamic(
  () => import("@/components/ExcalidrawApp"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
          background: "#fff",
          color: "#666",
          fontFamily: "sans-serif",
          fontSize: "1rem",
        }}
      >
        Loading…
      </div>
    ),
  }
);

export default function Page() {
  return <ExcalidrawApp />;
}
