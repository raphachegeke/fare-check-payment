module.exports = async (req, res) => {
  try {
    const callbackData = req.body;

    console.log("📩 Daraja Callback Received:", JSON.stringify(callbackData));

    if (callbackData.Body?.stkCallback) {
      const stk = callbackData.Body.stkCallback;

      const resultCode = stk.ResultCode;
      const resultDesc = stk.ResultDesc;
      const merchantRequestID = stk.MerchantRequestID;
      const checkoutRequestID = stk.CheckoutRequestID;

      let receipt = null;
      let amount = null;
      let phone = null;

      if (stk.CallbackMetadata && stk.CallbackMetadata.Item) {
        stk.CallbackMetadata.Item.forEach((item) => {
          if (item.Name === "MpesaReceiptNumber") receipt = item.Value;
          if (item.Name === "Amount") amount = item.Value;
          if (item.Name === "PhoneNumber") phone = item.Value;
        });
      }

      console.log("✅ Parsed Payment:", {
        resultCode,
        resultDesc,
        merchantRequestID,
        checkoutRequestID,
        receipt,
        amount,
        phone,
      });
    }

    // Acknowledge to Safaricom
    res.status(200).json({ message: "Callback received successfully" });
  } catch (error) {
    console.error("❌ Callback error:", error.message);
    res.status(500).json({ error: "Failed to process callback" });
  }
};
