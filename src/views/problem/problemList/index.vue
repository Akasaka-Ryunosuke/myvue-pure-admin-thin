<script setup lang="ts">
import { useColumns } from "./columns";
import { useRouter } from "vue-router";

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

defineOptions({
  name: "ProblemList"
});
</script>

<template>
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

    <pure-table
      border
      row-key="code_id"
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
      <template #questionIdSlot="{ row }">
        <el-link
          type="primary"
          @click="router.push(`/problem/${row.question_id}`)"
        >
          {{ row.question_id }}
        </el-link>
      </template>
    </pure-table>
  </div>
</template>
