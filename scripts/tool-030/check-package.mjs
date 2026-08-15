import fs from "node:fs";
const pkg=JSON.parse(fs.readFileSync("package.json","utf8")); const lock=JSON.parse(fs.readFileSync("package-lock.json","utf8")); let fail=0; const need=(ok,msg)=>{console.log(ok?"PASS":"FAIL",msg);if(!ok)fail++;};
need(pkg.dependencies?.["pdf-lib"]==="1.17.1","pdf-lib 1.17.1 pinned");
need(pkg.dependencies?.["pdfjs-dist"]==="5.4.54","pdfjs-dist 5.4.54 pinned");
need(lock.packages?.[""]?.dependencies?.["pdf-lib"]==="1.17.1","lock root pdf-lib");
need(lock.packages?.[""]?.dependencies?.["pdfjs-dist"]==="5.4.54","lock root pdfjs-dist");
need(lock.packages?.["node_modules/pdf-lib"]?.license==="MIT","pdf-lib license recorded");
need(lock.packages?.["node_modules/pdfjs-dist"]?.license==="Apache-2.0","pdfjs-dist license recorded");
process.exitCode=fail?1:0;
