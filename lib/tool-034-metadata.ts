import { PDFDict, PDFDocument, PDFName } from 'pdf-lib';

export type Tool034Metadata={title:string;author:string;subject:string;keywords:string;creator:string;producer:string;creationDate:string;modDate:string;xmp:boolean};
const clean=(v:unknown)=>typeof v==='string'?v:'';
export async function readTool034Metadata(bytes:Uint8Array):Promise<{pageCount:number;metadata:Tool034Metadata}>{
  const doc=await PDFDocument.load(bytes,{updateMetadata:false,ignoreEncryption:false});
  let xmp=false; try{xmp=Boolean(doc.catalog.get(PDFName.of('Metadata')))}catch{}
  const creation=doc.getCreationDate(); const modification=doc.getModificationDate();
  return {pageCount:doc.getPageCount(),metadata:{
    title:clean(doc.getTitle()),author:clean(doc.getAuthor()),subject:clean(doc.getSubject()),keywords:clean(doc.getKeywords()),creator:clean(doc.getCreator()),producer:clean(doc.getProducer()),creationDate:creation?creation.toISOString():'',modDate:modification?modification.toISOString():'',xmp
  }};
}
function infoDict(doc:PDFDocument){const ref=doc.context.trailerInfo.Info;return ref?doc.context.lookupMaybe(ref,PDFDict):undefined;}
export async function writeTool034Metadata(bytes:Uint8Array,values:Pick<Tool034Metadata,'title'|'author'|'subject'|'keywords'>,removeAll=false){
  const doc=await PDFDocument.load(bytes,{updateMetadata:false,ignoreEncryption:false}); const info=infoDict(doc);
  if(removeAll){
    for(const key of ['Title','Author','Subject','Keywords','Creator','Producer','CreationDate','ModDate']) info?.delete(PDFName.of(key));
    doc.catalog.delete(PDFName.of('Metadata'));
  }else{
    if(values.title.trim()) doc.setTitle(values.title); else info?.delete(PDFName.of('Title'));
    if(values.author.trim()) doc.setAuthor(values.author); else info?.delete(PDFName.of('Author'));
    if(values.subject.trim()) doc.setSubject(values.subject); else info?.delete(PDFName.of('Subject'));
    if(values.keywords.trim()) doc.setKeywords(values.keywords.split(/[,;]+/).map((x)=>x.trim()).filter(Boolean)); else info?.delete(PDFName.of('Keywords'));
    // pdf-lib does not provide a safe generic XMP field synchronizer. Remove stale XMP so edited Info fields cannot conflict with old values.
    doc.catalog.delete(PDFName.of('Metadata'))
  }
  return doc.save({useObjectStreams:true,addDefaultPage:false,updateFieldAppearances:false});
}
