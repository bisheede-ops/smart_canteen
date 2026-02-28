const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create PaymentIntent (UPI sandbox)
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body; // amount in paise

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      payment_method_types: ["card"],
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Stripe backend running");
});

const PORT = 3000;
app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
