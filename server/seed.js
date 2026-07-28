import connectDB from "./db/connection.js";
import User from "./models/User.js";
import bcrypt from 'bcrypt';


const register = async () => {
    try {
        connectDB();
        const hashPassword = await bcrypt.hash("admin123", 10);
        const newUser = new User({
            name: "admin",
            email: "admin@gmail.com",
            password: hashPassword,
            address: "admin address",
            role: "admin"
        })

        await newUser.save();
        console.log("Admin user created successfully");

        const hashSuperPassword = await bcrypt.hash("superadmin123", 10);
        const superAdminUser = new User({
            name: "superadmin",
            email: "superadmin@gmail.com",
            password: hashSuperPassword,
            address: "superadmin address",
            role: "superadmin"
        })


        await superAdminUser.save();
        console.log("Superadmin user created successfully");

        const customers =[
          {name: "Aadil", email: "aadil@gmail.com" , address: "Street 1"},
          {name: "Alice", email: "alice@gmail.com" , address: "Street 2"},
          {name: "charlic", email: "charlic@gmail.com" , address: "Street 3"},

        ];

        for (const cust of customers){
            const custPassword = await bcrypt.hash("customer123", 10)
            await new User({
                name: cust.name,
                email: cust.email,
                password: custPassword,
                address: cust.address,
                role: "customer",
            }).save();
            console.log(`Customer ${cust.name} created`)
        }

    } catch(error) {
        console.error("Error creating users:",error);
    }
}
 export default register();
