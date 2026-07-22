export default function Loading() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: '#e8a8c8' }}
    >
      <div className="w-72 max-w-[85vw] flex items-center justify-center animate-heartbeat">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Naturals Logo" className="w-full h-auto object-contain" />
      </div>
    </div>
  );
}
