// require("dotenv").config();
// const functions = require("firebase-functions/v1"); // Use v1 explicitly
// const admin = require("firebase-admin");
// const sgMail = require("@sendgrid/mail");

// admin.initializeApp();
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// console.log("SendGrid API Key:", process.env.SENDGRID_API_KEY);

// exports.sendPriceChangeEmail = functions.firestore
//   .document("nfts/{tokenId}")
//   .onUpdate(async (change, context) => {
//     const newData = change.after.data();
//     const oldData = change.before.data();

//     // Only proceed if price changed
//     if (newData.price === oldData.price) {
//       console.log(`No price change for NFT ${context.params.tokenId}`);
//       return null;
//     }

//     const tokenId = context.params.tokenId;
//     console.log(
//       `Price changed for NFT ${tokenId}: ${oldData.price} -> ${newData.price}`
//     );

//     // Get all watchlists
//     const watchlistSnapshot = await admin
//       .firestore()
//       .collection("watchlists")
//       .get();
//     const usersSnapshot = await admin.firestore().collection("users").get();

//     // Find users watching this tokenId
//     const watchers = watchlistSnapshot.docs
//       .filter(
//         (doc) => doc.data().tokenIds && doc.data().tokenIds.includes(tokenId)
//       )
//       .map((doc) => doc.id); // Get UIDs of watchers

//     if (watchers.length === 0) {
//       console.log(`No users watching NFT ${tokenId}`);
//       return null;
//     }

//     // Get emails for those users
//     const emails = usersSnapshot.docs
//       .filter((doc) => watchers.includes(doc.id))
//       .map((doc) => doc.data().email);

//     if (emails.length === 0) {
//       console.log(`No valid emails found for watchers of NFT ${tokenId}`);
//       return null;
//     }

//     // Prepare email
//     const msg = {
//       to: emails, // Array of recipient emails
//       from: "spkushal600@gmail.com", // Replace with your verified sender email
//       subject: `Price Update for NFT ${tokenId}`,
//       text: `The price of NFT ${tokenId} has changed from ${oldData.price} ETH to ${newData.price} ETH.`,
//       html: `<p>The price of NFT <strong>${tokenId}</strong> has changed from <strong>${oldData.price} ETH</strong> to <strong>${newData.price} ETH</strong>.</p>`,
//     };

//     try {
//       await sgMail.send(msg);
//       console.log(
//         `Email sent to ${emails.length} watchers: ${emails.join(", ")}`
//       );
//     } catch (error) {
//       console.error(
//         "Error sending email:",
//         error.response ? error.response.body : error
//       );
//     }
//   });

require("dotenv").config();
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const axios = require("axios"); // Add axios for metadata fetching

admin.initializeApp();

// Use environment variable from Firebase config
console.log("API kEY: ", process.env.SENDGRID_API_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendPriceChangeEmail = functions.firestore
  .document("nfts/{tokenId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    const tokenId = context.params.tokenId;

    // Log initial check
    console.log("Function triggered for NFT:", tokenId);
    console.log("Old Price:", oldData.price, "New Price:", newData.price);
    console.log("API Key set:", !!functions.config().sendgrid.key);

    // Only proceed if price changed
    if (newData.price === oldData.price) {
      console.log(`No price change for NFT ${tokenId}`);
      return null;
    }

    // Get all watchlists
    const watchlistSnapshot = await admin
      .firestore()
      .collection("watchlists")
      .get();
    const usersSnapshot = await admin.firestore().collection("users").get();

    // Find users watching this tokenId
    const watchers = watchlistSnapshot.docs
      .filter(
        (doc) => doc.data().tokenIds && doc.data().tokenIds.includes(tokenId)
      )
      .map((doc) => doc.id);

    console.log(`Watchers for NFT ${tokenId}:`, watchers);

    if (watchers.length === 0) {
      console.log(`No users watching NFT ${tokenId}`);
      return null;
    }

    // Get emails for those users
    const emails = usersSnapshot.docs
      .filter((doc) => watchers.includes(doc.id))
      .map((doc) => doc.data().email)
      .filter((email) => email); // Ensure no null/undefined emails

    console.log(`Emails found:`, emails);

    if (emails.length === 0) {
      console.log(`No valid emails found for watchers of NFT ${tokenId}`);
      return null;
    }

    // Fetch NFT metadata for better email content
    let nftName = `NFT ${tokenId}`;
    try {
      if (newData.metadataURL) {
        const metaResponse = await axios.get(newData.metadataURL);
        nftName = metaResponse.data.name || nftName;
      }
    } catch (error) {
      console.warn("Failed to fetch NFT metadata:", error.message);
    }

    // Prepare email
    const msg = {
      to: emails,
      from: "spkushal600@gmail.com", // Must be verified in SendGrid
      subject: `Price Update for ${nftName}`,
      text: `The price of ${nftName} (Token ID: ${tokenId}) has changed from ${oldData.price} ETH to ${newData.price} ETH.`,
      html: `
        <h2>Price Update</h2>
        <p>The price of <strong>${nftName}</strong> (Token ID: ${tokenId}) has changed from <strong>${oldData.price} ETH</strong> to <strong>${newData.price} ETH</strong>.</p>
        <p><a href="http://localhost:3000/nftPage/${tokenId}">View in Marketplace</a></p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(
        `Email sent to ${emails.length} watchers: ${emails.join(", ")}`
      );
    } catch (error) {
      console.error(
        "Error sending email:",
        error.response ? error.response.body : error.message
      );
      throw new functions.https.HttpsError("internal", "Failed to send email");
    }

    return null;
  });
