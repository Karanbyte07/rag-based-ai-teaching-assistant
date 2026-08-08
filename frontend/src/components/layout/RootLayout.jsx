import { Outlet, useLocation } from "react-router-dom";
import TopNav from "./TopNav";
import Footer from "./Footer";

// The chat screen manages its own full-height scroll, so it opts out of the footer.
const FULL_BLEED_ROUTES = ["/chat"];

export function RootLayout() {
  const { pathname } = useLocation();
  const fullBleed = FULL_BLEED_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <div className={`min-h-screen flex flex-col ${fullBleed ? "h-screen overflow-hidden" : ""}`}>
      <TopNav />
      <main className={fullBleed ? "flex-1 min-h-0 flex" : "flex-grow"}>
        <Outlet />
      </main>
      {!fullBleed && <Footer />}
    </div>
  );
}

export default RootLayout;
