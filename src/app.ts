import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRoute from './modules/auth/auth.routes';
import clientRouter from "./modules/client/client.routes";
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import invoiceRoute from "./modules/invoice/invoice.routes";
import projectRoute from "./modules/project/project.routes";
import taskRouter from "./modules/task/task.routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(helmet());


app.use('/api/v1/auth', authRoute);

app.use('/api/v1/clients', clientRouter);

app.use('/api/v1/dashboard', dashboardRoutes);

app.use('/api/v1/invoice', invoiceRoute);

app.use('/api/v1/projects', projectRoute);

app.use('/api/v1/tasks', taskRouter);

app.get('/health', (_req: any, res: any) => {
    res.status(200).json({ status: 'OK' });
});

app.use((err: { statusCode: number; message: string; }, _req: any, res: any, _next: any) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

export default app;
