const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const accountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["user", "staff", "admin"],
    default: "user",
  },
});

// Override all methods
accountSchema.plugin(mongoose_delete, { overrideMethods: "all" });

const Account = mongoose.model("accounts", accountSchema);

module.exports = Account;
