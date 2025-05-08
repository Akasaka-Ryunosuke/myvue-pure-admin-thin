export default {
  path: "/problem",
  redirect: "/problem/index",
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
      path: "/problem/refactor/:id",
      name: "ProblemRefactor",
      component: () => import("@/views/problem/problemRefactor/index.vue"),
      meta: {
        title: "题目修改",
        showLink: false
      },
      props: true
    },
    {
      path: "/problem/detail/:id",
      name: "ProblemDetail",
      component: () => import("@/views/problem/problemDetail/index.vue"),
      meta: {
        title: "题目详情",
        showLink: false
      },
      props: true
    }
  ]
};
