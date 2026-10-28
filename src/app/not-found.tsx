import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF9F2] px-6 text-center">
      <div className="mb-6 text-8xl font-bold text-[#f0d0d5]">404</div>
      <h1 className="mb-2 text-2xl font-bold text-[#492a30]">Page not found</h1>
      <p className="mb-8 max-w-sm text-sm text-[#987b7e]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-[#c96778] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#ad5064] transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
