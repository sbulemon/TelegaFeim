const { WebSocketServer } = require('ws');

module.exports = (req, res) => {
    if (req.headers['upgrade'] === 'websocket') {
        const wss = new WebSocketServer({ noServer: true });
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
            wss.emit('connection', ws, req);
        });

        wss.on('connection', (ws) => {
            ws.on('message', (message) => {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(message.toString());
                    }
                });
            });
        });

        return;
    }
    res.status(400).send('This is a WebSocket endpoint');
};
