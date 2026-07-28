import { authorizeRoles } from "../middleware/authMiddleware";
import User from './models/User.js';
import express from 'express';
import bcrypt from 'bcrypt';



const router = express.Router();

router.post("/create-admin", authorizeRoles("superadmin"), async (req, res) => {
  try {
    const {email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      email,
      password: hashPassword,
      role: "admin"
    });

    await admin.save();
    res.json({ success: true, admin});
} catch (error) {
    res.status(500).json({ error: "Failed to create admin"});
}
  });

  export default router;