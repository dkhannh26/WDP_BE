var express = require("express");
const cartController = require('../controllers/cart.controller');
var cartRouter = express.Router();


cartRouter.post('/', cartController.createCart);
cartRouter.get('/:accountId', cartController.getList);
cartRouter.put('/:cartId', cartController.updateCartById);
cartRouter.delete('/delete/:accountId', cartController.deleteAllCartById);
cartRouter.delete('/:cartId', cartController.deleteCartById);
cartRouter.delete('/:accountId', cartController.deleteAllCartByAccountId);
cartRouter.get('/product/:cartId', cartController.getProductSizeDetails);

module.exports = cartRouter;