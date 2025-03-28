const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const schema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts', required: true },
    senderName: { type: String, required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts', required: true },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

schema.plugin(mongoose_delete, { overrideMethods: "all" });

const ChatNotification = mongoose.model("chat_notification", schema);

module.exports = ChatNotification;