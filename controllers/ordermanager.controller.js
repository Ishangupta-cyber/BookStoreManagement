import Book from "../models/book_model.js";
import order_model from "../models/order.model.js";








export async function placeOrder(req, res) {
  
  try {
    const userId = req.user._id; 

    if (req.user.role !== "customer") {
        return res.status(403).json({
            success: false,
            message: "Forbidden: Only customer accounts can place an order."
        });
    }
    
   
    let { items } = req.body; 
    const { bookId, quantity } = req.body; // For single purchase shortcut

    // If single purchase parameters are present, construct the items array
    if (bookId && quantity) {
        // Overwrite 'items' with a single-item array
        items = [{ bookId, quantity }];
    }

    if (!items || items.length === 0) {
      throw new Error("Order must contain at least one item.");
    }

    let totalAmount = 0;
    const finalItems = [];

    // 1. Validate Items and Check Stock
    for (const item of items) {
      const { bookId, quantity } = item;

      if (!bookId || !quantity || quantity < 1) {
        throw new Error("Invalid item or quantity.");
      }
      
      // Find book 
      const book = await Book.findById(bookId);

      if (!book) {
        throw new Error(`Book ID ${bookId} not found.`);
      }

      // Check Inventory
      if (book.stock < quantity) {
        throw new Error(`Insufficient stock for ${book.title}. Only ${book.stock} available.`);
      }

      // Add to final list and calculate total
      finalItems.push({
        bookId: book._id,
        quantity: quantity,
        priceAtPurchase: book.price // Freeze the price for order history
      });
      totalAmount += book.price * quantity;
      
      // 2. Deduct Inventory and save immediately 
      book.stock -= quantity;
      await book.save();
    }

    // 3. Create the Order Record 
    const newOrder = await order_model.create({
      userId,
      items: finalItems,
      totalAmount,
      status: "completed"
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully. Inventory updated.",
      order: newOrder
    });

  } catch (error) {
    // Standard error handling
    console.error("Order processing error:", error.message);
    res.status(400).json({ 
      success: false, 
      message: error.message || "Failed to process order due to an internal error." 
    });
  }
}





export async function getMyOrders(req, res) {
    try {
        const userId = req.user._id;
       
        const orders = await order_model.find({ userId: userId })
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('items.bookId', 'title genre'); // Populate book details for readability

        res.status(200).json({
            success: true,
            results: orders.length,
            data: orders
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to retrieve order history." 
        });
    }
}