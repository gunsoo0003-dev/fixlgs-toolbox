import {runFinalizedDesignCheck} from '../check-finalized-design-contract.mjs';
const r=runFinalizedDesignCheck(87);
process.exitCode=r.fail?1:0;
