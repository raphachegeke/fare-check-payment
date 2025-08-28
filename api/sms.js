import africastalking from "africastalking";

const africastalkingClient = africastalking({
  apiKey: process.env.AT_API_KEY,     
  username: process.env.AT_USERNAME,  // "sandbox" or your production username
});

const sms = africastalkingClient.SMS;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: "Missing 'to' or 'message'" });
    }

    // ✅ Force one-way mode: use alphanumeric Sender ID if available
    //    fallback to "FareCheck" if none is set
    const senderId = process.env.AT_SENDER_ID || "FareCheck";

    const options = {
      to: Array.isArray(to) ? to : [to],
      message,
      from: senderId
    };

    const response = await sms.send(options);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("SMS error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
