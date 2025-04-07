import React, { useState } from 'react';
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
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/api';

const drawerWidth = 240;

interface AppNavigationProps {
  children: React.ReactNode;
}

const AppNavigation: React.FC<AppNavigationProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user data from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  const isVerifier = user?.role === 'verifier';
  const isAdmin = user?.role === 'admin';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Drawer items based on user role
  const drawerItems = [
    // Common items for all users
    {
      text: 'Home',
      icon: <HomeIcon />,
      path: '/',
      roles: ['borrower', 'verifier', 'admin']
    },
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['borrower', 'verifier', 'admin']
    },
    
    // Borrower specific items
    {
      text: 'Apply for Loan',
      icon: <PersonAddIcon />,
      path: '/apply-loan',
      roles: ['borrower']
    },
    {
      text: 'My Applications',
      icon: <AssignmentIcon />,
      path: '/my-applications',
      roles: ['borrower']
    },
    {
      text: 'My Loans',
      icon: <CreditCardIcon />,
      path: '/my-loans',
      roles: ['borrower']
    },
    {
      text: 'Repayments',
      icon: <PaymentIcon />,
      path: '/repayments',
      roles: ['borrower']
    },
    
    // Verifier specific items
    {
      text: 'Verify Applications',
      icon: <AssignmentIcon />,
      path: '/dashboard/verifier',
      roles: ['verifier']
    },
    {
      text: 'All Applications',
      icon: <AssignmentIcon />,
      path: '/applications',
      roles: ['verifier', 'admin']
    },
    
    // Admin specific items
    {
      text: 'Admin Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard/admin',
      roles: ['admin']
    },
    {
      text: 'Users Management',
      icon: <PersonIcon />,
      path: '/users',
      roles: ['admin']
    },
    {
      text: 'Loan Products',
      icon: <AccountBalanceIcon />,
      path: '/loan-products',
      roles: ['admin']
    },
    
    // Common items at the bottom
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      roles: ['borrower', 'verifier', 'admin']
    },
    {
      text: 'Help & Support',
      icon: <HelpIcon />,
      path: '/help',
      roles: ['borrower', 'verifier', 'admin']
    }
  ];

  // Filter items based on user role
  const roleToUse = isAdmin ? 'admin' : (isVerifier ? 'verifier' : 'borrower');
  const filteredItems = drawerItems.filter(item => item.roles.includes(roleToUse));

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1e6f42',
        color: 'white'
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Community Loans
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(30, 111, 66, 0.1)',
                  color: '#1e6f42',
                  '&:hover': {
                    backgroundColor: 'rgba(30, 111, 66, 0.2)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#1e6f42',
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#1e6f42' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
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
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#1e6f42'
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
            {isAdmin ? 'Admin Portal' : (isVerifier ? 'Loan Officer Portal' : 'Borrower Portal')}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <Typography variant="body1" sx={{ mr: 2 }}>
                {user?.name || 'User'}
              </Typography>
            )}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ bgcolor: '#164f2f' }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
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
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {children}
      </Box>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AppNavigation;