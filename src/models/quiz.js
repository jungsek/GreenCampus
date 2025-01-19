// models/quiz.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class Quiz {
    static async generateQuizQuestions(topic) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            
            const prompt = `Generate 5 multiple-choice questions about "${topic}". Return ONLY the JSON with no code blocks or additional formatting. Start with { and end with }. 

            For the explanation field, include:
            1. Why the correct answer is right
            2. A relevant fact or statistic
            3. The environmental impact or significance

            Example format:
            {
                "questions": [
                    {
                        "question": "What percentage of global greenhouse gas emissions come from transportation?",
                        "options": ["14%", "20%", "29%", "35%"],
                        "correctIndex": 0,
                        "explanation": "Transportation contributes 14% of global greenhouse gas emissions, making it the third-largest source after electricity (25%) and industry (21%). Reducing transportation emissions through public transit and electric vehicles could prevent up to 6.7 gigatons of CO2 emissions annually."
                    }
                ]
            }

            Make each explanation engaging and informative by:
            - Including specific numbers and statistics
            - Connecting the answer to real-world environmental impacts
            - Adding a solution or action item when relevant
            - Keeping explanations concise but comprehensive (2-3 sentences)

            Generate 5 unique questions about "${topic}" that will educate and inspire environmental action!`;
            
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 20,
                    topP: 0.8,
                    maxOutputTokens: 1000,
                }
            });
    
            const response = await result.response;
            const text = response.text();
            
            // Clean the response - remove markdown code blocks and any extra whitespace
            const cleanedText = text
                .replace(/```json\n?|\n?```/g, '')  // Remove code block markers
                .replace(/^\s*|\s*$/g, '')          // Remove leading/trailing whitespace
                .trim();
            
            // console.log('Cleaned response:', cleanedText);
            
            return JSON.parse(cleanedText);
        } catch (error) {
            console.error('Error generating quiz questions:', error);
            // Return fallback questions if generation fails
            return {
                questions: [
                    {
                        question: "What is a primary benefit of renewable energy?",
                        options: [
                            "Zero emissions during operation",
                            "Always available 24/7",
                            "Requires no maintenance",
                            "Free to install"
                        ],
                        correctIndex: 0,
                        explanation: "Renewable energy sources produce zero emissions during operation, making them crucial for fighting climate change."
                    },
                    {
                        question: "Which action most effectively reduces your carbon footprint?",
                        options: [
                            "Using public transportation",
                            "Turning off lights",
                            "Recycling paper",
                            "Using reusable bags"
                        ],
                        correctIndex: 0,
                        explanation: "Using public transportation significantly reduces individual carbon emissions by sharing rides and reducing the number of vehicles on the road."
                    },
                    {
                        question: "What percentage of Earth's surface is covered by oceans?",
                        options: [
                            "71%",
                            "55%",
                            "63%",
                            "82%"
                        ],
                        correctIndex: 0,
                        explanation: "Oceans cover 71% of Earth's surface and play a crucial role in regulating climate and supporting life."
                    }
                ]
            };
        }
    }

    static formatQuestions(questionsData) {
        try {
            if (!questionsData || !questionsData.questions) {
                throw new Error('Invalid questions data');
            }
            
            return questionsData.questions.map(q => ({
                question: q.question.trim(),
                options: q.options.map(opt => opt.trim()),
                correctIndex: Number(q.correctIndex),
                explanation: q.explanation.trim()
            }));
        } catch (error) {
            console.error('Error formatting questions:', error);
            // Return a single fallback question if formatting fails
            return [{
                question: "Why is reducing plastic use important?",
                options: [
                    "It takes 400+ years to decompose",
                    "It's expensive to produce",
                    "It's heavy to transport",
                    "It's difficult to make"
                ],
                correctIndex: 0,
                explanation: "Plastic pollution is a major environmental issue as plastic takes over 400 years to decompose."
            }];
        }
    }
}

module.exports = Quiz;