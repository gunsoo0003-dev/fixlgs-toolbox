export type Tool045Date = Readonly<{ year:number; month:number; day:number }>;
export type Tool045CalendarDuration = Readonly<{ years:number; months:number; days:number }>;
export type Tool045Result = Readonly<{
  elapsedDays:number;
  appliedDays:number;
  weeks:number;
  remainderDays:number;
  calendar:Tool045CalendarDuration;
  weekdays:number;
  weekends:number;
}>;

export const TOOL045_TECHNICAL_YEAR_RANGE = Object.freeze({ min:1, max:9999 });

export function isTool045LeapYear(year:number):boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
export function tool045DaysInMonth(year:number, month:number):number {
  if (month === 2) return isTool045LeapYear(year) ? 29 : 28;
  return [4,6,9,11].includes(month) ? 30 : 31;
}
export function parseTool045Date(value:string):Tool045Date | null {
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if(!m) return null;
  const year=Number(m[1]), month=Number(m[2]), day=Number(m[3]);
  if(year<TOOL045_TECHNICAL_YEAR_RANGE.min||year>TOOL045_TECHNICAL_YEAR_RANGE.max||month<1||month>12) return null;
  if(day<1||day>tool045DaysInMonth(year,month)) return null;
  return {year,month,day};
}

// Gregorian civil date -> integer serial. Timezone and Date parsing are intentionally not used.
export function tool045DateSerial(date:Tool045Date):number {
  let y=date.year;
  const m=date.month;
  y -= m <= 2 ? 1 : 0;
  const era=Math.floor(y/400);
  const yoe=y-era*400;
  const mp=m+(m>2?-3:9);
  const doy=Math.floor((153*mp+2)/5)+date.day-1;
  const doe=yoe*365+Math.floor(yoe/4)-Math.floor(yoe/100)+doy;
  return era*146097+doe-719468;
}
function compareDate(a:Tool045Date,b:Tool045Date):number { return tool045DateSerial(a)-tool045DateSerial(b); }
function exactAddMonths(start:Tool045Date, months:number):Tool045Date|null {
  const zero=(start.year*12+(start.month-1))+months;
  const year=Math.floor(zero/12), month=(zero%12)+1;
  if(year<1||year>9999||start.day>tool045DaysInMonth(year,month)) return null;
  return {year,month,day:start.day};
}
function exactAddYears(start:Tool045Date, years:number):Tool045Date|null {
  const year=start.year+years;
  if(year<1||year>9999||start.day>tool045DaysInMonth(year,start.month)) return null;
  return {year,month:start.month,day:start.day};
}
export function tool045CalendarDuration(start:Tool045Date,end:Tool045Date):Tool045CalendarDuration {
  if(compareDate(start,end)>0) throw new RangeError('START_AFTER_END');
  let years=Math.max(0,end.year-start.year);
  while(years>0){const d=exactAddYears(start,years);if(d&&compareDate(d,end)<=0)break;years--;}
  let anchor=exactAddYears(start,years)??start;
  let months=Math.max(0,(end.year-anchor.year)*12+(end.month-anchor.month));
  while(months>0){const d=exactAddMonths(anchor,months);if(d&&compareDate(d,end)<=0)break;months--;}
  anchor=exactAddMonths(anchor,months)??anchor;
  const days=tool045DateSerial(end)-tool045DateSerial(anchor);
  return {years,months,days};
}
function weekdayFromSerial(serial:number):number { return ((serial+4)%7+7)%7; } // 0 Sun ... 6 Sat; 1970-01-01 Thu
function countWeekdaysAndWeekends(firstSerial:number,count:number):{weekdays:number;weekends:number}{
  if(count<=0)return{weekdays:0,weekends:0};
  const fullWeeks=Math.floor(count/7);
  let weekends=fullWeeks*2;
  const rest=count%7;
  for(let i=0;i<rest;i++){const dow=weekdayFromSerial(firstSerial+fullWeeks*7+i);if(dow===0||dow===6)weekends++;}
  return {weekdays:count-weekends,weekends};
}
export function calculateTool045(startText:string,endText:string,includeStart:boolean):Tool045Result {
  const start=parseTool045Date(startText), end=parseTool045Date(endText);
  if(!start||!end) throw new RangeError('INVALID_DATE');
  const startSerial=tool045DateSerial(start), endSerial=tool045DateSerial(end);
  if(startSerial>endSerial) throw new RangeError('START_AFTER_END');
  const elapsedDays=endSerial-startSerial;
  const appliedDays=elapsedDays+(includeStart?1:0);
  const firstSerial=includeStart?startSerial:startSerial+1;
  const dayTypes=countWeekdaysAndWeekends(firstSerial,appliedDays);
  return {
    elapsedDays,
    appliedDays,
    weeks:Math.floor(appliedDays/7),
    remainderDays:appliedDays%7,
    calendar:tool045CalendarDuration(start,end),
    weekdays:dayTypes.weekdays,
    weekends:dayTypes.weekends,
  };
}
