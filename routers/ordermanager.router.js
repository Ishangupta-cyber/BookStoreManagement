import express from "express";
import { authorizer } from "../middleware/authorication.js";
import { getMyOrders, placeOrder } from "../controllers/order_controller.js"



const router = express.Router();


router.use(authorizer);


router.post("/place", placeOrder);


router.get("/history", getMyOrders);

export default router;