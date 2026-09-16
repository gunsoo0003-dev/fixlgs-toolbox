import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {KeywordFrequencyDuplicatePage} from "@/components/keyword-frequency-duplicate-page";
import {locales,type Locale,tool044Descriptions,tool044Titles} from "@/lib/site";
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))return{};const l=locale as Locale;const path="keyword-frequency-duplicate-analyzer";return{title:tool044Titles[l],description:tool044Descriptions[l],alternates:{canonical:`https://www.fixlgs.com/tools/${l}/${path}`,languages:{ko:`https://www.fixlgs.com/tools/ko/${path}`,en:`https://www.fixlgs.com/tools/en/${path}`,ja:`https://www.fixlgs.com/tools/ja/${path}`,"x-default":`https://www.fixlgs.com/tools/ko/${path}`}}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <KeywordFrequencyDuplicatePage locale={locale as Locale}/>}
