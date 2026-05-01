import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRoute from './routes/auth.route.js';
import clientRouter from "./routes/client.route.js";
import dashboardRoutes from './routes/dashboard.route.js';
import invoiceRoute from "./routes/invoice.route.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(helmet());

app.use('/api/v1/auth', authRoute);

app.use('/api/v1/clients', clientRouter);

app.use('/api/v1/dashboard', dashboardRoutes);

app.use('/api/v1/invoice', invoiceRoute);

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.use((err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

export default app;