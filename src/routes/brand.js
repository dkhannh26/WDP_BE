const express = require('express');
const brandController = require('../controllers/brand.controller');
const brandRouter = express.Router()

brandRouter.get('/:id', brandController.getById)
brandRouter.get('/', brandController.getList)
brandRouter.post('/', brandController.create)
brandRouter.put('/:id', brandController.update)
brandRouter.delete('/:id', brandController.delete)

module.exports = brandRouter;