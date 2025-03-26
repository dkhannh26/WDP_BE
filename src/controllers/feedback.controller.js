const Account = require("../models/accounts");
const Feedback = require("../models/feedbacks");
const FeedbackReply = require("../models/feedback_replies");
const mongoose = require("mongoose");
const FeedBackLike = require("../models/feedback_like");
const { uploadFeedbackImages } = require("../services/fileService");
const ImageFeedback = require("../models/image_feedback");
const { sendNotification } = require("./notification.controller");
const path = require("path");
const fs = require("fs");

class FeedbackController {
  async getList(req, res, next) {
    try {
      const { productId } = req.params;
      let result = [];
      let feedback = await Feedback.find({ product_id: productId }).populate(
        "account_id"
      );

      const promises = feedback.map(async (e) => {
        let id = e._id;
        let imageUrls = [];
        let images = await ImageFeedback.find({ feedback_id: id });

        if (images.length != 0) {
          // imageUrl = `/images/feedback/${id}/${image[0]?._id}${image[0]?.file_extension}`;
          imageUrls = images.map(
            (img) => `/images/feedback/${id}/${img._id}${img.file_extension}`
          );
        }

        let {
          _id,
          content,
          account_id,
          product_id,
          star,
          likeCount,
          createdAt,
        } = e;

        return {
          _id,
          content,
          account_id,
          product_id,
          star,
          likeCount,
          imageUrls,
          createdAt,
        };
      });
      result = await Promise.all(promises);
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  }

  async create(req, res, next) {
    try {
      const feedback = await Feedback.create(req.body);

      res.json(feedback);
    } catch (error) {
      console.error("Error in create:", error);
      res.status(500).json({ message: "Error creating feedback", error });
    }
  }

  async update(req, res, next) {
    try {
      const updatedFeedback = await Feedback.findOneAndUpdate(
        { _id: req.params.feedbackId },
        req.body,
        { new: true } // Trả về document sau khi cập nhật
      );

      res.json(updatedFeedback._id);
    } catch (error) {
      console.error("Error in update:", error);
      res.status(500).json({ message: "Error updating feedback", error });
    }
  }

  async delete(req, res, next) {
    let uploadPath = path.resolve(
      __dirname,
      "../public/images/feedback/" + req.params.feedbackId
    );
    await fs.promises.rm(uploadPath, { recursive: true, force: true });
    await ImageFeedback.deleteMany({ feedback_id: req.params.feedbackId });
    Feedback.deleteOne({ _id: req.params.feedbackId })
      .then(() => {
        res.send("Delete feedback successfully");
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

  async uploadFeedbackImg(req, res) {
    try {
      let fileArray; //mảng chứa các file hình
      const id = new mongoose.Types.ObjectId(req.params.id);
      if (req.files) {
        fileArray = Array.isArray(req.files)
          ? req.files
          : Object.values(req.files);
      }

      if (fileArray.length === 0) {
        return res.status(200).json({ success: true, imageUrls: [] });
      }
      const uploadResult = await uploadFeedbackImages(fileArray, id);
      const imageUrls = uploadResult.detail
        .filter((item) => item.status === "success")
        .map((item) => `/images/feedback/${id}/${item.path}`);

      res.status(200).json({ success: true, imageUrls });
    } catch (error) {
      console.error("Error in uploadFeedbackImg:", error);
      res.status(500).json({ message: "Error uploading images", error });
    }
  }
  async getFeedbackImg(req, res) {
    let { id } = req.params;
    let result = [];
    let feedbackImgs = await ImageFeedback.find({ feedback_id: id });
    if (feedbackImgs.length > 0) {
      result = feedbackImgs.map((e) => {
        return `/images/feedback/${id}/${e._id}${e.file_extension}`;
      });
    }

    res.json(result);
  }

  async replyFeedback(req, res) {
    const { feedbackId } = req.params;

    const replyData = {
      content: req.body.content,
      account_id: req.body.account_id,
      feedback_id: feedbackId,
    };
    const reply = await FeedbackReply.create(replyData);

    res.status(200).json(reply);
  }

  async getReplies(req, res) {
    const id = req.params?.feedbackId;
    if (id) {
      const replies = await FeedbackReply.find({
        feedback_id: id,
      }).populate("account_id", "username");

      res.status(200).json(replies);
    }
  }
}
module.exports = new FeedbackController();
