import { notFound } from "next/navigation";
import { ValidationDashboard } from "@/components/dev/validation-dashboard";

export default function ValidationPage(){
  if(process.env.NODE_ENV !== "development") notFound();
  return <ValidationDashboard/>;
}
