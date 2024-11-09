import chalk from "chalk";
import os from "os";
import fs, { existsSync } from "fs";
import path from "path";
import type { CommandLog } from "../types";

const formatPrompt = () => {
    const username = os.userInfo().username;
    const hostname = os.hostname();
    const currentDir = process.cwd();

    const homeDir = process.env.HOME;

    let pathDisplay = "";

    if (homeDir) {
        pathDisplay = currentDir.replace(homeDir, `${chalk.blue("~")}`);
    }

    const lastDir = pathDisplay.split("/").pop();

    if (lastDir) {
        pathDisplay = pathDisplay.replace(lastDir, chalk.green(lastDir));
    }

    return `${chalk.blue(username)}@${chalk.white(hostname)} ${pathDisplay}> `;
};

function showHistory() {
    const historyFile = path.join(os.homedir(), ".t_history");
    try {
        const history = fs.readFileSync(historyFile, "utf-8");
        console.log(history);
    } catch (err) {
        console.error(`Error reading history: ${err}`);
    }
}

function saveToHistory(command: string) {
    const HISTORY_LIMIT = 1000;
    const historyFile = path.join(os.homedir(), ".t_history");

    if (!fs.existsSync(historyFile)) {
        fs.writeFileSync(historyFile, "");
    }

    const history = fs.readFileSync(historyFile, "utf-8");
    let historyArray = history.trim().split("\n").filter(Boolean); // Remove empty lines

    const lastCommand = historyArray[historyArray.length - 1];
    if (lastCommand === command) {
        return;
    }

    historyArray.push(command);

    if (historyArray.length > HISTORY_LIMIT) {
        historyArray = historyArray.slice(-HISTORY_LIMIT);
    }

    fs.writeFileSync(historyFile, historyArray.join("\n") + "\n");
}

function saveOutputToFile(commandHistory: CommandLog[]) {
    const filePath = path.join(os.homedir(), ".t_error");

    if (existsSync(filePath)) {
        try {
            commandHistory = commandHistory.slice(-10);

            fs.writeFileSync(filePath, JSON.stringify(commandHistory, null, 2));
            console.log(chalk.green(`Output saved to ${filePath}`));
        } catch (err) {
            console.error(`Error saving output to file: ${err}`);
        }
    }
}

function catFile(command: string) {
    const [_, ...args] = command.split(" ");
    const file = args[0];
    try {
        const data = fs.readFileSync(file, "utf-8");
        console.log(data);
        saveToHistory(command);
    } catch (err) {
        console.error(`Error reading file: ${err}`);
    }
}

function changeDirectory(command: string) {
    const [_, ...args] = command.split(" ");

    if (args.length === 0) {
        const homeDir = os.homedir();
        try {
            process.chdir(homeDir);
            saveToHistory(command);
        } catch (err) {
            console.error(`Error changing directory: ${err}`);
        }
    } else {
        const directory = args[0];
        try {
            process.chdir(directory);
            saveToHistory(command);
        } catch (err) {
            console.error(`Error changing directory: ${err}`);
        }
    }
}

const aiErrorMessages = [
    "⟨ ×︵× ⟩",
    "⟨ ⊖︵⊖ ⟩",
    "⟨ ⊗︵⊗ ⟩",
    "【 ◑︵◐ 】",
    "⦗ ⊘︵⊘ ⦘",
    "[⊗ _ ⊗]",
    "⦅ •︵• ⦆",
    "⟦ ⊖﹏⊖ ⟧",
    "⟨ ⊝︵⊝ ⟩",
    "【 ⊛︵⊛ 】",
    "⦗ ⊕︵⊕ ⦘",
    "⟦ ⊗﹏⊗ ⟧",
    "⦅ ◉︵◉ ⦆",
    "⟨ ⊜﹏⊜ ⟩",
    "【 ⊛﹏⊛ 】",
];

function getRandomErrorMessage(): string {
    return aiErrorMessages[Math.floor(Math.random() * aiErrorMessages.length)];
}

export {
    formatPrompt,
    catFile,
    saveOutputToFile,
    showHistory,
    saveToHistory,
    changeDirectory,
};
