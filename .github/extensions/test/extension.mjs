import { createServer } from "node:http";
import { joinSession, createCanvas, CanvasError } from "@github/copilot-sdk/extension";
import { renderHtml } from "./renderer.mjs";

// Panel-only state; the runtime retains open input for provider rehydration.
const servers = new Map();

async function startServer(instanceId, message) {
    const server = createServer((req, res) => {
        if (req.url?.split("?")[0] !== "/") {
            res.writeHead(404).end("Not found");
            return;
        }
        if (req.method !== "GET" && req.method !== "HEAD") {
            res.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
            return;
        }
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.end(req.method === "HEAD" ? undefined : renderHtml(instanceId, message));
    });
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address === "string") {
        server.close();
        throw new CanvasError("test_server_unavailable", "Unable to determine the canvas server port.");
    }
    return { server, message, url: `http://127.0.0.1:${address.port}/` };
}

await joinSession({
    canvases: [
        createCanvas({
            id: "test",
            displayName: "Test",
            description: "A repo-local sample canvas with a greeting, a test button, and an information action.",
            inputSchema: {
                type: "object",
                properties: {
                    message: { type: "string", minLength: 1, maxLength: 500 },
                },
                additionalProperties: false,
            },
            actions: [
                {
                    name: "get_info",
                    description: "Return the Test canvas greeting and panel information.",
                    inputSchema: { type: "object", properties: {}, additionalProperties: false },
                    handler: (ctx) => {
                        const entry = servers.get(ctx.instanceId);
                        if (!entry) {
                            throw new CanvasError("test_not_open", "Open the Test canvas before requesting information.");
                        }
                        return {
                            title: "Test",
                            scope: "project",
                            instanceId: ctx.instanceId,
                            message: entry.message,
                        };
                    },
                },
            ],
            open: async (ctx) => {
                let entry = servers.get(ctx.instanceId);
                if (!entry) {
                    entry = await startServer(ctx.instanceId, ctx.input?.message ?? "Hello from your repo-local Test canvas.");
                    servers.set(ctx.instanceId, entry);
                }
                return {
                    title: "Test",
                    url: entry.url,
                };
            },
            onClose: async (ctx) => {
                const entry = servers.get(ctx.instanceId);
                if (entry) {
                    servers.delete(ctx.instanceId);
                    await new Promise((resolve, reject) => {
                        entry.server.close((error) => error ? reject(error) : resolve());
                    });
                }
            },
        }),
    ],
});
