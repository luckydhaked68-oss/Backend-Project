
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error("MONGODB_URI is missing in .env");
        }

        const connectionInstance = await mongoose.connect(uri, {
            dbName: DB_NAME,
        });

        console.log(
            "\nMongoDB connected !! DB HOST:",
            connectionInstance.connection.host
        );
        console.log("Database Name:", connectionInstance.connection.name);
    } catch (error) {
        console.error("MONGODB connection FAILED:", error.message);
        process.exit(1);
    }
};

export default connectDB;
