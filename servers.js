const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const genAI = new GoogleGenerativeAI(process.env.MYAPIKEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


app.post('/api/gemini', async (req, res) => {
    const userInput = req.body.input;
    if (!userInput) {
        return res.status(400).json({ error: 'Input is required' });
    }

    try {
        const result = await model.generateContent(userInput);
        const response = await result.response;

        if (!response || !response.candidates || !response.candidates[0]?.content?.parts) {
            throw new Error('Invalid response from Gemini API');
        }

        const generatedText = response.candidates[0].content.parts[0].text;
        res.json({ result: generatedText });
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Error communicating with Gemini API', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
