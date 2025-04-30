<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { getProblemDetail } from "@/api/problem"; // 假设你的 API 文件叫 problem.ts 并导出了 getProblemDetail
// 前端 Markdown 渲染库
import { marked } from "marked";

// --- 获取用户状态，判断是否是管理员 ---
const userStore = useUserStore();
// TODO 调试的时候这里显示是true，但是测试却不会显示
const isAdmin = userStore.roles == "admin";

// --- 获取路由参数 ---
const route = useRoute(); // 获取当前路由对象
// 从路由参数中获取题目 ID

const problemId = computed(() => route.params.id);

// --- 存储单个题目详情的响应式变量 ---
const problem = ref(null); // 存储获取到的题目详情，初始为 null
const loadingDetail = ref(true); // 加载状态，用于获取详情
const errorDetail = ref(null); // 错误状态，用于获取详情

// --- 异步函数：获取单个题目详情 ---
const fetchProblemDetail = async id => {
  loadingDetail.value = true; // 开始加载
  errorDetail.value = null; // 清除错误
  problem.value = null; // 清空之前的数据

  if (!id) {
    errorDetail.value = new Error("Missing problem ID in route.");
    loadingDetail.value = false;
    return;
  }

  try {
    const response = await getProblemDetail({ question_id: id });
    // 检查响应结构
    if (response && response.success && response.data) {
      problem.value = response.data; // 更新题目详情数据
    } else {
      // 响应结构不符合期望
      console.error("API response:", response);
      throw new Error("Unexpected response format from API");
    }
  } catch (err) {
    console.error("Error fetching problem detail:", err);
    errorDetail.value = err; // 存储错误
  } finally {
    loadingDetail.value = false; // 加载结束
  }
};

// --- 生命周期钩子和监听器 ---
onMounted(() => {
  // 首次加载时根据路由参数中的 ID 获取题目详情
  fetchProblemDetail(problemId.value);
});

// 监听路由参数 ID 变化，以便在同一个组件内切换题目时重新加载
watch(problemId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    // 确保新 ID 存在且不同
    fetchProblemDetail(newId);
  } else if (!newId) {
    // 如果 ID 变为 null 或 undefined，可以清空当前显示
    problem.value = null;
    errorDetail.value = new Error("Problem ID removed from route.");
  }
});

// --- 计算属性：将 question_raw Markdown 转换为 HTML ---
const renderedQuestionHtml = computed(() => {
  const raw = problem.value?.question_raw; // 获取原始的 question_raw 字符串
  if (!raw) {
    return ""; // 如果 raw 为空，返回空字符串，不进行渲染
  }
  try {
    // marked.parse 是 marked v4+ 的同步方法，用于简单 Markdown
    // 如果有复杂需求或需要处理 Promise，可以使用 marked(raw)
    return marked.parse(raw);
  } catch (e) {
    console.error("Error rendering markdown:", e);
    return '<p style="color: red;">Error rendering problem description.</p>'; // 渲染失败时显示错误
  }
});

// --- 操作相关的函数 ---
const router = useRouter(); // 获取 router 实例用于跳转

// 管理员：跳转到编辑当前题目页面
const handleEditProblem = () => {
  if (problem.value && problem.value.id) {
    // 确保题目数据和 ID 存在
    router.push(`/problems/edit/${problem.value.id}`); // 假设编辑路由是 /problems/edit/:id
  }
};

// 管理员：删除当前题目
const handleDeleteProblem = async () => {
  if (problem.value && problem.value.id) {
    if (
      confirm(
        `确定要删除题目 "${problem.value.title || problem.value.id}" 吗？`
      )
    ) {
      loadingDetail.value = true;
      try {
        // !!! 调用实际的后端删除接口 !!!
        // await deleteProblemApi(problem.value.id); // 假设你有一个 deleteProblemApi 函数
        console.log(
          `Simulating delete for problem with ID: ${problem.value.id}`
        ); // 模拟删除

        // 模拟删除成功后跳转
        // await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
        alert("删除成功！即将跳转回列表页。");
        router.push("/problems"); // 假设列表页路由是 /problems
      } catch (e) {
        console.error("删除失败", e);
        alert(`删除失败：${e.message || "未知错误"}`);
        loadingDetail.value = false;
      }
    }
  }
};

// 所有用户：跳转到代码编辑/解决界面
const handleSolveProblem = () => {
  if (problem.value && problem.value.id) {
    router.push(`/solve/${problem.value.id}`); // 假设解决页面路由是 /solve/:id
  }
};
</script>

<template>
  <div class="problem-page-container">
    <div class="problem-header">
      <h2>{{ problem ? problem.title || "题目详情" : "题目详情" }}</h2>
    </div>

    <div v-if="loadingDetail" class="status-message">正在加载题目详情...</div>
    <div v-else-if="errorDetail" class="status-message error-message">
      加载题目详情失败: {{ errorDetail.message }}
    </div>

    <div v-else-if="problem" class="problem-details-content">
      <div class="problem-content" v-html="renderedQuestionHtml" />

      <div class="problem-actions">
        <div v-if="isAdmin" class="admin-actions">
          <el-button type="primary" @click="handleEditProblem"
            >编辑题目
          </el-button>
          <el-button type="danger" @click="handleDeleteProblem"
            >删除题目
          </el-button>
        </div>

        <div class="solve-action">
          <el-button type="success" @click="handleSolveProblem"
            >解决题目
          </el-button>
        </div>
      </div>
    </div>

    <div v-else class="status-message">未找到该题目或题目ID无效。</div>
  </div>
</template>

<style scoped>
/* 添加Scoped CSS 样式来美化渲染出的 Markdown 内容 */

