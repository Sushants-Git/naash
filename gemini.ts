import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import os from "os";

import type { CommandLog, Config } from "./types";

let errorPrompt: CommandLog[];
const errorFile = path.join(os.homedir(), ".t_error");

let pathToApi = os.homedir() + "/.t.env";
let API_KEY = "";
if (fs.existsSync(pathToApi)) {
    API_KEY = (JSON.parse(fs.readFileSync(pathToApi, "utf-8")) as Config)
        .gemini_apiKey;
}
let genAI = new GoogleGenerativeAI(API_KEY as string);

let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const instructionForHm: string = `
- As an intelligent assistant, interpret the user's intent accurately. Provide precise shell commands in response, based on your analysis of the user's input and any errors they encountered.
- Your goal is to assist the user by giving them only the correct command they need to execute, formatted without explanations or additional details. Assume the user has a minimal shell environment installed and respond with the exact command they should run.
- Be concise and efficient, responding with only the command.
- platform ${process.platform}
- Be very smart
- Do not hallucinate
- **Note:** If you're unsure of the correct response, or prefer not to answer for any reason, reply only with the UUID: 3d8a19a704.
`;

const instructionForHp: string = `
- You are a command-line assistant, helping users run commands in a shell environment. Analyze the user's input and determine the exact shell command they need to execute, assuming they have a basic installation.
- Respond solely with the unformatted command line instruction, omitting any explanations or extraneous text.
- Focus on providing precise commands, interpreting user input efficiently and accurately to meet their needs.
- platform ${process.platform}
- Be very smart
- Do not hallucinate
- **Note:** If you're unsure of the correct response, or prefer not to answer for any reason, reply only with the UUID: 3d8a19a704.
`;

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
            API_KEY = (JSON.parse(fs.readFileSync(pathToApi, "utf-8")) as Config)
                .gemini_apiKey;
        }

        genAI = new GoogleGenerativeAI(API_KEY as string);

        model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    }

    try {
        const combinedPrompt: string = `${instructionForHm}\n${JSON.stringify(errorPrompt.at(-1))}`;
        const result = await model.generateContent(combinedPrompt);
        const responseText: string | undefined = result.response?.text();

        if (!responseText) {
            return "3d8a19a704";
        }

        const command: string = responseText?.split("\n")[0].trim() || "";

        if (command && command !== "3d8a19a704") {
            return command;
        } else {
            return "3d8a19a704";
        }
    } catch (error) {
        return "3d8a19a704";
    }
}

export async function generateCommandForHp(message: string) {
    if (!API_KEY) {
        let pathToApi = os.homedir() + "/.t.env";
        let API_KEY = "";
        if (fs.existsSync(pathToApi)) {
            API_KEY = (JSON.parse(fs.readFileSync(pathToApi, "utf-8")) as Config)
                .gemini_apiKey;
        }

        genAI = new GoogleGenerativeAI(API_KEY as string);

        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    try {
        const combinedPrompt: string = `${instructionForHp}\n${message}`;
        const result = await model.generateContent(combinedPrompt);

        const responseText: string | undefined = result.response.text();

        if (!responseText) {
            return "3d8a19a704";
        }

        const command: string = responseText?.split("\n")[0].trim() || "";

        if (command && command !== "3d8a19a704") {
            return command;
        } else {
            return "3d8a19a704";
        }
    } catch (error) {
        return "3d8a19a704";
    }
}

export async function betterMan(message: string) {
    if (!API_KEY) {
        let pathToApi = os.homedir() + "/.t.env";
        let API_KEY = "";
        if (fs.existsSync(pathToApi)) {
            API_KEY = (JSON.parse(fs.readFileSync(pathToApi, "utf-8")) as Config)
                .gemini_apiKey;
        }

        genAI = new GoogleGenerativeAI(API_KEY as string);

        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    try {
        const combinedPrompt: string = `You are a smart command-line assistant, the question the user has asked is -> \n${message}\n explain it to the user properly, if you cannot explain something just respond with 3d8a19a704 and nothing else, the output will be passed to a terminal so keep it clean`;
        const result = await model.generateContent(combinedPrompt);

        const responseText: string | undefined = result.response.text();

        if (!responseText) {
            return "3d8a19a704";
        }

        const command: string = responseText?.split("\n")[0].trim() || "";

        if (command && command !== "3d8a19a704") {
            return command;
        } else {
            return "3d8a19a704";
        }
    } catch (error) {
        return "3d8a19a704";
    }
}
