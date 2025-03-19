var express = require("express");
const orderController = require('../controllers/order.controller');
var orderRouter = express.Router();


orderRouter.get('/', orderController.getList);
orderRouter.post('/', orderController.createOrder);
orderRouter.delete('/', orderController.deleteAllOrder);
orderRouter.post('/paid', orderController.paidOrder);
orderRouter.get('/allRefund', orderController.getAllRefund);
orderRouter.get('/hotProduct', orderController.getTop10ProductsByCategory);
orderRouter.get('/hotBrand', orderController.getHotBrands);
orderRouter.get('/pending/:accountId', orderController.getListPending);
orderRouter.get('/done/:accountId', orderController.getListDone);
orderRouter.get('/cancel/:accountId', orderController.getListCancel);
orderRouter.get('/transit/:accountId', orderController.getListTransit);
orderRouter.get('/refund/:accountId', orderController.getListRefund);
orderRouter.get('/all/:accountId', orderController.getListAll);
orderRouter.get('/:orderId', orderController.getOrderById);
orderRouter.put('/:orderId', orderController.updateOrderById);
orderRouter.delete('/:orderId', orderController.deleteOrderById);
orderRouter.get('/allDetails/:accountId', orderController.getAllOrderDetails);
orderRouter.get('/details/:orderId', orderController.getOrderDetails);
orderRouter.put('/confirm/:orderId', orderController.confirmOrder);
orderRouter.put('/cancel/:orderId', orderController.cancelOrder);
orderRouter.put('/shipped/:orderId', orderController.shippedOrder);
orderRouter.put('/refund/:orderId', orderController.returnOrder);
orderRouter.put('/refundReject/:orderId', orderController.rejectRefund);
orderRouter.put('/reason/:orderId', orderController.updateOrderReason);
orderRouter.get('/account/:accountId', orderController.getOrderByAccountId);
orderRouter.post("/upload/:id", orderController.uploadOrderImg);
orderRouter.get("/image/:id", orderController.getOrderImg);
orderRouter.put('/confirmRefund/:orderId', orderController.confirmRefund);

module.exports = orderRouter;