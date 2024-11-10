# NAASH (Not another AI shell)
---

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

- if you do not have a `open ai` key you can just use the `gemini_apiKey` but you won't be able to use the `switchAI` command.

## Features
- [x] Look through users clipboard hitory, to auto suggest commands, eg: if the url has `https://github.com/Sushants-Git/team-gap` then auto suggest `git clone https://github.com/Sushants-Git/team-gap` and same for `wget`, `npm`, `brew` and more.
- [x] `hm` (help me), look through `naash` custom error stack that stores all terminal errors that a user has encountered, and using that to suggest a correct command and getting it copied straight to users clipboard.
- [x] `hp` (help prompt), convert natural language to commands.
- [x] `he` (help explain), explain things about the terminal that the user wants to know.
- [x] Multi-Model, no vendor look in you can switch between `openai` and `gemini` models.


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
