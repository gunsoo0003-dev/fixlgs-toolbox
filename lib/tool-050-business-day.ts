export type Tool050Country = 'KR'|'US'|'JP';
export type Tool050Direction = 'after'|'before';
export const TOOL050_LIMITS={maxRangeYears:20,maxCustomHolidays:200,minYear:1900,maxYear:2100} as const;
export type Holiday={date:string;name:{ko:string;en:string;ja:string}};
const H=(date:string,ko:string,en:string,ja:string):Holiday=>({date,name:{ko,en,ja}});

const HOLIDAYS:Record<Tool050Country,Holiday[]>={
 KR:[
  H('2025-01-01','신정','New Year’s Day','元日'),H('2025-01-28','설날 연휴','Lunar New Year Holiday','旧正月連休'),H('2025-01-29','설날','Lunar New Year','旧正月'),H('2025-01-30','설날 연휴','Lunar New Year Holiday','旧正月連休'),H('2025-03-01','삼일절','Independence Movement Day','三一節'),H('2025-03-03','삼일절 대체공휴일','Substitute Holiday','振替休日'),H('2025-05-05','어린이날·부처님오신날','Children’s Day / Buddha’s Birthday','こどもの日・釈迦誕生日'),H('2025-05-06','대체공휴일','Substitute Holiday','振替休日'),H('2025-06-06','현충일','Memorial Day','顕忠日'),H('2025-08-15','광복절','Liberation Day','光復節'),H('2025-10-03','개천절','National Foundation Day','開天節'),H('2025-10-05','추석 연휴','Chuseok Holiday','秋夕連休'),H('2025-10-06','추석','Chuseok','秋夕'),H('2025-10-07','추석 연휴','Chuseok Holiday','秋夕連休'),H('2025-10-08','추석 대체공휴일','Substitute Holiday','振替休日'),H('2025-10-09','한글날','Hangul Day','ハングルの日'),H('2025-12-25','성탄절','Christmas Day','クリスマス'),
  H('2026-01-01','신정','New Year’s Day','元日'),H('2026-02-16','설날 연휴','Lunar New Year Holiday','旧正月連休'),H('2026-02-17','설날','Lunar New Year','旧正月'),H('2026-02-18','설날 연휴','Lunar New Year Holiday','旧正月連休'),H('2026-03-01','삼일절','Independence Movement Day','三一節'),H('2026-03-02','삼일절 대체공휴일','Substitute Holiday','振替休日'),H('2026-05-05','어린이날','Children’s Day','こどもの日'),H('2026-05-24','부처님오신날','Buddha’s Birthday','釈迦誕生日'),H('2026-05-25','부처님오신날 대체공휴일','Substitute Holiday','振替休日'),H('2026-06-06','현충일','Memorial Day','顕忠日'),H('2026-08-15','광복절','Liberation Day','光復節'),H('2026-08-17','광복절 대체공휴일','Substitute Holiday','振替休日'),H('2026-09-24','추석 연휴','Chuseok Holiday','秋夕連休'),H('2026-09-25','추석','Chuseok','秋夕'),H('2026-09-26','추석 연휴','Chuseok Holiday','秋夕連休'),H('2026-09-28','추석 대체공휴일','Substitute Holiday','振替休日'),H('2026-10-03','개천절','National Foundation Day','開天節'),H('2026-10-05','개천절 대체공휴일','Substitute Holiday','振替休日'),H('2026-10-09','한글날','Hangul Day','ハングルの日'),H('2026-12-25','성탄절','Christmas Day','クリスマス'),
  H('2027-01-01','신정','New Year’s Day','元日'),H('2027-02-06','설날','Lunar New Year','旧正月'),H('2027-02-08','설날 대체공휴일','Substitute Holiday','振替休日'),H('2027-03-01','삼일절','Independence Movement Day','三一節'),H('2027-05-05','어린이날','Children’s Day','こどもの日'),H('2027-05-13','부처님오신날','Buddha’s Birthday','釈迦誕生日'),H('2027-06-06','현충일','Memorial Day','顕忠日'),H('2027-08-15','광복절','Liberation Day','光復節'),H('2027-08-16','광복절 대체공휴일','Substitute Holiday','振替休日'),H('2027-09-14','추석 연휴','Chuseok Holiday','秋夕連休'),H('2027-09-15','추석','Chuseok','秋夕'),H('2027-09-16','추석 연휴','Chuseok Holiday','秋夕連休'),H('2027-10-03','개천절','National Foundation Day','開天節'),H('2027-10-04','개천절 대체공휴일','Substitute Holiday','振替休日'),H('2027-10-09','한글날','Hangul Day','ハングルの日'),H('2027-10-11','한글날 대체공휴일','Substitute Holiday','振替休日'),H('2027-12-25','성탄절','Christmas Day','クリスマス'),H('2027-12-27','성탄절 대체공휴일','Substitute Holiday','振替休日')
 ],
 US:[
  ...usYear(2025),...usYear(2026),...usYear(2027)
 ],
 JP:[
  ...jpYear(2025),...jpYear(2026),...jpYear(2027)
 ]
};

