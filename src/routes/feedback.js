const express = require('express');
const FeedbackController = require('../controllers/feedback.controller');
const feedbackRouter = express.Router()

feedbackRouter.get('/', FeedbackController.getListFeedback)
feedbackRouter.get('/:productId', FeedbackController.getList)
feedbackRouter.post('/', FeedbackController.create)
feedbackRouter.put('/:feedbackId', FeedbackController.update)
feedbackRouter.delete('/:feedbackId', FeedbackController.delete)

module.exports = feedbackRouter;