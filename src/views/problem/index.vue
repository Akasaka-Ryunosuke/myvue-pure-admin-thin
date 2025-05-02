<template>
  <div class="problem-page-container">
    <div class="problem-header">
      <h2>{{ isEditing ? "编辑题目" : problem?.title || "题目详情" }}</h2>
    </div>

    <!-- 加载与错误提示 -->
    <div v-if="loadingDetail" class="status-message">正在加载题目详情...</div>
    <div v-else-if="errorDetail" class="status-message error-message">
      加载题目详情失败: {{ errorDetail.message }}
    </div>

    <!-- 详情或编辑表单 -->
    <div v-else-if="problem" class="problem-details-content">
      <!-- 只读模式 -->
      <div v-if="!isEditing">
        <div class="problem-content" v-html="renderedQuestionHtml" />
        <div class="problem-actions">
          <div v-if="true" class="admin-actions">
            <el-button type="primary" @click="enableEdit">编辑题目</el-button>
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

      <!-- 编辑模式 -->
      <div v-else>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="edit-form"
        >
          <!-- 不再编辑标题，仅编辑内容 -->
          <el-form-item label="内容" prop="question_raw">
            <el-input v-model="form.question_raw" type="textarea" :rows="20" />
          </el-form-item>

          <div class="form-actions">
            <el-button type="primary" @click="submitEdit">保存</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </div>
        </el-form>
      </div>
    </div>

    <div v-else class="status-message">未找到该题目或题目ID无效。</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { getProblemDetail, updateProblem } from "@/api/problem";
import MarkdownIt from "markdown-it";
import markdownItKatex from "@iktakahiro/markdown-it-katex";
import "katex/dist/katex.min.css";
import { ElForm, ElMessage } from "element-plus";

// 用户角色
const userStore = useUserStore();
const isAdmin = computed(() => userStore.roles.includes("admin"));

// 路由相关
const route = useRoute();
const router = useRouter();
const problemId = computed(() => route.params.id as string);

// 页面状态
const problem = ref<any>(null);
const loadingDetail = ref(true);
const errorDetail = ref<Error | null>(null);

// 编辑状态与表单对象
const isEditing = ref(false);
const form = ref<Partial<typeof problem.value>>({});
const formRef = ref<InstanceType<typeof ElForm> | null>(null);

// 表单校验规则
const rules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  question_raw: [{ required: true, message: "请输入题目内容", trigger: "blur" }]
};

// Markdown 渲染
const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
md.use(markdownItKatex);
const renderedQuestionHtml = computed(() => {
  try {
    return md.render(problem.value?.question_raw || "");
  } catch {
    return '<p style="color:red;">渲染错误</p>';
  }
});

// 获取题目详情
const fetchProblemDetail = async (id: string) => {
  loadingDetail.value = true;
  errorDetail.value = null;
  problem.value = null;
  try {
    const res = await getProblemDetail({ question_id: id });
    if (res.success && res.data) {
      problem.value = res.data;
    } else {
      throw new Error("API 返回格式异常");
    }
  } catch (e: any) {
    errorDetail.value = e;
  } finally {
    loadingDetail.value = false;
  }
};

// 切换到编辑模式
const enableEdit = () => {
  form.value = {
    id: problem.value.id,
    title: problem.value.title,
    question_raw: problem.value.question_raw
  };
  isEditing.value = true;
};

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false;
};

// 提交编辑
const submitEdit = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    try {
      await updateProblem({
        question_id: problemId.value,
        question_raw: form.value.question_raw
      });
      // 更新成功后，回写到 problem 并退出编辑
      problem.value = { ...problem.value, ...form.value };
      isEditing.value = false;
      ElMessage.success("保存成功");
    } catch (err: any) {
      ElMessage.error(`保存失败：${err.message}`);
    }
  });
};

// 删除与解决题目
const handleDeleteProblem = async () => {
  if (!problem.value?.id) return;
  if (confirm(`确定删除题目《${problem.value.title}》？`)) {
    loadingDetail.value = true;
    try {
      // await deleteProblemApi(problem.value.id);
      alert("删除成功");
      router.push("/problems");
    } catch (e: any) {
      alert(`删除失败：${e.message}`);
      loadingDetail.value = false;
    }
  }
};
const handleSolveProblem = () => {
  if (problem.value?.id) router.push(`/solve/${problem.value.id}`);
};

// 生命周期
onMounted(() => fetchProblemDetail(problemId.value));
watch(problemId, (newId, oldId) => {
  if (newId && newId !== oldId) fetchProblemDetail(newId as string);
});
</script>

<style scoped>
.problem-page-container {
  max-width: 800px;
  padding: 20px;
  margin: 40px auto;
  background: #fdfdfd;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 10%);
}

.problem-header h2 {
  padding-bottom: 8px;
  margin: 0;
  font-size: 2rem;
  color: #333;
  border-bottom: 2px solid #ddd;
}

.status-message {
  padding: 60px 0;
  font-size: 1.2rem;
  color: #888;
  text-align: center;
}

.error-message {
  color: #e74c3c;
}

.problem-content {
  margin-top: 20px;
  line-height: 1.8;
  color: #444;
}

.problem-content img {
  border-radius: 6px;
}

.problem-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.admin-actions .el-button {
  margin-right: 10px;
}

.solve-action .el-button {
  background: linear-gradient(45deg, #6db3f2, #1e69de);
  border: none;
}

/* 编辑表单 */
.edit-form {
  margin-top: 20px;
}

.form-actions {
  margin-top: 20px;
}

/* KaTeX 公式中央对齐 */
.katex-display {
  margin: 1em 0;
  text-align: center;
}
</style>
