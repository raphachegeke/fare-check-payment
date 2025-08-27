module.exports = async (req, res) => {
  try {
    console.log("📩 Daraja Callback Received:", JSON.stringify(req.body, null, 2));

    const body = req.body?.Body;

    if (!body || !body.stkCallback) {
      console.error("❌ Invalid callback body");
      return res.status(400).send("Bad Request");
    }

    const stkCallback = body.stkCallback;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;
    const merchantRequestID = stkCallback.MerchantRequestID;
    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const timestamp = new Date().toISOString();

    if (resultCode === 0) {
      console.log(`✅ Payment SUCCESS for ${checkoutRequestID} at ${timestamp}`);
    } else {
      console.log(`❌ Payment FAILED for ${checkoutRequestID}: ${resultDesc}`);
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("❌ Callback error:", error.message);
    return res.status(500).send("Internal Server Error");
  }
};
