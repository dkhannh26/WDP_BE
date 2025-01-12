const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");
const Discount = require("./discounts");
const { type } = require("express/lib/response");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
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

const Accessories = mongoose.model("accessories", schema);

module.exports = Accessories;
