export const MiB=1024*1024;
export const TOOL015_LIMIT_CANDIDATES={
  selectedFiles:{normal:2,before:2,candidate:2,above:3,confidence:'high',kind:'confirmed-contract'},
  perFileBytes:{normal:5*MiB,before:14*MiB,candidate:15*MiB,above:16*MiB,confidence:'high',kind:'final-service-limit'},
  totalBytes:{normal:10*MiB,before:29*MiB,candidate:30*MiB,above:31*MiB,confidence:'high',kind:'final-service-limit'},
  sourcePixels:{normal:8_000_000,before:11_900_000,candidate:12_000_000,above:12_100_000,confidence:'high',kind:'final-service-limit'},
  outputMaxSide:{normal:1600,before:2999,candidate:3000,above:3001,confidence:'high',kind:'final-service-limit'},
  outputPixels:{normal:4_000_000,before:8_900_000,candidate:9_000_000,above:9_100_000,confidence:'high',kind:'final-service-limit'},
  labelLength:{normal:12,before:23,candidate:24,above:25,confidence:'high',kind:'final-service-limit'}
} as const;
