var express = require("express");
const PaymentController = require('../controllers/payment.controller');
var paymentRouter = express.Router();


paymentRouter.get('/vnpay_return', PaymentController.vnpayReturn);
paymentRouter.post('/', PaymentController.createPayment);

module.exports = paymentRouter;
