import { http } from "@/utils/http";
import { codeInfoUrlPrefix } from "./utils";
import qs from "qs";

export interface CodeItem {
  code_id: number;
  user_id: number;
  question_id: string;
  code_raw: string;
  code_type: string;
  score: string;
  run_time: number;
  upload_time: string;
}

export type CodeInfoResult = {
  success: boolean;
  code: number;
  message: string;
  data: {
    list: CodeItem[];
    total: number;
    page: number;
    page_size: number;
  };
};

export const getCodeInfoList = (data?: object) => {
  return http.request<CodeInfoResult>("get", codeInfoUrlPrefix("/list"), {
    params: data,
    paramsSerializer: params => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    }
  });
};
