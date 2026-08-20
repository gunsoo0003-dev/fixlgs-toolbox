export type Tool060Locale='ko'|'en'|'ja';
export type Tool060Mode='shoes'|'clothing';
export type Tool060Gender='men'|'women'|'kids';
export type Tool060Item='tops'|'bottoms';
export type Tool060System='KR'|'US'|'UK'|'EU'|'JP';
export type Tool060ShoeRow={id:string;footLengthMm:number;sizes:Record<Tool060System,string>};
export type Tool060ClothingRow={id:string;sizes:Record<Tool060System,string>;measurements:{chest?:[number,number];bust?:[number,number];waist?:[number,number];hip?:[number,number]}};

export const TOOL060_SYSTEMS=['KR','US','UK','EU','JP'] as const;
export const TOOL060_LIMITS={systems:5,genders:3,items:3,maxCountryCards:5} as const;
export const TOOL060_REFERENCE={shoe:'General international reference crosswalk; verify the product brand chart before purchase.',clothing:'General body-measurement reference; brand, fit and product construction can differ.'} as const;

const shoe=(id:string,footLengthMm:number,KR:string,US:string,UK:string,EU:string,JP:string):Tool060ShoeRow=>({id,footLengthMm,sizes:{KR,US,UK,EU,JP}});
export const TOOL060_SHOES:Record<Tool060Gender,readonly Tool060ShoeRow[]>={
 men:[shoe('m240',240,'240','6','5','39','24'),shoe('m245',245,'245','6.5','5.5','39.5','24.5'),shoe('m250',250,'250','7','6','40','25'),shoe('m255',255,'255','7.5','6.5','40.5','25.5'),shoe('m260',260,'260','8','7','41','26'),shoe('m265',265,'265','8.5','7.5','42','26.5'),shoe('m270',270,'270','9','8','42.5','27'),shoe('m275',275,'275','9.5','8.5','43','27.5'),shoe('m280',280,'280','10','9','44','28'),shoe('m285',285,'285','10.5','9.5','44.5','28.5'),shoe('m290',290,'290','11','10','45','29'),shoe('m295',295,'295','11.5','10.5','45.5','29.5'),shoe('m300',300,'300','12','11','46','30')],
 women:[shoe('w220',220,'220','5','3','35.5','22'),shoe('w225',225,'225','5.5','3.5','36','22.5'),shoe('w230',230,'230','6','4','36.5','23'),shoe('w235',235,'235','6.5','4.5','37.5','23.5'),shoe('w240',240,'240','7','5','38','24'),shoe('w245',245,'245','7.5','5.5','38.5','24.5'),shoe('w250',250,'250','8','6','39','25'),shoe('w255',255,'255','8.5','6.5','40','25.5'),shoe('w260',260,'260','9','7','40.5','26'),shoe('w265',265,'265','9.5','7.5','41','26.5'),shoe('w270',270,'270','10','8','42','27')],
 kids:[shoe('k160',160,'160','10C','9.5','27','16'),shoe('k170',170,'170','11C','10.5','28','17'),shoe('k180',180,'180','12C','11.5','29.5','18'),shoe('k190',190,'190','13C','12.5','31','19'),shoe('k200',200,'200','1Y','13.5','32','20'),shoe('k210',210,'210','2Y','1.5','33.5','21'),shoe('k220',220,'220','3Y','2.5','35','22'),shoe('k230',230,'230','4Y','3.5','36','23'),shoe('k240',240,'240','5Y','4.5','37.5','24'),shoe('k250',250,'250','6Y','5.5','39','25')]
};

