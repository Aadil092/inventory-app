import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getSettings,
  addSetting,
  updateSetting,
  deleteSetting,
} from "../controllers/settingController.js";

const router = express.Router();

router.get("/", authMiddleware, getSettings);
router.post("/add", authMiddleware, addSetting);
router.put("/:id", authMiddleware, updateSetting);
router.delete("/:id", authMiddleware, deleteSetting);

export default router;
