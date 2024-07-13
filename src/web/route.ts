import {InstagramLiveHTTPClient} from "./http";

export abstract class LiveRoute<RoutePayload, RouteResponse> {

  constructor(
      protected http: InstagramLiveHTTPClient
  ) {
  }

  abstract fetch(config: RoutePayload): Promise<RouteResponse>;

}
