// models/funFact.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class FunFact {
    static backupFacts = {
        'SOLAR': "Solar panels have become 90% cheaper over the last decade!",
        'GREEN': "Green buildings reduce energy use by 30% on average!",
        'EARTH': "Earth's forests absorb 30% of annual carbon emissions!",
        'CLEAN': "Clean energy could provide 90% of electricity by 2050!",
        'PLANT': "A single plant can clean up to 10 cubic meters of air daily!",
        'REUSE': "Reusing materials can save 95% of the energy used to make new products!",
        'WATER': "Just 1% of Earth's water is available freshwater!",
        'WASTE': "Recycling one ton of paper saves 17 trees and 7,000 gallons of water!",
        'OCEAN': "Oceans absorb 30% of global CO2 emissions annually!",
        'POWER': "Renewable power could save $160 trillion in climate costs by 2050!",
        'OZONE': "The ozone layer blocks 97-99% of harmful UV radiation!",
        'TREES': "One mature tree absorbs 48 pounds of CO2 per year!",
        'CORAL': "Coral reefs support 25% of all marine species!",
        'CLOUD': "Cloud computing can reduce energy usage by up to 87%!",
        'BEACH': "Coastal wetlands store 50 times more carbon than rainforests!"
    };

    static getBackupFact(word) {
        return this.backupFacts[word] || "Every environmental action makes a difference!";
    }

    static async generateFunFacts(word) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            
            const prompt = `Generate an engaging environmental fact about "${word}" that adheres to the following rules:
            - Must include specific, surprising numbers (percentages, measurements, or quantities).
            - Must highlight the environmental impact, benefit, or an intriguing natural phenomenon.
            - Must be a single sentence ending with an exclamation mark.
            - Must be under 100 characters for brevity and impact.
            - Style examples:
              - "A single tree can absorb up to 48 pounds of CO2 per year!"
              - "Ocean waves can generate up to 80,000 TWh of electricity annually!"
              - "Solar panels have become 90% cheaper over the last decade!"
              - "Mangroves can absorb up to four times more CO2 than rainforests!"
            
            IMPORTANT RULES:
            1. Respond with ONLY the fact—no introductory or concluding text.
            2. The fact must end with an exclamation mark.
            3. Include at least one specific number or measurable detail.
            4. Avoid using quotation marks in the response.
            5. Ensure the fact is concise and below 100 characters.
            
            Generate a new and unique fact about "${word}" that will amaze and inspire!`;
            
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 20,
                    topP: 0.8,
                    maxOutputTokens: 100,
                }
            });
    
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating AI fun fact:', error);
            return this.getBackupFact(word);
        }
    }

    static formatResponse(text) {
        // Clean up the response
        let cleanText = text
            .trim()
            .replace(/^["']|["']$/g, '')     // Remove quotes at start/end
            .replace(/\n/g, ' ')             // Remove line breaks
            .trim();
            
        // Ensure it ends with an exclamation mark
        if (!cleanText.endsWith('!')) {
            cleanText += '!';
        }
                
        return {
            fact: cleanText
        };
    }
}

module.exports = FunFact;