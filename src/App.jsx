import React from "react";
import "./App.css";
import NavBar from "./Components/NavBar.jsx";
import Flipbook from "./Components/Flipbook.jsx";

export default function App() {
  return (
    <div className="app-wrapper">
      <NavBar />
      <main className="main-content">
        <Flipbook />
      </main>
    </div>
  );
}
