#! /usr/bin/env bun

import chalk from "chalk";
import formatPrompt from "./util/util.ts";
import readline from "readline";
import { exec, spawn } from "child_process";
import os from "os";
import fs from "fs";
import path from "path";

console.log(
    chalk.bold(`
    Welcome to your AI-Powered Terminal CLI! 🤖💻
    `),
);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

prompt();

function prompt() {
    rl.question(formatPrompt(), (command) => {
        runShellCommand(command);
    });
}

function runShellCommand(command: string) {
    const [cmd, ...args] = command.split(" ");
    if (cmd === "cd") {
        changeDirectory(command);
    } else if (cmd === "history") {
        const historyFile = path.join(os.homedir(), ".t_history");
        try {
            const data = fs.readFileSync(historyFile, "utf-8");
            console.log(data);
        } catch (err) {
            console.error(`Error reading history file: ${err}`);
        }
        prompt();
    } else {
        try {
            const process = spawn(cmd, args, { stdio: "inherit" });
            process.on("close", (code) => {
                if (code === 0) {
                    saveToHistory(command);
                } else {
                    console.error(`Command exited with code ${code}`);
                }
                prompt();
            });
        } catch (err) {
            console.error(`Error executing command: ${err}`);
            prompt();
        }
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
    prompt();
}

function saveToHistory(command: string) {
    const historyFile = path.join(os.homedir(), ".t_history");
    if (!fs.existsSync(historyFile)) {
        fs.writeFileSync(historyFile, "");
    }
    const history = fs.readFileSync(historyFile, "utf-8");
    const historyArray = history.split("\n");
    const lastCommand = historyArray[historyArray.length - 2];
    if (lastCommand !== command) {
        fs.appendFileSync(historyFile, `${command}\n`);
    }
}
