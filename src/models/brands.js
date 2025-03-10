const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const brandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    });

// Override all methods
brandSchema.plugin(mongoose_delete, { overrideMethods: "all" });

const Brands = mongoose.model("brands", brandSchema);

module.exports = Brands;
