# NAASH (Not another AI shell)

This was made as a hackathon project for [HackThisFall 2024](https://devfolio.co/projects/yaash-yet-another-ai-shell-192b) by [Vee](https://github.com/veesesh), [Ashish Malla](https://github.com/im45145v), [Siddarth](https://github.com/siddarth2810) and [Sushant](https://github.com/Sushants-Git)

Always Two command ahead. A Shell faster than your thoughts.

![image](https://github.com/user-attachments/assets/91130dd2-63f2-4d16-8d3c-ff2c26538de6)

## Problem
Shells are supposed to be fast, but integrating AI in them makes them slow. So, we combined the capadilities of a users clipboard and ai models to make this super fasttt.

![image](https://github.com/user-attachments/assets/83c7c5d6-eec8-4fdb-95f5-20ab8ff3ad04)


## Configure 

- Create a `.t.env` file in your home directory.

```bash
{
  # gemini
  "gemini_apiKey":"API_KEY",

  # open ai
  "azure_endpoint": "API_ENDPOINT",
  "azure_apiKey": "API_KEY_OPENAI",
  "azure_deploymentName": "API_DEPLOYMENT_NAME",
}
```

## Installation 

- To install dependencies:

```bash
bun install
```

- Link the cli

```bash
bun link
```

```bash
bun link cli
```

- Usuage

```bash
naash
```

- if you do not have a `open ai` key you can just use the `gemini_apiKey` but you won't be able to use the `switchAI` command.

## Features
- [x] Look through users clipboard hitory, to auto suggest commands, eg: if the url has `https://github.com/Sushants-Git/team-gap` then auto suggest `git clone https://github.com/Sushants-Git/team-gap` and same for `wget`, `npm`, `brew` and more.
![image](https://github.com/user-attachments/assets/5bc303c7-6ca6-4ef5-86f3-d5d72abe3102)

- [x] `hm` (help me), look through `naash` custom error stack that stores all terminal errors that a user has encountered, and using that to suggest a correct command and getting it copied straight to users clipboard.
![image](https://github.com/user-attachments/assets/920c06d1-4bd4-4ab9-96a2-86e129552a82)

- [x] `hp` (help prompt), convert natural language to commands.
![image](https://github.com/user-attachments/assets/706c683a-8a11-44bc-b0f6-2ff4a5483f01)

- [x] `he` (help explain), explain things about the terminal that the user wants to know.
  ![image](https://github.com/user-attachments/assets/ece40910-b4e3-47ab-86dd-92064ed47f49)

- [x] Multi-Model, no vendor look in you can switch between `openai` and `gemini` models.
![image](https://github.com/user-attachments/assets/c03479e8-dc86-48d7-8762-20a87b19f68d)


