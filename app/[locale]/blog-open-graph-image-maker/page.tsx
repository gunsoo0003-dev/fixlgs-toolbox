import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogOpenGraphImageMakerPage } from '@/components/blog-open-graph-image-maker-page';
import { locales, type Locale } from '@/lib/site';

const title={ko:'블로그·오픈그래프 이미지 제작기 - OG 1200×630 만들기 | FIXLGS TOOLBOX',en:'Blog & Open Graph Image Maker | FIXLGS TOOLBOX',ja:'ブログ・OG画像作成ツール | FIXLGS TOOLBOX'};
const desc={ko:'네이버 블로그·Google 블로그·웹사이트·Open Graph용 대표 이미지를 한 번에 만들고 JPG·PNG 또는 ZIP으로 저장하세요.',en:'Create featured images for Naver Blog, Google/Blogger, websites and Open Graph, then export JPG, PNG or ZIP.',ja:'NAVERブログ・Googleブログ・Webサイト・Open Graph用の代表画像を作成し、JPG・PNG・ZIPで保存できます。'};
export function generateStaticParams(){return locales.map(locale=>({locale}))}
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))notFound();const l=locale as Locale;const canonical=`https://toolbox.fixlgs.com/${l}/blog-open-graph-image-maker`;return {title:title[l],description:desc[l],alternates:{canonical,languages:{ko:'https://toolbox.fixlgs.com/ko/blog-open-graph-image-maker',en:'https://toolbox.fixlgs.com/en/blog-open-graph-image-maker',ja:'https://toolbox.fixlgs.com/ja/blog-open-graph-image-maker','x-default':'https://toolbox.fixlgs.com/ko/blog-open-graph-image-maker'}},openGraph:{title:title[l],description:desc[l],url:canonical,type:'website'}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <BlogOpenGraphImageMakerPage locale={locale as Locale}/>}
