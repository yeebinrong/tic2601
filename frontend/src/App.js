import {
  AppBar,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import React from "react";
import "./App.scss";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDrawerOpen: false,
    };
  }

  toggleDrawer = (bool) => {
    this.setState({
      isDrawerOpen: !bool,
    });
  };

  render() {
    return (
      <div className={"app-main"}>
        <AppBar position="static" open variant="dense">
          <Toolbar>
            <IconButton
              disableRipple
              color="inherit"
              onClick={() => this.toggleDrawer(this.state.isDrawerOpen)}
              edge="start"
              className={"app-menu-btn"}
              style={{
                marginRight: 5,
                ...(this.state.isDrawerOpen && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              style={{ marginLeft: this.state.isDrawerOpen ? "240px" : "" }}
              className={"app-menu-title"}
            >
              App Name
            </Typography>
            <Button color="inherit" style={{ marginLeft: "auto" }}>
              PLACEHOLDER
            </Button>
          </Toolbar>
        </AppBar>
        <Drawer
          open={this.state.isDrawerOpen}
          variant={"persistent"}
          className={"app-drawer-main"}
        >
          <div className={"app-drawer-header"}>
            <IconButton
              disableRipple
              onClick={() => this.toggleDrawer(this.state.isDrawerOpen)}
            >
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            <ListItem key={"Home"} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: this.state.isDrawerOpen
                    ? "initial"
                    : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: this.state.isDrawerOpen ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText
                  primary={"Home"}
                  sx={{ opacity: this.state.isDrawerOpen ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem key={"Settings"} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: this.state.isDrawerOpen
                    ? "initial"
                    : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: this.state.isDrawerOpen ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText
                  primary={"Settings"}
                  sx={{ opacity: this.state.isDrawerOpen ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
      </div>
    );
  }
}

export default App;
