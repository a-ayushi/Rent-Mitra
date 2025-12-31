import React from "react";
import { Drawer, Avatar, Button, LinearProgress, List, ListItem, ListItemIcon, ListItemText, Divider, Box } from "@mui/material";
import { Assignment, BusinessCenter, ShoppingCart, Receipt, HelpOutline, Settings, GetApp, Logout } from "@mui/icons-material";

export default function ProfileSidebar({ open, onClose, user, onLogout, onNavigate }) {
  // For progress bar (example: 3/6 steps)
  const stepsDone = 3;
  const totalSteps = 6;

  const avatarSrc = (() => {
    const direct = user?.avatarUrl || user?.profileImage?.url;
    if (direct) return direct;
    const raw = user?.imageUrls;
    if (typeof raw === 'string') {
      const first = raw.split(',')[0]?.trim();
      return first || undefined;
    }
    if (Array.isArray(raw)) {
      const first = raw[0] == null ? '' : String(raw[0]).trim();
      return first || undefined;
    }
    return undefined;
  })();

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 320, p: 2, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar src={avatarSrc} sx={{ width: 64, height: 64, mb: 1, bgcolor: '#00E1D6', fontSize: 36 }}>
            {user?.name?.[0] || 'A'}
          </Avatar>
          <Box sx={{ fontWeight: 700, fontSize: 22, mb: 1 }}>{user?.name || 'User Name'}</Box>
          <Button variant="contained" sx={{ bgcolor: '#0057A3', borderRadius: 2, fontWeight: 700, mb: 2 }} fullWidth onClick={() => onNavigate('profile')}>View and edit profile</Button>
          <Box sx={{ width: '100%', mb: 1 }}>
            <Box sx={{ fontWeight: 600, fontSize: 15, mb: 0.5 }}>3 steps left</Box>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
              {[...Array(totalSteps)].map((_, i) => (
                <Box key={i} sx={{ flex: 1, height: 7, borderRadius: 2, bgcolor: i < stepsDone ? '#FFD600' : '#E0E0E0' }} />
              ))}
            </Box>
            <Box sx={{ color: '#888', fontSize: 13, mb: 1 }}>
              We are built on trust. Help one another to get to know each other better.
            </Box>
          </Box>
        </Box>
        <Divider />
        <List>
          <ListItem button onClick={() => onNavigate('my-ads')}>
            <ListItemIcon><Assignment /></ListItemIcon>
            <ListItemText primary="My ADS" />
          </ListItem>
          <ListItem button onClick={() => onNavigate('buy-packages')}>
            <ListItemIcon><BusinessCenter /></ListItemIcon>
            <ListItemText primary="Buy Business Packages" />
          </ListItem>
          <ListItem button onClick={() => onNavigate('cart')}>
            <ListItemIcon><ShoppingCart /></ListItemIcon>
            <ListItemText primary="View Cart" />
          </ListItem>
          <ListItem button onClick={() => onNavigate('billing')}>
            <ListItemIcon><Receipt /></ListItemIcon>
            <ListItemText primary="Bought Packages & Billing" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button onClick={() => onNavigate('help')}>
            <ListItemIcon><HelpOutline /></ListItemIcon>
            <ListItemText primary="Help" />
          </ListItem>
          <ListItem button onClick={() => onNavigate('settings')}>
            <ListItemIcon><Settings /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button onClick={() => onNavigate('install-app')}>
            <ListItemIcon><GetApp /></ListItemIcon>
            <ListItemText primary="Install OLX Lite app" />
          </ListItem>
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" color="error" startIcon={<Logout />} sx={{ mt: 2 }} onClick={onLogout} fullWidth>
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}
