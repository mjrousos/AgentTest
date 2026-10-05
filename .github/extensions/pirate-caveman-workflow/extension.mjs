import { defineWorkflow, joinSession } from "@github/copilot-sdk/extension";

const WORKFLOW_NAME = "pirate-to-caveman";
const CAVEMAN_PROMPT =
    "Read the conversation history. Find the most recent substantive user prompt that Pirate answered " +
    "before asking whether Caveman should answer it too. Answer that same prompt afresh as Caveman. " +
    "Do not answer the user's 'yes' or copy Pirate's wording. Do not repeat side effects of Pirate's work.";

// Define a workflow that has two phases: 
// - First, activate the pirate agent and pause
// - Second, Switch to caveman agent and continue the conversation
const workflow = defineWorkflow({
    meta: {
        name: WORKFLOW_NAME,
        description: "Let the user chat with Pirate, then hand off to Caveman if they accept Pirate's offer.",
        phases: [{ title: "Pirate conversation" }, { title: "Caveman answer" }],
    },
    run: async (ctx) => {
        ctx.phase("Pirate conversation");
        await ctx.step("select-pirate-v1", async () => {
            await ctx.session.rpc.agent.select({ name: "Pirate" });
            return true;
        });
        await ctx.pause("user-accepts-caveman-v1");

        ctx.phase("Caveman answer");
        await ctx.session.rpc.agent.select({ name: "Caveman" });
        return { selectedAgent: "Caveman" };
    },
});

let handoffScheduled = false;

const session = await joinSession({
    workflows: [workflow],
    commands: [
        {
            // The pirate-caveman command starts the workflow (after checking that no other handoff is in progress)
            name: "pirate-caveman",
            description: "Start an interactive Pirate conversation with an optional Caveman handoff",
            handler: async () => {
                if (handoffScheduled) {
                    throw new Error("A Pirate-to-Caveman handoff is already in progress.");
                }
                await session.rpc.agent.reload();
                const runs = await session.workflow.listRuns();
                for (const run of runs.filter((run) => run.workflowName === WORKFLOW_NAME)) {
                    if (run.status === "paused") {
                        await session.workflow.cancel(run.runId);
                    } else if (run.status === "running") {
                        throw new Error("The Pirate-to-Caveman workflow is already running.");
                    }
                }

                const started = await session.workflow.run(workflow, { logPhaseNames: true });
                if (started.status !== "paused") {
                    throw new Error(`Pirate-to-Caveman workflow did not pause: ${started.error ?? started.status}`);
                }
                await session.send({
                    source: "system",
                    mode: "immediate",
                    prompt: "You are Pirate in the /pirate-caveman workflow. Greet the user and ask how you can help. " +
                        "Use normal chat for the greeting, conversation, and Caveman offer; wait for the user to reply in chat. " +
                        "Do not use ask_user, elicitation, or forms for these interactions. " +
                        "Do not offer Caveman until you have answered a substantive user prompt. " +
                        "If the user later accepts your Caveman offer, call pirate_caveman_handoff once.",
                });
            },
        },
    ],
    tools: [
        {
            // This tool is used by Copilot to resume the workflow and move on to the caveman phase
            name: "pirate_caveman_handoff",
            description: "After the user accepts Pirate's Caveman offer, schedule the active workflow handoff. Call only for an explicit yes.",
            parameters: { type: "object", properties: {} },
            skipPermission: true,
            handler: async () => {
                if (handoffScheduled) {
                    return { resultType: "failure", textResultForLlm: "The Caveman handoff is already pending." };
                }
                const current = await session.rpc.agent.getCurrent();
                const runs = await session.workflow.listRuns();
                const paused = runs.filter((run) => run.workflowName === WORKFLOW_NAME && run.status === "paused");
                if (current.agent?.name !== "Pirate" || paused.length !== 1) {
                    return {
                        resultType: "failure",
                        textResultForLlm: "No active Pirate conversation is awaiting a Caveman handoff.",
                    };
                }

                handoffScheduled = true;
                const runId = paused[0].runId;
                const unsubscribe = session.on("session.idle", (event) => {
                    unsubscribe();
                    if (event.data.aborted) {
                        handoffScheduled = false;
                        void session.log("Pirate's turn was aborted; the Caveman handoff did not run.", { level: "warning" });
                        return;
                    }
                    void (async () => {
                        try {
                            // Resume the session
                            const resumed = await session.workflow.resume(runId, { logPhaseNames: true });
                            if (resumed.status !== "completed") {
                                throw new Error(`Handoff did not complete: ${resumed.error ?? resumed.status}`);
                            }

                            // Send the prompt for caveman to continue the conversation
                            await session.send({ source: "system", prompt: CAVEMAN_PROMPT });
                        } catch (error) {
                            await session.log(`Caveman handoff failed: ${error.message}`, { level: "error" });
                        } finally {
                            handoffScheduled = false;
                        }
                    })();
                });
                return "Caveman handoff scheduled. Finish this Pirate turn; Caveman will answer next.";
            },
        },
    ],
});
