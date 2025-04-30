import { getCodeInfoList } from "@/api/submission";
import { delay } from "@pureadmin/utils";
import { onMounted, reactive, ref, watchEffect } from "vue";
import type { Align, LoadingConfig, PaginationProps } from "@pureadmin/table";
import { useUserStore } from "@/store/modules/user";

export function useColumns() {
  const userStore = useUserStore();
  const currentUserId = ref(userStore.userid);
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
  const typeOptions = [
    { label: "Accepted", value: "Accepted" },
    { label: "Wrong Answer", value: "Wrong Answer" },
    { label: "Time Limit Exceeded", value: "Time Limit Exceed" },
    { label: "Runtime Error", value: "Runtime Error (SIGSEGV)" },
    { label: "Compile Error", value: "Compile Error" },
    { label: "Other Error", value: "Other Error" },
    { label: "Presentation Error", value: "Presentation Error" },
    { label: "Memory Limit Exceeded", value: "Memory Limit Exceed" }
  ];
  const selectedTypes = ref<string[]>([]);
  const columns: TableColumnList = [
    {
      label: "代码id",
      prop: "code_id"
    },
    {
      label: "用户id",
      prop: "user_id"
    },
    {
      label: "题目id",
      prop: "question_id",
      // *** 添加 slot 属性，指定插槽名称 ***
      slot: "questionIdSlot" // 你可以自定义一个插槽名称
      // 提示：如果列内容是可点击的，通常会给一个固定的宽度，避免内容换行影响点击区域
      // width: 120
    },
    {
      label: "源代码",
      prop: "code_raw"
    },
    {
      label: "类型",
      prop: "code_type"
    },
    {
      label: "分数",
      prop: "score"
    },
    {
      label: "运行时长",
      prop: "run_time"
    },
    {
      label: "上传时间",
      prop: "upload_time"
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
        code_type: selectedTypes.value.length ? selectedTypes.value : undefined,
        user_id: isAdmin.value ? undefined : currentUserId.value
      }).filter(
        ([_, value]) =>
          value !== undefined && !(Array.isArray(value) && value.length === 0)
      )
    );

    const response = await getCodeInfoList({
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
    typeOptions,
    selectedTypes,
    questionIdFilter,
    onChange,
    onSizeChange,
    onCurrentChange,
    handleFilterChange
  };
}
