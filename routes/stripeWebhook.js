import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";

const stripeWebhook = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

stripeWebhook.post("/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(" Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    try {
      const order = await Order.findById(orderId).populate("books.book");
      if (!order) {
        console.log("Order not found:", orderId);
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        await order.save();

        for (const item of order.books) {
          const book = item.book;
          const qtyPurchased = item.qty;
          book.qty -= qtyPurchased;
          book.soldTimes += qtyPurchased;
          await book.save();
        }
      }
    } catch (error) {
      return res.status(500).send("Failed to update order or books");
    }
  }

  res.status(200).json({ received: true });
});

export default stripeWebhook;
