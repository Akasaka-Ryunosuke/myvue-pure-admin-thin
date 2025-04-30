// src/api/problem.ts

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

// --- API 函数实现 ---
export const getProblemDetail = (data?: object) => {
  return http.request<ProblemDetailResult>("get", problemUrlPrefix("/list"), {
    params: data,
    paramsSerializer: params => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    }
  });
};

// 如果需要，你还可以在这里定义添加、编辑、删除题目的 API 函数 (通常使用 POST, PUT, DELETE)
/*
// 添加题目 (POST)
export const addProblem = (problemData: Omit<ProblemItem, 'id'>) => {
    return http.request<any>("post", problemUrlPrefix("/"), {
        data: problemData // POST 请求通常将数据放在请求体中
    });
};

// 编辑题目 (PUT)
export const updateProblem = (problemId: number | string, problemData: Partial<ProblemItem>) => {
     return http.request<any>("put", problemUrlPrefix(`/${problemId}`), {
        data: problemData // PUT 请求通常将数据放在请求体中
    });
};

// 删除题目 (DELETE)
export const deleteProblem = (problemId: number | string) => {
     return http.request<any>("delete", problemUrlPrefix(`/${problemId}`));
     // DELETE 请求通常只需要 ID 在 URL 中
};
*/
