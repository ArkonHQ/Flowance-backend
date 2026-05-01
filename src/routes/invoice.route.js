// routes/invoice.route.js
import { Router } from 'express';
import auth from '../middleware/auth.middleware.js';
import { validateMiddleware as validate } from '../middleware/validate.middleware.js';
import { createInvoiceSchema, updateInvoiceSchema } from '../validators/invoice.validator.js';
import {
    getAllInvoices,
    getOneInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice
} from '../controllers/invoice.controller.js';

const router = Router();

router.use(auth);

router.get('/', getAllInvoices);
router.get('/:id', getOneInvoice);
router.post('/', validate(createInvoiceSchema), createInvoice);
router.put('/:id', validate(updateInvoiceSchema), updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;