import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 언어 세그먼트가 라우팅의 뿌리라 루트는 기본 언어로 넘긴다.
      // permanent:false — 나중에 Accept-Language 기반 분기로 바꿀 여지를 남긴다.
      { source: "/", destination: "/ko", permanent: false },
      { source: "/work/:slug", destination: "/ko/work/:slug", permanent: false },
    ];
  },
};

export default nextConfig;
