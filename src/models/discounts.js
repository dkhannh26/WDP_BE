const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const discountsSchema = new mongoose.Schema(
  {
    percent: {
      type: Number,
      required: true,
    },
    expired_at: Date,
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
discountsSchema.plugin(mongoose_delete, { overrideMethods: "all" });

const Discounts = mongoose.model("discounts", discountsSchema);

module.exports = Discounts;
