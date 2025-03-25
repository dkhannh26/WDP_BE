const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const replySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 200,
    },
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
      required: true,
    },
    feedback_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feedbacks",
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods để hỗ trợ soft delete (nếu cần)
replySchema.plugin(mongoose_delete, { overrideMethods: "all" });

const Replies = mongoose.model("feedback_replies", replySchema);

module.exports = Replies;
