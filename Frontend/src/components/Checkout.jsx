import React, { useEffect, useState } from "react";
import { db } from "../services/firebase"; // Firestore configuration
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../services/firebase"; // Firebase authentication
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]); // For storing all user's addresses
  const [selectedAddress, setSelectedAddress] = useState(null); // For storing the selected address
  const navigate = useNavigate();

  // Detect userId change based on Firebase Authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Set the userId when user logs in
        fetchAddresses(user.uid); // Fetch the user's addresses from Firestore
      } else {
        setUserId(null); // Clear userId if no user is logged in
      }
    });

    // Clean up the subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Fetch user's addresses from Firestore
  const fetchAddresses = async (userId) => {
    try {
      const userRef = doc(db, "users", userId); // Reference to user's document in Firestore
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const addresses = userData.addresses || []; // Get the addresses array

        if (addresses.length > 0) {
          setUserAddresses(addresses); // Store all addresses in state
          setSelectedAddress(addresses[0]); // Set the first address as selected by default
        } else {
          setUserAddresses([]);
          setSelectedAddress(null);
        }
      } else {
        setUserAddresses([]);
        setSelectedAddress(null);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  // Fetch cart items for the logged-in user
  useEffect(() => {
    if (userId) {
      const fetchCart = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/cart/${userId}`
          );
          const items = response.data.items || [];
          setCart(items);
          setTotalAmount(
            items
              .reduce(
                (sum, item) => sum + item.productId.price * item.quantity,
                0
              )
              .toFixed(2)
          );
          setLoading(false);
        } catch (err) {
          console.error("Failed to fetch cart:", err);
          setError("Failed to fetch cart");
          setLoading(false);
        }
      };
      fetchCart();
    }
  }, [userId]);

  const handlePayment = async () => {
    if (!selectedAddress) {
      alert("Please select an address before proceeding.");
      return;
    }

    try {
      const orderData = await axios.post(
        "http://localhost:5000/api/orders/create",
        {
          userId,
          items: cart,
          totalAmount,
          address: `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zip}`,
        }
      );

      const options = {
        key: "your-razorpay-key",
        amount: totalAmount * 100,
        currency: "INR",
        name: "Your Store Name",
        description: "Test Transaction",
        order_id: orderData.data.orderId,
        handler: async (response) => {
          try {
            await axios.post("http://localhost:5000/api/orders/verify", {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              address: `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zip}`,
            });
            alert("Payment successful!");
            navigate("/orders");
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: "Your Name",
          email: "your-email@example.com",
          contact: "9999999999",
        },
        notes: {
          address: `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zip}`,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error("Error initializing payment:", error);
      alert("Failed to initialize payment");
    }
  };

  return (
    <div className="container min-h-screen mx-auto p-24">
      <h1 className="text-center text-3xl mb-6">Checkout</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : cart.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty.</p>
      ) : (
        <div>
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex items-center border p-4 rounded-md"
              >
                <img
                  src={item?.productId?.image || "placeholder.jpg"}
                  alt={item?.productId?.name || "Unnamed product"}
                  className="w-16 h-16 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <h2 className="font-bold text-lg">
                    {item?.productId?.name || "Unknown Product"}
                  </h2>
                  <p className="text-blue-600 font-semibold">
                    Price: Rs.{item?.productId?.price || "N/A"}
                  </p>
                  <p>Quantity: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <h2 className="text-xl font-bold mt-6">
            Total Amount: Rs.{totalAmount}
          </h2>

          {/* Address Selection */}
          {/* Address Selection */}
          {userAddresses.length > 0 ? (
            <div className="mt-4">
              <h3 className="font-bold">Select Delivery Address</h3>
              <div className="space-y-3">
                {userAddresses.map((address, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`address-${index}`}
                      name="address"
                      value={index}
                      checked={selectedAddress === address}
                      onChange={() => setSelectedAddress(address)}
                      className="mr-2"
                    />
                    <label htmlFor={`address-${index}`}>
                      {`${address.flatHouseNo}, ${address.areaStreet}, ${address.landmark}, ${address.city}, ${address.state}, ${address.pincode}`}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <h3 className="font-bold">Delivery Address</h3>
              <p>No address available.</p>
            </div>
          )}

          <button
            onClick={handlePayment}
            className="bg-green-500 text-white p-2 rounded mt-6 block mx-auto transition transform duration-300 ease-in-out hover:bg-green-600 hover:scale-105"
          >
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
