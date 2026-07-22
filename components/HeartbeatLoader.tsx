"use client";

import NaturalsLogo from "./NaturalsLogo";

export default function HeartbeatLoader() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "#F3CCE0" }}
    >
      <NaturalsLogo className="w-72 animate-heartbeat" color="#5B2A6F" />
    </div>
  );
}
