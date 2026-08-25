import PDFDocument from "pdfkit";
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

const downloadOrderReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(id)
      .populate("productId")
      .populate("customerId", "name email phone address");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const orderCustId = order.customerId?._id?.toString() || order.customerId?.toString();
    const isOwner = orderCustId === userId.toString();
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access to receipt" });
    }

    // Check delivered status
    if (order.status !== "Delivered" && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Receipt is only available for delivered orders",
      });
    }

    const invNumber = `INV-${order._id.toString().slice(-8).toUpperCase()}`;

    // Set Response Headers for direct PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Receipt_${invNumber}.pdf`
    );

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    // Header Background
    doc.rect(0, 0, doc.page.width, 105).fill("#0F172A");

    // Company & Document Header
    doc.fillColor("#FFFFFF").fontSize(18).font("Helvetica-Bold").text("INVENTORY MANAGEMENT SYSTEM", 40, 28);
    doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("Official Customer Purchase Receipt & Tax Invoice", 40, 52);

    // Receipt Meta
    doc.fillColor("#38BDF8").fontSize(13).font("Helvetica-Bold").text(`RECEIPT: ${invNumber}`, 340, 28, { align: "right", width: 215 });
    doc.fillColor("#CBD5E1").fontSize(9).font("Helvetica").text(
      `Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}`,
      340,
      48,
      { align: "right", width: 215 }
    );

    // Delivered Status Pill
    const isDelivered = order.status === "Delivered";
    doc.roundedRect(455, 68, 100, 20, 4).fillAndStroke(isDelivered ? "#059669" : "#2563EB", isDelivered ? "#059669" : "#2563EB");
    doc.fillColor("#FFFFFF").fontSize(8.5).font("Helvetica-Bold").text(order.status ? order.status.toUpperCase() : "DELIVERED", 455, 74, { align: "center", width: 100 });

    let y = 125;

    // Two-column Info Card
    doc.roundedRect(40, y, 515, 88, 6).fillAndStroke("#F8FAFC", "#E2E8F0");

    // Customer Column
    doc.fillColor("#64748B").fontSize(8.5).font("Helvetica-Bold").text("CUSTOMER INFORMATION", 55, y + 12);
    doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold").text(order.customerId?.name || req.user.name || "Customer", 55, y + 26);
    doc.fillColor("#475569").fontSize(9).font("Helvetica").text(`Email: ${order.customerId?.email || "customer@mail.com"}`, 55, y + 42);
    doc.fillColor("#475569").fontSize(9).font("Helvetica").text(`Phone: ${order.customerId?.phone || "N/A"}`, 55, y + 56);

    // Order & Payment Column
    doc.fillColor("#64748B").fontSize(8.5).font("Helvetica-Bold").text("ORDER & PAYMENT DETAILS", 310, y + 12);
    doc.fillColor("#0F172A").fontSize(9).font("Helvetica").text(`Payment Mode: ${(order.paymentId || "CASH").toUpperCase()}`, 310, y + 26);
    doc.fillColor("#0F172A").fontSize(9).font("Helvetica").text(`Payment Status: PAID`, 310, y + 40);
    doc.fillColor("#475569").fontSize(9).font("Helvetica").text(`Delivery: ${order.address || "Standard Delivery Destination"}`, 310, y + 54, { width: 235 });

    y += 110;

    // Table Header
    doc.rect(40, y, 515, 26).fill("#2563EB");
    doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold");
    doc.text("#", 55, y + 8, { width: 25 });
    doc.text("PRODUCT DESCRIPTION", 85, y + 8, { width: 225 });
    doc.text("UNIT PRICE", 315, y + 8, { width: 80, align: "right" });
    doc.text("QTY", 405, y + 8, { width: 40, align: "center" });
    doc.text("TOTAL AMOUNT", 455, y + 8, { width: 90, align: "right" });

    y += 26;

    // Line Item
    const productName = order.productId?.name || "Purchased Product Item";
    const qty = order.quantity || 1;
    const totalPrice = Number(order.price || 0);
    const unitPrice = Math.round(totalPrice / qty);

    doc.rect(40, y, 515, 34).fillAndStroke("#FFFFFF", "#E2E8F0");
    doc.fillColor("#0F172A").fontSize(9).font("Helvetica");
    doc.text("1", 55, y + 11, { width: 25 });
    doc.font("Helvetica-Bold").text(productName, 85, y + 11, { width: 225 });
    doc.font("Helvetica").text(`Rs. ${unitPrice.toLocaleString()}`, 315, y + 11, { width: 80, align: "right" });
    doc.text(`${qty}`, 405, y + 11, { width: 40, align: "center" });
    doc.font("Helvetica-Bold").text(`Rs. ${totalPrice.toLocaleString()}`, 455, y + 11, { width: 90, align: "right" });

    y += 48;

    // Summary Box (Right aligned)
    const summaryX = 330;
    const summaryWidth = 225;

    doc.roundedRect(summaryX, y, summaryWidth, 84, 4).fillAndStroke("#F8FAFC", "#CBD5E1");

    doc.fillColor("#475569").fontSize(9).font("Helvetica");
    doc.text("Subtotal:", summaryX + 15, y + 12);
    doc.text(`Rs. ${totalPrice.toLocaleString()}`, summaryX + 115, y + 12, { align: "right", width: 95 });

    doc.text("Taxes / GST (0%):", summaryX + 15, y + 28);
    doc.text("Rs. 0.00", summaryX + 115, y + 28, { align: "right", width: 95 });

    doc.moveTo(summaryX + 15, y + 46).lineTo(summaryX + summaryWidth - 15, y + 46).strokeColor("#CBD5E1").stroke();

    doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold");
    doc.text("Total Paid:", summaryX + 15, y + 54);
    doc.fillColor("#2563EB").text(`Rs. ${totalPrice.toLocaleString()}`, summaryX + 115, y + 54, { align: "right", width: 95 });

    // Footer
    const footerY = 700;
    doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor("#E2E8F0").stroke();

    doc.fillColor("#64748B").fontSize(9).font("Helvetica-Bold").text("Thank you for shopping with us!", 40, footerY + 12, { align: "center", width: 515 });
    doc.fillColor("#94A3B8").fontSize(8).font("Helvetica").text("This is an electronically generated receipt verified by Inventory Management System. No signature required.", 40, footerY + 26, { align: "center", width: 515 });

    doc.end();
  } catch (error) {
    console.error("Error generating receipt PDF:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Server error generating receipt" });
    }
  }
};

export {
  addOrder,
  getOrder,
  getOrderByUser,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  downloadOrderReceipt,
};


