#! /usr/bin/env bun

import chalk from "chalk";
import {
    formatPrompt,
    catFile,
    saveOutputToFile,
    showHistory,
    saveToHistory,
    changeDirectory,
} from "./util/util.ts";
import stripAnsi from "strip-ansi";

import readline from "readline";
import { spawn } from "child_process";
import os from "os";
import fs from "fs";
import path from "path";
import { generateCommandForHm, generateCommandForHp } from "./prompt.ts";

import CompactAISpinner from "./spinner";

import { type CommandLog } from "./types.ts";
import clipboard from "clipboardy";

const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

interface ReadLineWithHint extends readline.Interface {
    _refreshLine(): void;
    line: string;
    cursor: number;
}

let currentSuggestion: string = "";
const historyFile = path.join(os.homedir(), ".t_history");

let historicalCommands: string[] = [];
let currentSessionCommands: string[] = [];

try {
    if (fs.existsSync(historyFile)) {
        historicalCommands = fs
            .readFileSync(historyFile, "utf-8")
            .split("\n")
            .filter(Boolean);
    }
} catch (err) {
    console.error(`Error reading history: ${err}`);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
}) as ReadLineWithHint;

const originalRefreshLine = rl._refreshLine.bind(rl);

let commandLog: CommandLog[] = loadCommandErrors();

console.log(
    chalk.bold(`
               Welcome to your AI-Powered Terminal CLI! 🤖💻
               `),
);

prompt();

rl._refreshLine = () => {
    if (currentSuggestion && rl.line) {
        const promptLength = stripAnsi(formatPrompt()).length;
        const currentLine = rl.line;
        const currentCursor = rl.cursor;

        process.stdout.write("\r\x1b[2K");

        process.stdout.write(formatPrompt());

        process.stdout.write(currentLine.slice(0, currentCursor));

        if (currentSuggestion.startsWith(currentLine)) {
            process.stdout.write(
                DIM + currentSuggestion.slice(currentCursor) + RESET,
            );
        }

        process.stdout.cursorTo(promptLength + currentCursor);
    } else {
        originalRefreshLine();
    }
};

let suggestionAccepted = false;

process.stdin.on("keypress", (char, key) => {
    if (!key) return;

    if (key.name === "tab" && currentSuggestion) {
        rl.line = currentSuggestion;
        rl.cursor = rl.line.length;
        currentSuggestion = "";
        suggestionAccepted = true;
        rl._refreshLine();
    } else if (key.name === "escape") {
        currentSuggestion = "";
        rl._refreshLine();
    } else if (
        key.name === "left" ||
        key.name === "right" ||
        key.name === "backspace" ||
        key.name === "delete"
    ) {
        if (suggestionAccepted) {
            currentSuggestion = "";
            suggestionAccepted = false;
            rl._refreshLine();
        }
    } else if (key.name !== "return") {
        process.nextTick(() => {
            updateSuggestion(rl.line);
            suggestionAccepted = false;
        });
    }
});

function generateId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function loadCommandErrors(): CommandLog[] {
    const filePath = path.join(os.homedir(), ".t_error");
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, "utf-8");
            return JSON.parse(data);
        }
    } catch (err) {
        console.error(`Error loading command history: ${err}`);
    }
    return [];
}

function prompt() {
    rl.question(formatPrompt(), (command) => {
        runShellCommand(command);
    });
}

function updateSuggestion(input: string) {
    if (!input.trim()) {
        currentSuggestion = "";
        return;
    }

    const cursorPos = rl.cursor;
    const textBeforeCursor = input.slice(0, cursorPos);
    const commonCommands = [
        "git status",
        "git add .",
        "git commit -m",
        "git push origin",
        "npm install",
        "npm run dev",
        "ls -la",
        "cd ..",
        "docker ps",
        "docker-compose up",
        "history",
        "exit",
    ];

    const searchText = textBeforeCursor.toLowerCase();

    currentSuggestion =
        currentSessionCommands.findLast((cmd) =>
            cmd.toLowerCase().startsWith(searchText),
        ) || "";

    if (!currentSuggestion) {
        currentSuggestion =
            historicalCommands.findLast((cmd) =>
                cmd.toLowerCase().startsWith(searchText),
            ) || "";
    }

    if (!currentSuggestion) {
        currentSuggestion =
            commonCommands.findLast((cmd) =>
                cmd.toLowerCase().startsWith(searchText),
            ) || "";
    }

    currentSuggestion = currentSuggestion || "";

    rl._refreshLine();
}

