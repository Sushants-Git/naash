import chalk from "chalk";
import os from "os";

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

export default formatPrompt;
