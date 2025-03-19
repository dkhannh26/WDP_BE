const { type } = require("express/lib/response");
const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema(
    {
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "roles",
        },
        permission_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "permissions",
        },
        des: {
            type: String,
        },
        status: {
            type: Boolean
        }
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Override all methods
schema.plugin(mongoose_delete, { overrideMethods: "all" });

const Role_permission = mongoose.model("role_permission", schema, "role_permission");

module.exports = Role_permission;
