module.exports = async (req, res) => {
  try {
    // Safaricom sends JSON → make sure body is parsed
    const data =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    console.log("📩 Daraja Callback Received:", JSON.stringify(data, null, 2));

    if (!data?.Body?.stkCallback) {
      console.error("❌ Callback error: Missing stkCallback in response");
      return res.status(400).send("Missing stkCallback");
    }

    const callback = data.Body.stkCallback;
    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;
    const metadata = callback.CallbackMetadata || {};
    const items = metadata.Item || [];

    // Extract receipt number + amount + phone
    const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
    const amount = items.find((i) => i.Name === "Amount")?.Value;
    const phone = items.find((i) => i.Name === "PhoneNumber")?.Value;

    console.log("✅ Payment Result:");
    console.log("  Receipt:", receipt);
    console.log("  Amount:", amount);
    console.log("  Phone:", phone);
    console.log("  Code:", resultCode, "-", resultDesc);

    return res.status(200).json({ message: "Callback received" });
  } catch (error) {
    console.error("❌ Callback error:", error.message);
    return res.status(500).send("Server error in callback");
  }
};
