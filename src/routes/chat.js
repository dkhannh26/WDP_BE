const Message = require("../models/message");
const Account = require("../models/accounts");
const Notification = require("../models/notification_chat");
const mongoose = require("mongoose");

const setupChat = (io) => {
    const users = {};

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("join", async (accountId) => {
            if (!mongoose.Types.ObjectId.isValid(accountId)) {
                console.error("Invalid accountId:", accountId);
                return;
            }

            users[socket.id] = accountId;
            socket.join(accountId.toString());
            console.log(`${accountId} joined room: ${accountId}`);

            io.emit("userList", Object.values(users));

            const account = await Account.findById(accountId);
            if (!account) {
                console.error("Account not found:", accountId);
                return;
            }

            const isStaff = account.role === "staff";

            if (isStaff) {
                socket.join("staffRoom");
                console.log(`${accountId} joined staffRoom`);

                const userList = await Message.aggregate([
                    { $match: { recipient_id: new mongoose.Types.ObjectId(accountId) } },
                    { $group: { _id: "$sender_id" } },
                    { $lookup: { from: "accounts", localField: "_id", foreignField: "_id", as: "sender" } },
                    { $match: { "sender": { $ne: [] } } },
                    { $project: { _id: "$_id", username: { $arrayElemAt: ["$sender.username", 0] } } },
                    { $sort: { _id: 1 } },
                ]);

                socket.emit("userChatList", userList.map((user) => ({
                    _id: user._id.toString(),
                    username: user.username,
                })));
            } else {
                const messages = await Message.find({
                    $or: [
                        { sender_id: accountId, recipient_id: { $in: await Account.find({ role: "staff" }).distinct("_id") } },
                        { recipient_id: accountId, sender_id: { $in: await Account.find({ role: "staff" }).distinct("_id") } },
                    ],
                })
                    .populate("sender_id", "username")
                    .populate("recipient_id", "username")
                    .sort({ timestamp: 1 });
                socket.emit("loadMessages", messages);
            }
        });

        socket.on("loadUserMessages", async (userId) => {
            const account = await Account.findById(users[socket.id]);
            if (!account || account.role !== "staff") return;

            const messages = await Message.find({
                $or: [
                    { sender_id: userId, recipient_id: account._id },
                    { sender_id: account._id, recipient_id: userId },
                ],
            })
                .populate("sender_id", "username")
                .populate("recipient_id", "username")
                .sort({ timestamp: 1 });
            socket.emit("loadMessages", messages);
        });

        socket.on("sendMessage", async (data) => {
            const { sender_id, message, recipient_id } = data;
            const senderAccount = await Account.findById(sender_id);

            if (senderAccount && senderAccount.role !== "staff") {
                const staffAccounts = await Account.find({ role: "staff" });

                const messagePromises = staffAccounts.map(async (staff) => {
                    const newMessage = new Message({
                        sender_id,
                        recipient_id: staff._id,
                        message,
                    });
                    await newMessage.save();
                    return Message.findById(newMessage._id)
                        .populate("sender_id", "username")
                        .populate("recipient_id", "username");
                });

                const populatedMessages = await Promise.all(messagePromises);

                const notificationPromises = staffAccounts.map(async (staff) => {
                    const newNotification = new Notification({
                        senderId: sender_id,
                        senderName: senderAccount.username,
                        recipientId: staff._id
                    });
                    await newNotification.save();
                    return newNotification;
                });
                await Promise.all(notificationPromises);

                // Send notifications to all staff members
                populatedMessages.forEach((populatedMessage) => {
                    const recipientId = populatedMessage.recipient_id.toString();
                    // Send new message notification to individual staff
                    io.to(recipientId).emit("newMessageNotification", {
                        senderId: sender_id.toString(),
                        message: populatedMessage,
                    });
                    // Send notification to individual staff
                    io.to(recipientId).emit("getNotification", {
                        senderName: populatedMessage.sender_id.username,
                        senderId: sender_id.toString(),
                    });
                });

                // Also broadcast to staffRoom for all connected staff
                if (populatedMessages.length > 0) {
                    io.to("staffRoom").emit("getNotification", {
                        senderName: populatedMessages[0].sender_id.username, // Fixed reference
                        senderId: sender_id.toString(),
                        message: populatedMessages[0].message // Include message content if needed
                    });

                    io.emit("receiveMessage", populatedMessages[0]);
                }

                // Update user list for all staff
                for (const staff of staffAccounts) {
                    const userList = await Message.aggregate([
                        { $match: { recipient_id: staff._id } },
                        { $group: { _id: "$sender_id" } },
                        { $lookup: { from: "accounts", localField: "_id", foreignField: "_id", as: "sender" } },
                        { $match: { "sender": { $ne: [] } } },
                        { $project: { _id: "$_id", username: { $arrayElemAt: ["$sender.username", 0] } } },
                        { $sort: { _id: 1 } },
                    ]);
                    io.to(staff._id.toString()).emit("userChatList", userList.map((user) => ({
                        _id: user._id.toString(),
                        username: user.username,
                    })));
                }
            } else if (senderAccount && senderAccount.role === "staff") {
                const newMessage = new Message({ sender_id, recipient_id, message });
                await newMessage.save();
                const populatedMessage = await Message.findById(newMessage._id)
                    .populate("sender_id", "username")
                    .populate("recipient_id", "username");
                const newNotification = new Notification({
                    senderId: sender_id,
                    senderName: senderAccount.username,
                    recipientId: recipient_id
                });
                await newNotification.save();
                // Send message to all connected clients
                io.emit("receiveMessage", populatedMessage);

                // Send notification to the customer
                io.to(recipient_id).emit("getNotification", {
                    senderName: populatedMessage.sender_id.username,
                    senderId: sender_id.toString(),
                });

                // Send notification to staff room (excluding sender)
                socket.to("staffRoom").emit("getNotification", {
                    senderName: populatedMessage.sender_id.username,
                    recipientId: recipient_id.toString(),
                    senderId: sender_id.toString(),
                });
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            delete users[socket.id];
            io.emit("userList", Object.values(users));
        });
    });
};

module.exports = setupChat;