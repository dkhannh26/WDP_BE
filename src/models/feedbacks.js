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
    accessory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accessories",
    },
    shoes_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shoes",
    },
    pant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pants",
    },
    tshirt_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tshirts",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Feedbacks = mongoose.model("feedbacks", schema);

module.exports = Feedbacks;
