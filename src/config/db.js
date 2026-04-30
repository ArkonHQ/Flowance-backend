import mongoose from 'mongoose'
import { logger } from "../utils/logger.js";
import { MONGO_URI } from "./env.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI)
        logger.info(`MongoDB Connected: ${conn.connection.host}`)
    } catch (err) {
        const error = new Error(`❌MongoDB Connection Error: ${err.message}`)
        logger.error(error)
        process.exit(1)
    }
}

export default connectDB