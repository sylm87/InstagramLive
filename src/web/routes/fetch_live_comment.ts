import {LiveRoute} from "../route";
import {AxiosResponse} from "axios";
import {checkLogin, MEDIA_DELETE_MESSAGE, UserOfflineError} from "../utils";

export type CommentUser = {
  pk: string;
  pk_id: string;
  id: string;
  full_name: string;
  is_private: boolean;
  has_onboarded_to_text_post_app: boolean;
  strong_id__: string;
  fbid_v2: string;
  username: string;
  is_verified: boolean;
  profile_pic_id: string;
  profile_pic_url: string;
  is_mentionable: boolean;
  latest_reel_media: number;
  latest_besties_reel_media: number;
};

export type UserComment = {
  pk: string;
  user_id: string;
  type: number;
  did_report_as_spam: boolean;
  created_at: number;
  created_at_utc: number;
  created_at_for_fb_app: number;
  content_type: string;
  status: string;
  bit_flags: number;
  share_enabled: boolean;
  is_ranked_comment: boolean;
  media_id: string;
  user: CommentUser;
  text: string;
  is_covered: boolean;
  has_liked_comment: boolean;
  comment_like_count: number;
};


export type SystemComment = {
  pk: string;
  created_at: number;
  user: CommentUser;
  text: string;
  user_count: number;
  has_social_context: boolean;
  type: SystemCommentType;
}

export type LiveCommentsRoutePayload = {
  live_id: string,
  last_comment_ts?: string
}


export enum SystemCommentType {
  JOIN = "multi_user_joined"
}

export type LiveCommentsRouteResponse = {
  comment_likes_enabled: boolean;
  comments: UserComment[];
  comment_count: number;
  caption: string | null;
  caption_is_edited: boolean;
  has_more_comments: boolean;
  has_more_headload_comments: boolean;
  media_header_display: string | null;
  can_view_more_preview_comments: boolean;
  live_seconds_per_comment: number;
  is_first_fetch: string;
  system_comments: SystemComment[];
  comment_muted: number;
  is_viewer_comment_allowed: boolean;
  status: string;
}


export class LiveCommentsRoute extends LiveRoute<LiveCommentsRoutePayload, LiveCommentsRouteResponse> {

  async fetch(config: LiveCommentsRoutePayload): Promise<LiveCommentsRouteResponse> {
    const lastCommentParam = config.last_comment_ts ? `?last_comment_ts=${config.last_comment_ts}` : "";
    const fetchUrl = `https://www.instagram.com/api/v1/live/${config.live_id}/get_comment/` + lastCommentParam;
    const response: AxiosResponse = checkLogin(await this.http.axios.get(fetchUrl));

    if (response?.data?.message === MEDIA_DELETE_MESSAGE) {
      throw new UserOfflineError("The user with that live ID is now offline & the comment media is deleted.");
    }

    return response.data;

  }

}