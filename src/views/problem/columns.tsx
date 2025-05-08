import { delay } from "@pureadmin/utils";
import { onMounted, reactive, ref, watchEffect } from "vue";
import type { Align, LoadingConfig, PaginationProps } from "@pureadmin/table";
import { useUserStore } from "@/store/modules/user";
import { getProblemList } from "@/api/problem";

export function useColumns() {
  const userStore = useUserStore();
  ref(userStore.userid);
  const isAdmin = ref(false);
  if (userStore.roles == "admin") {
    isAdmin.value = true;
  }

  const dataList = ref([]);
  const loading = ref(true);
  const select = ref("no");
  const hideVal = ref("nohide");
  const tableSize = ref("default");
  const paginationAlign = ref("right");
  const questionIdFilter = ref("");

  const questionInfoFilter = ref("");
  const columns: TableColumnList = [
    {
      label: "题目id",
      prop: "question_id",
      slot: "questionIdSlot"
    },
    {
      label: "题目名称",
      prop: "question_name"
    },
    {
      label: "操作",
      width: "200",
      fixed: "right",
      slot: "operation"
    }
  ];

  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    pageSize: 10,
    currentPage: 1,
    pageSizes: [10, 15, 20],
    total: 0,
    align: "right",
    background: true,
    size: "default"
  });

  /** 加载动画配置 */
  const loadingConfig = reactive<LoadingConfig>({
    text: "正在加载第一页...",
    viewBox: "-10, -10, 50, 50",
    spinner: `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
    // svg: "",
    // background: rgba()
  });

  function onChange(val) {
    pagination.size = val;
  }

  function onSizeChange(val) {
    console.log("onSizeChange", val);
  }

  async function onCurrentChange(val) {
    loadingConfig.text = `正在加载第${val}页...`;
    try {
      loading.value = true;
      await fetchData(val);
      loading.value = false;
    } catch (error) {
      console.error("获取数据失败:", error);
      loading.value = false;
    }

    delay(600).then(() => {
      loading.value = false;
    });
  }

  async function handleFilterChange() {
    pagination.currentPage = 1; // 回到第一页
    await fetchData();
  }

  async function fetchData(val: number = pagination.currentPage) {
    const params = Object.fromEntries(
      Object.entries({
        question_id: questionIdFilter.value || undefined,
        question_raw: questionInfoFilter.value || undefined
      }).filter(
        ([_, value]) =>
          value !== undefined && !(Array.isArray(value) && value.length === 0)
      )
    );

    const response = await getProblemList({
      ...params,
      page: val,
      page_size: pagination.pageSize
    });

    if (response.data) {
      dataList.value = response.data.list;
      pagination.total = response.data.total;
    }
  }

  watchEffect(() => {
    pagination.align = paginationAlign.value as Align;
  });

  onMounted(async () => {
    try {
      loading.value = true;
      await fetchData();
      loading.value = false;
    } catch (error) {
      console.error("获取数据失败:", error);
      loading.value = false;
    }
  });

  return {
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
  };
}
