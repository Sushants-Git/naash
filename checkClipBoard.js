import { sleep } from "bun";
import clipboard from "clipboardy";
import { parentPort } from "worker_threads";

function extractGithubRepoUrls(text) {
    const pattern = /https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/g;
    return text.match(pattern)?.at(0) || "";
}

async function checkClipBoard() {
    let oldText = "";

    while (true) {
        let val = clipboard.readSync();

        if (oldText !== val) {
            if (val.includes("git")) {
                let link = extractGithubRepoUrls(val);
                if (link) {
                    parentPort.postMessage(`git clone ${link}`);
                    oldText = val;
                }
            }
        }

        await sleep(2000);
    }
}

checkClipBoard();
