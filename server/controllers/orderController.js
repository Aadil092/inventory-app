import Order from "../models/Order.js";
import Product from "../models/Product.js";



const addOrder = async (req, res) => {
  try {
    const {  productId, quantity, price, address, paymentId } = req.body;
    const product = await Product.findById({_id: productId});
    if(!product) {
      return res.status(404).json({error: "product not found in order"});
    }

    const newOrder = new Order({
      customerId: req.user.id,

      productId,
      quantity,
      price,
      address,
      paymentId,
    });

    const savedOrder = await newOrder.save();

    console.log('Order saved customerId:', savedOrder.customerId?.toString());
    console.log('Order saved _id:', savedOrder._id?.toString());

    await Product.findByIdAndUpdate(
        productId,
        { $inc: { stock: -quantity }},
        { returnDocument : 'after'}
    )

    return res.status(201).json({ success: true, message: "Order added successfully" });
  } catch (error) {
    // console.error("Error adding order:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ customerId: userId })
      .populate("productId")
      .populate("paymentId")
      .populate("customerId", "name")
      .sort({ createdAt: -1 });


    if (orders.length === 0) {
      return res.status(404).json({ success: false,  message: "No orders found" });
    }

    return res.status(200).json({ success: true, count: orders.length, data: orders, orders });

  } catch (error) {
    console.error("Error getting orders:", error);
    return res.status(500).json({ success: false, message: "Server Error"});
  }
};

const getOrderByUser = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const orders = await Order.find()
      .populate("customerId", "name email phone")
      .populate("productId", "name price")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const existingOrder = await Order.findById(id);
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: 'Order not found'});
          } 
          await Order.findByIdAndDelete(id);
          return res.status(200).json({ success: true, message: 'Order deleted successfully'});
    } catch (error) {
        console.error('Error deleting order:', error);
        return res.status(500).json({ success: false, message:'Server error'});
    }
}

export {addOrder, getOrder, deleteOrder, getOrderByUser};
