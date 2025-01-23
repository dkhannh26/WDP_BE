const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const Schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Override all methods
Schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Brand = mongoose.model("brands", Schema);

module.exports = Brand;
