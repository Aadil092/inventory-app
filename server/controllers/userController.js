import User from "../models/User.js";
import bcrypt from 'bcrypt';


const addUser = async (req , res) => {
    try {
        const { name, email, password, address, role} = req.body;

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists'});

        }
            const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
         name,
         email,
         password: hashPassword,
         address,
         role,
        });

        await newUser.save();
        return res.status(201).json({ success: true, message: 'User added Successfully'});
    } catch (error) {
        console.error('Error adding User:', error);
        return res.status(500).json({ success: false, message: 'Server Error'});
    }
}

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, address, password, role } = req.body;

        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updatedData = {
            name: name || existingUser.name,
            email: email || existingUser.email,
            address: address || existingUser.address,
            password: existingUser.password, // Keep the existing password if not provided
            role: role || existingUser.role,
        };

        if (password) {
            const hashPassword = await bcrypt.hash(password, 10);
            updatedData.password = hashPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updatedData, {returnDocument: 'after'});
        return res.status(200).json({ success: true, message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}   
const getUsers = async (req , res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ success: true, users});
     } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ success: false, message: 'Server error in getting users'});
     }
}

const getUser = async (req, res) => {
    try{
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found'});
        }
        return res.status(200).json({ success: true, user});
    }
    catch (error) {
        console.error('Error fetching a User profile:', error);
        return res.status(500).json({ success: false , message: 'Server Error getting a user profile'});
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
            }

        await User.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }   

}

const updateProfile = async (req, res) => {
    try {
        const { name, email, address, currentPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        const updatedData = {
            name: name || user.name,
            email: email || user.email,
            address: address || user.address,
        };

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { returnDocument: 'after' }).select('-password');
        return res.status(200).json({ success: true, message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Old password and new password are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Old password is incorrect' });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        await user.save();

        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ success: false, message: 'Server error updating password' });
    }
};

export {addUser, getUsers, updateUser, deleteUser, getUser, updateProfile, updatePassword};
