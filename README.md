InstagramLive
==================
The definitive Python library to connect to Instagram Live.

InstagramLive is a TypeScript library designed to connect to Instagram livestreams and receive realtime events
such as comments, gifts, and likes through a short-polling connection to Instagrams's internal API service. This library
allows you to
connect directly to Instagram with a target username and set of account credentials.

Join the [InstagramLive (TikTokLive) discord](https://discord.gg/e2XwPNTBBr) and visit
the [`#instagram-support`](https://discord.gg/RFacrJwvFm)
channel for questions, contributions and ideas.


## Table of Contents

- [Getting Started](#getting-started)
- [Licensing](#license)

## Getting Started

1. Install the module via npm from the **Coming Soon** repository

```shell script
npm i [ Coming Soon]

*For now, clone the repository and run `npm install`*
```

2. Create your first chat connection

```typescript
import {InstagramLiveClient, LiveEvent, UserComment} from "instagram-live";

const client = new InstagramLiveClient(
    "loop.offline",
    {device_id: process.env.DEVICE_ID, session_id: process.env.SESSION_ID},
    process.env.PROXY_URL ? new URL(process.env.PROXY_URL) : undefined
);

client.on(LiveEvent.CONNECTED, (e: undefined) => {
  console.log('Connected!')
});

client.on(LiveEvent.COMMENT, (data: UserComment) => {
  console.log("Comment Data", data);
});
```

### Current Events

```typescript
export enum LiveEvent {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ERROR = "error",
  JOIN = "join",
  USER_COMMENT = "comment",
  SYSTEM_COMMENT = "system_comment",
  FETCH_HEARTBEAT = "fetch_heartbeat",
  FETCH_COMMENTS = "fetch_comments"
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
