import React from "react";
import SettingComponent from "../components/SettingComponent/SettingComponent";
import BasePage from "./base-page";

class SettingPage extends React.Component {
  render() {
    return <BasePage component={<SettingComponent />} />;
  }
}

export default SettingPage;
