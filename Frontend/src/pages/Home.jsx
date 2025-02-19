import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import LoginModal from "../components/LoginModel";
import HomeAdvantageSection from "../components/HomeDetailsSection";
import MedicineCarousel from "../components/MedicineCarousel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chatbot from "../components/Chatbot/Chatbot";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const testimonials = [
    {
      name: "Amit K.",
      age: 70,
      image:
        "https://img.freepik.com/premium-photo/indian-confident-male-cancer-survivor-who-is-bald-standing-hospital_466689-96148.jpg",
      text: "Meds4You helped me save thousands on my monthly medicine bills!",
    },
    {
      name: "Rajesh M.",
      age: 27,
      image:
        "https://cdn.pixabay.com/photo/2024/03/31/05/00/ai-generated-8665996_960_720.jpg",
      text: "Quality medicines at unbeatable prices. Highly recommend!",
    },
    {
      name: "Preeti S.",
      age: 45,
      image:
        "https://www.womenentrepreneursreview.com/entrepreneur_images/news_images/671b6cc938d27_1.jpg",
      text: "Meds4You's recommendations are spot-on, and the discounts are amazing!",
    },
    {
      name: "Neha P.",
      age: 23,
      image:
        "https://media.istockphoto.com/id/1987655119/photo/smiling-young-businesswoman-standing-in-the-corridor-of-an-office.jpg?s=612x612&w=0&k=20&c=5N_IVGYsXoyj-H9vEiZUCLqbmmineaemQsKt2NTXGms=",
      text: "Timely delivery and genuine products. A trustworthy service!",
    },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        checkAdminRole(user.uid);
      }
    });

    axios
      .get("http://localhost:5000/api/products")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((err) => console.error(err));

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

  const addToCart = async (productId) => {
    if (!user) {
      setShowLoginModal(true);
      toast.info("Please log in to add items to your cart.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/cart/add", {
        userId: user.uid,
        productId: productId,
        quantity: 1,
      });

      toast.success("Added to Cart!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.log("Failed to add to cart:", err);

      toast.error("Failed to Add to Cart. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div>
      <div className="fixed bottom-4 right-4 w-20 h-20 z-50">
        <Chatbot />
      </div>
      <div className="mx-auto max-w-7xl mt-20">
        {/* Header Section */}
        <div className="header-section text-center bg-blue-100 py-16">
          <h1 className="text-4xl font-bold text-[#333333] mb-4">
            Your Partner in Affordable Healthcare
          </h1>
          <div className="space-x-4">
            <Link to="/infoOrder">
              <button className="bg-[#d1f3e0] text-[#444444] px-6 py-2 rounded-full hover:bg-[#4CAF50]">
                Upload Prescription
              </button>
            </Link>
            <Link to="/join-partner">
              <button className="bg-[#d1f3e0] text-[#444444] px-6 py-2 rounded-full hover:bg-[#4CAF50]">
                Join as Store Partner
              </button>
            </Link>
          </div>
        </div>

        <div className="px-8 mt-8">
          <MedicineCarousel products={products} addToCart={addToCart} />
        </div>

        {/* Why Choose Us Section */}
        <div className="why-choose-us bg-gray-100 py-12">
          <h2 className="text-2xl font-bold text-center mb-6">
            Why Choose Us?
          </h2>
          <ul className="list-none text-center">
            <li>Save up to 30% with high-quality generic alternatives.</li>
            <li>Easy prescription upload and alternative suggestions.</li>
            <li>Dedicated to making healthcare accessible to all.</li>
          </ul>
        </div>

        {/* WhatsApp Section */}
        <section
          style={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
            zIndex: 1000, // Ensure it's above other elements
          }}
        >
          <a
            href="https://wa.me/918459708577?text=Hello%20there!" // Correct format with an optional pre-filled message
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 20px",
              backgroundColor: "#25D366",
              color: "white",
              borderRadius: "50px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              textDecoration: "none",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1EBE55")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#25D366")
            }
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              style={{
                width: "24px",
                height: "24px",
                marginRight: "8px",
              }}
            />
            <span
              style={{
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Chat on WhatsApp
            </span>
          </a>
        </section>

        {/* Customer Testimonials Section */}
        <section className="py-0" id="happy-customers">
          <h2 className="text-left text-2xl font-bold mb-6 text-black-800">
            💬 Hear from Our Happy Customers
          </h2>
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-lg shadow-md flex flex-col justify-end text-left relative overflow-hidden"
                style={{
                  backgroundImage: `url(${testimonial.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "300px",
                }}
              >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                {/* Content */}
                <div className="relative z-10 p-4 text-white mt-auto">
                  <h3 className="font-semibold text-sm mb-1">
                    <span className="mr-2">😊</span>
                    {testimonial.name}{" "}
                    <span className="text-gray-300">| {testimonial.age}</span>
                  </h3>
                  <p className="text-xs mt-2 leading-tight">{testimonial.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Admin Section */}
        {isAdmin && (
          <div className="text-center mt-10">
            <button className="bg-green-500 text-white px-6 py-2 rounded-full">
              Admin Dashboard
            </button>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
            <LoginModal onClose={() => setShowLoginModal(false)} />
          </div>
        )}

        {/* Toastify Container */}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Home;
