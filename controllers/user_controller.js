
import User from "../models/user_model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export async function SignUpUser(req,res){
  try{
    const data=req.body

    if(!data?.name?.trim() || !data?.password?.trim() || !data?.email?.trim()  || !data?.role?.trim()){
      return res.status(400).json({
        success: false,
        message:"All fields are required"
      })
    }

    const salt =await bcrypt.genSalt(10)
    const hashedPassword=await bcrypt.hash(data.password.trim(), salt)

    const createdUser=await User.create({
      name:data.name.trim(),
      email:data.email.trim(),
      password:hashedPassword,
      role:data.role.trim()
    })

    const token =jwt.sign({id:createdUser._id},process.env.Secret)


    res.cookie("token",token).json({
      success:true,
      data:createdUser,
      token:token
    })
  }

  catch(err){
    res.status(500).json({
      success:false,
      message:err.message|| "Something Went Wrong"
    })

  }
}


export async function LoginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    // Find user by Email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Compare password
    const isTrue = await bcrypt.compare(password, user.password);
    if (!isTrue) {
      return res.status(401).json({
        status: false,
        message: "Incorrect password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.Secret);

    
    return res.cookie("token",token).status(200).json({
      status: true,
      token:token,
      message: "Login successful",
    });

  } 
  catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
}


export async function getAllUsers(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ 
                success: false, 
                message: "Forbidden: Only admins can view all users." 
            });
        }

        // Fetch all users, but exclude the password field
        const users = await User.find().select('-password'); 

        res.status(200).json({
            success: true,
            results: users.length,
            data: users,
        });

    } catch (err) {
        console.error("Error fetching all users:", err.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}



export async function getUserById(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ 
                success: false, 
                message: "Forbidden: Only admins can view user details." 
            });
        }

        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, data: user });

    } catch (err) {
        console.error("Error fetching user by ID:", err.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}




export async function updateUserRole(req, res) {
    try {
        const { newRole } = req.body;
        const userId = req.params.id;

        // 1. Role Check
        if (req.user.role !== "admin") {
            return res.status(403).json({ 
                success: false, 
                message: "Forbidden: Only admins can change user roles." 
            });
        }

        // 2. Validation
        if (!newRole || !["author", "admin", "customer"].includes(newRole)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid role provided. Must be author, admin, or customer." 
            });
        }

        // 3. Prevent admin from demoting themselves (a safety measure)
        if (req.user._id.toString() === userId) {
             return res.status(400).json({ 
                success: false, 
                message: "You cannot change your own role via this endpoint." 
            });
        }

        // 4. Update the user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role: newRole },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({
            success: true,
            message: `User role updated to ${newRole}.`,
            data: updatedUser
        });

    } catch (err) {
        console.error("Error updating user role:", err.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}



export async function deleteUser(req, res) {
    try {
        const userId = req.params.id;

        // 1. Role Check
        if (req.user.role !== "admin") {
            return res.status(403).json({ 
                success: false, 
                message: "Forbidden: Only admins can delete users." 
            });
        }

        // 2. Prevent admin from deleting themselves
        if (req.user._id.toString() === userId) {
             return res.status(400).json({ 
                success: false, 
                message: "You cannot delete your own account via this endpoint." 
            });
        }

        // 3. Delete the user
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully."
        });

    } catch (err) {
        console.error("Error deleting user:", err.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}