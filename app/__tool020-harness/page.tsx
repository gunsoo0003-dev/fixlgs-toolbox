import type { Metadata } from "next";
import { YoutubeChannelBannerTool } from "@/components/youtube-channel-banner-tool";
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function Tool020Harness(){return <main style={{maxWidth:1400,margin:"0 auto",padding:24}}><YoutubeChannelBannerTool locale="ko"/></main>}
