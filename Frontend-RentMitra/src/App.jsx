import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
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
import MyRentals from "./pages/MyRentals";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import CategoryItems from "./pages/CategoryItems";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import BecomeRenter from "./pages/BecomeRenter";

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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 700,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
    },
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

const AppContent = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  const isLoginRoute = location.pathname === "/login";
  const isRegisterRoute = location.pathname === "/register";
  const isForgotPasswordRoute = location.pathname === "/forgot-password";
  const isAuthRoute = isLoginRoute || isRegisterRoute || isForgotPasswordRoute;

  return (
    <div
      className={`flex flex-col ${
        isAuthRoute ? "h-screen overflow-y-auto no-scrollbar" : "min-h-screen"
      }`}
    >
      {!isRegisterRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/become-a-renter" element={<BecomeRenter />} />
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
                              <AddItem />
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
      {isAuthRoute ? (
        <footer className="bg-gray-900 text-white mt-auto">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-400 gap-2">
            <span>© 2025 Rentra Mitra</span>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/privacy" className="hover:text-white transition-colors duration-300">
                Privacy Policy
              </Link>
              <span className="hidden sm:inline">|</span>
              <Link to="/terms" className="hover:text-white transition-colors duration-300">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </footer>
      ) : (
        <Footer />
      )}
    </div>
  );
};

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
                  <AppContent />
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
