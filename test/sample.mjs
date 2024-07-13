import dotenv from "dotenv";
import {InstagramLiveClient} from "../dist/index.js";

dotenv.config({path: import.meta.dirname + '/.env'});
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const client = new InstagramLiveClient(
  "loop.offline",
  {device_id: process.env.DEVICE_ID, session_id: process.env.SESSION_ID},
  process.env.PROXY_URL ? new URL(process.env.PROXY_URL) : undefined
);

client.on("connected", () => {
  console.log('Connected!')
})

client.on("comment", (data) => {
  console.log("Comment Data", data);
})

/**
 * Log system comment data (aka joining)
 */
client.on("system_comment", (data) => {
  console.log("System Comment Data", data);
});


/**
 * Log join data
 */
client.on("join", (data) => {
  console.log("Join Data", data);
});
await client.login({device_id: process.env.DEVICE_ID, session_id: process.env.SESSION_ID});
await client.start(undefined, false);