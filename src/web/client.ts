import {InstagramLiveHTTPClient} from "./http";
import {LoginRoute} from "./routes/fetch_login";
import {LiveCommentsRoute} from "./routes/fetch_live_comment";
import {LiveHeartbeatRoute} from "./routes/fetch_live_heartbeat";
import {CreateAxiosDefaults} from "axios";
import {LiveUserIdRoute} from "./routes/fetch_user";
import {LiveInfoRoute} from "./routes/fetch_live_info";

export class InstagramLiveWebClient extends InstagramLiveHTTPClient {

  // Regular IG Routes
  public readonly login_route: LoginRoute;

  // IG Live Routes
  public readonly live_user_id_route: LiveUserIdRoute;
  public readonly live_comments_route: LiveCommentsRoute;
  public readonly live_heartbeat_route: LiveHeartbeatRoute
  public readonly live_info_route: LiveInfoRoute;

  constructor(
      proxy?: URL,
      axiosConfig?: CreateAxiosDefaults
  ) {
    super(axiosConfig, proxy);
    this.login_route = new LoginRoute(this);
    this.live_user_id_route = new LiveUserIdRoute(this);
    this.live_comments_route = new LiveCommentsRoute(this);
    this.live_heartbeat_route = new LiveHeartbeatRoute(this);
    this.live_info_route = new LiveInfoRoute(this);
  }

}


