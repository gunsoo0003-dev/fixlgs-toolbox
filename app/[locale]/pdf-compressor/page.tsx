import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PdfCompressorPage } from "@/components/pdf-compressor-page";
import { locales, type Locale } from "@/lib/site";
const title:Record<Locale,string>={ko:"PDF 압축기 - PDF 용량 줄이기 | FIXLGS TOOLBOX",en:"PDF Compressor - Reduce PDF File Size | FIXLGS TOOLBOX",ja:"PDF 圧縮ツール - PDF容量を小さくする | FIXLGS TOOLBOX"};
const description:Record<Locale,string>={ko:"PDF를 브라우저에서 압축하고 최고화질·균형·용량 우선·사용자 지정 품질과 전후 실제 용량 비교, 결과 미리보기를 확인하세요.",en:"Compress PDFs locally with Highest quality, Balanced, Smaller file, or Custom settings, plus real size comparison and result preview.",ja:"PDFをブラウザ内で圧縮し、最高画質・バランス・容量優先・カスタム設定、実際の前後サイズ比較、結果プレビューを確認できます。"};
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!locales.includes(locale as Locale))notFound();const l=locale as Locale;const canonical=`https://toolbox.fixlgs.com/${l}/pdf-compressor`;return{title:title[l],description:description[l],alternates:{canonical,languages:{ko:"https://toolbox.fixlgs.com/ko/pdf-compressor",en:"https://toolbox.fixlgs.com/en/pdf-compressor",ja:"https://toolbox.fixlgs.com/ja/pdf-compressor","x-default":"https://toolbox.fixlgs.com/ko/pdf-compressor"}},openGraph:{title:title[l],description:description[l],url:canonical,type:"website"}}}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!locales.includes(locale as Locale))notFound();return <PdfCompressorPage locale={locale as Locale}/>}
