import {
  AppBar,
  Button,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import NavigateButton from "../components/NavigateButton";

class BasePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDrawerOpen: false,
    };
  }

  render() {
    return (
      <>
        <AppBar className={'app-bar'} position="static" open variant="dense">
          <Toolbar>
            <img src="/static/readit_logo.png" className={'app-bar-logo'} alt="readit logo" />
            <Button color="inherit" style={{ marginLeft: "auto" }}>
              PLACEHOLDER
            </Button>
          </Toolbar>
        </AppBar>
        {this.props.component}
      </>
    );
  }
}

export default BasePage;
