// ussd.js
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
// AT sends application/x-www-form-urlencoded by default
app.use(bodyParser.urlencoded({ extended: false }));

// Utility: clean phone to MSISDN format (very light for now)
function normalizeMsisdn(input) {
  let msisdn = input.replace(/\s+/g, "");
  if (msisdn.startsWith("0")) msisdn = "+254" + msisdn.slice(1);
  if (msisdn.startsWith("254")) msisdn = "+" + msisdn;
  return msisdn;
}

app.post("/ussd", (req, res) => {
  const { sessionId, phoneNumber, serviceCode, text } = req.body;

  // Split user inputs by "*"
  const parts = text ? text.split("*") : [];

  if (parts.length === 0 || text === "") {
    // First screen
    return res.send("CON Welcome to Matatu Pay\nEnter passenger phone number:");
  }

  if (parts.length === 1) {
    // Got phone, ask amount
    const passengerPhone = normalizeMsisdn(parts[0]);
    return res.send(
      `CON Passenger: ${passengerPhone}\nEnter fare amount (KES):`
    );
  }

  if (parts.length >= 2) {
    const passengerPhone = normalizeMsisdn(parts[0]);
    const amount = parts[1];

    // TODO (Step 2): trigger Daraja STK push here.
    // You will pass { passengerPhone, amount } to your STK function.

    // Finish the USSD session for now
    return res.send("END Payment request sent to passenger.");
  }
});

// Start server (use your preferred port)
app.listen(3000, () => console.log("USSD server running on :3000"));
