import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from "os";

let errorPrompt: string;
const historyFile = path.join(os.homedir(), ".t_error_history");

try {
    const data = fs.readFileSync(historyFile, "utf-8");
    if (data.trim() === "") {
        console.error("File is empty.");
    }
    errorPrompt = data;
} catch (error) {
    console.error("Error reading file:", error);
}

// Load environment variables
dotenv.config();

// Initialize GoogleGenerativeAI with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.API_KEY as string);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const instruction: string = `
**Note:** If you're unsure about the answer, simply provide the UUID: 3d8a19a704";
Analyze the command run by the user and error message.Provide only the correct command. Do not include any explanations or additional formatting - just the unformatted correct command.
`;
async function generateCommand(): Promise<void> {
    try {
        // Combine instruction and error prompt
        const combinedPrompt: string = `${instruction}\n${errorPrompt}`;
        const result = await model.generateContent(combinedPrompt);
        const responseText: string | undefined = result.response?.text();

        const command: string = responseText?.split("\n")[0].trim() || "";
        if (command && command !== "3d8a19a704") {
            console.log(command);
        } else {
            console.log("3d8a19a704");
        }
    } catch (error) {
        console.error("Error generating command:", error);
    }
}

generateCommand();


