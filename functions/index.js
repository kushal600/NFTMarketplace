const functions = require("firebase-functions/v1"); // Use v1 explicitly
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
sgMail.setApiKey(
  "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"
); // Replace with your API key

exports.sendPriceChangeEmail = functions.firestore
  .document("nfts/{tokenId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Only proceed if price changed
    if (newData.price === oldData.price) {
      console.log(`No price change for NFT ${context.params.tokenId}`);
      return null;
    }

    const tokenId = context.params.tokenId;
    console.log(
      `Price changed for NFT ${tokenId}: ${oldData.price} -> ${newData.price}`
    );

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
      .map((doc) => doc.id); // Get UIDs of watchers

    if (watchers.length === 0) {
      console.log(`No users watching NFT ${tokenId}`);
      return null;
    }

    // Get emails for those users
    const emails = usersSnapshot.docs
      .filter((doc) => watchers.includes(doc.id))
      .map((doc) => doc.data().email);

    if (emails.length === 0) {
      console.log(`No valid emails found for watchers of NFT ${tokenId}`);
      return null;
    }

    // Prepare email
    const msg = {
      to: emails, // Array of recipient emails
      from: "spkushal600@gmail.com", // Replace with your verified sender email
      subject: `Price Update for NFT ${tokenId}`,
      text: `The price of NFT ${tokenId} has changed from ${oldData.price} ETH to ${newData.price} ETH.`,
      html: `<p>The price of NFT <strong>${tokenId}</strong> has changed from <strong>${oldData.price} ETH</strong> to <strong>${newData.price} ETH</strong>.</p>`,
    };

    try {
      await sgMail.send(msg);
      console.log(
        `Email sent to ${emails.length} watchers: ${emails.join(", ")}`
      );
    } catch (error) {
      console.error(
        "Error sending email:",
        error.response ? error.response.body : error
      );
    }
  });
