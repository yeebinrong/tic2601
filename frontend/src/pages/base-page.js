import {
    AppBar,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
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

    setDrawer = bool => {
        this.setState({
          isDrawerOpen: bool,
        });
    };

    render() {
        return (
        <>
            <AppBar position="static" open variant="dense">
                <Toolbar>
                    <IconButton
                        disableRipple
                        color="inherit"
                        onClick={() => this.setDrawer(!this.state.isDrawerOpen)}
                        edge="start"
                        className={"app-menu-btn"}
                        style={{
                        marginRight: 5,
                        ...(this.state.isDrawerOpen && { display: "none" }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    {this.state.isDrawerOpen &&
                    <div className={"app-drawer-header"}>
                        <IconButton
                            disableRipple
                            onClick={() => this.setDrawer(!this.state.isDrawerOpen)}
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>}
                    <Typography
                        variant="h6"
                        style={{ marginLeft: "20px" }}
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
                open
                variant={"persistent"}
                className={`app-drawer-main ${this.state.isDrawerOpen ? 'app-drawer-open' : 'app-drawer-close'}`}
            >
                <List>
                    <NavigateButton
                        text={'Home'}
                        url={'/'}
                        icon={<HomeIcon />}
                        isDrawerOpen={this.state.isDrawerOpen}
                        closeDrawer={() => this.setDrawer(false)}
                    />
                </List>
                <Divider />
                <List>
                    <NavigateButton
                        text={'Settings'}
                        url={'/settings'}
                        icon={<SettingsIcon />}
                        isDrawerOpen={this.state.isDrawerOpen}
                        closeDrawer={() => this.setDrawer(false)}
                    />
                </List>
            </Drawer>
            <div style={{ display: 'flex' }}>
                <div className={`${this.state.isDrawerOpen ? 'app-drawer-filler-open' : 'app-drawer-filler-close'}`} />
                {this.props.component}
            </div>
        </>);
    }
}

export default BasePage;
