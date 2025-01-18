import React, { useState, useEffect } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";


const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("manageProducts"); // Default section
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const navigate = useNavigate(); 

  // Fetch products and orders from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await axios.get("/api/admin/products");
        const orderData = await axios.get("/api/admin/orders");

        setProducts(Array.isArray(productData.data) ? productData.data : []);
        setOrders(Array.isArray(orderData.data) ? orderData.data : []);
        setLoadingProducts(false);
        setLoadingOrders(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoadingProducts(false);
        setLoadingOrders(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Clear authentication data from localStorage/sessionStorage
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
  
        // Redirect to login page
        navigate("/");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
        alert("Failed to log out. Please try again.");
      });
  };
  

  // Function to create a new product
  const createProduct = async (newProduct) => {
    try {
      // Ensure the product data is correctly formatted
      const formattedProduct = {
        name: newProduct.name,
        image: newProduct.image,
        description: newProduct.description,
        type: newProduct.type,
        brand: newProduct.brand,
        category: newProduct.category,
        price: parseFloat(newProduct.price), // Ensure price is a number
        discount: newProduct.discount ? parseFloat(newProduct.discount) : 0, // Handle discount if provided
      };

      console.log("Sending product data:", formattedProduct);

      // Send the product data to the backend
      const response = await axios.post("http://localhost:5000/api/admin/products", formattedProduct);

      // Update the product list after successfully creating the product
      setProducts((prevProducts) => [...prevProducts, response.data]);

      alert("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error.response ? error.response.data : error.message);
      alert("Error creating product");
    }
  };

  // Function to delete a product
  const deleteProduct = async (id) => {
    try {
      await axios.delete(`/api/admin/products/${id}`);
      setProducts((prevProducts) => prevProducts.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Function to update order status
  const updateOrderStatus = async (orderId, status, paymentStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, { orderStatus: status, paymentStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: status, paymentStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Function to delete an order
  const deleteOrder = async (id) => {
    try {
      await axios.delete(`/api/admin/orders/${id}`);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex-shrink-0">
        <div className="p-4">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
        </div>
        <nav className="flex flex-col p-4">
          <button
            onClick={() => setActiveSection("createProduct")}
            className={`mb-2 text-left px-4 py-2 rounded ${
              activeSection === "createProduct" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            Create Product
          </button>
          <button
            onClick={() => setActiveSection("manageProducts")}
            className={`mb-2 text-left px-4 py-2 rounded ${
              activeSection === "manageProducts" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            Manage Products
          </button>
          <button
            onClick={() => setActiveSection("manageOrders")}
            className={`mb-2 text-left px-4 py-2 rounded ${
              activeSection === "manageOrders" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            Manage Orders
          </button>
          <button
            onClick={handleLogout}
            className="mt-4 text-red-500 hover:text-red-700 text-left px-4 py-2 rounded"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Create Product Section */}
        {activeSection === "createProduct" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Create Product</h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newProduct = Object.fromEntries(formData.entries());

                // Convert numerical fields
                newProduct.price = parseFloat(newProduct.price);
                newProduct.discount = parseFloat(newProduct.discount);

                // Optional: Validate URLs (image and brand)
                const urlPattern = new RegExp(
                  "^(https?:\\/\\/)?" + // protocol
                    "((([a-zA-Z0-9\\-\\.]+)\\.([a-zA-Z]{2,5}))|" + // domain name
                    "localhost)" + // localhost
                    "(\\:[0-9]{1,5})?" + // port
                    "(\\/.*)?$" // path
                );

                if (!urlPattern.test(newProduct.image)) {
                  alert("Please enter a valid Image URL.");
                  return;
                }

                if (!urlPattern.test(newProduct.brand)) {
                  alert("Please enter a valid Brand Logo URL.");
                  return;
                }

                createProduct(newProduct);
                e.target.reset();
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Product Name */}
              <div>
                <label className="block mb-1 font-semibold">Product Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Thyroxine 12.5mcg"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block mb-1 font-semibold">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="82.9"
                  step="0.01"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block mb-1 font-semibold">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  placeholder="50"
                  step="0.01"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block mb-1 font-semibold">Image URL</label>
                <input
                  type="url"
                  name="image"
                  placeholder="https://example.com/image.jpg"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Brand Logo URL */}
              <div>
                <label className="block mb-1 font-semibold">Brand Logo URL</label>
                <input
                  type="url"
                  name="brand"
                  placeholder="https://example.com/brand-logo.webp"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block mb-1 font-semibold">Type</label>
                <input
                  type="text"
                  name="type"
                  placeholder="Tab 100s"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Category */}
              <div className="md:col-span-2">
                <label className="block mb-1 font-semibold">Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="Bottle of 100 tablets"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block mb-1 font-semibold">Description</label>
                <textarea
                  name="description"
                  placeholder="Thiroace 12.5mcg"
                  required
                  className="w-full p-2 border rounded h-24"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Manage Products Section */}
        {activeSection === "manageProducts" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Manage Products</h1>
            {loadingProducts ? (
              <div>Loading products...</div>
            ) : products.length === 0 ? (
              <div>No products available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Image</th>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Price ($)</th>
                      <th className="py-2 px-4 border-b">Discount (%)</th>
                      <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} className="text-center">
                        <td className="py-2 px-4 border-b">
                          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover mx-auto" />
                        </td>
                        <td className="py-2 px-4 border-b">{product.name}</td>
                        <td className="py-2 px-4 border-b">{product.price.toFixed(2)}</td>
                        <td className="py-2 px-4 border-b">{product.discount}%</td>
                        <td className="py-2 px-4 border-b">
                          <button
                            onClick={() => deleteProduct(product._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Manage Orders Section */}
        {activeSection === "manageOrders" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
            {loadingOrders ? (
              <div>Loading orders...</div>
            ) : orders.length === 0 ? (
              <div>No orders available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Order ID</th>
                      <th className="py-2 px-4 border-b">Status</th>
                      <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="text-center">
                        <td className="py-2 px-4 border-b">{order._id}</td>
                        <td className="py-2 px-4 border-b">{order.orderStatus}</td>
                        <td className="py-2 px-4 border-b">
                          <button
                            onClick={() =>
                              updateOrderStatus(order._id, "Shipped", "Paid")
                            }
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Ship Order
                          </button>
                          <button
                            onClick={() => deleteOrder(order._id)}
                            className="ml-4 text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;  