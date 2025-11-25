import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    genre: {
      type: String,
      enum: ["Fiction", "Non-fiction", "Sci-Fi", "Fantasy", "Romance", "Thriller", "Other"],
      default: "Other"
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      set: (value) => Math.ceil(value)
    },
  
    publishedYear: {
      type: Number
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0 // New Field: Tracks inventory
    }
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);
export default Book;
