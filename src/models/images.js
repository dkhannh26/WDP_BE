const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
  {
    file_extension: {
      type: String,
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Images = mongoose.model("images", schema);

module.exports = Images;
