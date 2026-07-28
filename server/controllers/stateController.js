import State from "../models/State.js";

const addState = async (req, res) => {
  try {
    const { stateName } = req.body;

    if (!stateName || stateName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "State name is required",
      });
    }

    const existingState = await State.findOne({
      stateName: stateName.trim(),
    });

    if (existingState) {
      return res.status(400).json({
        success: false,
        message: "State already exists",
      });
    }

    const newState = new State({
      stateName: stateName.trim(),
    });

    await newState.save();

    return res.status(201).json({
      success: true,
      message: "State added successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getStates = async (req, res) => {
  try {
    const states = await State.find().sort({ stateName: 1 });

    return res.status(200).json({
      success: true,
      states,
    });
  } catch (error) {
    console.error("Error fetching states:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export { addState, getStates };