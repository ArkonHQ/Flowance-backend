import app from './app';
import connectDB from './config/db';
import { logger } from "./utils/logger";
import { PORT } from './config/env';

const start = async () => {
    try {
        await connectDB();
        logger.info('Database connected');
        app.listen(PORT || 5500, () => {
            logger.info(`Server running on http://localhost:${PORT || 5500}`);
        });
    } catch (err) {
        logger.error(err, 'Failed to start server');
        process.exit(1);
    }
};

start();
