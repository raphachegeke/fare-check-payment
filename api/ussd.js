const axios = require("axios");

module.exports = async (req, res) => {
  try {
    // Log everything for debugging
    console.log("==== Incoming USSD Request ====");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    // Parse USSD input
    let text = "";
    let phoneNumber = "";
    let sessionId = "";
    let serviceCode = "";

    if (req.body) {
      text = req.body.text || "";
      phoneNumber = req.body.phoneNumber || "";
      sessionId = req.body.sessionId || "";
      serviceCode = req.body.serviceCode || "";
    }

    const parts = text ? text.split("*") : [];

    // Step 1: Start session
    if (parts.length === 0 || text === "") {
      return res
        .status(200)
        .send("CON Welcome to Matatu Pay\nEnter passenger phone number:");
    }

    // Step 2: Passenger phone entered
    if (parts.length === 1) {
      const passengerPhone = parts[0];
      return res
        .status(200)
        .send(`CON Passenger: ${passengerPhone}\nEnter fare amount (KES):`);
    }

    // Step 3: Amount entered -> trigger STK Push
    if (parts.length >= 2) {
      const passengerPhone = parts[0];
      const amount = parts[1];

      console.log(
        `Triggering STK Push: Passenger=${passengerPhone}, Amount=${amount}`
      );

      // Trigger Daraja STK Push in background
      axios
        .post("https://fare-check.vercel.app/stkpush", {
          phoneNumber: passengerPhone,
          amount: amount,
        })
        .then((r) =>
          console.log("✅ STK Push triggered:", JSON.stringify(r.data, null, 2))
        )
        .catch((err) =>
          console.error(
            "❌ STK Push error:",
            err.response?.data || err.message
          )
        );

      return res
        .status(200)
        .send("END Payment request sent to passenger. Await confirmation.");
    }
  } catch (error) {
    console.error("🔥 USSD error:", error);
    return res.status(200).send("END Server error. Try again later.");
  }
};
