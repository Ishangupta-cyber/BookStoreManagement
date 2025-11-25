import Book from "../models/book_model.js";


export async function createBook(req, res) {
  try {
    // req.user is populated by the authorizer middleware
    const user = req.user;
    const data = req.body;

    // 1. Basic validation and role check
    if (user.role !== "author" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only authors and admins can create books.",
      });
    }

    // 2. Mandatory field check
    if (!data.title?.trim() || !data.price || !data.stock) {
      return res.status(400).json({
        success: false,
        message: "Title, Price, and Stock are required fields.",
      });
    }

    // 3. Prevent duplicate book titles
    const existingBook = await Book.findOne({ title: data.title.trim() });
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: "A book with this title already exists.",
      });
    }

    // 4. Create the new book
    const newBook = await Book.create({
      title: data.title.trim(),
      description: data.description?.trim(),
      genre: data.genre || "Other",
      price: data.price,
      stock: data.stock,
      publishedYear: data.publishedYear,
      rating: data.rating,
      isArchived: data.isArchived,
      createdBy: user._id, // Link the book to the currently logged-in user
    });

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: newBook,
    });
  } catch (err) {
    console.error("Error creating book:", err.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong while creating the book.",
      error: err.message,
    });
  }
}

export async function getAllBooks(req, res) {
  try {
    // 1. Destructure and set defaults for query parameters
    const {
      genre,
      minPrice,
      maxPrice,
      sortBy = "createdAt", // Default sort by creation time
      order = "desc", // Default order (newest first)
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    const sort = {};
    const sortOrder = order === "desc" ? -1 : 1;

    // 2. Build the Filter Object
    if (genre) {
      filter.genre = genre;
    }

    // Price Range Filter: Allows filtering by price[gte] and price[lte]
    const priceFilter = {};
    if (minPrice !== undefined) priceFilter.$gte = Number(minPrice);
    if (maxPrice !== undefined) priceFilter.$lte = Number(maxPrice);
    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }

    // 3. Build the Sort Object
    if (sortBy === "price") {
      sort.price = sortOrder;
    } else if (sortBy === "rating") {
      sort.rating = sortOrder;
    } else if (sortBy === "createdAt") {
      sort.createdAt = sortOrder;
    } else {
      sort.createdAt = -1;
    }

    // 4. Pagination Setup
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // 5. Execute Query
    const booksQuery = Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate("createdBy", "name email"); // Populate author for richer results

    const [books, totalBooks] = await Promise.all([
      booksQuery.exec(),
      Book.countDocuments(filter), // Get total count for pagination metadata
    ]);

    // 6. Send Response
    res.status(200).json({
      success: true,
      results: books.length,
      page: pageNum,
      limit: limitNum,
      total: totalBooks,
      data: books,
    });
  } catch (err) {
    console.error("Error fetching books:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error during book retrieval.",
      error: err.message,
    });
  }
}

export async function getBookById(req, res) {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId).populate(
      "createdBy",
      "name email"
    ); // Populate author name/email

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }

    res.status(200).json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateBook(req, res) {
  try {
    const bookId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;
    const updates = req.body;

    // 1. Find the book
    const book = await Book.findById(bookId);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }

    // 2. Authorization Check: Must be the book's creator OR an admin
    const isOwner = book.createdBy.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only update books you created.",
      });
    }

    // 3. Update fields (avoid updating createdBy)
    Object.keys(updates).forEach((key) => {
      if (key !== "createdBy" && updates[key] !== undefined) {
        book[key] = updates[key];
      }
    });

    await book.save();

    res.status(200).json({
      success: true,
      message: "Book updated successfully.",
      data: book,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteBook(req, res) {
  try {
    const bookId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;

    // 1. Find the book
    const book = await Book.findById(bookId);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }

    // 2. Authorization Check: Must be the book's creator OR an admin
    const isOwner = book.createdBy.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only delete books you created.",
      });
    }

    // 3. Delete the book
    await Book.deleteOne({ _id: bookId });

    res.status(200).json({
      success: true,
      message: "Book deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
