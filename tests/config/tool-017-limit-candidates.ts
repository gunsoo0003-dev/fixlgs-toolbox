export const MiB=1024*1024;
export const TOOL017_LIMIT_CANDIDATES={
  selectedFiles:{normal:5,before:19,candidate:20,above:21,confidence:'medium',kind:'service-candidate'},
  perFileBytes:{normal:5*MiB,before:14*MiB,candidate:15*MiB,above:16*MiB,confidence:'medium',kind:'service-candidate'},
  totalBytes:{normal:30*MiB,before:79*MiB,candidate:80*MiB,above:81*MiB,confidence:'medium',kind:'service-candidate'},
  sourcePixels:{normal:12_000_000,before:23_000_000,candidate:24_000_000,above:25_000_000,confidence:'medium',kind:'service-candidate'},
  outputPixels:{normal:12_000_000,before:23_000_000,candidate:24_000_000,above:25_000_000,confidence:'medium',kind:'service-candidate'},
  textLength:{normal:80,before:299,candidate:300,above:301,confidence:'medium',kind:'service-candidate'}
} as const;
