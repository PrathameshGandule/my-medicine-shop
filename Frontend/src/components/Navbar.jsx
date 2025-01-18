import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartImage from "../assets/cart.png";
import companyicon from "../assets/company.png";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import LoginModal from "./LoginModel";
import axios from "axios";

function Navbar({ onSearch }) {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Track if typing is in progress
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        checkAdminRole(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkAdminRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      setIsAdmin(userDoc.exists() ? userDoc.data()?.isAdmin || false : false);
    } catch (error) {
      console.error("Error checking admin role:", error);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsTyping(true); // Set to typing
      const delayDebounceFn = setTimeout(() => {
        fetchSearchResults();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
      setIsTyping(false); // Reset when there's no input
    }
  }, [searchQuery]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/products?search=${searchQuery}`
      );
      setSearchResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Search error:", error);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await fetchSearchResults();
    }
  };

  const handleResultClick = (medicineId) => {
    if (!medicineId) {
      console.error("Medicine ID is undefined.");
      return;
    }
    setSearchResults([]);
    setSearchQuery("");
    navigate(`/medicine/${medicineId}`);
  };

  const handleLogout = () => {
    auth.signOut();
  };

  const clearSearchQuery = () => {
    setSearchQuery(""); // Clear the input
    setIsTyping(false); // Reset typing state
  };

  return (
    <nav
      className={`bg-[#c8f4df] p-4 fixed top-0 left-0 w-full z-50 shadow-md transition-all duration-300 ease-in-out ${
        isTyping ? "shadow-lg" : "" // Add shadow when typing
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo and Company Name */}
          <div className="flex items-center flex-shrink-0">
            <img src={companyicon} alt="Icon" className="w-6 h-6" />
            <Link
              to="/"
              className="text-black font-roboto font-medium text-lg mr-4 pl-2"
            >
              Meds4You
            </Link>
          </div>

          {/* Search Section */}
          <div className="flex-grow mx-8 relative">
            <form
              onSubmit={handleSearch}
              className="flex items-center relative w-full"
            >
              <input
                type="text"
                placeholder="Search your Medicines"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-l-full border border-gray-300 focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out"
              />

              {/* Cross Button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearchQuery}
                  className="absolute right-1 pr-28 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl"
                >
                  ×
                </button>
              )}

              {/* Search Button */}
              <button
                type="submit"
                className="bg-[#4a8694] text-white px-6 py-2 rounded-r-full hover:bg-[#225f6a] transition duration-300 -ml-px whitespace-nowrap"
              >
                Search
              </button>
            </form>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-[90%] bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto z-50 transition-all ease-in-out duration-300 max-h-[35vh]">
                {searchResults.map((result) => (
                  <div
                    key={result._id}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-md last:rounded-b-md border-b border-gray-100 last:border-0"
                    onClick={() => handleResultClick(result._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">
                          {result.name}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {result.category}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        MRP ₹{result.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Loading Spinner */}
            {loading && (
              <div className="absolute top-full left-0 mt-2 w-[90%] text-center text-sm text-gray-500">
                Loading...
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6 flex-shrink-0">
            <Link
              to="/infoOrder"
              className="text-black text-base font-lato hover:text-blue-600 transition duration-300 ease-in-out hidden sm:block"
            >
              How to order
            </Link>
            <Link
              to="/contact"
              className="text-black text-base font-lato hover:text-blue-600 transition duration-300 ease-in-out hidden sm:block"
            >
              Contact
            </Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin-dashboard"
                    className="text-black text-base font-lato hover:text-blue-600 transition duration-300 ease-in-out hidden sm:block"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-black text-base font-lato hover:text-blue-600 transition duration-300 ease-in-out"
                >
                  Profile
                </Link>
                <Link
                  to="/cart"
                  className="text-black text-base font-lato hover:text-blue-600 transition duration-300 ease-in-out"
                >
                  <div className="w-6 h-6 bg-white rounded-full flex justify-center items-center shadow-md transform hover:scale-110 transition-transform duration-300 ease-in-out">
                    <img className="w-4 h-4" src={cartImage} alt="Cart" />
                  </div>
                </Link>
              </>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="text-black text-base font-lato hover:text-blue-600 transition duration-300 ease-in-out"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
    </nav>
  );
}

export default Navbar;
