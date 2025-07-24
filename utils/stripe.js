// utils/stripe.js
require("dotenv").config(); // optional if already loaded in app.js
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15", // or the latest
});

module.exports = stripe;
