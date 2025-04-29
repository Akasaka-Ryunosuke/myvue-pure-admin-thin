import {http} from "@/utils/http";
import { accountUrlPrefix } from "./utils";

export type UserResult = {
  success: boolean;
  data: {
    /** ID */
    user_id: string;
    /** 用户名 */
    user_name: string;
    /** 当前登录用户的角色 */
    user_type: string;
    /** `token` */
    access_token: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refresh_token: string;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    access_token: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refresh_token: string;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", accountUrlPrefix("/login"), {data});
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", accountUrlPrefix("/refresh-token"), {data});
};
