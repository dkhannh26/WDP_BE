const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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
});

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Tshirts = mongoose.model("tshirts", schema);

module.exports = Tshirts;
