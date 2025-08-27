const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const { text, phoneNumber, sessionId, serviceCode } = req.body || {};
    const parts = text ? text.split("*") : [];

    if (parts.length === 0 || text === "") {
      // Step 1: Conductor starts session
      return res
        .status(200)
        .send("CON Welcome to Matatu Pay\nEnter passenger phone number:");
    }

    if (parts.length === 1) {
      // Step 2: Enter passenger phone
      const passengerPhone = parts[0];
      return res
        .status(200)
        .send(`CON Passenger: ${passengerPhone}\nEnter fare amount (KES):`);
    }

    if (parts.length >= 2) {
      // Step 3: Enter amount -> trigger STK push
      const passengerPhone = parts[0];
      const amount = parts[1];

      // Fire Daraja STK push in background
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

      // Respond immediately to USSD
      return res
        .status(200)
        .send("END Payment request sent to passenger. Await confirmation.");
    }
  } catch (error) {
    console.error("USSD error:", error);
    return res.status(500).send("END Server error. Try again later.");
  }
};