function pad(n:number){return String(n).padStart(2,'0')}
function iso(y:number,m:number,d:number){return `${y}-${pad(m)}-${pad(d)}`}
function utcDay(y:number,m:number,d:number){return new Date(Date.UTC(y,m-1,d)).getUTCDay()}
function nthWeekday(y:number,m:number,weekday:number,n:number){let d=1+(7+weekday-utcDay(y,m,1))%7+7*(n-1);return iso(y,m,d)}
function lastWeekday(y:number,m:number,weekday:number){const last=new Date(Date.UTC(y,m,0)).getUTCDate();return iso(y,m,last-(7+utcDay(y,m,last)-weekday)%7)}
function observed(y:number,m:number,d:number){const w=utcDay(y,m,d); if(w===6)return iso(y,m,d-1); if(w===0)return iso(y,m,d+1); return iso(y,m,d)}
function usYear(y:number):Holiday[]{return [
 H(observed(y,1,1),"미국 신정","New Year’s Day","米国元日"),H(nthWeekday(y,1,1,3),'마틴 루터 킹 주니어 데이','Martin Luther King Jr. Day','キング牧師記念日'),H(nthWeekday(y,2,1,3),'대통령의 날','Washington’s Birthday','大統領の日'),H(lastWeekday(y,5,1),'메모리얼 데이','Memorial Day','メモリアルデー'),H(observed(y,6,19),'준틴스','Juneteenth','ジューンティーンス'),H(observed(y,7,4),'독립기념일','Independence Day','独立記念日'),H(nthWeekday(y,9,1,1),'노동절','Labor Day','レイバーデー'),H(nthWeekday(y,10,1,2),'콜럼버스 데이','Columbus Day','コロンブスデー'),H(observed(y,11,11),'재향군인의 날','Veterans Day','退役軍人の日'),H(nthWeekday(y,11,4,4),'추수감사절','Thanksgiving Day','感謝祭'),H(observed(y,12,25),'크리스마스','Christmas Day','クリスマス')
]}
function jpYear(y:number):Holiday[]{
 const equinox:{[k:number]:[number,number]}={2025:[3,20],2026:[3,20],2027:[3,21]};
 const autumn:{[k:number]:[number,number]}={2025:[9,23],2026:[9,23],2027:[9,23]};
 const e=equinox[y]||[3,20],a=autumn[y]||[9,23];
 const holidays:Holiday[]=[
  H(iso(y,1,1),'일본 신정','New Year’s Day','元日'),H(nthWeekday(y,1,1,2),'성인의 날','Coming of Age Day','成人の日'),H(iso(y,2,11),'건국기념일','National Foundation Day','建国記念の日'),H(iso(y,2,23),'천황 탄생일','Emperor’s Birthday','天皇誕生日'),H(iso(y,e[0],e[1]),'춘분의 날','Vernal Equinox Day','春分の日'),H(iso(y,4,29),'쇼와의 날','Showa Day','昭和の日'),H(iso(y,5,3),'헌법기념일','Constitution Memorial Day','憲法記念日'),H(iso(y,5,4),'녹색의 날','Greenery Day','みどりの日'),H(iso(y,5,5),'어린이날','Children’s Day','こどもの日'),H(nthWeekday(y,7,1,3),'바다의 날','Marine Day','海の日'),H(iso(y,8,11),'산의 날','Mountain Day','山の日'),H(nthWeekday(y,9,1,3),'경로의 날','Respect for the Aged Day','敬老の日'),H(iso(y,a[0],a[1]),'추분의 날','Autumnal Equinox Day','秋分の日'),H(nthWeekday(y,10,1,2),'스포츠의 날','Sports Day','スポーツの日'),H(iso(y,11,3),'문화의 날','Culture Day','文化の日'),H(iso(y,11,23),'근로감사의 날','Labor Thanksgiving Day','勤労感謝の日')
 ];
 // Cabinet Office published substitute/citizens' holidays within the bundled 2025-2027 coverage.
 const supplements:Record<number,Holiday[]>={
  2025:[H('2025-02-24','일본 대체휴일','Substitute Holiday','休日'),H('2025-05-06','일본 대체휴일','Substitute Holiday','休日'),H('2025-11-24','일본 대체휴일','Substitute Holiday','休日')],
  2026:[H('2026-05-06','일본 대체휴일','Substitute Holiday','休日'),H('2026-09-22','일본 국민의 휴일','Citizens’ Holiday','休日')],
  2027:[H('2027-03-22','일본 대체휴일','Substitute Holiday','休日')]
 };
 return [...holidays,...(supplements[y]||[])].sort((a,b)=>a.date.localeCompare(b.date));
}

