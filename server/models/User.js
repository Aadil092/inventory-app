import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {type: String},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    address: {type: String},
    role: {type: String, enum:["superadmin", "admin","customer"], default: "customer"},
    status: {type: String, enum:["Active", "Deactive", "Blocked", "active", "deactive", "blocked"], default: "Active"}
})

const User = mongoose.model("User", userSchema);
export default User;