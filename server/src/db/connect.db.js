import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
import dotenv from "dotenv"
dotenv.config()

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These options are no longer needed in latest Mongoose version
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true,
        })

        console.log(`MongoDB Connected: ${conn.connection.host}`)
        return conn
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB