const axios = require("axios");
const querystring = require("querystring");

module.exports = async (req, res) => {
  try {
    // AT sends as x-www-form-urlencoded
    const body =
      typeof req.body === "string"
        ? querystring.parse(req.body)
        : req.body;

    const { text, phoneNumber } = body || {};
    const parts = text ? text.split("*") : [];

    if (!text || text === "") {
      // Step 1: Start session
      return res
        .status(200)
        .send("CON Welcome to Matatu Pay\nEnter passenger phone number:");
    }

    if (parts.length === 1) {
      // Step 2: Passenger phone entered
      return res
        .status(200)
        .send(`CON Passenger: ${parts[0]}\nEnter fare amount (KES):`);
    }

    if (parts.length >= 2) {
      // Step 3: Amount entered -> trigger STK push
      const passengerPhone = parts[0];
      const amount = parts[1];

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
    console.error("USSD error:", err);
    return res.status(200).send("END Server error. Try again later.");
  }
};
