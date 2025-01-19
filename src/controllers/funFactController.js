// controllers/funFactController.js
const FunFact = require("../models/funFact");

const getFunFacts = async (req, res) => {
    try {
        const { word } = req.body; // Get the word from request body

        if (!word) {
            return res.status(400).json({ 
                error: 'Missing word parameter',
                fact: `Environmental facts help us understand our impact!` 
            });
        }

        // Ensure word is one of our valid categories
        const validWords = [
            'SOLAR', 'GREEN', 'EARTH', 'CLEAN', 'PLANT',
            'REUSE', 'WATER', 'WASTE', 'OCEAN', 'POWER',
            'OZONE', 'TREES', 'CORAL', 'CLOUD', 'BEACH'
        ];

        if (!validWords.includes(word.toUpperCase())) {
            return res.status(400).json({ 
                error: 'Invalid word category',
                fact: `Environmental awareness makes a difference!` 
            });
        }

        // Generate the fun fact
        let fact;
        try {
            fact = await FunFact.generateFunFacts(word.toUpperCase());
        } catch (error) {
            console.error('Error generating fact:', error);
            // Return a backup fact if generation fails
            return res.json({ 
                fact: FunFact.getBackupFact(word.toUpperCase()) 
            });
        }

        // Format and return the response
        const formattedFact = FunFact.formatResponse(fact);
        res.json(formattedFact);

    } catch (error) {
        console.error('Error in fun fact controller:', error);
        res.status(500).json({ 
            error: 'Failed to generate fun fact',
            fact: 'Every environmental action counts!' 
        });
    }
};

module.exports = {
    getFunFacts
};