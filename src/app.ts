import express from 'express';
import { toNodeHandler } from "better-auth/node";
import helmet from 'helmet';
import cors from 'cors';
import authRoute from './modules/auth/auth.routes';
import clientRouter from "./modules/client/client.routes";
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import invoiceRoute from "./modules/invoice/invoice.routes";
import projectRoute from "./modules/project/project.routes";
import taskRouter from "./modules/task/task.routes";
import { auth } from './lib/auth';
import timerRouter from './modules/timer/timer.routes';
import tagRouter from './modules/tags/tag.routes';
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(helmet());

app.use('/api/auth', toNodeHandler(auth.handler));

// All resource routes scoped under a team slug (pass 'personal' for personal workspace)
app.use('/api/teams/:slug/dashboard', dashboardRoutes);

app.use('/api/teams/:slug/invoices', invoiceRoute);

app.use('/api/teams/:slug/projects', projectRoute);

app.use('/api/teams/:slug/tasks', taskRouter);

app.use('/api/teams/:slug/clients', clientRouter);

app.use('/api/teams/:slug/tags', tagRouter);

// Timer is user-scoped (no team context needed)
app.use('/api/timer', timerRouter);



app.get('/health', (_req: any, res: any) => {
    res.status(200).json({ status: 'OK' });
});

app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(`[Error] ${_req.method} ${_req.originalUrl}:`, err?.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

export default app;
