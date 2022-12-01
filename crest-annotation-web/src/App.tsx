import React from "react";
import { Outlet } from "react-router-dom";
import Theme from "./themes";

function App() {
  return (
    <Theme>
      <Outlet />
    </Theme>
  );
}

export default App;
