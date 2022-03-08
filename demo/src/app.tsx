import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./app.css";
import { AntdDemo } from "./antd-demo";
import { MuiDemo } from "./mui-demo";

interface AppProps {}

function App({}: AppProps) {
  // Create the count state.
  const [count, setCount] = useState(0);
  // Create the counter (+1 every second).
  useEffect(() => {
    const timer = setTimeout(() => setCount(count + 1), 1000);
    return () => clearTimeout(timer);
  }, [count, setCount]);
  // Return the App component.
  return (
    <div className="app">
      <div>
        <img src={logo} className="logo" alt="logo" />
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <AntdDemo />
        <MuiDemo />
      </div>
    </div>
  );
}

export { App };
