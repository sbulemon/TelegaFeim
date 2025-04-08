let messages = []; // Временное хранилище

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { message, nickname } = req.body;
        if (!message || !nickname) {
            return res.status(400).json({ error: 'Message and nickname required' });
        }
        const chatMessage = { nickname, text: message, timestamp: Date.now() };
        messages.push(chatMessage);
        return res.status(200).json({ success: true });
    } else if (req.method === 'GET') {
        return res.status(200).json(messages);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
};
