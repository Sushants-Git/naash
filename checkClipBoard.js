import { sleep } from "bun";
import clipboard from "clipboardy";
import { parentPort } from "worker_threads";

function extractGithubRepoUrls(text) {
    const pattern = /https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/g;
    return text.match(pattern)?.at(0) || "";
}

function extractNpmPackageUrl(text) {
    const pattern = /https:\/\/(?:www\.)?npmjs\.com\/package\/[@A-Za-z0-9_.-]+/g;
    return text.match(pattern)?.at(0) || "";
}

function extractBrewPackageUrl(text) {
    const pattern =
        /https:\/\/(?:www\.)?formulae\.brew\.sh\/formula\/[A-Za-z0-9_.-]+/g;
    return text.match(pattern)?.at(0) || "";
}

function extractUrls(text) {
    const urlPattern = /https?:\/\/[^\s]+/g;
    return text.match(urlPattern)?.at(0) || "";
}

function isDownloadableUrl(url) {
    const fileExtensions = [
        ".zip",
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".mp3",
        ".mp4",
        ".wav",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".csv",
        ".txt",
        ".json",
        ".xml",
        ".deb"
    ];
    return fileExtensions.some((ext) => url.toLowerCase().endsWith(ext));
}

async function checkClipBoard() {
    let oldText = "";
    while (true) {
        let val = clipboard.readSync();
        if (oldText !== val) {
            if (val.includes("github")) {
                let link = extractGithubRepoUrls(val);
                if (link) {
                    parentPort.postMessage(`git clone ${link}`);
                    oldText = val;
                }
            } else if (val.includes("npmjs")) {
                let link = extractNpmPackageUrl(val);
                if (link) {
                    const packageName = link.split("/package/")[1];
                    parentPort.postMessage(`npm install ${packageName}`);
                    oldText = val;
                }
            } else if (val.includes("brew")) {
                let link = extractBrewPackageUrl(val);
                if (link) {
                    const formulaName = link.split("/formula/")[1];
                    parentPort.postMessage(`brew install ${formulaName}`);
                    oldText = val;
                }
            } else {
                let url = extractUrls(val);
                if (url) {
                    if (isDownloadableUrl(url)) {
                        parentPort.postMessage(getWgetCommand(url));
                    } else {
                        parentPort.postMessage(`wget ${url}`);
                    }
                    oldText = val;
                }
            }
        }
        await sleep(1000);
    }
}

function getFilenameFromUrl() {
    return `yaash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getWgetCommand(url) {
    const filename = getFilenameFromUrl();

    if (url.endsWith(".zip")) {
        return `wget -O "${filename}" "${url}" && unzip "${filename}"`;
    } else if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return `wget -P ./images "${url}"`;
    } else {
        return `wget "${url}"`;
    }
}

checkClipBoard();
