import {InstagramLiveWebClient} from "./web/client";
import {CreateAxiosDefaults} from "axios";
import {EventEmitter} from "node:events";
import {LiveInfoRouteResponse} from "./web/routes/fetch_live_info";
import {LiveEvent} from "./event";
import {UserOfflineError} from "./web/utils";
import {BroadcastStatus, LiveHeartbeatRouteResponse} from "./web/routes/fetch_live_heartbeat";
import {LiveCommentsRouteResponse, SystemCommentType} from "./web/routes/fetch_live_comment";
import {LoginRoutePayload} from "./web/routes/fetch_login";

export * from "./web/client";
export * from "./web/http";


export class InstagramLiveClient extends EventEmitter {

  public readonly web: InstagramLiveWebClient;
  private liveInfo?: LiveInfoRouteResponse;
  private heartbeatInterval?: NodeJS.Timeout;
  private commentInterval?: NodeJS.Timeout;
  private lastCommentTimestamp?: string;
  private lastHeartbeat?: LiveHeartbeatRouteResponse;
  private isConnected: boolean = false;

  /**
   * Create a new Instagram Live Client
   *
   * @param username The user you want to connect to
   * @param credentials The credentials to log in with
   * @param proxy The proxy to use for the connection
   * @param axiosConfig The axios configuration to use
   * @param commentFetchInterval The interval to fetch comments at
   * @param heartbeatFetchInterval The interval to fetch heartbeats at
   *
   */
  constructor(
      public readonly username: string,
      private credentials: LoginRoutePayload,
      public readonly proxy?: URL,
      protected readonly axiosConfig?: CreateAxiosDefaults,
      protected commentFetchInterval: number = 5000,
      protected heartbeatFetchInterval: number = 5000
  ) {
    super();
    this.web = new InstagramLiveWebClient(proxy, axiosConfig);
  }

  /**
   * Log into Instagram with an account
   *
   * @param credentials Login credentials
   *
   */
  public async login(credentials: LoginRoutePayload = this.credentials) {
    this.credentials = credentials;
    await this.web.login_route.fetch(credentials);
  }

  /**
   * Start a connection to a live stream
   *
   * @param target_user_id The user ID of the target user (manual override)
   * @param refreshLogin Whether to refresh the login before starting
   */
  public async start(
      target_user_id?: string,
      refreshLogin: boolean = true
  ) {

    // Refresh login upon request
    if (refreshLogin) {
      await this.login();
    }

    // Grab the target user ID if not provided
    if (!target_user_id) {
      target_user_id = await this.web.live_user_id_route.fetch({username: this.username});
    }

    // Now we fetch the room info
    await this.fetchLiveInfo(target_user_id);

    // Start the heartbeat update
    this.heartbeatInterval = setInterval(this.fetchHeartbeat.bind(this), 5000);
    this.commentInterval = setInterval(this.fetchComments.bind(this), 5000);

    // Set the connection status
    this.isConnected = true;
    this.emit(LiveEvent.CONNECTED);
  }

  /**
   * Stop polling the live stream, essentially "disconnecting" from it.
   */
  public disconnect<T extends unknown>(error?: T): void {
    clearInterval(this.heartbeatInterval);
    clearInterval(this.commentInterval);

    this.isConnected = false;
    this.heartbeatInterval = undefined;
    this.commentInterval = undefined;
    this.liveInfo = undefined;
    this.lastHeartbeat = undefined;
    this.lastCommentTimestamp = undefined;

    this.emit(LiveEvent.DISCONNECTED, error);

  }

  /**
   * Heartbeat to check if the livestream has stopped
   * @protected
   */
  protected async fetchHeartbeat(): Promise<void> {
    try {
      this.lastHeartbeat = await this.web.live_heartbeat_route.fetch(
          {live_id: this.getLiveId() as string}
      );
    } catch (ex) {
      this.disconnect(ex);
      this.emit(LiveEvent.ERROR, ex);
      return;
    }

    // Emit the heartbeat event
    this.emit(LiveEvent.FETCH_HEARTBEAT, this.lastHeartbeat);

    if (this.lastHeartbeat.broadcast_status === BroadcastStatus.STOPPED) {
      this.disconnect();
      return;
    }

  }

  protected async fetchComments(): Promise<void> {
    let comments: LiveCommentsRouteResponse;

    // Attempt to fetch the comments
    try {
      comments = await this.web.live_comments_route.fetch({
        live_id: this.getLiveId() as string,
        last_comment_ts: this.lastCommentTimestamp
      });
    } catch (ex) {
      this.disconnect(ex);
      this.emit(LiveEvent.ERROR, ex);
      return;
    }

    // Emit the fetch event
    this.emit(LiveEvent.FETCH_COMMENTS, comments);

    // Update the last comment timestamp parameter
    if (comments.comments.length > 0 || comments.system_comments.length > 0) {
      this.lastCommentTimestamp = String(Math.floor(Date.now() / 1000));
    }

    // Emit comments
    for (const comment of comments.comments) {
      this.emit(LiveEvent.USER_COMMENT, comment);
    }

    // Emit system comments
    for (const systemComment of comments.system_comments) {
      this.emit(LiveEvent.SYSTEM_COMMENT, systemComment);

      // Emit specific known events
      switch (systemComment.type) {
        case SystemCommentType.JOIN:
          this.emit(LiveEvent.JOIN, systemComment);
          break
      }

    }

  }

  /**
   * Fetch the live info of a user
   * @param targetUserId The Instagram User ID of the target user
   */
  public async fetchLiveInfo(targetUserId: string): Promise<LiveInfoRouteResponse> {
    this.liveInfo = await this.web.live_info_route.fetch({target_user_id: targetUserId});
    return this.liveInfo;
  }

  /**
   * Get the initially scraped info of the live stream
   */
  public getLiveInfo(): LiveInfoRouteResponse | undefined {
    return this.liveInfo;
  }

  /**
   * Get the current viewer count of the live stream
   */
  public getViewerCount(): number | undefined {
    return this.lastHeartbeat?.viewer_count;
  }

  /**
   * Get the live ID of the live stream
   */
  public getLiveId(): string | undefined {
    return this.liveInfo?.id;
  }

  /**
   * Check if the user is connected
   */
  public getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get the last heartbeat payload
   */
  public getLastHeartbeat(): LiveHeartbeatRouteResponse | undefined {
    return this.lastHeartbeat;
  }

}