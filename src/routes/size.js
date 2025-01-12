var express = require("express");
const sizeController = require('../controllers/size.controller');
var sizeRouter = express.Router();


sizeRouter.get('/pantShirtSize', sizeController.getPantShirtSizeList);
sizeRouter.post('/pantShirtSize', sizeController.createPantShirtSize);
sizeRouter.get('/pantShirtSize/:sizeId', sizeController.getPantShirtSizeById);
sizeRouter.put('/pantShirtSize/:sizeId', sizeController.updatePantShirtSizeById);
sizeRouter.delete('/pantShirtSize/:sizeId', sizeController.deletePantShirtSizeById);

sizeRouter.get('/shoesSize', sizeController.getShoesSizeList);
sizeRouter.post('/shoesSize', sizeController.createShoesSize);
sizeRouter.get('/shoesSize/:sizeId', sizeController.getShoesSizeById);
sizeRouter.put('/shoesSize/:sizeId', sizeController.updateShoesSizeById);
sizeRouter.delete('/shoesSize/:sizeId', sizeController.deleteShoesSizeById);

module.exports = sizeRouter;