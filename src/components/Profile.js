import Navbar from "./Navbar";
import { useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import NFTTile from "./NFTTile";
import { Menu, X } from "lucide-react";
import { auth, db } from "../firebase"; // Import Firebase Auth and Firestore
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage

export default function Profile() {
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState(false);
  const [address, updateAddress] = useState("0x");
  const [totalPrice, updateTotalPrice] = useState("0");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("This is my NFT collection!");
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [user, setUser] = useState(null); // Store Firebase user
  const [loading, setLoading] = useState(false); // For upload feedback

  // Initialize Firebase Storage
  const storage = getStorage();

  // Fetch NFTs
  async function getNFTData(tokenId) {
    const ethers = require("ethers");
    let sumPrice = 0;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    let contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );
    let transaction = await contract.getMyNFTs();

    const items = await Promise.all(
      transaction.map(async (i) => {
        const tokenURI = await contract.tokenURI(i.tokenId);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };
        sumPrice += Number(price);
        return item;
      })
    );

    updateData(items);
    updateFetched(true);
    updateAddress(addr);
    updateTotalPrice(sumPrice.toPrecision(3));
  }

  // Fetch user data from Firebase on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || "No email set");

        // Fetch profile data from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBio(userData.bio || "This is my NFT collection!");
          setProfilePic(userData.profilePic || null);
        }
      } else {
        setUser(null);
        setEmail("");
        setBio("This is my NFT collection!");
        setProfilePic(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load NFT data if not fetched
  const params = useParams();
  const tokenId = params.tokenId;
  if (!dataFetched) getNFTData(tokenId);

  // Handle profile picture upload
  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (file && user) {
      setLoading(true);
      try {
        // Upload to Firebase Storage
        const storageRef = ref(
          storage,
          `profile_pics/${user.uid}/${file.name}`
        );
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Update state and Firestore
        setProfilePic(downloadURL);
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { profilePic: downloadURL }, { merge: true });

        setLoading(false);
      } catch (error) {
        console.error("Error uploading profile pic:", error);
        setLoading(false);
      }
    }
  };

  // Save bio to Firestore
  const saveBio = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { bio }, { merge: true });
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving bio:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-white">
      <Navbar />

      {/* Sidebar Toggle Button */}
      <button
        className="fixed top-5 left-5 bg-gray-800 text-white p-3 rounded-full z-50 hover:bg-gray-700 transition"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="flex">
        {/* Sliding Sidebar */}
        <div
          className={`fixed top-0 left-0 w-64 bg-gray-800 min-h-screen shadow-lg p-6 transform transition-transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-64"
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">Profile Info</h2>

          {/* Profile Picture Upload */}
          <div className="mb-4 text-center">
            <label htmlFor="profile-pic">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-700 border border-gray-600 cursor-pointer">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-gray-400 flex items-center justify-center h-full">
                    {loading ? "Uploading..." : "Upload"}
                  </p>
                )}
              </div>
            </label>
            <input
              type="file"
              id="profile-pic"
              className="hidden"
              accept="image/*"
              onChange={handleProfilePicChange}
              disabled={loading || !user}
            />
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-300">Email</h3>
            <p className="text-blue-400">{email || "Not signed in"}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-300">
              Wallet Address
            </h3>
            <p className="text-blue-400 break-all">{address}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-300">Bio</h3>
            {isEditing ? (
              <textarea
                className="w-full bg-gray-700 p-2 rounded-md text-white"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            ) : (
              <p className="text-gray-400">{bio}</p>
            )}
            <button
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white px-4 py-1 rounded-md disabled:bg-gray-500"
              onClick={isEditing ? saveBio : () => setIsEditing(true)}
              disabled={!user}
            >
              {isEditing ? "Save" : "Edit Bio"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full p-6 ml-0 md:ml-64 transition-all m-10">
          {/* Total Value Display */}
          <div className="flex justify-end mt-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-xl shadow-xl text-center w-64">
              <h3 className="text-lg font-semibold text-gray-100">
                Total NFT Value
              </h3>
              <p className="text-white text-3xl font-bold">{totalPrice} ETH</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-indigo-600">
            Your NFTs
          </h2>

          {/* NFT Collection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {data.length > 0 ? (
              data.map((value, index) => <NFTTile data={value} key={index} />)
            ) : (
              <p className="text-gray-400 text-center mt-4">
                Oops, No NFT data to display (Are you logged in?)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
