import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
import dotenv from "dotenv"
dotenv.config()

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI, {
        })

        console.log(`MongoDB Connected: ${conn.connection.host}`)
        return connect
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB