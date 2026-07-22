"use client";

import NaturalsLogo from "./NaturalsLogo";

export default function HeartbeatLoader() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "#F3CCE0" }}
    >
      <div className="w-72 flex items-center justify-center animate-heartbeat">
        <NaturalsLogo className="w-full h-auto" color="#5B2A6F" />
      </div>
    </div>
  );
}
