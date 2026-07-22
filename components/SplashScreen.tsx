'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1800);
    const hideTimer = setTimeout(() => setVisible(false), 2350);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: '#e8a8c8',
        opacity: fading ? 0 : 1,
        transition: 'opacity 550ms ease-in-out',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <div className="w-72 max-w-[85vw] flex items-center justify-center animate-heartbeat">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Naturals Logo" className="w-full h-auto object-contain" />
      </div>
    </div>
  );
}
