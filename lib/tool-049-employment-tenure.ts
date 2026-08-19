export type Tool049Date = Readonly<{year:number;month:number;day:number}>;
export type Tool049Duration = Readonly<{years:number;months:number;days:number}>;
export type Tool049PeriodInput = Readonly<{start:string;end:string}>;
export type Tool049PeriodResult = Readonly<{duration:Tool049Duration;totalDays:number}>;
export type Tool049TotalResult = Readonly<{duration:Tool049Duration;totalDays:number}>;

export const TOOL049_LIMITS = Object.freeze({minYear:1,maxYear:9999,maxRows:30});
const ISO_RE=/^(\d{4})-(\d{2})-(\d{2})$/;

export function isTool049LeapYear(year:number):boolean{return year%4===0&&(year%100!==0||year%400===0)}
export function tool049DaysInMonth(year:number,month:number):number{
 if(month<1||month>12)return 0;
 return [31,isTool049LeapYear(year)?29:28,31,30,31,30,31,31,30,31,30,31][month-1];
}
export function parseTool049Date(value:string):Tool049Date|null{
 const m=ISO_RE.exec(value);if(!m)return null;
 const year=Number(m[1]),month=Number(m[2]),day=Number(m[3]);
 if(year<TOOL049_LIMITS.minYear||year>TOOL049_LIMITS.maxYear||month<1||month>12||day<1||day>tool049DaysInMonth(year,month))return null;
 return{year,month,day};
}
export function tool049DateSerial(date:Tool049Date):number{
 let y=date.year;const m=date.month;y-=m<=2?1:0;const era=Math.floor(y/400);const yoe=y-era*400;const mp=m+(m>2?-3:9);const doy=Math.floor((153*mp+2)/5)+date.day-1;const doe=yoe*365+Math.floor(yoe/4)-Math.floor(yoe/100)+doy;return era*146097+doe-719468;
}
export function tool049DateFromSerial(serial:number):Tool049Date{
 let z=serial+719468;const era=Math.floor(z/146097);const doe=z-era*146097;const yoe=Math.floor((doe-Math.floor(doe/1460)+Math.floor(doe/36524)-Math.floor(doe/146096))/365);let y=yoe+era*400;const doy=doe-(365*yoe+Math.floor(yoe/4)-Math.floor(yoe/100));const mp=Math.floor((5*doy+2)/153);const day=doy-Math.floor((153*mp+2)/5)+1;const month=mp+(mp<10?3:-9);y+=month<=2?1:0;return{year:y,month,day};
}
function compare(a:Tool049Date,b:Tool049Date){return tool049DateSerial(a)-tool049DateSerial(b)}
function exactAddYears(start:Tool049Date,years:number):Tool049Date|null{const year=start.year+years;if(year<1||year>9999||start.day>tool049DaysInMonth(year,start.month))return null;return{year,month:start.month,day:start.day}}
function exactAddMonths(start:Tool049Date,months:number):Tool049Date|null{const zero=start.year*12+(start.month-1)+months;const year=Math.floor(zero/12),month=((zero%12)+12)%12+1;if(year<1||year>9999||start.day>tool049DaysInMonth(year,month))return null;return{year,month,day:start.day}}
export function tool049CalendarDuration(start:Tool049Date,end:Tool049Date):Tool049Duration{
 if(compare(start,end)>0)throw new RangeError('START_AFTER_END');
 let years=Math.max(0,end.year-start.year);while(years>0){const d=exactAddYears(start,years);if(d&&compare(d,end)<=0)break;years--}
 let anchor=exactAddYears(start,years)??start;let months=Math.max(0,(end.year-anchor.year)*12+(end.month-anchor.month));while(months>0){const d=exactAddMonths(anchor,months);if(d&&compare(d,end)<=0)break;months--}
 anchor=exactAddMonths(anchor,months)??anchor;const days=tool049DateSerial(end)-tool049DateSerial(anchor);return{years,months,days};
}
export function calculateTool049Period(startText:string,endText:string):Tool049PeriodResult{
 const start=parseTool049Date(startText),end=parseTool049Date(endText);if(!start||!end)throw new RangeError('INVALID_DATE');
 const totalDays=tool049DateSerial(end)-tool049DateSerial(start);if(totalDays<0)throw new RangeError('START_AFTER_END');
 return{duration:tool049CalendarDuration(start,end),totalDays};
}
// Multi-employment totals are first summed as exact elapsed days. The primary Y/M/D
// display then maps that cumulative day count onto a fixed Gregorian anchor so the
// result is deterministic and never uses average-month or floating-point conversion.
const TOTAL_ANCHOR:Tool049Date={year:2000,month:1,day:1};
export function totalTool049Periods(periods:readonly Tool049PeriodInput[]):Tool049TotalResult{
 if(periods.length<1)throw new RangeError('NO_PERIODS');if(periods.length>TOOL049_LIMITS.maxRows)throw new RangeError('TOO_MANY_ROWS');
 let totalDays=0;for(const p of periods)totalDays+=calculateTool049Period(p.start,p.end).totalDays;
 const end=tool049DateFromSerial(tool049DateSerial(TOTAL_ANCHOR)+totalDays);return{totalDays,duration:tool049CalendarDuration(TOTAL_ANCHOR,end)};
}
