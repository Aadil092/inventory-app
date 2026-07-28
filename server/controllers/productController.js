import Supplier from "../models/Supplier.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const getProducts = async (req , res) => {
    try {
        const suppliers = await Supplier.find();
        const categories = await Category.find();
        const products = await Product.find().populate(`categoryId`).populate(`supplierId`);
        return res.status(200).json({ success: true, suppliers, categories , products});
     } catch (error) {
        console.error('Error fetching suppliers:', error);
        return res.status(500).json({ success: false, message: 'Server error in getting suppliers'});
     }
}

const addProducts = async (req , res) => {
    try {
        const { name, description, price, stock, categoryId, supplierId} = req.body;

          if (!categoryId || !supplierId) {
         return res.status(400).json({ message: "Category and Supplier are required" });
     }

        const newProduct = new Product({
         name,
         description,
         price,
         stock,
         categoryId,
         supplierId,
        });

        await newProduct.save();
        return res.status(201).json({ success: true, message: 'Products added Successfully'});
    } catch (error) {
        console.error('Error adding products:', error);
        return res.status(500).json({ success: false, message: 'Server Error'});
    }
}

const updateProducts = async (req , res) => {
    try {
        const { id } = req.params;
        console.log("id" , id);
        const { name, description, price, stock, categoryId, supplierId} = req.body;

        const existingProduct = await Product.findById(id);
        if(!existingProduct) {
            return res.status(404).json({ success: false, message: 'Product not found'})
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {name, description, price, stock, categoryId, supplierId },
            { returnDocument: 'after'}
        );

        return res.status(200).json({ success: true, message: 'Product Updated Successfully'});
      } catch (error) {
        console.error('Error updating products:', error);
        return res.status(500).json({ success: false, message: 'Server Error'});
      }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: 'Product not found'});
          } 
          await Product.findByIdAndDelete(id);
          return res.status(200).json({ success: true, message: 'Product deleted successfully'});
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ success: false, message:'Server error'});
    }
}



export  {getProducts, addProducts, updateProducts, deleteProduct};