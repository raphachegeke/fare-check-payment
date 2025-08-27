const axios = require("axios");

const BUSINESS_SHORTCODE = process.env.DARAJA_SHORTCODE || "174379"; // Sandbox default
const PASSKEY = process.env.DARAJA_PASSKEY;
const CONSUMER_KEY = process.env.DARAJA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET;
const CALLBACK_URL = "https://fare-check.vercel.app/api/daraja-callback";

// 🧠 Get Access Token
async function getAccessToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
}

// 🔑 Generate STK Password
function generatePassword() {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  const password = Buffer.from(BUSINESS_SHORTCODE + PASSKEY + timestamp).toString("base64");
  return { password, timestamp };
}

module.exports = async (req, res) => {
  try {
    const { phoneNumber, amount } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({ error: "phoneNumber and amount are required" });
    }

    // 1. Get access token
    const token = await getAccessToken();

    // 2. Generate password & timestamp
    const { password, timestamp } = generatePassword();

    // 3. Trigger STK Push
    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: BUSINESS_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: CALLBACK_URL,
        AccountReference: "Matatu Fare",
        TransactionDesc: "Fare payment",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.status(200).json(stkResponse.data);
  } catch (err) {
    console.error("❌ STK Push error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to initiate STK push" });
  }
};
