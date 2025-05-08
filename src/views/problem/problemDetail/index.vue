<script setup lang="ts">
import "codemirror/theme/material-darker.css";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/javascript-hint.js";
import "codemirror/mode/javascript/javascript.js";

import { useDark } from "@pureadmin/utils";
import Codemirror from "codemirror-editor-vue3";
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import type { Editor, EditorConfiguration } from "codemirror";
import { getProblemDetail, submitProblem } from "@/api/problem";
import { getCodeInfoList } from "@/api/submission";
import MarkdownIt from "markdown-it";
import markdownItKatex from "@iktakahiro/markdown-it-katex";
import { useUserStore } from "@/store/modules/user";
import "deep-chat";
import { useRoute } from "vue-router";
import {
  addSessionDetail,
  createSession,
  getSessionDetail,
  searchSessions
} from "@/api/llm";

const { isDark } = useDark();
const cminstance = ref<Editor | null>(null);
const cmOptions: EditorConfiguration = reactive({
  mode: "javascript",
  theme: isDark.value ? "material-darker" : "default",
  tabSize: 4,
  readOnly: false,
  autofocus: true,
  autoRefresh: true,
  lineNumbers: true,
  lineWiseCopyCut: true,
  gutters: ["CodeMirror-lint-markers"],
  lint: true,
  lineWrapping: true,
  extraKeys: {
    Ctrl: "autocomplete",
    Tab: "autocomplete"
  },
  hintOptions: {
    completeSingle: false
  }
});

const route = useRoute();
const userStore = useUserStore();
const currentUserId = ref(userStore.userid);
const currentQuestionId = ref(route.params.id as string);

const problem = ref("");
const code = ref("");
const currentLlmRecordId = ref<number | null>(null);
const historyMessages = ref<{ text: string; role: string }[]>([]);
const currentMode = ref("0");
const modes = ref([
  { label: "无", value: "0" },
  { label: "代码解释", value: "1" },
  { label: "代码修复", value: "2" },
  { label: "代码思路", value: "3" }
]);

const onReady = (cm: Editor) => {
  cminstance.value = cm;
  cm.on("keypress", () => cm.showHint());
};

watch(
  () => isDark.value,
  async newVal => {
    await nextTick();
    newVal
      ? cminstance.value.setOption("theme", "material-darker")
      : cminstance.value.setOption("theme", "default");
  }
);

const fetchProblemDetail = async (id: string) => {
  const res = await getProblemDetail({ question_id: id });
  if (res.success && res.data) {
    problem.value = res.data.question_raw;
  }
};

const fetchCodeDetail = async (id: string) => {
  const res = await getCodeInfoList({
    question_id: id,
    user_id: currentUserId.value,
    page: 1,
    page_size: 10
  });
  if (res.success && res.data.list.length != 0) {
    code.value = res.data.list[0].code_raw ?? "";
  }
};

const loadHistorySessions = async (mode: string) => {
  try {
    // 搜索当前用户、题目、mode 下的会话列表
    const searchRes = await searchSessions({
      user_id: currentUserId.value,
      question_id: currentQuestionId.value,
      mode: mode
    });

    if (searchRes.success && searchRes.data.sessions.length > 0) {
      // 取最新的会话（按 upload_time 倒序，第一个是最新）
      const firstSessionId = searchRes.data.sessions[0].llm_record_id;
      currentLlmRecordId.value = firstSessionId;

      // 获取会话详情
      const detailRes = await getSessionDetail({
        llm_record_id: firstSessionId
      });
      if (detailRes.success) {
        // 整理成 deep-chat 所需的历史消息格式
        historyMessages.value = detailRes.data.details.map(detail => ({
          text: detail.raw,
          role: detail.io_type === 1 ? "user" : "ai"
        }));
      }
    } else {
      historyMessages.value = []; // 无会话时清空历史消息
      currentLlmRecordId.value = null;
    }
  } catch (error) {
    console.error("历史记录加载失败", error);
    historyMessages.value = []; // 清空或显示错误信息
  }
};

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
md.use(markdownItKatex);
const renderedQuestionHtml = computed(() => {
  try {
    return md.render(problem.value || "");
  } catch {
    return '<p style="color:red;">渲染错误</p>';
  }
});
const chatRef = ref();
const lineHeight = 20; // 假设每行高度为 20px
const cmHeight = ref(`${lineHeight * 15}px`);
const evaluationResult = ref<string | null>(null);
const isSubmitting = ref(false);

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    // 这里添加提交代码的 API 调用
    // evaluationResult.value = "评测通过！用时 120ms";
    const submitRes = await submitProblem({
      question_id: currentQuestionId.value,
      code: code.value
    });
    evaluationResult.value = submitRes.data;
  } finally {
    isSubmitting.value = false;
  }
};

// 新增消息发送处理函数
const chatConnectHandler = async (body: any, signals: any) => {
  const userMessage = body.messages[0].text; // 获取用户输入的消息

  // 首次发送时创建会话（如果没有会话ID）
  if (!currentLlmRecordId.value) {
    const createRes = await createSession({
      user_id: currentUserId.value,
      question_id: currentQuestionId.value,
      mode: currentMode.value
    });
    currentLlmRecordId.value = createRes.data.llm_record_id;
  }

  // 调用 addSessionDetail 发送消息并获取AI回复
  const detailRes = await addSessionDetail({
    llm_record_id: currentLlmRecordId.value!,
    raw: userMessage as string
  });
  // 通过 signals 返回AI回复，Deep Chat会自动显示
  await signals.onResponse({ text: detailRes.data.llm_response });
};

