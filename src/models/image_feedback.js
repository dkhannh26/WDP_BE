const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
  {
    file_extension: {
      type: String,
      required: true,
    },

    feedback_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feedbacks",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const ImageFeedback = mongoose.model("image_feedback", schema);

module.exports = ImageFeedback;
