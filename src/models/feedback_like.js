const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
  {
    feedback_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feedbacks",
    },
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },

    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Feedbacks = mongoose.model("feedback_like", schema);

module.exports = Feedbacks;
