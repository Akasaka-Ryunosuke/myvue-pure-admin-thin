export default {
  path: "/submission",
  redirect: "/submission/index",
  meta: {
    icon: "ri/chat-search-line",
    title: "submission",
    rank: 1
  },
  children: [
    {
      path: "/submission/index",
      name: "Submission",
      component: () => import("@/views/submission/index.vue"),
      meta: {
        title: "提交记录"
      }
    }
  ]
};
