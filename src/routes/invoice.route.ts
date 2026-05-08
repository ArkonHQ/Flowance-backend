// routes/invoice.route.ts
import { Router } from 'express';
import {
    getAllInvoices,
    getOneInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice
} from '../controllers/invoice.controller';
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware)

router.get('/', getAllInvoices);
router.get('/:id', getOneInvoice);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;