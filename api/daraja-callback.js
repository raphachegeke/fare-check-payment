module.exports = async (req, res) => {
  try {
    const body = req.body;
    console.log("Daraja callback:", JSON.stringify(body, null, 2));

    // TODO: Save transaction status in database (for receipt validation)

    res.status(200).json({ message: "Callback received successfully" });
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).json({ error: "Callback handler failed" });
  }
};
