import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
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
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  ExitToApp as LogoutIcon,
  AccountCircle,
  NotificationsActive as NotificationIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

interface AppLayoutProps {
  title?: string;
}

const AppLayout = ({ title = 'Dashboard' }: AppLayoutProps) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isMenuOpen = Boolean(anchorEl);

  const adminItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Borrowers', icon: <PeopleIcon />, path: '/admin/borrowers' },
    { text: 'Loans', icon: <DescriptionIcon />, path: '/admin/loans' },
    { text: 'Repayments', icon: <PaymentIcon />, path: '/admin/repayments' },
    { text: 'Admin Management', icon: <PeopleIcon />, path: '/admin/manage' }
  ];

  const verifierItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/verifier/dashboard' },
    { text: 'Borrowers', icon: <PeopleIcon />, path: '/verifier/borrowers' },
    { text: 'Loans', icon: <DescriptionIcon />, path: '/verifier/loans' },
    { text: 'Repayments', icon: <PaymentIcon />, path: '/verifier/repayments' }
  ];

  // Decide which items to show based on role
  const navigationItems = isAdmin() ? adminItems : verifierItems;

  const drawer = (
    <div>
      <Toolbar sx={{ backgroundColor: '#1e6f42', color: 'white' }}>
        <Typography variant="h6" noWrap component="div">
          CREDIT APP
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: '#1e6f42', mr: 2 }}>
          {user?.name?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" noWrap>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {/* Safely check user?.role before calling string methods */}
            {user?.role
              ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
              : ''}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'black',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <IconButton
              size="large"
              aria-label="show new notifications"
              color="inherit"
            >
              <NotificationIcon />
            </IconButton>
            <IconButton
              size="large"
              aria-label="show new messages"
              color="inherit"
            >
              <ChatIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMenu}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // Offset for AppBar
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
