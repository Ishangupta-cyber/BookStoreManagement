// models/order_model.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
      quantity: { type: Number, required: true, min: 1 },
      priceAtPurchase: { type: Number, required: true } // Capture price at moment of sale
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

const order_model= mongoose.model("Order", orderSchema);
export default order_model;