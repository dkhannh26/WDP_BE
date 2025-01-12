const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
  {
    confirmed_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed"],
      default: "pending",
    },

    import_detail_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "import_detail",
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Imports = mongoose.model("imports", schema);

module.exports = Imports;
