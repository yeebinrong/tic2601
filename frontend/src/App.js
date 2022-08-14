import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";
import "./App.scss";
import HomePage from "./pages/home-page";
import SettingPage from "./pages/setting-page";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<HomePage />} />
        <Route path="/settings" exact element={<SettingPage />} />
        <Route
          path="*"
          element={
            <main style={{ padding: "1rem" }}>
              <p>There's nothing here!</p>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
