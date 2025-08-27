const axios = require("axios");

module.exports = async (req, res) => {
  try {
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

    if (parts.length === 0 || text === "") {
      return res
        .status(200)
        .send("CON Welcome to Matatu Pay\nEnter passenger phone number:");
    }

    if (parts.length === 1) {
      const passengerPhone = parts[0];
      return res
        .status(200)
        .send(`CON Passenger: ${passengerPhone}\nEnter fare amount (KES):`);
    }

    if (parts.length >= 2) {
      const passengerPhone = parts[0];
      const amount = parts[1];

      // 🔗 Trigger Daraja STK Push by calling your stkpush API
      try {
        await axios.post(
          `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/api/stkpush`,
          {
            phoneNumber: passengerPhone,
            amount: amount,
          }
        );

        return res
          .status(200)
          .send("END Payment request sent to passenger. Await confirmation.");
      } catch (err) {
        console.error("❌ Error calling stkpush:", err.message);
        return res.status(200).send("END Failed to initiate payment. Try again.");
      }
    }
  } catch (error) {
    console.error("USSD error:", error);
    return res.status(500).send("END Server error. Try again later.");
  }
};
