import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NavigateButton = (props) => {
  const { text, url, icon, isDrawerOpen, closeDrawer } = props;
  const navigate = useNavigate();
  const location = useLocation();

  console.log(location);

  return (
    <ListItem key={text} disablePadding sx={{ display: "block" }}>
      <ListItemButton
        selected={location.pathname === url}
        onClick={() => {
          closeDrawer();
          navigate(url);
        }}
        sx={{
          minHeight: 48,
          justifyContent: isDrawerOpen ? "initial" : "center",
          px: 2.5,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: isDrawerOpen ? 3 : "auto",
            justifyContent: "center",
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText primary={text} sx={{ opacity: isDrawerOpen ? 1 : 0 }} />
      </ListItemButton>
    </ListItem>
  );
};

export default NavigateButton;
