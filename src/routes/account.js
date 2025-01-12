const express = require('express');
const accountController = require('../controllers/account.controller');
const accountRouter = express.Router()

accountRouter.get('/:id', accountController.getById)
accountRouter.get('/', accountController.getList)
accountRouter.post('/', accountController.create)
accountRouter.put('/:id', accountController.update)
accountRouter.delete('/:id', accountController.delete)

module.exports = accountRouter;