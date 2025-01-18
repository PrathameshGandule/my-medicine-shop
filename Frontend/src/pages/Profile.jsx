import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

const Profile = () => {
  const [user, setUser] = useState(null);
  const [selectedSection, setSelectedSection] = useState("profileInfo");
  const [showAddressForm, setShowAddressForm] = useState(false); // State to toggle address form

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");

  const [addresses, setAddresses] = useState([]); // State for storing addresses
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    isPrimary: false,
  }); // Form state for new address

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserDetails(user.uid); // Fetch data when logged in
      } else {
        setUser(null);
        setAddresses([]); // Clear addresses on logout
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate("/");
    });
  };

  const fetchUserDetails = async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setFirstName(userData.firstName || "");
        setLastName(userData.lastName || "");
        setAge(userData.age || "");
        setEmail(userData.email || "");
        setGender(userData.gender || "");
        setAddresses(userData.addresses || []); // Set addresses from Firestore
      }
    } catch (error) {
      console.error("Error getting user details:", error);
    }
  };

  const saveUserDetails = async () => {
    if (user) {
      try {
        await setDoc(
          doc(db, "users", user.uid),
          { firstName, lastName, age, email, gender, addresses },
          { merge: true }
        );
        toast.success("User details updated successfully!"); // Use toast notification instead of alert
      } catch (error) {
        console.error("Error saving user details:", error);
        toast.error("Error updating user details."); // Use toast for error
      }
    }
  };

  const handleAddAddress = async () => {
    const updatedAddresses = [...addresses, newAddress];

    // Update the local state
    setAddresses(updatedAddresses);
    setNewAddress({
      street: "",
      city: "",
      state: "",
      zip: "",
      isPrimary: false,
    });

    // Save updated addresses to Firebase
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          addresses: updatedAddresses,
        });
        toast.success("Address added successfully!"); // Success toast
      } catch (error) {
        console.error("Error saving address:", error);
        toast.error("Error adding address."); // Error toast
      }
    }
  };

  const handleDeleteAddress = async (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);

    // Remove address from Firestore
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          addresses: updatedAddresses,
        });
        toast.success("Address deleted successfully!"); // Success toast
      } catch (error) {
        console.error("Error deleting address:", error);
        toast.error("Error deleting address."); // Error toast
      }
    }
  };

  const handleSetPrimaryAddress = (index) => {
    const updatedAddresses = addresses.map((address, i) => ({
      ...address,
      isPrimary: i === index,
    }));
    setAddresses(updatedAddresses);
  };

  //   <div>
  //     <h2 className="text-xl font-semibold mb-4">Manage Addresses</h2>

  //     {addresses.length === 0 ? (
  //       <p>No addresses added yet.</p>
  //     ) : (
  //       <div>
  //         {addresses.map((address, index) => (
  //           <div key={index} className="bg-white p-4 rounded-md shadow-md mb-4">
  //             <p>{address.isPrimary ? "Primary Address" : "Address"}</p>
  //             <p>{address.street}</p>
  //             <p>{address.city}, {address.state} {address.zip}</p>
  //             <button
  //               onClick={() => handleSetPrimaryAddress(index)}
  //               className="bg-blue-500 text-white py-1 px-4 rounded-md mt-2"
  //             >
  //               Set as Primary
  //             </button>
  //             <button
  //               onClick={() => handleDeleteAddress(index)}
  //               className="bg-red-500 text-white py-1 px-4 rounded-md mt-2 ml-2"
  //             >
  //               Delete
  //             </button>
  //           </div>
  //         ))}
  //       </div>
  //     )}

  //     {/* Address Form */}
  //     <h3 className="text-lg font-semibold mt-6">Add New Address</h3>
  //     <div className="space-y-4">
  //       <div>
  //         <label className="block text-gray-700">Street</label>
  //         <input
  //           type="text"
  //           value={newAddress.street}
  //           onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
  //           className="w-full p-3 border border-gray-300 rounded-md"
  //         />
  //       </div>
  //       <div>
  //         <label className="block text-gray-700">City</label>
  //         <input
  //           type="text"
  //           value={newAddress.city}
  //           onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
  //           className="w-full p-3 border border-gray-300 rounded-md"
  //         />
  //       </div>
  //       <div>
  //         <label className="block text-gray-700">State</label>
  //         <input
  //           type="text"
  //           value={newAddress.state}
  //           onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
  //           className="w-full p-3 border border-gray-300 rounded-md"
  //         />
  //       </div>
  //       <div>
  //         <label className="block text-gray-700">Zip Code</label>
  //         <input
  //           type="text"
  //           value={newAddress.zip}
  //           onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
  //           className="w-full p-3 border border-gray-300 rounded-md"
  //         />
  //       </div>
  //       <div className="flex items-center space-x-4">
  //         <label className="text-gray-700">Set as Primary Address</label>
  //         <input
  //           type="checkbox"
  //           checked={newAddress.isPrimary}
  //           onChange={() => setNewAddress({ ...newAddress, isPrimary: !newAddress.isPrimary })}
  //         />
  //       </div>
  //       <button
  //         onClick={handleAddAddress}
  //         className="w-full bg-green-500 text-white py-2 rounded-md mt-4"
  //       >
  //         Add Address
  //       </button>
  //     </div>
  //   </div>
  // );

  const renderAddressSection = () => (
    <div>
      <h2 className="text-sm font-semibold mb-4">Manage Addresses</h2>

      {addresses.length === 0 ? (
        <p>No addresses added yet.</p>
      ) : (
        <div>
          {addresses.map((address, index) => (
            <div key={index} className="bg-white p-4 rounded-md shadow-md mb-4">
              <p>{address.isPrimary ? "Primary Address" : "Address"}</p>
              <p>
                {address.flatHouseNo}, {address.areaStreet}, {address.landmark}
              </p>
              <p>
                {address.pincode}, {address.city}
              </p>
              <p>{address.state}</p>
              <button
                onClick={() => handleSetPrimaryAddress(index)}
                className="bg-blue-500 text-white py-1 px-4 rounded-md mt-2"
              >
                Set as Primary
              </button>
              <button
                onClick={() => handleDeleteAddress(index)}
                className="bg-red-500 text-white py-1 px-4 rounded-md mt-2 ml-2"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAddressForm(!showAddressForm)}
        className="w-full bg-blue-500 text-white py-2 rounded-md mt-4"
      >
        {showAddressForm ? "Cancel" : "Add New Address"}
      </button>

      {/* Address Form */}
      {showAddressForm && (
        <>
          <h3 className="text-lg font-semibold mt-6">Add New Address</h3>
          <div className="space-y-4">
            {/* Flat, House no., Building, Company, Apartment */}
            <div>
              <label className="block text-gray-700">
                Flat, House no., Building, Company, Apartment
              </label>
              <input
                type="text"
                value={newAddress.flatHouseNo}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, flatHouseNo: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            {/* Area, Street, Sector, Village */}
            <div>
              <label className="block text-gray-700">
                Area, Street, Sector, Village
              </label>
              <input
                type="text"
                value={newAddress.areaStreet}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, areaStreet: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-gray-700">Landmark</label>
              <input
                type="text"
                value={newAddress.landmark}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, landmark: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            {/* Pincode and Town/City on the same line */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-gray-700">Pincode</label>
                <input
                  type="text"
                  value={newAddress.pincode}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, pincode: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700">Town/City</label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* State selection */}
            <div>
              <label className="block text-gray-700">Select State</label>
              <select
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">Select State</option>
                {/* Add options for states here */}
              </select>
            </div>

            {/* Make this my default address */}
            <div className="flex items-center space-x-4 mt-4">
              <label className="text-gray-700">
                Make this my default address
              </label>
              <input
                type="checkbox"
                checked={newAddress.isPrimary}
                onChange={() =>
                  setNewAddress({
                    ...newAddress,
                    isPrimary: !newAddress.isPrimary,
                  })
                }
              />
            </div>

            <button
              onClick={handleAddAddress}
              className="w-full bg-green-500 text-white py-2 rounded-md mt-4"
            >
              Add Address
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderContent = () => {
    if (!user) {
      return <p>Please log in to view your profile details.</p>;
    }

    switch (selectedSection) {
      case "profileInfo":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-gray-700">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Gender</label>
              <div className="flex space-x-4">
                <label>
                  <input
                    type="radio"
                    value="Male"
                    checked={gender === "Male"}
                    onChange={() => setGender("Male")}
                    className="mr-2"
                  />
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    value="Female"
                    checked={gender === "Female"}
                    onChange={() => setGender("Female")}
                    className="mr-2"
                  />
                  Female
                </label>
                <label>
                  <input
                    type="radio"
                    value="Other"
                    checked={gender === "Other"}
                    onChange={() => setGender("Other")}
                    className="mr-2"
                  />
                  Other
                </label>
              </div>
            </div>
            <button
              onClick={saveUserDetails}
              className="w-full bg-[#4a8694] text-white py-2 rounded-md hover:bg-[#225f6a] transition"
            >
              Save
            </button>
          </div>
        );
      case "manageAddress":
        return renderAddressSection();
      case "myOrders":
        return <p>Here you can view your order history.</p>;
      case "managePatients":
        return <p>Manage your patients here.</p>;
      case "wallet":
        return <p>Check your wallet balance and transactions here.</p>;
      default:
        return <p>Select a section from the left.</p>;
    }
  };

  return (
    <div className="min-h-screen p-36 bg-gray-100 flex">
      <div className="w-1/4 bg-gray-200 p-6">
        <div className="text-xl font-semibold text-gray-800 mb-6">
          {user ? user.phoneNumber : "Not Logged In"}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setSelectedSection("profileInfo")}
            className="w-full text-left p-3 bg-gray-300 rounded-md hover:bg-gray-400 transition"
          >
            Profile Info
          </button>
          <button
            onClick={() => setSelectedSection("manageAddress")}
            className="w-full text-left p-3 bg-gray-300 rounded-md hover:bg-gray-400 transition"
          >
            Manage Address
          </button>
          <button
            onClick={() => setSelectedSection("myOrders")}
            className="w-full text-left p-3 bg-gray-300 rounded-md hover:bg-gray-400 transition"
          >
            My Orders
          </button>

          <button
            onClick={() => setSelectedSection("managePatients")}
            className="w-full text-left p-3 bg-gray-300 rounded-md hover:bg-gray-400 transition"
          >
            Manage Patients
          </button>

          <button
            onClick={() => setSelectedSection("wallet")}
            className="w-full text-left p-3 bg-gray-300 rounded-md hover:bg-gray-400 transition"
          >
            Wallet
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left p-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-6">{renderContent()}</div>

      {/* Add ToastContainer at the bottom */}
      <ToastContainer />
    </div>
  );
};

export default Profile;
