import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Context
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppProvider";
import { CityProvider } from "./contexts/CityContext";

// Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import PrivateRoute from "./components/common/PrivateRoute";
import LoadingScreen from "./components/common/LoadingScreen";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Categories from "./pages/Categories";
import ItemDetails from "./pages/ItemDetails";
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import MyListings from "./pages/MyListings";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import MyRentals from "./pages/MyRentals";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import CategoryItems from "./pages/CategoryItems";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <Router>
            <AuthProvider>
              <CityProvider>
                <AppProvider>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-grow">
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route
                          path="/categories/:category"
                          element={<Search />}
                        />
                        <Route
                          path="/category/:id"
                          element={<CategoryItems />}
                        />
                        <Route path="/items/:id" element={<ItemDetails />} />
                        <Route
                          path="/forgot-password"
                          element={<ForgotPassword />}
                        />
                        <Route
                          path="/reset-password"
                          element={<ResetPassword />}
                        />
                        <Route path="/terms" element={<Terms />} />

                        {/* Protected Routes */}
                        <Route
                          path="/dashboard"
                          element={
                            <PrivateRoute>
                              <UserDashboard />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/profile/:id?"
                          element={
                            <PrivateRoute>
                              <Profile />
                            </PrivateRoute>
                          }
                        />
                        <Route
  path="/my-ads"
  element={
    <PrivateRoute>
      <MyListings />
    </PrivateRoute>
  }
/>
                        <Route
                          path="/add-item"
                          element={
                            <PrivateRoute>
                              <AddItem />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/edit-item/:id"
                          element={
                            <PrivateRoute>
                              <EditItem />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/my-rentals"
                          element={
                            <PrivateRoute>
                              <MyRentals />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/rentals/:id"
                          element={
                            <PrivateRoute>
                              <ItemDetails />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/favorites"
                          element={
                            <PrivateRoute>
                              <Favorites />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/messages"
                          element={
                            <PrivateRoute>
                              <Messages />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <PrivateRoute>
                              <Settings />
                            </PrivateRoute>
                          }
                        />

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </AppProvider>
              </CityProvider>
            </AuthProvider>
          </Router>
          <Toaster position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
