const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const accountSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    default: null,
  },
  address: {
    type: String,
  },

  phone: {
    type: String,
  },

  role: {
    type: String,
    enum: ["customer", "staff", "admin"],
    default: "customer",
  },
});

// Override all methods
accountSchema.plugin(mongoose_delete, { overrideMethods: "all" });

const Account = mongoose.model("accounts", accountSchema);

module.exports = Account;
