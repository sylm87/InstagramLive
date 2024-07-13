import {LiveRoute} from "../route";
import {sleepRandom} from "../http";
import * as querystring from "node:querystring";

export type LoginRoutePayload = {
  username?: string,
  password?: string,
  session_id?: string
  device_id: string,
}

interface LoginRouteResponse {

  // Always sent
  user: boolean,
  authenticated: boolean,
  status: string, // e.g. 'ok'

  // Only if successful
  userId?: string,
  oneTapPrompt?: boolean,
  has_onboarded_to_text_post_app?: boolean,
}

export class LoginError extends Error {
}

export class TwoFactorError extends LoginError {
}

export class IncorrectPasswordError extends LoginError {
}

export class UsernameNotFoundError extends LoginError {

}

/**
 * Ripped with thanks from https://github.com/instaloader/instaloader/blob/master/instaloader/instaloadercontext.py
 */
export class LoginRoute extends LiveRoute<LoginRoutePayload, LoginRouteResponse | undefined> {

  async fetch(config: LoginRoutePayload): Promise<LoginRouteResponse | undefined> {

    // Set Base Cookies
    await this.http.setCookie('sessionid', config.session_id || "");
    await this.http.setCookie('ig_did', config.device_id);
    await this.http.setCookie('mid', '');
    await this.http.setCookie('ig_pr', '1');
    await this.http.setCookie('ig_vw', '1920');
    await this.http.setCookie('ig_cb', '1');
    await this.http.setCookie('csrftoken', '');
    await this.http.setCookie('s_network', '');
    await this.http.setCookie('db_user_id', '');

    // Request Instagram's base URL to get the csrftoken cookie
    await this.http.axios.get('https://www.instagram.com/');

    // Get the CSRF Token
    const cookies = await this.http.cookies.getCookies("https://www.instagram.com");
    let csrfCookie = cookies.find(cookie => cookie.key === 'csrftoken');
    this.http.axios.defaults.headers.common['X-CSRFToken'] = csrfCookie?.value;

    // If they pass session ID we can just skip actually logging in
    if (config.session_id) {
      return;
    }

    if (!config.username || !config.password) {
      throw new LoginError('Username and password are required for login if session ID is not passed.');
    }

    // Sleep for a random amount of time
    await sleepRandom(0, 2);
    const enc_password = `#PWD_INSTAGRAM_BROWSER:0:${Math.round(Date.now() / 1000)}:` + config.password;

    const login = await this.http.axios.request(
        {
          method: "POST",
          url: 'https://www.instagram.com/accounts/login/ajax/',
          headers: {'content-type': 'application/x-www-form-urlencoded'},
          data: querystring.stringify(
              {
                username: config.username,
                enc_password: enc_password,
              }
          )
        }
    );

    // 2FA error
    if (login.data['two_factor_required']) {
      throw new TwoFactorError("Two factor authentication required!")
    }

    // Checkpoint error
    if (login.data['checkpoint_url']) {
      throw new LoginError(`Checkpoint required. ${login.data['checkpoint_url']} - follow the instructions, then retry.`)
    }

    if (login.data['status'] !== 'ok') {
      if ('message' in login.data) {
        throw new LoginError(`Login error: "${login.data['status']}" status, message "${login.data['message']}"`)
      } else {
        throw new LoginError(`Login error: "${login.data['status']}" status.`)
      }
    }

    if ('authenticated' in login.data) {
      if (!login.data['authenticated']) {
        if (login.data['user']) {
          console.log(config)
          throw new IncorrectPasswordError(`Login error: Wrong password, or too many attempts? Response: ${login.status} - ${JSON.stringify(login.data)}`)
        } else {
          throw new UsernameNotFoundError(`Login error: User ${config.username} does not exist.`)
        }
      }
    } else {
      throw new LoginError('Login error: Unexpected response, this might indicate a blocked IP.')
    }

    csrfCookie = cookies.find(cookie => cookie.key === 'csrftoken');
    this.http.axios.defaults.headers.common['X-CSRFToken'] = csrfCookie?.value;
    return login.data;
  }

}