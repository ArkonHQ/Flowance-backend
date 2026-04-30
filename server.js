import app from './src/app.js';
import connectDB from './src/config/db.js';
import { logger } from './src/utils/logger.js';
import { PORT } from './src/config/env.js';

const start = async () => {
    try {
        await connectDB();
        logger.info('Database connected');
        app.listen(PORT, () => {
            logger.info(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        logger.error(err, 'Failed to start server');
        process.exit(1);
    }
};

start();