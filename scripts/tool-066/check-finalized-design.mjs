import {runFinalizedDesignCheck} from '../check-finalized-design-contract.mjs';
const r=runFinalizedDesignCheck(66);
process.exitCode=r.fail?1:0;
