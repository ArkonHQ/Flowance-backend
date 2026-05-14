import { setDefaultResultOrder } from 'dns';

setDefaultResultOrder('ipv4first');

import app from './app';
import connectDB from './config/db';
import { logger } from "./utils/logger";
import { PORT } from './config/env';

const start = async () => {
    try {
        await connectDB();
        logger.info('Database connected');
        app.listen(PORT || 5501, () => {
            logger.info(`Server running on http://localhost:${PORT || 5501}`);
        });
    } catch (err) {
        logger.error(err, 'Failed to start server');
        process.exit(1);
    }
};

start();
