/* eslint no-console: "off" */

import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login.tsx";
import type { AuthContext } from "./contexts/LoginContext.ts";
import Layout from "./components/Layout.tsx";
import Home from "./pages/Home.tsx";
import { io } from "socket.io-client";
import type { GameSocket } from "./util/types.ts";
import LoggedInRoute from "./components/LoggedInRoute.tsx";
import { ErrorBoundary } from "react-error-boundary";
import fallback from "./fallback.tsx";
import TimeContextKeeper from "./components/UpdatingTimeContext.tsx";

/** If `true`, all incoming socket messages will be logged */
const DEBUG_SOCKETS = false;

/**
 * Websocket connection for the app. It would be natural to define this in a
 * useEffect hook, but the React docts advise against this.
 * https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application
 * */
let socket: GameSocket | null = null;
if (typeof window !== "undefined") {
  socket = io();
  if (DEBUG_SOCKETS) {
    socket.onAny((tag, payload) => {
      console.log(`from socket got ${tag}(${JSON.stringify(payload)})`);
    });
  }
}

function NoSuchRoute() {
  const { pathname } = useLocation();
  return `No page found for route '${pathname}'`;
}

export default function App() {
  const [auth, setAuth] = useState<AuthContext | null>(null);
  return (
    socket && (
      <Routes>
        <Route path="/login" element={<Login setAuth={(auth) => setAuth(auth)} />} />
        <Route
          element={
            <LoggedInRoute auth={auth} socket={socket}>
              <TimeContextKeeper updateFrequency={20 * 1000}>
                <ErrorBoundary fallbackRender={fallback}>
                  <Layout />
                </ErrorBoundary>
              </TimeContextKeeper>
            </LoggedInRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/*" element={<NoSuchRoute />} />
        </Route>
      </Routes>
    )
  );
}
