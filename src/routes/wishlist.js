const express = require('express');
const wishlistController = require('../controllers/wishlist.controller');
const wishlistRouter = express.Router()

wishlistRouter.get('/check', wishlistController.checkWishlist);
wishlistRouter.get('/:accountId', wishlistController.getList)
wishlistRouter.post('/', wishlistController.create)
wishlistRouter.put('/:id', wishlistController.update)
wishlistRouter.delete('/:id', wishlistController.delete)

module.exports = wishlistRouter;