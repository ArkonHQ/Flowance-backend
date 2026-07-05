import { Router } from 'express';
import * as invoiceController from './invoice.controller';
import { authenticate } from "../../middleware/authenticate.middleware";
import { resolveTeam } from "../../middleware/resolveTeam.middleware";
import { requirePermission } from "../../middleware/requirePermission.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createInvoiceSchema, updateInvoiceSchema } from "./invoice.schema";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(resolveTeam);

router.get('/', requirePermission('invoice:read'), invoiceController.getAllInvoices);
router.get('/:id', requirePermission('invoice:read'), invoiceController.getOneInvoice);
router.post('/', requirePermission('invoice:write'), validate(createInvoiceSchema), invoiceController.createInvoice);
router.put('/:id', requirePermission('invoice:write'), validate(updateInvoiceSchema), invoiceController.updateInvoice);
router.delete('/:id', requirePermission('invoice:write'), invoiceController.deleteInvoice);

export default router;
