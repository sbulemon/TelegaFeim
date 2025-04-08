const { WebSocketServer, WebSocket } = require('ws');

module.exports = (req, res) => {
    if (req.headers.upgrade === 'websocket') {
        const wss = new WebSocketServer({ noServer: true });
        
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
            wss.emit('connection', ws, req);
        });

        wss.on('connection', (ws) => {
            ws.on('message', (message) => {
                // Добавляем имя пользователя к сообщению
                const username = "Аноним"; // Можно добавить систему авторизации
                const messageWithUser = `${username}: ${message.toString()}`;
                
                // Отправляем сообщение всем клиентам
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(messageWithUser);
                    }
                });
                
                // Отправляем подтверждение отправителю
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(`Вы: ${message.toString()}`);
                }
            });
        });
        return;
    }
    res.status(400).send('This is a WebSocket endpoint');
};
