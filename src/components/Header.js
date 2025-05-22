import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  InputBase,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#f1f3f4",
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "300px",
  },
  display: "flex",
  alignItems: "center",
  padding: "0 10px",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  marginLeft: theme.spacing(1),
  flex: 1,
}));

const Header = ({ hoTen, onLogout }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    if (onLogout) onLogout();
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        {/* Logo + Search */}
        <Box display="flex" alignItems="center" gap={2}>
          <img src="/logo.png" alt="logo" style={{ height: 80 }} />
          <Search>
            <SearchIcon />
            <StyledInputBase placeholder="Tìm kiếm..." inputProps={{ "aria-label": "search" }} />
          </Search>
        </Box>

        {/* Actions: Home + Notifications + User */}
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton color="inherit">
            <HomeIcon />
          </IconButton>
          <IconButton color="inherit">
            <Badge badgeContent={10} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Box>
            <IconButton onClick={handleMenuOpen}>
              <Avatar sx={{ width: 32, height: 32 }} />
              <Typography sx={{ ml: 1, fontWeight: 500 }}>{hoTen}</Typography>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleMenuClose}>Thông tin cá nhân</MenuItem>
              <MenuItem onClick={handleMenuClose}>Đổi mật khẩu</MenuItem>
              <MenuItem onClick={handleLogoutClick}>Đăng xuất</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
