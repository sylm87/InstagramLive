import {InstagramLiveWebClient} from "../dist/index.js";
import dotenv from "dotenv";

dotenv.config({ path: import.meta.dirname + "/.env"});
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const client = new InstagramLiveWebClient(
  process.env.PROXY_URL ? new URL(process.env.PROXY_URL) : undefined
);

await client.login_route.fetch(
  {
    username: process.env.INSTAGRAM_USERNAME,
    password: process.env.INSTAGRAM_PASSWORD,
    device_id: InstagramLiveWebClient.generateDeviceId()
  }
);

