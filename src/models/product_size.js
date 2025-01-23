const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
    {
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
        },
        size_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "sizes",
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Prodcut_Sizes = mongoose.model("product_size", schema);

module.exports = Prodcut_Sizes;
