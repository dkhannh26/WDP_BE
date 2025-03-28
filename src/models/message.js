const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const messageSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accounts",
        required: true,
    },
    recipient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accounts",
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

messageSchema.plugin(mongoose_delete, { overrideMethods: "all" });

const Message = mongoose.model("messages", messageSchema);

module.exports = Message;