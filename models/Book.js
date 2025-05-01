import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    mainCategory: {
      type: String,
      required: true,
      enum: ["English", "Arabic", "Kids"],
    },
    subCategory: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
    ISBN: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    qty: { type: Number, required: true, min: 0 },
    favorites: { type: Number, default: 0, min: 0 },
    soldTimes: { type: Number, default: 0, min: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rate: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    rate: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

bookSchema.index({ title: "text", description: "text" });
export default mongoose.model("Book", bookSchema);
