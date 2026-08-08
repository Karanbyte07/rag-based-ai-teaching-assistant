import { NavLink } from "react-router-dom";
import { useApp } from "../../hooks/useApp";
import { IconButton } from "../ui/Button";
import Icon from "../ui/Icon";
import Logo from "../ui/Logo";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/lectures", label: "My Lectures" },
  { to: "/chat", label: "Chat" },
];

// Active route gets the primary underline from the mockup.
const linkClass = ({ isActive }) =>
  `font-body-md text-body-md px-sm py-xs rounded transition-all ${
    isActive
      ? "text-primary font-bold border-b-2 border-primary pb-1"
      : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
  }`;

export function TopNav() {
  const { isDark, toggleTheme } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant/30">
      <div className="flex justify-between items-center w-full px-lg py-md max-w-container-max mx-auto">
        <Logo />

        <nav className="hidden md:flex items-center gap-lg">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-sm">
          <IconButton
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            <Icon name={isDark ? "light_mode" : "dark_mode"} />
          </IconButton>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `p-sm rounded-full transition-all flex items-center justify-center active:scale-95
               ${isActive ? "text-primary bg-primary/10" : "text-on-surface-variant hover:bg-surface-container-high"}`
            }
            aria-label="Settings"
            title="Settings"
          >
            <Icon name="settings" />
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export default TopNav;
