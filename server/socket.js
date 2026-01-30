const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                process.env.CLIENT_URL,     // Vercel frontend
                "http://localhost:5173"      // Local dev
            ],
            credentials: true,
        },
        transports: ["websocket", "polling"], // Render friendly
    });

    io.on("connection", (socket) => {
        console.log("🟢 Socket connected:", socket.id);

        // Join chat room
        socket.on("joinChat", (chatId) => {
            if (!chatId) return;
            socket.join(chatId.toString());
            console.log(`Socket ${socket.id} joined chat ${chatId}`);
        });

        // Typing indicator
        socket.on("typing", ({ chatId, userId }) => {
            if (!chatId) return;
            socket.to(chatId).emit("typing", { chatId, userId });
        });

        socket.on("stopTyping", ({ chatId, userId }) => {
            if (!chatId) return;
            socket.to(chatId).emit("stopTyping", { chatId, userId });
        });

        socket.on("disconnect", (reason) => {
            console.log("🔴 Socket disconnected:", socket.id, "|", reason);
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

