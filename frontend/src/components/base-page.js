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
import PropTypes from 'prop-types';
import React from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";

class BasePage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <>
            <AppBar position="static" open variant="dense">
                <Toolbar>
                    <IconButton
                        disableRipple
                        color="inherit"
                        onClick={() => this.props.toggleDrawer(this.props.isDrawerOpen)}
                        edge="start"
                        className={"app-menu-btn"}
                        style={{
                        marginRight: 5,
                        ...(this.props.isDrawerOpen && { display: "none" }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        style={{ marginLeft: this.props.isDrawerOpen ? "240px" : "" }}
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
                open={this.props.isDrawerOpen}
                variant={"persistent"}
                className={"app-drawer-main"}
            >
                <div className={"app-drawer-header"}>
                <IconButton
                    disableRipple
                    onClick={() => this.props.toggleDrawer(this.props.isDrawerOpen)}
                >
                    <ChevronLeftIcon />
                </IconButton>
                </div>
                <Divider />
                <List>
                <ListItem key={"Home"} disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                    onClick={()=> {
                        this.props.navigate('/');
                    }}
                    sx={{
                        minHeight: 48,
                        justifyContent: this.props.isDrawerOpen
                        ? "initial"
                        : "center",
                        px: 2.5,
                    }}
                    >
                    <ListItemIcon
                        sx={{
                        minWidth: 0,
                        mr: this.props.isDrawerOpen ? 3 : "auto",
                        justifyContent: "center",
                        }}
                    >
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={'Home'}
                        sx={{ opacity: this.props.isDrawerOpen ? 1 : 0 }}
                    />
                    </ListItemButton>
                </ListItem>
                </List>
                <Divider />
                <List>
                <ListItem key={"Settings"} disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                    onClick={()=> {
                        this.props.navigate('/setting');
                    }}
                    sx={{
                        minHeight: 48,
                        justifyContent: this.props.isDrawerOpen
                        ? "initial"
                        : "center",
                        px: 2.5,
                    }}
                    >
                    <ListItemIcon
                        sx={{
                        minWidth: 0,
                        mr: this.props.isDrawerOpen ? 3 : "auto",
                        justifyContent: "center",
                        }}
                    >
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={"Settings"}
                        sx={{ opacity: this.props.isDrawerOpen ? 1 : 0 }}
                    />
                    </ListItemButton>
                </ListItem>
                </List>
            </Drawer>
        </>);
    }
}

BasePage.propTypes = {
    isDrawerOpen: PropTypes.bool,
    toggleDrawer: PropTypes.func,
    navigate: PropTypes.func,
}

export default BasePage;
