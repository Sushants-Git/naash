import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import os from "os";

import type { CommandLog } from "./types";

let errorPrompt: CommandLog[];
const errorFile = path.join(os.homedir(), ".t_error");

let pathToApi = os.homedir() + "/.t.env";
let API_KEY = "";
if (fs.existsSync(pathToApi)) {
    API_KEY = fs.readFileSync(pathToApi, "utf-8");
}
let genAI = new GoogleGenerativeAI(API_KEY as string);

let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const instructionForHm: string = `
- **Note:** If you're unsure about the answer, or don't want to reply for any reason, simply provide the UUID: 3d8a19a704\n
- Be smart enough to understand what the user means. \n
- Analyze the command run by the user and error message.Provide only the correct command. Do not include any explanations or additional formatting - just the unformatted correct command.
`;

const instructionForHp: string = `
- **Note:** If you're unsure about the answer, or don't want to reply for any reason, simply provide the UUID: 3d8a19a704 \n
- Be smart enough to understand what the user means. \n
- Analyze the message typed by the user and provide only the correct command that can be run on a shell, assume that the user has the bare minimum installed. Do not include any explanations or additional formatting - just the unformatted correct command.`;

export async function generateCommandForHm() {
    try {
        if (fs.existsSync(errorFile)) {
            const data = fs.readFileSync(errorFile, "utf-8");
            if (data.trim() === "") {
                console.error("File is empty.");
            }
            errorPrompt = JSON.parse(data);
        }
    } catch (error) {
        console.error("Error reading file:", error);
    }

    if (!API_KEY) {
        let pathToApi = os.homedir() + "/.t.env";
        let API_KEY = "";
        if (fs.existsSync(pathToApi)) {
            API_KEY = fs.readFileSync(pathToApi, "utf-8");
        }

        genAI = new GoogleGenerativeAI(API_KEY as string);

        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    try {
        const combinedPrompt: string = `${instructionForHm}\n${JSON.stringify(errorPrompt.at(-1))}`;
        const result = await model.generateContent(combinedPrompt);
        const responseText: string | undefined = result.response?.text();

        const command: string = responseText?.split("\n")[0].trim() || "";
        if (command && command !== "3d8a19a704") {
            return command;
        } else {
            return "3d8a19a704";
        }
    } catch (error) {
        console.error("Error generating command:", error);
    }
}

export async function generateCommandForHp(message: string) {
    try {
        if (fs.existsSync(errorFile)) {
            const data = fs.readFileSync(errorFile, "utf-8");
            if (data.trim() === "") {
                console.error("File is empty.");
            }
            errorPrompt = JSON.parse(data);
        }
    } catch (error) {
        console.error("Error reading file:", error);
    }

    if (!API_KEY) {
        let pathToApi = os.homedir() + "/.t.env";
        let API_KEY = "";
        if (fs.existsSync(pathToApi)) {
            API_KEY = fs.readFileSync(pathToApi, "utf-8");
        }

        genAI = new GoogleGenerativeAI(API_KEY as string);

        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    try {
        const combinedPrompt: string = `${instructionForHp}\n${message}`;
        const result = await model.generateContent(combinedPrompt);
        const responseText: string | undefined = result.response?.text();

        const command: string = responseText?.split("\n")[0].trim() || "";
        if (command && command !== "3d8a19a704") {
            return command;
        } else {
            return "3d8a19a704";
        }
    } catch (error) {
        console.error("Error generating command:", error);
    }
}