export function parseDate(value:string){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);if(!m)throw new Error('INVALID_DATE');const y=+m[1],mo=+m[2],d=+m[3];const t=Date.UTC(y,mo-1,d);const dt=new Date(t);if(dt.getUTCFullYear()!==y||dt.getUTCMonth()!==mo-1||dt.getUTCDate()!==d)throw new Error('INVALID_DATE');return {y,m:mo,d,serial:Math.floor(t/86400000)}}
export function fromSerial(serial:number){const d=new Date(serial*86400000);return iso(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate())}
export function weekday(value:string){return new Date(parseDate(value).serial*86400000).getUTCDay()}
export function holidayCoverage(country:Tool050Country){const years=HOLIDAYS[country].map(h=>+h.date.slice(0,4));return {min:Math.min(...years),max:Math.max(...years)}}
export function holidaysFor(country:Tool050Country){return HOLIDAYS[country]}
export function holidayMap(country:Tool050Country,custom:string[]=[]){const m=new Map<string,Holiday>();for(const h of HOLIDAYS[country])m.set(h.date,h);for(const date of [...new Set(custom)])m.set(date,H(date,'사용자 지정 휴일','Custom holiday','ユーザー指定休日'));return m}
export function isWeekend(date:string){const w=weekday(date);return w===0||w===6}
export function isBusinessDay(date:string,country:Tool050Country,excludeHolidays=true,custom:string[]=[]){if(isWeekend(date))return false;if(excludeHolidays&&holidayMap(country,custom).has(date))return false;return true}
export function validateRange(start:string,end:string){const a=parseDate(start),b=parseDate(end);if(b.serial<a.serial)throw new Error('REVERSED');const yearGap=b.y-a.y;const beyondAnniversary=yearGap>TOOL050_LIMITS.maxRangeYears||(yearGap===TOOL050_LIMITS.maxRangeYears&&(b.m>a.m||(b.m===a.m&&b.d>a.d)));if(beyondAnniversary)throw new RangeError('RANGE');return {a,b}}
export function calculateBusinessRange(start:string,end:string,country:Tool050Country,excludeHolidays=true,custom:string[]=[]){const {a,b}=validateRange(start,end);const hm=holidayMap(country,custom);let business=0,weekends=0,holidays=0;const excluded:Holiday[]=[];for(let s=a.serial;s<=b.serial;s++){const date=fromSerial(s);if(isWeekend(date)){weekends++;continue}const h=hm.get(date);if(excludeHolidays&&h){holidays++;excluded.push(h);continue}business++}return {businessDays:business,calendarDays:b.serial-a.serial+1,weekendDays:weekends,holidayDays:holidays,excludedHolidays:excluded}}
export function addBusinessDays(base:string,count:number,direction:Tool050Direction,country:Tool050Country,excludeHolidays=true,custom:string[]=[]){if(!Number.isInteger(count)||count<0)throw new Error('INVALID_COUNT');if(count>TOOL050_LIMITS.maxRangeYears*366)throw new RangeError('RANGE');const start=parseDate(base);if(count===0)return base;let s=start.serial,left=count,walked=0;const step=direction==='after'?1:-1;while(left>0){s+=step;walked++;if(walked>TOOL050_LIMITS.maxRangeYears*366)throw new RangeError('RANGE');const date=fromSerial(s);if(isBusinessDay(date,country,excludeHolidays,custom))left--}return fromSerial(s)}
export function normalizeCustomDates(values:string[]){const normalized=[...new Set(values.map(v=>{parseDate(v);return v}))].sort();if(normalized.length>TOOL050_LIMITS.maxCustomHolidays)throw new RangeError('CUSTOM_LIMIT');return normalized}
