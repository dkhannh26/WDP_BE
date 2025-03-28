const Account = require("../models/accounts");

const mongoose = require("mongoose");
const Feedbacks = require("../models/feedbacks");
const Notification = require("../models/notification");
const Products = require("../models/products");
require("dotenv").config();

module.exports = (io) => {
  const sendNotification = async (req, res) => {
    const { feedbackId } = req.params;
    const _id = new mongoose.Types.ObjectId(feedbackId);
    const feedback = await Feedbacks.findOne({ _id });
    const account = await Account.findOne({ _id: feedback.account_id });
    const product = await Products.findOne({ _id: feedback.product_id });

    const message =
      "Tài khoản " +
      account.username +
      " vừa đăng một nhận xét mới ở " +
      product.name;
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${today.getFullYear()}`;

    let staffs = await Account.find({ role: { $ne: "customer" } });
    let staffIds = staffs.map(
      (staff) => new mongoose.Types.ObjectId(staff._id)
    );

    const notification = {
      message,
      url: `customer/${product.category}/${product._id}`,
      created_at: formattedDate,
    };

    await Account.updateMany(
      { _id: { $in: staffIds } },
      { $inc: { countNotifications: 1 } }
    );

    await Notification.insertMany(
      staffIds.map((staffId) => ({
        feedback_id: feedback._id,
        url: `customer/${product.category}/${product._id}`,
        message,
        staff_id: staffId,
      }))
    );

    io.emit("newNotification", notification);
    res.status(200).json({ message: "Thông báo đã gửi" });
  };

  const getListNotification = async (req, res) => {
    try {
      let { accountId } = req.params;

      let notifications = await Notification.find({
        staff_id: new mongoose.Types.ObjectId(accountId),
      });

      let staff = await Account.findOne({
        _id: new mongoose.Types.ObjectId(accountId),
      });

      res
        .status(200)
        .json({ notifications, countNotification: staff.countNotifications });
    } catch (error) {
      console.log(error);
    }
  };

  const readNotifications = async (req, res) => {
    try {
      let { accountId } = req.params;
      console.log("Request URL:", req.url);
      console.log("Received accountId:", accountId);
      let updateCountNotification = await Account.findByIdAndUpdate(
        new mongoose.Types.ObjectId(accountId),
        { countNotifications: 0 }
      );
      console.log(updateCountNotification);

      res.status(200).json("ok");
      io.to(accountId).emit("notificationCount", 0);
    } catch (error) { }
  };
  return { sendNotification, getListNotification, readNotifications };
};
