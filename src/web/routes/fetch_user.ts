import {LiveRoute} from "../route";
import {AxiosResponse} from "axios";
import {checkLogin, UserOfflineError} from "../utils";
import * as fs from "node:fs";

export interface LiveUserIdRoutePayload {
  username: string
}

export const PROFILE_ID_REGEX = /"profile_id":"(\d+)"/;

export class LiveUserIdRouteError extends Error {

}

export class LiveUserIdRoute extends LiveRoute<LiveUserIdRoutePayload, string> {

  async fetch(config: LiveUserIdRoutePayload): Promise<string> {
    const response: AxiosResponse = checkLogin(
        await this.http.axios.get(
            `https://www.instagram.com/api/v1/users/web_profile_info/?username=${config.username}`
        )
    );

    const userId = response.data?.data?.user?.id;

    if (!userId) {
      throw new LiveUserIdRouteError(`Failed to fetch user ID: ${response.status} - ${response.data}`);
    }

    return userId;

  }

}