// src/config/landing.js
export const colors = {
  red: "#C8102E",
  maroon: "#5c0f18",
  charcoal: "#1f2023",
  gray: "#8a8d91",
  white: "#ffffff",
};

export const landing = {
  media: {
    video: "/media/hero.mp4",
    poster: "/media/hero-poster.jpg",
    logo: "/media/logo-ojk.png",
  },
  eyebrow: "Selamat Datang",
  title: "Otoritas Jasa Keuangan Jember",
  description:
    "Platform layanan informasi dan fasilitasi yang disediakan untuk memudahkan masyarakat, lembaga pendidikan, instansi pemerintah, maupun pihak lainnya dalam mengakses layanan dan berkoordinasi dengan Otoritas Jasa Keuangan (OJK) Jember.",
  nav: [
    { label: "Layanan Konsumen", href: "/layanan" },
    { label: "Edukasi", href: "/edukasi" },
  ],
  cta: {
    primary: { label: "Layanan Konsumen", href: "/layanan" },
    secondary: { label: "Visit OJK Jember", href: "#" }, // ganti dengan link asli
  },
};
