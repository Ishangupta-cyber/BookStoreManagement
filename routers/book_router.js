import express from "express";
import { 
    createBook, 
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook
} from "../controllers/book_controller.js";
import { authorizer } from "../middleware/authorication.js";


const router = express.Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);

// Private routes requiring authentication (Authorizer middleware)
router.post("/create", authorizer, createBook); // Only Authors/Admins can create
router.patch("/:id", authorizer, updateBook);  // Only Author/Admin can update their own/any book
router.delete("/:id", authorizer, deleteBook); // Only Author/Admin can delete their own/any book

export default router;