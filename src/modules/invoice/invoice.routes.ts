import { Router } from 'express';
import * as invoiceController from './invoice.controller';
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createInvoiceSchema, updateInvoiceSchema } from "./invoice.schema";

const router = Router();

router.use(requireAuth);

router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getOneInvoice);
router.post('/', validate(createInvoiceSchema), invoiceController.createInvoice);
router.put('/:id', validate(updateInvoiceSchema), invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

export default router;
