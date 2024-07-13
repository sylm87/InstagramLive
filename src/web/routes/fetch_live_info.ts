import {LiveRoute} from "../route";
import {checkLogin, checkOnline, UserOfflineError} from "../utils";
import {BroadcastStatus} from "./fetch_live_heartbeat";

const OFFLINE_MESSAGE = "User is not live";

export interface BroadcastOwner {
  pk: string;
  pk_id: string;
  full_name: string;
  is_private: boolean;
  strong_id__: string;
  username: string;
  is_verified: boolean;
  live_broadcast_id: string;
  live_broadcast_visibility: number;
  profile_pic_id: string;
  profile_pic_url: string;
  live_subscription_status: string;
  interop_messaging_user_fbid: string;
  friendship_status: {
    following: boolean;
    followed_by: boolean;
    blocking: boolean;
    muting: boolean;
    is_private: boolean;
    incoming_request: boolean;
    outgoing_request: boolean;
    is_bestie: boolean;
    is_restricted: boolean;
    is_feed_favorite: boolean;
    subscribed: boolean;
    is_eligible_to_subscribe: boolean;
  };
}

export type LiveInfoRouteResponse = {
  id: string;
  published_time: number;
  broadcast_prompt: string;
  broadcast_message: string;
  dimensions: { height: number; width: number; };
  dimensions_typed: { height: number; width: number; };
  hide_from_feed_unit: boolean;
  is_live_comment_mention_enabled: boolean;
  is_live_comment_replies_enabled: boolean;
  media_id: string;
  response_timestamp: number;
  strong_id__: string;
  broadcast_owner: BroadcastOwner;
  cover_frame_url: string;
  video_duration: number;
  internal_only: boolean;
  is_viewer_comment_allowed: boolean;
  broadcast_experiments: Record<string, any>;
  live_post_id: string;
  is_player_live_trace_enabled: number;
  visibility: number;
  media_overlay_info: {};
  cobroadcasters: any[];
  organic_tracking_token: string;
  dash_playback_url: string;
  dash_abr_playback_url: string;
  viewer_count: number;
  broadcast_status: BroadcastStatus;
  status: string;
}

class LiveIdRouteFetchError extends Error {

}


type LiveInfoRoutePayload = {
  target_user_id: string
}


export class LiveInfoRoute extends LiveRoute<LiveInfoRoutePayload, LiveInfoRouteResponse> {

  async fetch(config: LiveInfoRoutePayload): Promise<LiveInfoRouteResponse> {

    const fetchUrl = `https://www.instagram.com/api/v1/live/web_info/?target_user_id=${config.target_user_id}`;
    const response = await this.http.axios.get(fetchUrl);
    checkLogin(response);
    checkOnline(response);

    if (response?.data?.status !== "ok") {
      throw new LiveIdRouteFetchError(
          "Received non-ok status code from Instagram API while fetching live info with reason: " +
          JSON.stringify(response.data) || "[Empty]"
      )
    }

    if (!response.data.id) {
      throw new LiveIdRouteFetchError("Missing live ID from the payload!")
    }

    return response.data;

  }

}