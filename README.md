# AgentTest

This repository is currently a minimal test repository for experimenting with Copilot custom agents.

## Agents

- **Annotated Response** - Formats every response with the current timestamp and model name.
- **Caveman** - Replies with very simple words, short sentences, and minimal text.
- **Cross-Surface** - Demonstrates how different surfaces (VS Code and Copilot CLI) handle lists of multiple preferred models, including some that are not valid.
- **Long Description Test** - Provides a general-purpose agent with an intentionally long description for testing agent metadata across Copilot surfaces.
- **Pirate** - Replies with pirate speech, nautical slang, and a swashbuckling tone. After answering, the Pirate agent always asks whether the user would like to hand off to the Caveman agent for an additional answer.

## Interactive workflow experiment

Run `/pirate-caveman` in the Copilot CLI. The Dynamic Workflow selects Pirate and asks how it can help. Chat with Pirate normally; after answering, Pirate offers a Caveman answer. Reply **yes** to let the extension resume the paused workflow, select Caveman, and ask Caveman to answer the same prompt from the conversation history. Outside this experiment, Pirate's existing handoff control and manual instructions still apply. Starting `/pirate-caveman` again cancels any earlier paused run of this experiment.

## Contents

- `.github/agents/` - Copilot agent configuration files
- `.github/hooks/` - Hooks that append stop and session-end payloads, including the hook trigger, to `debug.log`

As additional code or documentation is added, this README should be updated to reflect the repository structure and purpose.
