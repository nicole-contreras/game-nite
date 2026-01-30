import "./SideBarNav.css";
import { useState, useContext } from "react";
import { NavLink, type NavLinkRenderProps } from "react-router-dom";
import useAuth from "../hooks/useAuth.ts";
import { GameListContext } from "./../contexts/GameListContext.tsx";

/**
 * The SideBarNav component contains the primary naviagation menu. It
 * highlights the currently selected page and triggers navigation when the
 * menu items are clicked.
 */

export default function SideBarNav() {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const { username } = useAuth();
  const { unviewedCount } = useContext(GameListContext);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const navClass = ({ isActive }: NavLinkRenderProps) =>
    `menu_button ${isActive ? "menu_selected" : ""}`;

  return (
    <div className="sideBarNav">
      <NavLink to="/" className={navClass}>
        Home
      </NavLink>
      <NavLink to="/games" className={navClass}>
        Games {unviewedCount > 0 ? `(${unviewedCount} new!)` : ""}
      </NavLink>
      <NavLink to="/forum" className={navClass}>
        Forum
      </NavLink>
      <NavLink
        to={`/profile/${username}`}
        id="menu_user"
        className={navClass}
        onClick={toggleOptions}
      >
        Profile
      </NavLink>
    </div>
  );
}
