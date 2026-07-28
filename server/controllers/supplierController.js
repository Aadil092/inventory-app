import City from "../models/City.js";
import State from "../models/State.js";
import Supplier from "../models/Supplier.js";


const addSupplier = async (req, res) => {
  try {
    const { name, email, number, address, stateId, cityId } = req.body;

    const existingSupplier = await Supplier.findOne({ name });
    if (existingSupplier) {
      return res.status(400).json({ success: false, message: "Supplier already exists" });
    }

    const newSupplier = new Supplier({
      name,
      email,
      number,
      address,
      stateId,
      cityId,
    });

    await newSupplier.save();

    return res.status(201).json({ success: true, message: "Supplier added Successfully" });
  } catch (error) {
    console.error("SUPPLIER_CONTROLLER_ERROR addSupplier:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error?.message });
  }
};

const getSupplier = async (req, res) => {
  try {
    const [states, cities, suppliers] = await Promise.all([
      State.find().sort({ stateName: 1 }),
      City.find().populate("stateId", "stateName").sort({ name: 1 }),
      Supplier.find()
        .populate("stateId", "stateName")
        .populate("cityId", "name")
        .sort({ name: 1 }),
    ]);

    return res.status(200).json({
      success: true,
      suppliers,
      states,
      cities,
    });
  } catch (error) {
    console.error("SUPPLIER_CONTROLLER_ERROR getSupplier:", error);
    return res.status(500).json({ success: false, message: "Server error in getting suppliers", error: error?.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, number, address, stateId, cityId } = req.body;

    const existingSupplier = await Supplier.findById(id);
    if (!existingSupplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    await Supplier.findByIdAndUpdate(
      id,
      { name, email, number, address, stateId, cityId },
      { returnDocument: "after" }
    );

    return res.status(200).json({ success: true, message: "Suppplier Updated Successfully" });
  } catch (error) {
    console.error("SUPPLIER_CONTROLLER_ERROR updateSupplier:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error?.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const existingSupplier = await Supplier.findById(id);
    if (!existingSupplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    await Supplier.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("SUPPLIER_CONTROLLER_ERROR deleteSupplier:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error?.message });
  }
};

export { addSupplier, getSupplier, updateSupplier, deleteSupplier };
