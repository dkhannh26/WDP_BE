const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
    {
        size_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "pant_shirt_sizes",
        },
        size_name: {
            type: String,
            require
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Sizes = mongoose.model("sizes", schema);

module.exports = Sizes;
