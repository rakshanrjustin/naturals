"use client";

export default function HeartbeatLoader() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "#F3CCE0" }}
    >
      <div className="animate-heartbeat flex flex-col items-center gap-4">
        {/* Naturals wordmark — white text on pink background */}
        <div
          className="text-4xl font-bold tracking-widest uppercase"
          style={{ color: "#5B2A6F", letterSpacing: "0.2em" }}
        >
          naturals
        </div>
        <div
          className="text-sm font-medium tracking-widest uppercase"
          style={{ color: "#5B2A6F", opacity: 0.7 }}
        >
          salon chain
        </div>
      </div>
    </div>
  );
}
