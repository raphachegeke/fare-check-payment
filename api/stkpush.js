// api/stkpush.js
const axios = require("axios");

// 🧠 Get Access Token
async function getAccessToken(consumerKey, consumerSecret) {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error.response?.data || error.message);
    throw new Error("Failed to get access token");
  }
}

// 🔑 Generate STK Password
function generatePassword(shortcode, passkey) {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  return {
    password: Buffer.from(shortcode + passkey + timestamp).toString("base64"),
    timestamp,
  };
}

module.exports = async (req, res) => {
  try {
    const { phoneNumber, amount } = req.body;

    // ====== CONFIG ======
    const shortcode = process.env.DARAJA_SHORTCODE || "174379"; // sandbox default
    const passkey = process.env.DARAJA_PASSKEY;
    const consumerKey = process.env.DARAJA_CONSUMER_KEY;
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
    const callbackUrl = "https://fare-check.vercel.app/api/daraja-callback";

    // 1. Get access token
    const accessToken = await getAccessToken(consumerKey, consumerSecret);

    // 2. Generate password + timestamp
    const { password, timestamp } = generatePassword(shortcode, passkey);

    // 3. Trigger STK Push
    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: "Matatu Fare",
        TransactionDesc: "Fare payment",
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return res.status(200).json(stkResponse.data);
  } catch (err) {
    console.error("STK Push error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to initiate STK push" });
  }
};
