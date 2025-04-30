export default {
  path: "/problem",
  redirect: "/problem/index", // 如果你希望 /problem 就是列表页，保留重定向；如果希望 /problem/index 是详情页，则此重定向可能需要调整或移除
  meta: {
    icon: "ri/chat-search-line",
    title: "problem",
    rank: 2
  },
  children: [
    // 题目列表页，还没做呢
    {
      path: "/problem/index",
      name: "ProblemList",
      component: () => import("@/views/problem/index.vue"),
      meta: {
        title: "题目列表"
      }
    },
    {
      path: "/problem/:id",
      name: "ProblemDetail",
      component: () => import("@/views/problem/index.vue"),
      meta: {
        title: "题目详情", // 详情页的标题
        showLink: false // 详情页通常不显示在左侧菜单中
      },
      props: true
    }
  ]
};
