import { http } from "@/utils/http";
import qs from "qs";

// 定义题目相关的 API URL 前缀
const problemUrlPrefix = (path: string) => {
  return `/api/question-info${path}`;
};

// --- TypeScript 接口定义 ---
export interface ProblemItem {
  question_id: string;
  question_raw: string;
}

export type ProblemDetailResult = {
  success: boolean;
  code: number;
  message: string;
  data: ProblemItem; // 单个题目对象
};

export type ProblemList = {
  success: boolean;
  code: number;
  message: string;
  data: {
    list: ProblemItem[];
    total: number;
    page: number;
    page_size: number;
  };
};

// --- API 函数实现 ---
export const getProblemList = (data?: object) => {
  return http.request<ProblemList>("get", problemUrlPrefix("/list"), {
    params: data,
    paramsSerializer: params => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    }
  });
};

export const getProblemDetail = (data?: object) => {
  return http.request<ProblemDetailResult>("get", problemUrlPrefix("/get"), {
    params: data,
    paramsSerializer: params => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    }
  });
};

// 如果需要，你还可以在这里定义添加、编辑、删除题目的 API 函数 (通常使用 POST, PUT, DELETE)

// 添加题目 (POST)
export const addProblem = (data?: object) => {
  return http.request<any>("post", problemUrlPrefix("/create"), {
    data: data
  });
};

// 编辑题目 (PUT)
export const updateProblem = (data?: object) => {
  return http.request<any>("put", problemUrlPrefix(`/update`), {
    data: data
  });
};

// 删除题目 (DELETE)
export const deleteProblem = (data?: object) => {
  return http.request<any>("delete", problemUrlPrefix(`/delete`), {
    data: data
  });
};

// 提交题目 (SUBMIT)
export const submitProblem = (data?: object) => {
  return http.request<any>("post", problemUrlPrefix(`/submit`), {
    data: data
  });
};
