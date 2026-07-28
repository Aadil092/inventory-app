import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: String, required: true },
    address: { type: String, required: true },

    // references for dropdowns
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const SupplierModel = mongoose.model("Supplier", supplierSchema);

export default SupplierModel;

