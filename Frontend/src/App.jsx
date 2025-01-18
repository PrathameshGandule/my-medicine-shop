import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminDashboard from "./components/AdminDashboard";
import ContactUs from "./pages/Contact";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import OrderMedicine from "./components/OrderMedicine";
import MedicineDetails from "./pages/MedicineDetails";
import JoinAsStorePartner from "./pages/JoinAsStorePartner";

function AppContent() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null); // Store user data (e.g., role)
  const location = useLocation();
  const navigate = useNavigate();

  // Simulate fetching user role from local storage or API
  useEffect(() => {
    // You should fetch user data from your authentication system (e.g., backend)
    const fetchedUser = JSON.parse(localStorage.getItem('user'));
    // console.log(fetchedUser);
     // Replace with actual user fetching logic
    setUser(fetchedUser);
    
    // Redirect admins from accessing non-admin routes
    if (fetchedUser && fetchedUser.role === "admin" && location.pathname === "/") {
      navigate("/admin");
    }
  }, [location, navigate]);

  const handleSearch = (searchResults) => {
    setProducts(searchResults);
  };

  // List of routes where Navbar and Footer should not be displayed
  const noLayoutRoutes = ["/admin"];

  const shouldShowLayout = !noLayoutRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowLayout && <Navbar onSearch={handleSearch} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<PrivateRoute element={CartPage} />} />
        <Route path="/checkout" element={<PrivateRoute element={CheckoutPage} />} />
        <Route path="/admin" element={<PrivateRoute element={AdminDashboard} />} />
        <Route path="/profile" element={<PrivateRoute element={Profile} />} />
        <Route path="/infoOrder" element={<OrderMedicine />} />
        <Route path="/products/:id" element={<MedicineDetails />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/join-partner" element={<JoinAsStorePartner />} />
        <Route path="/medicine/:id" element={<MedicineDetails />} />
      </Routes>
      {shouldShowLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
