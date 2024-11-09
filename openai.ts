import fs from "fs";
import path from "path";
import os from "os";

import type { CommandLog, Config } from "./types";

interface OpenAIResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

let errorPrompt: CommandLog[];
const errorFile = path.join(os.homedir(), ".t_error");

let config: Config;
const configPath = path.join(os.homedir(), ".t.env");

try {
    if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, "utf-8");
        config = JSON.parse(configData);
    } else {
        throw new Error("Configuration file not found");
    }
} catch (error) {
    console.error("Error reading configuration:", error);
    process.exit(1);
}

const instructionForHm: string = `
- **Note:** If you're unsure of the correct response, or prefer not to answer for any reason, reply only with the UUID: 3d8a19a704.
- As an intelligent assistant, interpret the user's intent accurately. Provide precise shell commands in response, based on your analysis of the user's input and any errors they encountered.
- Your goal is to assist the user by giving them only the correct command they need to execute, formatted without explanations or additional details. Assume the user has a minimal shell environment installed and respond with the exact command they should run.
- Be concise and efficient, responding with only the command.
- platform ${process.platform}
`;

const instructionForHp: string = `
- **Note:** If you're unsure of the correct response, or prefer not to answer for any reason, reply only with the UUID: 3d8a19a704.
- You are a command-line assistant, helping users run commands in a shell environment. Analyze the user's input and determine the exact shell command they need to execute, assuming they have a basic installation.
- Respond solely with the unformatted command line instruction, omitting any explanations or extraneous text.
- Focus on providing precise commands, interpreting user input efficiently and accurately to meet their needs.
- platform ${process.platform}
`;

async function callAzureOpenAI(prompt: string): Promise<string> {
    try {
        const response = await fetch(
            `${config.azure_endpoint}openai/deployments/${config.azure_deploymentName}/chat/completions?api-version=2023-05-15`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": config.azure_apiKey,
                },
                body: JSON.stringify({
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 100,
                    temperature: 0.7,
                }),
            },
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as OpenAIResponse;
        return data.choices[0]?.message.content || "3d8a19a704";
    } catch (error) {
        console.error("Error calling Azure OpenAI:", error);
        return "3d8a19a704";
    }
}

export async function generateCommandForHmOpenAi(): Promise<string> {
    try {
        if (fs.existsSync(errorFile)) {
            const data = fs.readFileSync(errorFile, "utf-8");
            if (data.trim() === "") {
                console.error("File is empty.");
                return "3d8a19a704";
            }
            errorPrompt = JSON.parse(data);
        }

        const combinedPrompt: string = `${instructionForHm}\n${JSON.stringify(errorPrompt.at(-1))}`;
        const response = await callAzureOpenAI(combinedPrompt);

        const command: string = response.split("\n")[0].trim();
        return command && command !== "3d8a19a704" ? command : "3d8a19a704";
    } catch (error) {
        console.error("Error generating command:", error);
        return "3d8a19a704";
    }
}

export async function generateCommandForHpOpenAi(
    message: string,
): Promise<string> {
    try {
        const combinedPrompt: string = `${instructionForHp}\n${message}`;
        const response = await callAzureOpenAI(combinedPrompt);

        const command: string = response.split("\n")[0].trim();
        return command && command !== "3d8a19a704" ? command : "3d8a19a704";
    } catch (error) {
        console.error("Error generating command:", error);
        return "3d8a19a704";
    }
}

export async function betterManOpenAi(message: string) {
    try {
        const combinedPrompt: string = `You are a smart command-line assistant, the question the user has asked is -> \n${message}\n explain it to the user properly, if you cannot explain something just respond with 3d8a19a704 and nothing else, the output will be passed to a terminal so keep it clean`;
        const response = await callAzureOpenAI(combinedPrompt);

        const command: string = response.split("\n")[0].trim();
        return command && command !== "3d8a19a704" ? command : "3d8a19a704";
    } catch (error) {
        console.error("Error generating command:", error);
        return "3d8a19a704";
    }
}
