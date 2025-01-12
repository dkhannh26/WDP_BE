const Feedback = require("../models/feedbacks");
class FeedbackController {
  getList(req, res, next) {
    const { productId } = req.params;

    // Tạo bộ lọc để tìm phản hồi dựa trên productId
    const filter = {
      $or: [
        { accessory_id: productId },
        { shoes_id: productId },
        { pant_id: productId },
        { tshirt_id: productId },
      ],
    };

    Feedback.find(filter)
      .populate("account_id", "username")
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

  create(req, res, next) {
    Feedback.create(req.body)
      .then(() => {
        res.send("Create feedback successfully");
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
}

module.exports = new FeedbackController();
