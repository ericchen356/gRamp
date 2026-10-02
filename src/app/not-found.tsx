import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col justify-center px-page">
      <p className="text-[15px] text-ink-2">404</p>
      <h1 className="mt-3 text-[40px] leading-[1.1] tracking-[-0.025em] text-ink">This page doesn’t exist</h1>
      <p className="mt-4 max-w-md text-[14px] text-ink-2">
        The link may be broken, or the page may have moved. Head back home to pick up where you left off.
      </p>
      <Link
        href="/home"
        className="mt-8 inline-flex h-10 w-fit items-center rounded-[2px] bg-lime px-[18px] text-[15px] text-ink hover:bg-lime-hover"
      >
        Go to Home
      </Link>
    </div>
  );
}
