import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import React from "react";
import "./App.scss";
import HomePage from "./pages/home-page";
import SettingPage from "./pages/setting-page";
import LoginComponent from "./components/LoginComponent/LoginComponent";
import { Provider } from "react-redux";
import store from "./state/store";
import ErrorPage from "./pages/error-page";

const App = () => {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" exact element={<LoginComponent isRegister={false} />} />
            <Route path="/register" exact element={<LoginComponent isRegister />} />
            <Route path="/home" exact element={<HomePage />} />
            <Route path="/settings" exact element={<SettingPage />} />
            <Route path="" exact element={<Navigate replace to="/login" />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
};

export default App;
