const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
    {
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "orders",
        },
        product_size_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product_size",
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        discount: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Order_detail = mongoose.model("order_detail", schema);

module.exports = Order_detail;