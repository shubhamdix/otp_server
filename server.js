


// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sgMail = require("@sendgrid/mail");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === 🔐 CONFIG ===
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Replace this

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
  process.env.TWILIO_NUMBER
);

// Example usage
twilioClient.messages
  .create({
    body: 'Hello from your secure backend!',
    from: '+1 941 390 3848', // your Twilio number
    to: '+919604924575'     // recipient
  })
  .then(message => console.log(message.sid))
  .catch(err => console.error(err));



//const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);             
const TWILIO_NUMBER = "+1 941 390 3848"; // Replace this

//sgMail.setApiKey(SENDGRID_API_KEY);
//const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH);

const SOUTH_STATES = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'];

// === ✉️ Send Email ===
async function sendOtpEmail(email, otp) {
  const msg = {
    to: email,
    from: "shubhamdixit27198@gmail.com", // Replace with your SendGrid verified sender
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
  };
  await sgMail.send(msg);
}

// === 📱 Send SMS ===
async function sendOtpSMS(phone, otp) {
  await twilioClient.messages.create({
    body: `Your OTP is: ${otp}`,
    from: TWILIO_NUMBER,
    to: phone,
  });
}

// === 🎯 Route ===
app.post("/send-otp", async (req, res) => {
  const { region, email, phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const isSouth = SOUTH_STATES.includes(region);

  console.log("Incoming Request:", { region, email, phone });

  // ✅ Basic Validation
  if (isSouth && !email) return res.status(400).json({ error: "Email is required for South Indian states" });
  if (!isSouth && !phone) return res.status(400).json({ error: "Phone number is required for other states" });

  try {
    if (isSouth) {
      console.log(`Sending OTP to EMAIL: ${email} | OTP: ${otp}`);
      await sendOtpEmail(email, otp);
    } else {
      console.log(`Sending OTP to PHONE: ${phone} | OTP: ${otp}`);
      await sendOtpSMS(phone, otp);
    }

    res.json({ message: "OTP sent successfully", otp }); // Return OTP for testing only
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP", details: err.message });
  }
});

// === 🔥 Start Server ===
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});