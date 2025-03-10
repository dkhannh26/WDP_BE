const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
    {
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
        },
        account_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "accounts",
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Wishlist = mongoose.model("wishlist", schema, "wishlist");

module.exports = Wishlist;
