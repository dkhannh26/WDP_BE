const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },

    star: {
      type: Number,
      min: 1,
      max: 5,
    },

    likeCount: { type: Number, default: 0 },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Feedbacks = mongoose.model("feedbacks", schema);

module.exports = Feedbacks;