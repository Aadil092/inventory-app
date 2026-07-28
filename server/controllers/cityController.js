import City from "../models/City.js";

const addCity = async (req, res) => {
  try {
    const { name, stateId } = req.body;

    if (!stateId) {
      return res.status(400).json({
        success: false,
        message: "State is required",
      });
    }

    const existingCity = await City.findOne({
      name: name.trim(),
      stateId,
    });

    if (existingCity) {
      return res.status(400).json({
        success: false,
        message: "City already exists in this state",
      });
    }

    const newCity = new City({
      name: name.trim(),
      stateId,
    });

    await newCity.save();

    return res.status(201).json({
      success: true,
      message: "City added successfully",
      city: newCity,
    });
  } catch (error) {
    console.error("Error adding city:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getCities = async (req, res) => {
  try {
    const cities = await City.find()
      .populate("stateId", "name")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      cities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getCitiesByState = async (req, res) => {
  try {
    const { stateId } = req.params;

    const cities = await City.find({ stateId }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      cities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export { addCity, getCities, getCitiesByState };