const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const sizeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

});

// Override all methods
sizeSchema.plugin(mongoose_delete, { overrideMethods: "all" });

const Sizes = mongoose.model("sizes", sizeSchema);

module.exports = Sizes;
