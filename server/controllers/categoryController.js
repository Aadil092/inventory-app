import Category from "../models/Category.js";

const addCategory = async (req , res) => {
    try {
        const {categoryName, categoryDescription } = req.body;

        const existingCategory = await Category.findOne({ name: categoryName});
        if (existingCategory) {
            return res.status(400).json({ success: false, message: 'Category already exists'});
        }
        const newCategory = new Category({
         categoryName,
         categoryDescription,
        });

        await newCategory.save();
        return res.status(201).json({ success: true, message: 'Category added Successfully'});
    } catch (error) {
        console.error('Error adding category:', error);
        return res.status(500).json({ success: false, message: 'Server Error'});
    }
}

const getCategory = async (req , res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({ success: true, categories});
     } catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({ success: false, message: 'Server error in getting categories'});
     }
}

const updateCategory = async (req , res) => {
    try {
        const { id } = req.params;
        console.log("id" , id);
        const { categoryName, categoryDescription} = req.body;

        const existingCategory = await Category.findById(id);
        if(!existingCategory) {
            return res.status(404).json({ success: false, message: 'Category not found'})
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {categoryName, categoryDescription},
            { returnDocument: 'after'}
        );

        return res.status(200).json({ success: true, message: 'Category Updated Successfully'});
      } catch (error) {
        console.error('Error updating categories:', error);
        return res.status(500).json({ success: false, message: 'Server Error'});
      }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            return res.status(404).json({ success: false, message: 'Category not found'});
          } 
          await Category.findByIdAndDelete(id);
          return res.status(200).json({ success: true, message: 'Category deleted successfully'});
    } catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({ success: false, message:'Server error'});
    }
}


export {addCategory, getCategory, updateCategory, deleteCategory};