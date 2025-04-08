let messages = []; // Временное хранилище (сбрасывается при перезапуске)

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        messages.push(message);
        console.log('Message added:', message);
        return res.status(200).json({ success: true });
    } else if (req.method === 'GET') {
        console.log('Returning messages:', messages);
        return res.status(200).json(messages);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
};
