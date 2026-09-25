import { appendFile } from "node:fs/promises";
import { EOL } from "node:os";
import { join } from "node:path";

const trigger = process.argv[2];

if (!trigger) {
  throw new Error("Hook trigger argument is required.");
}

const chunks = [];

for await (const chunk of process.stdin) {
  chunks.push(chunk);
}

const payload = Buffer.concat(chunks).toString("utf8");
await appendFile(
  join(process.cwd(), "debug.log"),
  `Hook trigger: ${trigger}${EOL}${payload}${EOL}`,
  "utf8",
);
