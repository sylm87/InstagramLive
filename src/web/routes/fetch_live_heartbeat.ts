import {LiveRoute} from "../route";
import {AxiosResponse} from "axios";
import {checkLogin} from "../utils";

export type LiveHeartbeatRoutePayload = {
  live_id: string
}

export enum BroadcastStatus {
  ACTIVE = "active",
  STOPPED = "stopped",
  INTERRUPTED = "interrupted",
}

export type LiveHeartbeatRouteResponse = {
  viewer_count: number,
  broadcast_status: BroadcastStatus,
  cobroadcaster_ids: string[],
  offset_to_video_start: number,
  user_pay_max_amount_reached: boolean,
  status: string
}

export class LiveHeartbeatRoute extends LiveRoute<LiveHeartbeatRoutePayload, LiveHeartbeatRouteResponse> {

  async fetch(config: LiveHeartbeatRoutePayload): Promise<LiveHeartbeatRouteResponse> {
    const fetchUrl = `https://www.instagram.com/api/v1/live/${config.live_id}/heartbeat_and_get_viewer_count/`;
    return checkLogin(await this.http.axios.get(fetchUrl)).data;
  }

}