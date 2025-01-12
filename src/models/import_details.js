const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
  {
    accessory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accessories",
    },
    shoes_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shoes_size_detail",
    },
    pant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pant_shirt_size_detail",
    },
    tshirt_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pant_shirt_size_detail",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Import_detail = mongoose.model("import_detail", schema);

module.exports = Import_detail;
