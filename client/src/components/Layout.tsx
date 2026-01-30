import "./Layout.css";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.tsx";
import SideBarNav from "./SideBarNav.tsx";
import useGameNotificationListener from "../hooks/useGameNotificationListener.ts";

/**
 * Main component represents the layout of the main page, including a sidebar
 * and the main content area. Sets up socket listeners for game notifications globally.
 */
export default function Layout() {
  const location = useLocation();
  const isOnGamePage = location.pathname === "/" || location.pathname === "/games";

  // Listen for game notifications and update unviewed count
  useGameNotificationListener(isOnGamePage);

  return (
    <>
      <div id="main" className="main">
        <Header />
        <SideBarNav />
        <div id="right_main" className="right_main">
          <Outlet />
        </div>
      </div>
    </>
  );
}
