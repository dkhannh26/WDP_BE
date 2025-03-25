const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
  {
    feedback_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feedbacks",
    },
    message: {
      type: String,
    },
    url: {
      type: String,
    },
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Notification = mongoose.model("notifications", schema);

module.exports = Notification;
