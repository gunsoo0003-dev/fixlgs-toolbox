declare module 'qpdf-wasm-esm-embedded' {
  type QPdfModule = {
    FS: { writeFile(path:string,data:Uint8Array):void; readFile(path:string):Uint8Array; unlink(path:string):void };
    callMain(args:string[]): number | void;
  };
  type Options = { noInitialRun?:boolean; print?:(text:string)=>void; printErr?:(text:string)=>void };
  export default function QPDF(options?:Options): Promise<QPdfModule>;
}
