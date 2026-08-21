import {runFinalizedDesignCheck} from '../check-finalized-design-contract.mjs';
const r=runFinalizedDesignCheck(80);
process.exitCode=r.fail?1:0;
