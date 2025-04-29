<script setup lang="ts">
import { useColumns } from "./columns";

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
  typeOptions,
  selectedTypes,
  questionIdFilter,
  onChange,
  onSizeChange,
  onCurrentChange,
  handleFilterChange
} = useColumns();


defineOptions({
  name: "Submission"
});
</script>

<template>
  <div>
    <el-input
      v-model="questionIdFilter"
      placeholder="按题目 ID 筛选"
      clearable
      @change="handleFilterChange"
    />

    <!-- 2. type 多选 -->
    <el-select
      v-model="selectedTypes"
      multiple
      placeholder="选择作答类型"
      @change="handleFilterChange"
    >
      <el-option
        v-for="item in typeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

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
      @page-size-change="onSizeChange"
      @page-current-change="onCurrentChange"
    />
  </div>
</template>





