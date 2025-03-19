const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
    },
}, {
    timestamps: true, // createdAt, updatedAt
});

// Override all methods
roleSchema.plugin(mongoose_delete, { overrideMethods: "all" });

const Role = mongoose.model("roles", roleSchema, "roles");

module.exports = Role;
