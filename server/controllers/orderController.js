import Order from "../models/Order.js";
import Product from "../models/Product.js";

const addOrder = async (req, res) => {
  try {
    const { items, productId, quantity, price, address, paymentId } = req.body;
    const customerId = req.user.id;

    // Handle batch orders (from cart)
    if (items && Array.isArray(items) && items.length > 0) {
      const createdOrders = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.name || item.productId} not found`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock available for ${product.name}`,
          });
        }

        const newOrder = new Order({
          customerId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price * item.quantity,
          address: address || item.address,
          paymentId: paymentId || item.paymentId || "cash",
          status: "Pending",
        });

        const savedOrder = await newOrder.save();
        createdOrders.push(savedOrder);

        // Deduct stock
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      return res.status(201).json({
        success: true,
        message: "All orders placed successfully",
        orders: createdOrders,
      });
    }

    // Handle single order
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      });
    }

    const newOrder = new Order({
      customerId,
      productId,
      quantity,
      price,
      address,
      paymentId: paymentId || "cash",
      status: "Pending",
    });

    const savedOrder = await newOrder.save();

    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity },
    });

    return res.status(201).json({
      success: true,
      message: "Order added successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error adding order:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ customerId: userId })
      .populate("productId")
      .populate("customerId", "name email phone address")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
      orders,
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
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
      .populate("customerId", "name email phone address")
      .populate("productId", "name price stock")
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

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // If order was cancelled now and wasn't previously cancelled, restore stock
    if (status === "Cancelled" && previousStatus !== "Cancelled") {
      await Product.findByIdAndUpdate(order.productId, {
        $inc: { stock: order.quantity },
      });
    }

    // If uncancelled (e.g., moved back from Cancelled to Pending), re-deduct stock
    if (previousStatus === "Cancelled" && status !== "Cancelled") {
      await Product.findByIdAndUpdate(order.productId, {
        $inc: { stock: -order.quantity },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Ensure customer owns the order unless admin/superadmin
    if (
      order.customerId.toString() !== userId &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    if (order.status === "Shipped" || order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order that is already ${order.status}`,
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    order.status = "Cancelled";
    await order.save();

    // Restore product stock
    await Product.findByIdAndUpdate(order.productId, {
      $inc: { stock: order.quantity },
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully and stock restored",
      order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // If order was not completed and not already cancelled, restore stock upon deletion
    if (existingOrder.status !== "Delivered" && existingOrder.status !== "Cancelled") {
      await Product.findByIdAndUpdate(existingOrder.productId, {
        $inc: { stock: existingOrder.quantity },
      });
    }

    await Order.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  addOrder,
  getOrder,
  getOrderByUser,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
};

