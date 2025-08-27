// api/ussd.js

module.exports = async (req, res) => {
  try {
    // Parse form data (Vercel parses JSON automatically, not urlencoded)
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
      return res.status(200).send("CON Welcome to Matatu Pay\nEnter passenger phone number:");
    }

    if (parts.length === 1) {
      const passengerPhone = parts[0];
      return res.status(200).send(`CON Passenger: ${passengerPhone}\nEnter fare amount (KES):`);
    }

    if (parts.length >= 2) {
      const passengerPhone = parts[0];
      const amount = parts[1];
      // TODO: trigger Daraja STK Push here later
      return res.status(200).send("END Payment request sent to passenger.");
    }
  } catch (error) {
    console.error("USSD error:", error);
    return res.status(500).send("END Server error. Try again later.");
  }
};
