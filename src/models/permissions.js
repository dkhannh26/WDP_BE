const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
    },
}, {
    timestamps: true, // createdAt, updatedAt
});

// Override all methods
permissionSchema.plugin(mongoose_delete, { overrideMethods: "all" });

const Permission = mongoose.model("permissions", permissionSchema, "permissions");

module.exports = Permission;
