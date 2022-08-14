
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";
import "./App.scss";
import HomePage from "./components/home-page";
import SettingPage from "./components/setting-page";
import BasePage from "./components/base-page";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDrawerOpen: false,
    };
  }

  toggleDrawer = bool => {
    this.setState({
      isDrawerOpen: !bool,
    });
  };

  render() {
    return (
      <div className={"app-main"}>
        <BasePage
          isDrawerOpen={this.state.isDrawerOpen}
          toggleDrawer={this.toggleDrawer}
        />
        <BrowserRouter>
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/setting" element={<SettingPage />} />
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
      </div>
    );
  }
}

export default App;
