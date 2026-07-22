'use client';

import { useEffect, useState } from 'react';
import NaturalsLogo from './NaturalsLogo';

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
      <div className="w-72 flex items-center justify-center animate-heartbeat">
        <NaturalsLogo className="w-full h-auto" color="#5B2A6F" />
      </div>
    </div>
  );
}
