import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ValidationDashboard } from "@/components/dev/validation-dashboard";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function ValidationPage(){
  if(process.env.NODE_ENV !== "development") notFound();
  return <ValidationDashboard/>;
}
