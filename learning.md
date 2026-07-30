# Learning Path: GitHub Copilot Custom Agents

A guided path for someone brand new to Copilot agents. Work through the stages in
order; each one builds on the previous. Every stage lists what to learn, what to
try, and how to tell you're ready to move on.

Research for this document was gathered by a sub-agent from the official GitHub
and VS Code documentation. Links to primary sources are included throughout so
you can go deeper on any topic.

---

## Stage 0 — Orientation: the customization landscape

Before writing anything, learn the vocabulary. Copilot has several
customization mechanisms that are easy to confuse:

| Mechanism | File location | When it applies |
| --- | --- | --- |
| Custom instructions | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`, `AGENTS.md` | Always on, automatically |
| Prompt files | `.github/prompts/*.prompt.md` | Manually invoked for one task |
| Custom agents | `.github/agents/NAME.agent.md` | Manually selected persona with its own tools |
| Subagents | Same agent files, invoked by another agent | Delegated work in an isolated context |
| Skills | `.github/skills/<name>/SKILL.md` | Auto-loaded capability bundles |
| Hooks | `.github/hooks/*.json` | Deterministic lifecycle commands |
| MCP servers | Agent frontmatter or repo settings | Access to external systems |

**Read:** [Customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet)

**Checkpoint:** You can explain, in one sentence each, the difference between
instructions, prompt files, and custom agents.

---

## Stage 1 — Custom instructions and `AGENTS.md`

Instructions are the cheapest, highest-leverage customization: they apply to
every request without anyone having to remember to opt in.

Learn:

- Repo-wide instructions live in `.github/copilot-instructions.md`.
- Path-specific instructions live in `.github/instructions/**/*.instructions.md`
  and use an `applyTo` glob in frontmatter.
- Agent instruction files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) are also read.
- Precedence, highest to lowest: personal → path-specific → repo-wide →
  `AGENTS.md` → organization instructions.
- Instructions that tend to *fail*: pointing at files in other repositories,
  referencing chat participants like `@terminal`, and mandating response style
  or length.

Practice: write an `AGENTS.md` for a repo you know. Aim for roughly six
sections — project overview, build/test commands (with exact flags, early in the
file), code style, testing expectations, security boundaries, and PR rules. Show
short code examples instead of prose, and state hard boundaries explicitly
("never modify generated files under `src/gen/`").

**Read:**
[Response customization](https://docs.github.com/en/copilot/concepts/prompting/response-customization) ·
[Instructions support matrix](https://docs.github.com/en/copilot/reference/custom-instructions-support) ·
[How to write a great AGENTS.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

**Checkpoint:** Your instructions file changes Copilot's behavior in a way you
can observe (for example, it now runs the right test command unprompted).

---

## Stage 2 — Prompt files for repeatable tasks

Prompt files package a repeatable request. They live in
`.github/prompts/*.prompt.md` and are invoked with `/promptname`.

Learn the frontmatter: `description`, `name`, `argument-hint`, `agent`
(`ask`, `agent`, `plan`, or a custom agent), `model`, and `tools`. Learn the
input variables: `${input:name}`, `${input:name:placeholder}`, `${selection}`,
`${file}`, `${workspaceFolder}`.

Note the support gap: prompt files work in VS Code, Visual Studio, and JetBrains,
but **not** on GitHub.com or in Copilot CLI.

Practice: turn a task you repeat weekly (release notes, a scaffolding chore, a
review checklist) into a prompt file. `/create-prompt` in VS Code can generate a
first draft for you.

**Read:** [Prompt files](https://code.visualstudio.com/docs/agent-customization/prompt-files)

**Checkpoint:** You can run your prompt file with an argument and get a
consistent result twice in a row.

---

## Stage 3 — Your first custom agent

A custom agent is a Markdown file with YAML frontmatter that encodes a persona,
its allowed tools, and optionally its MCP servers. The same file works on
GitHub.com, in VS Code, in Copilot CLI, and (in preview) in JetBrains, Eclipse,
and Xcode.

Where agent files live:

- Repository: `.github/agents/NAME.md` or `.github/agents/NAME.agent.md`
- Organization: `/agents/NAME.md` in the org's `.github` or `.github-private` repo
- Enterprise: `/agents/NAME.md` in the designated `.github-private` repo
- Personal (VS Code and CLI): `~/.copilot/agents/`

When names collide, the most local definition wins: repository beats
organization beats enterprise. Agent versions are tracked by git commit SHA, so
a branch can carry a different version of an agent than the default branch.
Filenames may use letters, digits, `.`, `-`, and `_`; the prompt body is capped
at 30,000 characters.

Key frontmatter fields:

| Field | Meaning |
| --- | --- |
| `description` | **Required.** Purpose of the agent; also used to auto-infer when to use it |
| `name` | Display name; defaults to the filename |
| `target` | `vscode`, `github-copilot`, or unset for both |
| `tools` | Array or comma-separated string; unset means all tools, `[]` means none |
| `model` | Model to run the agent with |
| `disable-model-invocation` | `true` means the agent is only chosen manually |
| `user-invocable` | `false` means only other agents can call it |
| `mcp-servers` | Per-agent MCP server definitions (cloud agent only) |

Tool names are case-insensitive aliases: `execute` (shell/bash/powershell),
`read`, `edit`, `search`, `agent` (invoke another custom agent), `web`, and
`todo`. Unknown tool names are ignored.

Practice: follow the official tutorial and build a small
`readme-specialist.agent.md`, commit it, then select it from the agents tab and
give it a task. This repository's own
[`.github/agents/caveman.agent.md`](.github/agents/caveman.agent.md) is a
minimal example worth reading.

**Read:**
[About custom agents](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents) ·
[Custom agents configuration reference](https://docs.github.com/en/copilot/reference/custom-agents-configuration) ·
[Create custom agents](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents) ·
[Your first custom agent](https://docs.github.com/en/copilot/tutorials/customization-library/custom-agents/your-first-custom-agent)

**Checkpoint:** You have an agent that appears in the agent picker and visibly
behaves differently from the default agent.

---

## Stage 4 — Custom agents in VS Code

VS Code's "chat modes" were renamed to custom agents; a `.chatmode.md` file just
needs renaming to `.agent.md`. Any `.md` file in `.github/agents` counts.

VS Code adds fields the cloud agent ignores: `argument-hint`, `agents` (which
subagents are allowed), `handoffs` (suggested next agents with a label, prompt,
and optional model), and preview `hooks`. `model` may be an array to express
fallback order. Extra search paths come from `chat.agentFilesLocations`;
monorepos may need `chat.useCustomizationsInParentRepositories`. Claude-format
agents in `.claude/agents/*.md` are also recognized.

Create agents with `/agents`, the **Chat: New Custom Agent** command, or
`/create-agent` to have Copilot draft one.

**Read:** [VS Code custom agents](https://code.visualstudio.com/docs/agent-customization/custom-agents)

**Checkpoint:** You can switch between two of your own agents in VS Code chat
and explain why each has the tools it has.

---

## Stage 5 — Subagents and delegation

A subagent runs in its own context window; the parent agent only receives the
final summary. This keeps a long research task from flooding the main
conversation.

Learn:

- The parent needs the `agent` tool to spawn subagents.
- Nested subagents are off by default
  (`chat.subagents.allowInvocationsFromSubagents`), with a maximum depth of 5.
- Model selection order for a subagent: explicit parameter → the agent's own
  `model` → the parent's model. A subagent cannot exceed the parent's cost tier.
- Copilot CLI ships built-in subagents: `explore`, `task`, `general-purpose`,
  `code-review`, `research`, and `rubber-duck`.
- Subagents are not available in Visual Studio or on GitHub.com.

Practice: build a narrow research agent with `user-invocable: false` and have a
"planner" agent delegate to it. That is exactly the pattern used to research
this document.

**Checkpoint:** A parent agent successfully delegates and summarizes subagent
output.

---

## Stage 6 — The cloud agent (formerly "coding agent")

The cloud agent runs in an ephemeral GitHub Actions environment: it researches,
plans, edits a branch, and opens a pull request.

Learn the entry points — the agents panel at
`https://github.com/copilot/agents`, assigning an issue to Copilot, `@copilot`
in a PR comment, `/task` in Chat, automations, and security campaign alerts.

Learn the hard limits: one repository, one branch, and one PR per task; a
maximum session length of 59 minutes; content exclusions are not honored;
GitHub-hosted repositories only. Sessions consume both Actions minutes and AI
credits. The PR description records which custom agent was used.

**Read:** [About the cloud agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent)

**Checkpoint:** You have assigned an issue to Copilot and reviewed the resulting
pull request.

---

## Stage 7 — Environment setup and MCP

**Environment.** Preinstall dependencies with
`.github/workflows/copilot-setup-steps.yml`. The job must be named
`copilot-setup-steps` and the file must exist on the default branch. Honored
keys are `steps`, `permissions`, `runs-on`, `services`, `snapshot`, and
`timeout-minutes` (59 max). A failing step skips the rest but the agent still
runs. Ubuntu x64 and Windows x64 only — no macOS. Validate it with
`workflow_dispatch` from the Actions tab.

**MCP.** Model Context Protocol servers connect agents to external systems. The
cloud agent ships with read-only `github/*` (scoped to the source repo) and
`playwright/*` (localhost only). Per-agent servers are declared under
`mcp-servers` in the agent frontmatter:

```yaml
---
name: my-custom-agent-with-mcp
description: Custom agent description
tools: ['read', 'edit', 'custom-mcp/tool-1']
mcp-servers:
  custom-mcp:
    type: 'local'
    command: 'some-command'
    args: ['--arg1', '--arg2']
    tools: ["*"]
    env:
      ENV_VAR_NAME: ${{ secrets.COPILOT_MCP_ENV_VAR_VALUE }}
---
```

Configuration merges in the order: built-in servers → agent profile → repository
settings, with later sources overriding earlier ones. MCP tools are called
*without* approval in the cloud agent, so allowlist read-only tools only. OAuth
remote servers are unsupported, and the MCP policy is off by default for
Business and Enterprise plans.

**Read:**
[Customize the agent environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment) ·
[About MCP](https://docs.github.com/en/copilot/concepts/context/mcp) ·
[Configure MCP servers](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/configure-mcp-servers)

**Checkpoint:** A setup-steps workflow runs green, and you can name the risk of
allowing a write-capable MCP tool.

---

## Stage 8 — Security and safe operation

Do not skip this stage — it is what makes agents safe to enable for a team.

Built-in protections: CodeQL scanning, GitHub Advisory Database dependency
checks (malware and High/Critical CVSS), secret scanning, and a second-opinion
Copilot code review — none of which require a GHAS license.

Guardrails to understand:

- Only users with write access can trigger the agent; comments from others never
  reach it.
- The agent pushes only to its own `copilot/` branch or the PR branch. It cannot
  run raw `git push`, mark a PR ready, approve, or merge — and the person who
  requested the work cannot approve its PR.
- Actions workflows on agent PRs require a human "Approve and run workflows".
- Hidden characters and HTML comments are filtered to mitigate prompt injection,
  but injection (OWASP LLM01) remains a real risk.
- The firewall limits internet access but does **not** cover MCP servers or
  `copilot-setup-steps` processes, and applies only inside the Actions
  appliance. Allowlists are by domain or URL prefix; disabling it grants full
  internet access.
- Secrets use a dedicated **Agents** secret type. The agent cannot read Actions,
  Codespaces, or Dependabot secrets. `COPILOT_MCP_*` secrets are visible only to
  MCP servers, names cannot start with `GITHUB_`, and values are masked in logs.
- Commits are authored by Copilot with a human co-author, are signed and
  "Verified", link to the session log, and appear in the audit log.

**Read:**
[Risks and mitigations](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations) ·
[Customize the firewall](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-the-firewall) ·
[Configure secrets and variables](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/configure-secrets-and-variables)

**Checkpoint:** You can list three guardrails and one residual risk.

---

## Stage 9 — Iterating and getting good results

- Test agent changes on a branch: the agent version is tied to the commit SHA,
  so a branch can exercise an in-progress agent definition. Copilot code review
  likewise reads instructions and skills from the head branch, so you can test
  them within the same PR.
- Steer a running session with a follow-up message (this costs credits).
  Stopping a session preserves the commits already made.
- Batch PR feedback using "Start a review" rather than posting single comments.
- Good first tasks: bug fixes, tests, documentation, accessibility fixes, tech
  debt, and small UI changes. Poor fits: cross-repository refactors, work
  touching security or PII, ambiguous requirements, and tasks whose purpose is
  your own learning.

**Read:**
[Get the best results](https://docs.github.com/en/copilot/tutorials/cloud-agent/get-the-best-results) ·
[Customization library](https://docs.github.com/en/copilot/tutorials/customization-library/custom-agents) ·
[github/awesome-copilot agents](https://github.com/github/awesome-copilot/tree/main/agents)

**Checkpoint:** You have iterated on an agent definition across at least two
sessions and improved its output measurably.

---

## Suggested schedule

| Week | Focus |
| --- | --- |
| 1 | Stages 0–2: vocabulary, instructions, prompt files |
| 2 | Stages 3–4: first custom agent, VS Code authoring |
| 3 | Stages 5–6: subagents, cloud agent end to end |
| 4 | Stages 7–9: environment, MCP, security, iteration |

## Quick reference

- [Custom agents configuration reference](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [Customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet)
- [Custom instructions support](https://docs.github.com/en/copilot/reference/custom-instructions-support)
- [Agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Hooks](https://docs.github.com/en/copilot/concepts/agents/hooks)
- [Custom agents for Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli)
- [VS Code custom agents](https://code.visualstudio.com/docs/agent-customization/custom-agents)

> Note: GitHub's documentation renamed "coding agent" to "cloud agent"; older
> URLs redirect.
