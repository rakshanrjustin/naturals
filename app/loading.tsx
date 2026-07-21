import NaturalsLogo from '@/components/NaturalsLogo';

export default function Loading() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: '#e8a8c8' }}
    >
      <NaturalsLogo className="w-72 animate-heartbeat" color="#5B2A6F" />
    </div>
  );
}
