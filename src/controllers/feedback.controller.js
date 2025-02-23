const Account = require("../models/accounts");
const Feedback = require("../models/feedbacks");
const mongoose = require("mongoose");
const FeedBackLike = require("../models/feedback_like");

class FeedbackController {
  getList(req, res, next) {
    const { productId } = req.params;

    Feedback.find({ product_id: productId })
      .populate("account_id")
      .then((feedback) => {
        res.json(feedback);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ message: "Error retrieving feedback", error });
      });
  }

  getListFeedback(req, res, next) {
    Feedback.find({})
      .then((feedback) => {
        res.json(feedback);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async create(req, res, next) {
    Feedback.create(req.body)
      .then((data) => {
        console.log(data);

        res.json(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  update(req, res, next) {
    Feedback.updateOne({ _id: req.params.feedbackId }, req.body)
      .then(() => {
        res.send("Update discount successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  delete(req, res, next) {
    Feedback.deleteOne({ _id: req.params.feedbackId })
      .then(() => {
        res.send("Delete discount successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async like(req, res, next) {
    // let like = req.body?.like;
    try {
      let account_id = req.body?.account_id;
      let feedback_id = req.params.feedbackId;

      const existingLike = await FeedBackLike.findOne({
        feedback_id,
        account_id,
      });

      if (existingLike) {
        await FeedBackLike.deleteOne({ feedback_id, account_id });
        await Feedback.findByIdAndUpdate(feedback_id, {
          $inc: { likeCount: -1 },
        });
        return res
          .status(200)
          .json({ message: "Unliked successfully", liked: false });
      } else {
        await FeedBackLike.create({ feedback_id, account_id });

        await Feedback.findByIdAndUpdate(feedback_id, {
          $inc: { likeCount: 1 },
        });
        res.status(200).json({ message: "Liked successfully", liked: true });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getFeedbackLike(req, res, next) {
    // let like = req.body?.like;
    try {
      let account_id = req.params.accountId;

      let feedbackLike = await FeedBackLike.find({ account_id });

      let feedbackArr = [];
      feedbackLike.forEach((e) => {
        feedbackArr.push(e.feedback_id);
      });

      // console.log(feedbackArr);

      res.json(feedbackArr);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new FeedbackController();
