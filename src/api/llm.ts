import { http } from "@/utils/http";
import qs from "qs";

// 定义题目相关的 API URL 前缀
const llmUrlPrefix = (path: string) => {
  return `/api/llm${path}`;
};

// --- TypeScript 接口定义 ---
export interface SessionItem {
  llm_record_id: number;
  user_id: number;
  question_id: string;
  mode: number;
  upload_time: string;
}

export interface SessionDetailItem {
  detail_id: number;
  llm_record_id: number;
  io_type: number;
  raw: string;
  upload_time: string;
}

export type CreateSessionResult = {
  success: boolean;
  code: number;
  message: string;
  data: {
    llm_record_id: number;
  };
};

export type SearchSessionsResult = {
  success: boolean;
  code: number;
  message: string;
  data: {
    sessions: SessionItem[];
  };
};

export type AddSessionDetailResult = {
  success: boolean;
  code: number;
  message: string;
  data: {
    llm_response: string;
  };
};

export type GetSessionDetailResult = {
  success: boolean;
  code: number;
  message: string;
  data: {
    llm_record_id: number;
    user_id: number;
    question_id: string;
    upload_time: string;
    details: SessionDetailItem[];
  };
};

// --- API 函数实现 ---
// 创建会话
export const createSession = async (data?: object) => {
  return http.request<CreateSessionResult>(
    "post",
    llmUrlPrefix("/create_session"),
    {
      data: data
    }
  );
};

// 获取会话列表
export const searchSessions = async (data?: object) => {
  return http.request<SearchSessionsResult>(
    "get",
    llmUrlPrefix("/list_session"),
    {
      params: data,
      paramsSerializer: params => {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    }
  );
};

// 添加会话详情
export const addSessionDetail = async (data?: object) => {
  return http.request<AddSessionDetailResult>(
    "post",
    llmUrlPrefix("/add_session_detail"),
    {
      data: data
    }
  );
};

export const getSessionDetail = async (data?: object) => {
  return http.request<GetSessionDetailResult>(
    "get",
    llmUrlPrefix("/get_session_detail"),
    {
      params: data,
      paramsSerializer: params => {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    }
  );
};
