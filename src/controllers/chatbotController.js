const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports.handleChat = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message content is required.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant for GreenCampus. Format your responses using markdown with proper headings, bullet points, and numbered lists where appropriate. Make sure to structure the information clearly and use bold text for important points. When producing Campaigns, make sure to always output in this format: Campaign Name: Recycling Campaign, Description: Join us to recycle 10 bottles and make a difference!, Campaign Points: 5"
                },
                { 
                    role: "user", 
                    content: message 
                }
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        const botMessage = completion.choices[0].message.content.trim();
        res.json({ reply: botMessage });
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};