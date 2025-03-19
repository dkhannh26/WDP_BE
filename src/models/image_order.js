const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
  {
    file_extension: {
      type: String,
      required: true,
    },

    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const ImageOrder = mongoose.model("image_order", schema);

module.exports = ImageOrder;
