<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";
import { useRouter } from "vue-router";
import { addProblem } from "@/api/problem"; // 导入新增接口

const router = useRouter();
const {
  loading,
  columns,
  dataList,
  select,
  hideVal,
  tableSize,
  pagination,
  loadingConfig,
  paginationAlign,
  questionIdFilter,
  questionInfoFilter,
  onChange,
  onSizeChange,
  onCurrentChange,
  handleFilterChange
} = useColumns();

// 控制“新建题目”弹窗的开关
const createDialogVisible = ref(false);

// 表单模型
const form = ref({
  question_id: "",
  question_raw: ""
});

function handleRefactor(question_id: string) {
  router.push(`/problem/refactor/${question_id}`);
}

function handleDetail(question_id: string) {
  router.push(`/problem/detail/${question_id}`);
}

// 提交表单并刷新列表
function submitCreate() {
  addProblem(form.value)
    .then(() => {
      // 新增成功后，刷新当前列表数据
      handleFilterChange();
      // 重置表单
      form.value = { question_id: "", question_raw: "" };
      // 关闭弹窗
      createDialogVisible.value = false;
    })
    .catch(err => {
      console.error("创建失败", err);
      // 这里可以提示用户错误信息
    });
}
</script>

<template>
  <div>
    <!-- 顶部操作区域：筛选 + 新建按钮 -->
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      "
    >
      <div>
        <el-input
          v-model="questionIdFilter"
          placeholder="按题目 ID 筛选"
          clearable
          style="width: 200px; margin-right: 10px"
          @change="handleFilterChange"
        />
        <el-input
          v-model="questionInfoFilter"
          placeholder="按题目详情筛选"
          clearable
          style="width: 200px; margin-right: 10px"
          @change="handleFilterChange"
        />
      </div>
      <el-button type="primary" @click="createDialogVisible = true">
        新建题目
      </el-button>
    </div>

    <!-- 题目列表 -->
    <pure-table
      border
      row-key="question_id"
      alignWhole="center"
      showOverflowTooltip
      :size="tableSize as any"
      :loading="loading"
      :loading-config="loadingConfig"
      :height="tableSize === 'small' ? 352 : 440"
      :data="dataList"
      :columns="columns"
      :pagination="pagination"
      style="margin-top: 15px"
      @page-size-change="onSizeChange"
      @page-current-change="onCurrentChange"
    >
      <template #operation="{ row }">
        <el-button
          link
          type="primary"
          size="small"
          @click="handleRefactor(row.question_id)"
          >编辑</el-button
        >
        <el-button
          link
          type="primary"
          size="small"
          @click="handleDetail(row.question_id)"
          >做题</el-button
        >
      </template>
    </pure-table>

    <!-- 新建题目对话框 -->
    <el-dialog
      title="新建题目"
      :model-value="createDialogVisible"
      width="50%"
      @update:model-value="val => (createDialogVisible = val)"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="题目 ID">
          <el-input v-model="form.question_id" />
        </el-form-item>
        <el-form-item label="题目原文">
          <el-input v-model="form.question_raw" type="textarea" :rows="6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
