const express = require('express');
const notificationChatController = require('../controllers/notificationChat.controller');
const notificationChatRouter = express.Router()

notificationChatRouter.get('/unread/:userId', notificationChatController.unread);
notificationChatRouter.put('/customerRead/:userId', notificationChatController.customerRead);
notificationChatRouter.put('/read/:userId/:senderId', notificationChatController.read);

module.exports = notificationChatRouter;