import Logo from "../ui/Logo";

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-surface-bright border-t border-outline-variant/20 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-lg py-xl max-w-container-max mx-auto gap-md">
        <Logo size={24} />

        <p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary text-center opacity-80">
          © {YEAR} Lectra AI · React • FastAPI • Whisper • FAISS
        </p>

        <nav className="flex gap-lg">
          {["Privacy", "Terms", "Support"].map((label) => (
            <a
              key={label}
              href="#"
              className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
