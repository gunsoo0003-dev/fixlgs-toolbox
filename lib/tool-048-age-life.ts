export type Tool048Date = Readonly<{ year:number; month:number; day:number }>;
export type Tool048CalendarAge = Readonly<{ years:number; months:number; days:number }>;
export type Tool048Result = Readonly<{
  age:Tool048CalendarAge;
  yearAge:number;
  elapsedDays:number;
  nextBirthday:Tool048Date;
  nextBirthdayDays:number;
  birthdayToday:boolean;
  nextBirthdayWeekday:number;
  leapBirthdayPolicyApplied:boolean;
}>;

export const TOOL048_SERVICE_DATE_RANGE = Object.freeze({ min:"1900-01-01", max:"2100-12-31" });
export const TOOL048_LEAP_BIRTHDAY_POLICY = "FEB_28" as const;

export function isTool048LeapYear(year:number):boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
export function tool048DaysInMonth(year:number,month:number):number {
  if(month===2)return isTool048LeapYear(year)?29:28;
  return [4,6,9,11].includes(month)?30:31;
}
export function parseTool048Date(value:string):Tool048Date|null {
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if(!m)return null;
  const year=Number(m[1]),month=Number(m[2]),day=Number(m[3]);
  if(year<1||year>9999||month<1||month>12||day<1||day>tool048DaysInMonth(year,month))return null;
  return {year,month,day};
}
export function tool048DateSerial(date:Tool048Date):number {
  let y=date.year; const m=date.month; y-=m<=2?1:0;
  const era=Math.floor(y/400),yoe=y-era*400,mp=m+(m>2?-3:9);
  const doy=Math.floor((153*mp+2)/5)+date.day-1;
  const doe=yoe*365+Math.floor(yoe/4)-Math.floor(yoe/100)+doy;
  return era*146097+doe-719468;
}
function compare(a:Tool048Date,b:Tool048Date):number{return tool048DateSerial(a)-tool048DateSerial(b)}
function serviceRangeOk(text:string):boolean{return text>=TOOL048_SERVICE_DATE_RANGE.min&&text<=TOOL048_SERVICE_DATE_RANGE.max}
function birthdayInYear(dob:Tool048Date,year:number):{date:Tool048Date;policyApplied:boolean}{
  if(dob.month===2&&dob.day===29&&!isTool048LeapYear(year))return{date:{year,month:2,day:28},policyApplied:true};
  return{date:{year,month:dob.month,day:dob.day},policyApplied:false};
}
function addMonthsClamped(date:Tool048Date,months:number):Tool048Date{
  const zero=date.year*12+(date.month-1)+months;
  const year=Math.floor(zero/12),month=((zero%12)+12)%12+1;
  return{year,month,day:Math.min(date.day,tool048DaysInMonth(year,month))};
}
function calendarAge(dob:Tool048Date,asOf:Tool048Date):Tool048CalendarAge{
  let years=asOf.year-dob.year;
  let anniversary=birthdayInYear(dob,dob.year+years).date;
  if(compare(anniversary,asOf)>0){years--;anniversary=birthdayInYear(dob,dob.year+years).date;}
  let months=0,anchor=anniversary;
  while(months<11){const next=addMonthsClamped(anchor,1);if(compare(next,asOf)>0)break;anchor=next;months++;}
  const days=tool048DateSerial(asOf)-tool048DateSerial(anchor);
  return{years,months,days};
}
export function tool048Weekday(date:Tool048Date):number{return ((tool048DateSerial(date)+4)%7+7)%7}
export function formatTool048Date(date:Tool048Date):string{
  return `${String(date.year).padStart(4,"0")}-${String(date.month).padStart(2,"0")}-${String(date.day).padStart(2,"0")}`;
}
export function calculateTool048(dobText:string,asOfText:string):Tool048Result{
  if(!serviceRangeOk(dobText)||!serviceRangeOk(asOfText))throw new RangeError("OUT_OF_RANGE");
  const dob=parseTool048Date(dobText),asOf=parseTool048Date(asOfText);
  if(!dob||!asOf)throw new RangeError("INVALID_DATE");
  if(compare(dob,asOf)>0)throw new RangeError("DOB_AFTER_AS_OF");
  const elapsedDays=tool048DateSerial(asOf)-tool048DateSerial(dob);
  const currentBirthday=birthdayInYear(dob,asOf.year);
  let next=currentBirthday;
  if(compare(currentBirthday.date,asOf)<0)next=birthdayInYear(dob,asOf.year+1);
  const nextBirthdayDays=tool048DateSerial(next.date)-tool048DateSerial(asOf);
  return{
    age:calendarAge(dob,asOf),
    yearAge:asOf.year-dob.year,
    elapsedDays,
    nextBirthday:next.date,
    nextBirthdayDays,
    birthdayToday:nextBirthdayDays===0,
    nextBirthdayWeekday:tool048Weekday(next.date),
    leapBirthdayPolicyApplied:next.policyApplied,
  };
}
