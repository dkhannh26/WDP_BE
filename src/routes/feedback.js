const express = require("express");
const FeedbackController = require("../controllers/feedback.controller");
const feedbackRouter = express.Router();

feedbackRouter.get("/:productId", FeedbackController.getList);
feedbackRouter.post("/", FeedbackController.create);
feedbackRouter.put("/:feedbackId", FeedbackController.update);

feedbackRouter.put("/like/:feedbackId", FeedbackController.like);
feedbackRouter.get("/like/:accountId", FeedbackController.getFeedbackLike);

feedbackRouter.delete("/:feedbackId", FeedbackController.delete);
feedbackRouter.post("/upload/:id", FeedbackController.uploadFeedbackImg);

feedbackRouter.get("/image/:id", FeedbackController.getFeedbackImg);
feedbackRouter.get("/reply/:feedbackId", FeedbackController.getReplies);
feedbackRouter.post("/reply/:feedbackId", FeedbackController.replyFeedback);

module.exports = feedbackRouter;