/* 外层容器样式 */
.problem-page-container {
  max-width: 960px; /* 限制内容最大宽度，让其居中 */
  padding: 0 20px; /* 左右内边距，避免内容贴边 */
  margin: 20px auto; /* 顶部/底部 20px, 左右自动居中 */
  background-color: #fff; /* 白色背景 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 2px 12px rgb(0 0 0 / 10%); /* 添加阴影效果 */
}

/* 页面标题区域样式 */
.problem-header {
  padding: 20px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.problem-header h2 {
  margin: 0; /* 移除默认的 h2 margin */
  font-size: 1.8em;
  color: #333;
}

.problem-meta-info {
  margin-top: 10px;
  font-size: 0.9em;
  color: #666;
}

/* 加载/错误状态消息样式 */
.status-message {
  padding: 40px 20px;
  font-size: 1.2em;
  color: #666;
  text-align: center;
}

.status-message.error-message {
  color: #f56c6c; /* 错误消息颜色 */
}

/* 题目详情内容区域样式 */
.problem-details-content {
  padding-bottom: 20px; /* 底部内边距 */
}

/* Markdown 渲染内容区域样式 */
.problem-content {
  font-size: 1rem;

  /* 基础排版样式 */
  line-height: 1.7; /* 增加行高 */
  color: #333;
  word-wrap: break-word; /* 长单词或URL自动换行 */
  overflow-wrap: break-word; /* 同上 */
}

/* Markdown 渲染出的 HTML 元素样式美化 */

/* 标题 */
.problem-content h1,
.problem-content h2,
.problem-content h3,
.problem-content h4,
.problem-content h5,
.problem-content h6 {
  padding-bottom: 0.4em;
  margin-top: 1.8em; /* 增加标题顶部间距 */
  margin-bottom: 0.8em; /* 增加标题底部间距 */
  font-weight: bold;
  line-height: 1.3;
  color: #333;
  border-bottom: 1px solid #eee; /* 标题下划线 */
}

.problem-content h1 {
  font-size: 2em;
  border-bottom-color: #ddd;
}

/* 一级标题样式 */
.problem-content h2 {
  font-size: 1.6em;
}

.problem-content h3 {
  font-size: 1.3em;
}

.problem-content h4 {
  font-size: 1.1em;
}

.problem-content h5 {
  font-size: 1em;
}

.problem-content h6 {
  font-size: 0.9em;
  color: #666;
}

/* 段落 */
.problem-content p {
  margin-bottom: 1em;
}

/* 列表 */
.problem-content ul,
.problem-content ol {
  padding-left: 2.5em; /* 增加列表缩进 */
  margin-bottom: 1em;
}

.problem-content ul li {
  list-style: disc;
}

/* 无序列表圆点 */
.problem-content ol li {
  list-style: decimal;
}

/* 有序列表数字 */
.problem-content li {
  margin-bottom: 0.5em;
}

/* 列表项间距 */

/* 内联代码 */
.problem-content code {
  padding: 0.2em 0.4em;
  font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
  font-size: 0.9em;
  color: #c0392b; /* 代码颜色 */
  background-color: #f0f0f0; /* 浅灰色背景 */
  border-radius: 4px;
}

/* 代码块 */
.problem-content pre {
  padding: 1.2em; /* 增加内边距 */
  margin-bottom: 1.5em; /* 增加底部间距 */
  overflow-x: auto; /* 处理长代码行 */
  font-size: 0.9em;
  line-height: 1.5;
  color: #f8f8f2; /* 代码颜色 */
  background-color: #2d2d2d; /* 深色背景 */
  border-radius: 5px; /* 增加圆角 */
}

.problem-content pre code {
  padding: 0;
  font-size: 1em;
  color: inherit; /* 继承 pre 的颜色 */

  /* 代码块内的 code 元素样式覆盖 */
  background-color: transparent;
  border-radius: 0;
}

/* 引用块 */
.problem-content blockquote {
  padding: 0.5em 1.5em; /* 增加内边距 */
  margin: 1em 0;
  color: #6a737d;
  background-color: #f8f8f8; /* 浅灰色背景 */
  border-left: 0.25em solid #a0aab4; /* 引用块左侧边框 */
  border-radius: 4px;
}

/* 表格 */
.problem-content table {
  width: 100%;
  margin-bottom: 1em;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.problem-content th,
.problem-content td {
  padding: 0.8em 1em; /* 增加内边距 */
  text-align: left;
  border: 1px solid #ddd;
}

.problem-content th {
  font-weight: bold;
  background-color: #f2f2f2;
}

.problem-content tr:nth-child(even) {
  background-color: #f9f9f9; /* 条纹表格效果 */
}

/* 图片 */
.problem-content img {
  display: block; /* 图片作为块级元素 */
  max-width: 100%;
  height: auto;
  margin: 1em auto; /* 图片居中并添加上下间距 */
  border-radius: 4px; /* 图片圆角 */
}

/* 分割线 */
.problem-content hr {
  margin: 2em 0; /* 分割线上下间距 */
  border: none;
  border-top: 1px solid #eee;
}

/* 操作按钮区域样式 */
.problem-actions {
  display: flex; /* 使用 flexbox 布局 */
  align-items: center;
  justify-content: space-between; /* 按钮组分开对齐 */
  padding-top: 20px; /* 顶部内边距 */
  margin-top: 30px; /* 顶部间距 */
  border-top: 1px solid #eee; /* 顶部边框线 */
}

/* 管理员按钮组样式 */
.admin-actions .el-button {
  margin-right: 10px; /* 按钮之间的右侧间距 */
}

/* 解决按钮组样式 */
.solve-action .el-button {
  /* 如果需要单独样式 */
}
</style>
