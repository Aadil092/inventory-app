import mongoose from "mongoose";

const orderSchema =  new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true},
    quantity : { type: Number , required: true},
    price : { type: Number , required: true},
    address : { type: String , required: true},
    paymentId: { type: String, enum: ["cash", "online"], required: true }

});


const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel; 