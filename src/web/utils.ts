import {AxiosResponse} from "axios";

export class UnauthenticatedError extends Error {

}

export class UserOfflineError extends Error {

}

export const OFFLINE_MESSAGE = "User is not live";
export const MEDIA_DELETE_MESSAGE = "Sorry, this media has been deleted";


export function checkLogin(response: AxiosResponse): AxiosResponse {

  if (typeof response.data !== "string") {
    return response;
  }

  if (response.data.includes("<title>Login")) {
    throw new UnauthenticatedError("User is not authenticated or authentication expired. Please login first.")
  }

  if (response.headers?.['location']?.includes('/challenge/')) {
    throw new UnauthenticatedError("User was hit with a challenge: " + response.headers['location']);
  }

  return response
}

export function checkOnline(response: AxiosResponse): AxiosResponse {

  if (response.data?.message === OFFLINE_MESSAGE) {
    throw new UserOfflineError("The requested user is not online.")
  }

  return response;
}