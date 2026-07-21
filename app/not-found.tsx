import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F3CCE0] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl font-bold text-[#5B2A6F] tracking-widest uppercase mb-4">naturals</div>
      <h1 className="text-2xl font-bold text-[#3d1b4a] mb-2">Card not found</h1>
      <p className="text-[#5B2A6F] text-sm mb-8">
        This e-card link doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/register"
        className="px-6 py-3 bg-[#5B2A6F] text-white rounded-xl font-semibold text-sm"
      >
        Create Your Own E-Card
      </Link>
    </main>
  );
}
