export const routePaths = {
  root: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  oauthCallback: "/oauth/callback",
  dashboard: "/dashboard",
  dashboardHome: "/dashboard/home",
  dashboardVartalap: "/dashboard/vartalap",
  dashboardViber: "/dashboard/viber",
  dashboardShop: "/dashboard/shop",
  dashboardPosts: "/dashboard/posts",
  dashboardSettings: "/dashboard/settings",
  dashboardProfile: "/dashboard/profile",
  dashboardAlias: "/dashboard2",
} as const;

export const dashboardRouteSegments = {
  home: "home",
  vartalap: "vartalap",
  viber: "viber",
  shop: "shop",
  posts: "posts",
  settings: "settings",
  profile: "profile",
} as const;
