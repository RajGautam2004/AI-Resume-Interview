require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAI() {
    console.log("Checking API Key:", process.env.GEMINI_API_KEY ? "Found it!" : "MISSING!");
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        console.log("Sending message to Gemini...");
        const result = await model.generateContent("Say hello to Rishu in one sentence.");
        
        console.log("\n✅ SUCCESS! Gemini says:");
        console.log(result.response.text());
    } catch (error) {
        console.error("\n❌ FAILED! Here is the REAL error:");
        console.error(error);
    }
}

testAI();