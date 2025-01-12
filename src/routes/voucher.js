var express = require("express");
const voucherController = require('../controllers/voucher.controller');
var voucherRouter = express.Router();


voucherRouter.get('/', voucherController.getList);
voucherRouter.post('/', voucherController.createVoucher);
voucherRouter.get('/:voucherId', voucherController.getVoucherById);
voucherRouter.put('/:voucherId', voucherController.updateVoucherById);
voucherRouter.delete('/:voucherId', voucherController.deleteVoucherById);

module.exports = voucherRouter;