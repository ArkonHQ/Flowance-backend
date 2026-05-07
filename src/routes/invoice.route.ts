// routes/invoice.route.ts
import { Router } from 'express';
import auth from '../middleware/auth.middleware.ts';
import { validateMiddleware as validate } from '../middleware/validate.middleware.ts';
import { createInvoiceSchema, updateInvoiceSchema } from '../validators/invoice.validator.ts';
import {
    getAllInvoices,
    getOneInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice
} from '../controllers/invoice.controller.ts';

const router = Router();

router.use(auth);

router.get('/', getAllInvoices);
router.get('/:id', getOneInvoice);
router.post('/', validate(createInvoiceSchema), createInvoice);
router.put('/:id', validate(updateInvoiceSchema), updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;