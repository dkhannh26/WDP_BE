const express = require('express');
const discountController = require('../controllers/discount.controller');
const discountRouter = express.Router()

discountRouter.get('/:id', discountController.getById)
discountRouter.get('/', discountController.getList)
discountRouter.post('/', discountController.create)
discountRouter.put('/:id', discountController.update)
discountRouter.delete('/:id', discountController.delete)

module.exports = discountRouter;