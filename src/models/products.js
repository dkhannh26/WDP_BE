const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        brand_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "brands",
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        discount_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "discounts",
        },
        category: {
            type: String,
            requried: true
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

const Products = mongoose.model("products", schema);

module.exports = Products;
