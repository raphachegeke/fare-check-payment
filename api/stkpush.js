const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const { phoneNumber, amount } = req.body;

    // === ENV CONFIG ===
    const shortcode = process.env.DARAJA_SHORTCODE || "174379"; // sandbox PayBill
    const passkey = process.env.DARAJA_PASSKEY;
    const consumerKey = process.env.DARAJA_CONSUMER_KEY;
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
    const callbackUrl = "https://fare-check.vercel.app/daraja-callback";

    if (!phoneNumber || !amount) {
      return res.status(400).json({ error: "Phone number and amount required" });
    }

    // 1️⃣ Get access token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const accessToken = tokenResponse.data.access_token;

    // 2️⃣ Generate password
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    // 3️⃣ Trigger STK Push
    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Number(amount),
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: "Matatu Fare",
        TransactionDesc: "Matatu fare collection",
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log("✅ STK Push Response:", stkResponse.data);
    return res.status(200).json(stkResponse.data);
  } catch (err) {
    console.error("❌ STK Push error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Failed to initiate STK push",
      details: err.response?.data || err.message,
    });
  }
};
