import Setting from "../models/Setting.js";

const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const addSetting = async (req, res) => {
  try {
    const { settingKey, settingValue, settingType, description, status } = req.body;

    const existing = await Setting.findOne({ settingKey });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Setting with this key already exists",
      });
    }

    const newSetting = new Setting({
      settingKey,
      settingValue,
      settingType: settingType || "text",
      description: description || "",
      status: status || "active",
    });

    await newSetting.save();
    return res.status(201).json({
      success: true,
      message: "Setting created successfully",
      setting: newSetting,
    });
  } catch (error) {
    console.error("Error adding setting:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { settingKey, settingValue, settingType, description, status } = req.body;

    const updated = await Setting.findByIdAndUpdate(
      id,
      { settingKey, settingValue, settingType, description, status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Setting not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      setting: updated,
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Setting.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Setting not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Setting deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting setting:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { getSettings, addSetting, updateSetting, deleteSetting };
