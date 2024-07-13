import {HttpsProxyAgent} from "https-proxy-agent";
import {Cookie, CookieJar} from "tough-cookie";
import axios, {AxiosInstance, CreateAxiosDefaults} from "axios";
import {createCookieAgent} from "http-cookie-agent/http";
import {HttpProxyAgent} from "http-proxy-agent";
import {wrapper} from "axios-cookiejar-support";
import * as zlib from "node:zlib";
import * as crypto from "node:crypto";

export const COOKIE_DOMAIN: string = "instagram.com";
export const ORIGIN: string = "https://www.instagram.com/";

export const DEFAULT_HEADERS: Record<string, string> = {
  "Accept": "*/*",
  "Accept-Encoding": "gzip, deflate",
  "Accept-Language": "en-CA,en;q=0.9",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
  "Dpr": "3",
  "Host": "www.instagram.com",
  "Pragma": "no-cache",
  "Sec-Ch-Prefers-Color-Scheme": "dark",
  "Sec-Ch-Ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
  "Sec-Ch-Ua-Full-Version-List": "\"Not/A)Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"126.0.6478.127\", \"Google Chrome\";v=\"126.0.6478.127\"",
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Model": "",
  "X-IG-App-ID": "936619743392459",
  "Sec-Ch-Ua-Platform": "\"macOS\"",
  "Sec-Ch-Ua-Platform-Version": "\"14.4.0\"",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Viewport-Width": "499",
  "Origin": ORIGIN
}

export class InstagramLiveHTTPClient {

  public readonly axios: AxiosInstance

  constructor(
      axiosConfig?: CreateAxiosDefaults,
      public readonly proxy?: URL,
      public readonly cookies: CookieJar = new CookieJar(),
  ) {
    this.axios = InstagramLiveHTTPClient.createAxios(this.cookies, this.proxy, axiosConfig)
    InstagramLiveHTTPClient.addGzipMiddleware(this.axios);
  }

  public static addGzipMiddleware(instance: AxiosInstance) {

    instance.interceptors.response.use(response => {
      const encoding = response.headers['content-encoding'];

      if (encoding && encoding.includes('gzip')) {
        return new Promise((resolve, reject) => {
          zlib.gunzip(response.data, (err, dezipped) => {
            if (err) {
              return reject(err);
            }
            response.data = dezipped.toString();
            resolve(response);
          });
        });
      }

      return response;
    }, error => {
      return Promise.reject(error);
    });

  }

  /**
   * Create axios client w/ Cookie + Proxy support
   * https://github.com/3846masa/http-cookie-agent/issues/238#issuecomment-1236493872
   */
  public static createAxios(
      cookies: CookieJar,
      proxy?: URL,
      axiosConfig?: CreateAxiosDefaults
  ): AxiosInstance {
    axiosConfig ||= {};

    const baseConfig: CreateAxiosDefaults = {
      headers: {...DEFAULT_HEADERS, ...axiosConfig?.headers || {}},
      validateStatus: () => true,
      ...axiosConfig
    }

    if (!proxy) {
      return wrapper(
          axios.create(
              {
                jar: cookies,
                ...baseConfig
              }
          )
      )
    }

    const HttpProxyCookieAgent = createCookieAgent(HttpProxyAgent);
    const HttpsProxyCookieAgent = createCookieAgent(HttpsProxyAgent);

    const cookieAgentParams: any = {
      cookies: {jar: cookies},
      host: proxy?.hostname,
      port: proxy?.port,
      password: proxy?.password
    }

    return axios.create(
        {
          httpAgent: new HttpProxyCookieAgent(cookieAgentParams),
          httpsAgent: new HttpsProxyCookieAgent(cookieAgentParams),
          ...baseConfig
        }
    )

  }

  public setCookie(name: string, value: string) {

    /*
      [
    Cookie="ps_l=0; Expires=Sun, 17 Aug 2025 03:34:23 GMT; Max-Age=34560000; Domain=instagram.com; Path=/; Secure; HttpOnly; SameSite=Lax; hostOnly=false; aAge=1ms; cAge=133ms",
    Cookie="ps_n=0; Expires=Sun, 17 Aug 2025 03:34:23 GMT; Max-Age=34560000; Domain=instagram.com; Path=/; Secure; HttpOnly; hostOnly=false; aAge=2ms; cAge=126ms",
    Cookie="csrftoken=gZ4a63RQOvj0TjlJHWD5m5; Expires=Sat, 12 Jul 2025 03:34:23 GMT; Max-Age=31449600; Domain=instagram.com; Path=/; Secure; hostOnly=false; aAge=2ms; cAge=123ms"
  ]

     */
    return this.cookies.setCookie(
        new Cookie(
            {
              key: name,
              value: value,
              domain: COOKIE_DOMAIN,
              secure: true
            }
        ),
        ORIGIN
    );

  }

  public static async generateDeviceId(): Promise<string> {
    return crypto.randomUUID().toString().toUpperCase();
  }

}


export function sleepRandom(min: number = 1, max: number = 5) {
  return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min) * 1000));
}