async function runShellCommand(command: string) {
    const [cmd, ...args] = command.split(" ");

    if (cmd === "cd") {
        currentSessionCommands.push(command);
        saveToHistory(command);

        changeDirectory(command);
        prompt();
    } else if (cmd === "history") {
        showHistory();
        prompt();
    } else if (cmd === "cat") {
        currentSessionCommands.push(command);
        saveToHistory(command);

        catFile(command);
        prompt();
    } else if (cmd === "exit") {
        rl.close();
    } else if (cmd === "copy") {
        saveOutputToFile(commandLog);
        prompt();
    } else if (cmd === "hm") {
        if (await checkKey()) {
            const spinner = new CompactAISpinner();

            spinner.start("Processing data...");

            let res = await askGemini("hm");

            spinner.stop();

            console.log(res);

            if (res) {
                clipboard.writeSync(res);
            }
        }

        prompt();
    } else if (cmd === "hp") {
        if (await checkKey()) {
            if (args.length === 0) {
                console.log("Hey you did not enter a message.");
                prompt();
            }

            let message = args.join(" ");

            const spinner = new CompactAISpinner();

            spinner.start("Processing data...");

            let res = await askGemini("hp", message);

            spinner.stop();

            console.log(res);

            if (res) {
                clipboard.writeSync(res);
            }
        }

        prompt();
    } else {
        runTheCommand(command);
    }
}

async function askGemini(to: "hm" | "hp", message?: string) {
    if (to === "hm") {
        return await generateCommandForHm();
    } else if (to === "hp" && message) {
        return await generateCommandForHp(message);
    }
}

function runTheCommand(command: string) {
    const [cmd, ...args] = command.split(" ");

    const logEntry = logInit(command);

    try {
        const pro = spawn(cmd, args, {
            stdio: ["inherit", "inherit", "pipe"],
            env: { ...process.env },
            cwd: logEntry.command.cwd,
        });

        pro.stderr.on("data", (data) => {
            console.error(data.toString());
            logEntry.output.stderr += stripAnsi(data.toString());
        });

        pro.on("error", (error) => {
            logEntry.output.error = stripAnsi(error.message);
            logEntry.output.exitCode = 1;
            console.error(chalk.red(error.message));
            commandLog.push(logEntry);
            saveOutputToFile(commandLog);
            prompt();
        });

        pro.on("close", (code) => {
            logEntry.output.exitCode = code || 0;

            if (code !== 0) {
                commandLog.push(logEntry);
                saveOutputToFile(commandLog);
            }

            saveToHistory(command);
            currentSessionCommands.push(command);
            prompt();
        });
    } catch (err) {
        logEntry.output.error = (err as Error).message;
        logEntry.output.exitCode = 1;
        console.error(chalk.red(`Error executing command: ${err}`));
        commandLog.push(logEntry);
        saveOutputToFile(commandLog);
        prompt();
    }
}

function logInit(command: string) {
    const [cmd, ...args] = command.split(" ");

    const logEntry: CommandLog = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        command: {
            raw: command,
            executable: cmd,
            arguments: args,
            cwd: process.cwd(),
        },
        output: {
            stderr: "",
            exitCode: 0,
        },
        metadata: {
            user: os.userInfo().username,
            platform: process.platform,
            shell: process.env.SHELL || "unknown",
        },
    };

    return logEntry;
}

// function checkKey() {
//     let pathToApi = os.homedir() + "/.t.env";
//     let API = "";
//     if (!fs.existsSync(pathToApi)) {
//         console.log("⟨ ◠︰◠ ⟩ API key not found.");
//         return false;
//     }
//     return true;
// }

async function checkKey(): Promise<boolean> {
    const pathToApi = path.join(os.homedir(), ".t.env");

    // If the API key file already exists, return true
    if (fs.existsSync(pathToApi)) {
        return true;
    }

    console.log("⟨ ×︵× ⟩ API key not found.");

    // Prompt the user for their API key
    const apiKey = await new Promise<string>((resolve) => {
        rl.question("⟨ ◠︰◠ ⟩ Please enter your API key: ", (answer) => {
            resolve(answer.trim());
        });
    });

    if (!apiKey) {
        console.log("⟨ ×︵× ⟩ API key cannot be empty");
        return false;
    }

    // Try saving the API key to the file
    try {
        fs.writeFileSync(pathToApi, apiKey);
        console.log("⟨ ◠︶◠ ⟩ API key saved successfully!");
        return true;
    } catch (err) {
        console.error("⟨ ⊗︵⊗ ⟩ Error saving API key:", err);
        return false;
    }
}
