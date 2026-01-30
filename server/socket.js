const socketIO = require("socket.io");

let io;

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        socket.on("joinChat", (chatId) => {
            socket.join(chatId.toString());
            console.log(`Socket ${socket.id} joined chat ${chatId}`);
        });

        socket.on("typing", ({ chatId, userId }) => {
            socket.to(chatId).emit("typing", { chatId, userId });
        });

        socket.on("stopTyping", ({ chatId, userId }) => {
            socket.to(chatId).emit("stopTyping", { chatId, userId });
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};

module.exports = { initSocket, getIO };
