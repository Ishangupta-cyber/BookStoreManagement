import express from "express";
import { 
    SignUpUser, 
    LoginUser,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser
} from "../controllers/user_controller.js";
import { authorizer } from "../middleware/authorication.js";


const router = express.Router();


router.post("/signup", SignUpUser);
router.post("/login", LoginUser);


// Get all users in the system (for Admin dashboard)
router.get("/users", authorizer, getAllUsers);

// Get a specific user by ID
router.get("/users/:id", authorizer, getUserById);

// Update a user's role (promote/demote)
router.patch("/users/:id/role", authorizer, updateUserRole);

// Delete a user account
router.delete("/users/:id", authorizer, deleteUser);

export default router;