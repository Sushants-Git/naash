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

let lastCommandOutput = "";

prompt();

function prompt() {
    rl.question(formatPrompt(), (command) => {
        runShellCommand(command);
    });
}

function runShellCommand(command: string) {
    const [cmd, ..._] = command.split(" ");

    if (cmd === "cd") {
        changeDirectory(command);
        prompt();
    } else if (cmd === "history") {
        saveToHistory(command);
        prompt();
    } else if (cmd === "cat") {
        catFile(command);
        prompt();
    } else if (cmd === "exit") {
        rl.close();
    } else if (cmd === "copy") {
        saveOutputToFile();
    } else {
        runTheCommand(command);
    }
}

// function runTheCommand(command: string) {
//     const [cmd, ...args] = command.split(" ");
//     try {
//         const process = spawn(cmd, args, { stdio: "inherit" });
//         process.on("close", (code) => {
//             prompt();
//             if (code === 0) {
//                 saveToHistory(command);
//             } else {
//                 console.error(`Command exited with code ${code}`);
//             }
//         });
//     } catch (err) {
//         console.error(`Error executing command: ${err}`);
//         prompt();
//     }
// }

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

function runTheCommand(command: string) {
    const [cmd, ...args] = command.split(" ");
    try {
        const process = spawn(cmd, args, { stdio: "inherit" });
        lastCommandOutput = "";

        // process.stdout.on("data", (data) => {
        //     lastCommandOutput += data.toString();
        //     process.stdout.write(data);
        // });

        // process.stderr.on("data", (data) => {
        //     lastCommandOutput += data.toString();
        //     process.stderr.write(data);
        // });

        process.on("close", (code) => {
            if (code === 0) saveToHistory(command);
            else console.error(`Command exited with code ${code}`);
            prompt();
        });
    } catch (err) {
        console.error(`Error executing command: ${err}`);
        prompt();
    }
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

function saveOutputToFile() {
    const filePath = path.join(os.homedir(), "test");
    try {
        fs.writeFileSync(filePath, lastCommandOutput);
        console.log(chalk.green(`Output saved to ${filePath}`));
    } catch (err) {
        console.error(`Error saving output to file: ${err}`);
    }
    prompt();
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