const clothing=(id:string,KR:string,US:string,UK:string,EU:string,JP:string,measurements:Tool060ClothingRow['measurements']):Tool060ClothingRow=>({id,sizes:{KR,US,UK,EU,JP},measurements});
export const TOOL060_CLOTHING:Record<Tool060Gender,Record<Tool060Item,readonly Tool060ClothingRow[]>>={
 men:{
  tops:[clothing('mt90','90 / S','S','34','44','S',{chest:[86,91]}),clothing('mt95','95 / M','M','36','46','M',{chest:[91,96]}),clothing('mt100','100 / L','L','38','48','L',{chest:[96,101]}),clothing('mt105','105 / XL','XL','40','50','LL',{chest:[101,106]}),clothing('mt110','110 / XXL','XXL','42','52','3L',{chest:[106,112]})],
  bottoms:[clothing('mb28','28','28','28','44','71',{waist:[70,74],hip:[88,92]}),clothing('mb30','30','30','30','46','76',{waist:[75,79],hip:[93,97]}),clothing('mb32','32','32','32','48','81',{waist:[80,84],hip:[98,102]}),clothing('mb34','34','34','34','50','86',{waist:[85,89],hip:[103,107]}),clothing('mb36','36','36','36','52','91',{waist:[90,94],hip:[108,112]})]
 },
 women:{
  tops:[clothing('wt44','44 / XS','0-2','4-6','32-34','5-7',{bust:[78,82]}),clothing('wt55','55 / S','4','8','36','9',{bust:[83,87]}),clothing('wt66','66 / M','6-8','10-12','38-40','11-13',{bust:[88,94]}),clothing('wt77','77 / L','10-12','14-16','42-44','15-17',{bust:[95,101]}),clothing('wt88','88 / XL','14-16','18-20','46-48','19-21',{bust:[102,109]})],
  bottoms:[clothing('wb24','24','0','4','32','5',{waist:[60,64],hip:[84,88]}),clothing('wb26','26','2','6','34','7',{waist:[65,69],hip:[89,93]}),clothing('wb28','28','4','8','36','9',{waist:[70,74],hip:[94,98]}),clothing('wb30','30','6-8','10-12','38-40','11-13',{waist:[75,81],hip:[99,105]}),clothing('wb32','32','10','14','42','15',{waist:[82,87],hip:[106,111]})]
 },
 kids:{
  tops:[clothing('kt100','100','3T','3-4','98-104','100',{chest:[52,56]}),clothing('kt110','110','4T-5','4-5','104-110','110',{chest:[55,59]}),clothing('kt120','120','6','6-7','116-122','120',{chest:[58,62]}),clothing('kt130','130','7-8','8-9','128-134','130',{chest:[61,65]}),clothing('kt140','140','10','10-11','140-146','140',{chest:[64,69]})],
  bottoms:[clothing('kb100','100','3T','3-4','98-104','100',{waist:[50,53],hip:[56,60]}),clothing('kb110','110','4T-5','4-5','104-110','110',{waist:[52,55],hip:[59,63]}),clothing('kb120','120','6','6-7','116-122','120',{waist:[54,57],hip:[62,67]}),clothing('kb130','130','7-8','8-9','128-134','130',{waist:[56,59],hip:[66,71]}),clothing('kb140','140','10','10-11','140-146','140',{waist:[58,62],hip:[70,76]})]
 }
};

export function getTool060Rows(mode:Tool060Mode,gender:Tool060Gender,item:Tool060Item='tops'){return mode==='shoes'?TOOL060_SHOES[gender]:TOOL060_CLOTHING[gender][item];}
export function findTool060BySize(mode:Tool060Mode,gender:Tool060Gender,item:Tool060Item,system:Tool060System,size:string){const v=size.trim().toLowerCase();return getTool060Rows(mode,gender,item).filter(row=>row.sizes[system].toLowerCase()===v);}
export function findTool060ShoeByFootLength(gender:Tool060Gender,mm:number){if(!Number.isFinite(mm)||mm<=0)return[];return TOOL060_SHOES[gender].filter(r=>Math.abs(r.footLengthMm-mm)<=2.5);}
export function measurementText(row:Tool060ClothingRow,locale:Tool060Locale){const labels={ko:{chest:'가슴',bust:'가슴',waist:'허리',hip:'엉덩이'},en:{chest:'Chest',bust:'Bust',waist:'Waist',hip:'Hip'},ja:{chest:'胸囲',bust:'胸囲',waist:'ウエスト',hip:'ヒップ'}}[locale];return (Object.entries(row.measurements) as [keyof Tool060ClothingRow['measurements'],[number,number]][]).filter(([,v])=>v).map(([k,v])=>`${labels[k]} ${v[0]}–${v[1]} cm`).join(' · ');}