watch(currentMode, async newMode => {
  await loadHistorySessions(newMode);
});

onMounted(async () => {
  await fetchProblemDetail(currentQuestionId.value);
  await fetchCodeDetail(currentQuestionId.value);
  await loadHistorySessions(currentMode.value);
});
</script>

<template>
  <div class="container" style="display: flex; height: 85vh; overflow: hidden">
    <!-- 题目描述栏 -->
    <div
      class="section problem-section"
      style="
        display: flex;
        flex: 3;
        flex-direction: column;
        width: 20vw;
        height: 85vh;
      "
    >
      <el-card
        shadow="never"
        style="display: flex; flex: 1; flex-direction: column; overflow: hidden"
      >
        <h3
          style="flex-shrink: 0; padding: 10px; border-bottom: 1px solid #eee"
        >
          题目描述
        </h3>
        <div
          class="problem-content"
          style="flex: 1; overflow-y: auto"
          v-html="renderedQuestionHtml"
        />
      </el-card>
    </div>

    <!-- 代码编辑栏 -->
    <div
      class="section code-section"
      style="display: flex; flex: 3; flex-direction: column; height: 85vh"
    >
      <el-card
        shadow="never"
        style="display: flex; flex: 1; flex-direction: column; overflow: hidden"
      >
        <div
          style="display: flex; flex: 1; flex-direction: column; min-height: 0"
        >
          <h3
            style="flex-shrink: 0; padding: 10px; border-bottom: 1px solid #eee"
          >
            代码
          </h3>

          <!-- 代码编辑器 -->
          <div style="flex: 2; min-height: 0; border-bottom: 1px solid #eee">
            <Codemirror
              v-model:value="code"
              width="24vw"
              :height="cmHeight"
              :options="cmOptions"
              @ready="onReady"
            />
          </div>

          <!-- 评测结果 -->
          <div
            class="evaluation-container"
            style="
              display: flex;
              flex: 1;
              flex-direction: column;
              min-height: 0;
            "
          >
            <h4
              style="
                flex-shrink: 0;
                padding: 10px;
                margin: 0;
                border-bottom: 1px solid #eee;
              "
            >
              评测结果
            </h4>
            <div style="flex: 1; padding: 10px; overflow-y: auto">
              <div
                v-if="evaluationResult"
                style="
                  padding: 8px;
                  font-family: monospace;
                  white-space: pre-wrap;
                  background: var(--el-fill-color-light);
                  border-radius: 4px;
                "
              >
                {{ evaluationResult }}
              </div>
              <el-empty v-else :image-size="60" description="暂无评测结果" />
            </div>
          </div>

          <!-- 提交按钮 -->
          <div
            style="flex-shrink: 0; padding: 10px; border-top: 1px solid #eee"
          >
            <el-button
              type="primary"
              style="width: 100%"
              :loading="isSubmitting"
              @click="handleSubmit"
            >
              提交代码
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
    <div
      class="section ai-section"
      style="display: flex; flex: 4; flex-direction: column; height: 85vh"
    >
      <el-card
        shadow="never"
        style="display: flex; flex: 1; flex-direction: column; overflow: hidden"
      >
        <h3
          style="flex-shrink: 0; padding: 10px; border-bottom: 1px solid #eee"
        >
          AI助手
        </h3>
        <div style="position: absolute; top: 10px; right: 20px; z-index: 100">
          <el-select
            v-model="currentMode"
            placeholder="选择作答类型"
            style="width: 150px"
          >
            <el-option
              v-for="mode in modes"
              :key="mode.value"
              :label="mode.label"
              :value="mode.value"
            />
          </el-select>
        </div>
        <div style="flex: 1; min-height: 0">
          <deep-chat
            ref="chatRef"
            style="
              height: 75vh;
              border-radius: 10px;
              width: 31vw;
              padding-top: 10px;
              background-image: url(&quot;/bhang.jpeg&quot;);
              background-size: cover;
              background-repeat: no-repeat;
              background-position: center;
            "
            :messageStyles="{
              default: {
                user: {
                  bubble: { backgroundColor: '#47b8f5' }
                },
                ai: {
                  bubble: { backgroundColor: '#0f43a6', color: 'white' }
                }
              }
            }"
            :submitButtonStyles="{
              submit: {
                svg: {
                  styles: {
                    default: {
                      filter:
                        'brightness(0) saturate(100%) invert(60%) sepia(79%) saturate(643%) hue-rotate(185deg) brightness(102%) contrast(100%)'
                    }
                  }
                }
              }
            }"
            :textInput="{
              styles: {
                container: {
                  backgroundColor: '#004f97',
                  color: 'white',
                  boxShadow: 'unset',
                  minHeight: '40px', // 设置最小高度
                  alignItems: 'flex-start' // 顶部对齐
                },
                text: {
                  maxHeight: '80px', // 最大高度
                  minHeight: '40px', // 最小高度
                  lineHeight: '1.5' // 行高
                }
              },
              placeholder: { text: '发送消息', style: { color: '#d1d1d1' } }
            }"
            :history="historyMessages"
            :demo="false"
            :connect="{ handler: chatConnectHandler }"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  height: 100vh;
}

.el-card {
  height: 100%;
}

/* 解决 CodeMirror 滚动问题 */
.code-section :deep(.cm-editor) {
  height: 100% !important;
}

.code-section :deep(.cm-scroller) {
  overflow: auto;
}

/* 评测结果滚动条样式 */
.evaluation-container ::-webkit-scrollbar {
  width: 6px;
}

.evaluation-container ::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.evaluation-container ::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
