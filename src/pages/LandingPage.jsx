// src/pages/LandingPage.jsx
import { useEffect, useRef, useState } from "react";
import { colors, landing } from "../config/landing";

const isExternal = (href) => /^https?:\/\//.test(href);

function Cta({ href, label, variant }) {
  const base =
    "group inline-flex items-center justify-between gap-6 border border-white/70 px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white";

  return (
    <a
      href={href}
      className={`${base} hover:bg-white hover:text-[color:var(--ojk-charcoal)]`}
      style={
        variant === "primary"
          ? { backgroundColor: "var(--ojk-red)" }
          : undefined
      }
      {...(isExternal(href) ? { target: "_blank", rel: "noreferrer" } : {})}
    >→
      <span>{label}</span>
      <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
        →
      </span>
    </a>
  );
}

export default function LandingPage() {
  const videoRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { media, nav, cta } = landing;

  // Hormati prefers-reduced-motion: video tidak diputar, tampil poster saja
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce && videoRef.current) videoRef.current.pause();
  }, []);

  const cssVars = {
    "--ojk-red": colors.red,
    "--ojk-maroon": colors.maroon,
    "--ojk-charcoal": colors.charcoal,
  };

  return (
    <main style={cssVars} className="relative min-h-screen w-full overflow-hidden bg-[color:var(--ojk-charcoal)] text-white">
      <style>{`
        @keyframes ojkFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .ojk-reveal { opacity: 0; animation: ojkFadeUp .8s ease-out forwards; }
        @media (prefers-reduced-motion: reduce) { .ojk-reveal { animation: none; opacity: 1; } }
      `}</style>

      {/* Background: video + fallback poster */}
      <img
  src={media.poster}
  alt=""
  className="h-full w-full object-cover brightness-[0.20]"
/>
        {!videoFailed && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={media.video}
            poster={media.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setVideoFailed(true)}
          />
        )}
        <div
  className="absolute inset-0"
  style={{ backgroundColor: "black", opacity: 0.95, zIndex: 9999 }}
></div>
        {/* Overlay hitam merata */}
<div
  className="absolute inset-0 z-[2]"
  style={{ backgroundColor: "rgba(0, 0, 0, 0.98)" }}
/>

{/* Gradient tambahan */}
<div
  className="absolute inset-0 z-[3]"
  style={{
    background:
      "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.20) 50%, rgba(0,0,0,0.10) 100%)",
  }}
/>

{/* Shadow bagian atas */}
<div
  className="absolute inset-x-0 top-0 z-[4] h-32"
  style={{
    background: "linear-gradient(180deg, rgba(0,0,0,0.50) 0%, transparent 100%)",
  }}
/>
      </div>

      {/* Navbar */}
      <header className="relative z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
          <a href="/" aria-label="Beranda OJK Jember">
            <img src={media.logo} alt="Otoritas Jasa Keuangan" className="h-10 w-auto md:h-12" />
          </a>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Navigasi utama">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative text-sm font-medium tracking-wide after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            className="md:hidden"
            aria-label="Buka menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="block h-0.5 w-6 bg-white" />
            <span className="mt-1.5 block h-0.5 w-6 bg-white" />
            <span className="mt-1.5 block h-0.5 w-6 bg-white" />
          </button>
        </div>

        {menuOpen && (
          <nav className="mx-5 flex flex-col border-t border-white/20 bg-black/80 md:hidden" aria-label="Navigasi mobile">
            {nav.map((item) => (
              <a key={item.label} href={item.href} className="px-4 py-4 text-sm font-medium">
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Hero content */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl flex-col justify-center px-5 pb-16 md:px-10">
        <p className="ojk-reveal text-xs font-semibold uppercase tracking-[0.3em] text-white/80" style={{ animationDelay: "0.1s" }}>
          {landing.eyebrow}
        </p>
        <h1
          className="ojk-reveal mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl"
          style={{ animationDelay: "0.25s" }}
        >
          {landing.title}
        </h1>
        <span className="ojk-reveal mt-6 block h-1 w-16" style={{ backgroundColor: "var(--ojk-red)", animationDelay: "0.4s" }} />
        <p
          className="ojk-reveal mt-6 max-w-xl text-sm leading-relaxed text-white/85 md:text-base"
          style={{ animationDelay: "0.5s" }}
        >
          {landing.description}
        </p>

        <div className="ojk-reveal mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row" style={{ animationDelay: "0.7s" }}>
          <Cta {...cta.primary} variant="primary" />
          <Cta {...cta.secondary} variant="secondary" />
        </div>
      </section>
    </main>
  );
}