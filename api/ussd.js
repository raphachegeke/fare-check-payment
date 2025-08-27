const axios = require("axios");
const querystring = require("querystring");

module.exports = async (req, res) => {
  try {
    // Log raw body + headers
    console.log("==== Incoming USSD Request ====");
    console.log("Headers:", req.headers);
    console.log("Raw body:", req.body);

    // Parse body (AT sends x-www-form-urlencoded)
    const body =
      typeof req.body === "string"
        ? querystring.parse(req.body)
        : req.body;

    console.log("Parsed body:", body);

    const { text, phoneNumber, sessionId, serviceCode } = body || {};
    const parts = text ? text.split("*") : [];

    if (!text || text === "") {
      console.log("Step 1: New session");
      return res
        .status(200)
        .send("CON Welcome to Matatu Pay\nEnter passenger phone number:");
    }

    if (parts.length === 1) {
      console.log("Step 2: Passenger phone entered ->", parts[0]);
      return res
        .status(200)
        .send(`CON Passenger: ${parts[0]}\nEnter fare amount (KES):`);
    }

    if (parts.length >= 2) {
      console.log("Step 3: Amount entered ->", parts[1]);

      const passengerPhone = parts[0];
      const amount = parts[1];

      // Trigger Daraja STK push in background
      axios
        .post("https://fare-check.vercel.app/stkpush", {
          phoneNumber: passengerPhone,
          amount: amount,
        })
        .then((r) =>
          console.log("STK Push triggered:", JSON.stringify(r.data, null, 2))
        )
        .catch((err) =>
          console.error("STK Push error:", err.response?.data || err.message)
        );

      return res
        .status(200)
        .send("END Payment request sent to passenger. Await confirmation.");
    }
  } catch (err) {
    console.error("🔥 USSD function error:", err);
    return res.status(200).send("END Server error. Try again later.");
  }
};
