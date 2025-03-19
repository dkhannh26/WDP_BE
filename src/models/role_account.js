const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
    {
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "roles",
        },
        account_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "accounts",
        },
        des: {
            type: String,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Role_account = mongoose.model("role_account", schema, "role_account");

module.exports = Role_account;
