export type Tool042Rule = Readonly<{ find: string; replacement: string }>;
export type Tool042Limits = Readonly<{
  maxInputCharacters: number;
  maxRules: number;
  maxFindLength: number;
  maxReplacementLength: number;
  maxResultCharacters: number;
}>;
export type Tool042RuleCount = Readonly<Tool042Rule & { count: number }>;
export type Tool042Result = Readonly<{
  output: string;
  totalCount: number;
  ruleCounts: readonly Tool042RuleCount[];
}>;

export const TOOL042_SERVICE_LIMITS: Tool042Limits = {
  maxInputCharacters: 1_000_000,
  maxRules: 100,
  maxFindLength: 1_000,
  maxReplacementLength: 10_000,
  maxResultCharacters: 5_000_000,
} as const;

export type Tool042ValidationError = Readonly<{
  code:
    | "EMPTY_FIND"
    | "DUPLICATE_FIND"
    | "RULE_LIMIT"
    | "FIND_LIMIT"
    | "REPLACEMENT_LIMIT"
    | "INPUT_LIMIT";
  ruleIndex?: number;
  message: string;
}>;

type Match = Readonly<{ start: number; end: number; ruleIndex: number }>;
type Folded = Readonly<{ text: string; map: readonly number[] }>;

function foldedWithOffsets(source: string): Folded {
  let text = "";
  const map: number[] = [];
  for (let i = 0; i < source.length;) {
    const cp = source.codePointAt(i)!;
    const width = cp > 0xffff ? 2 : 1;
    const piece = String.fromCodePoint(cp).toLocaleLowerCase("en-US");
    for (let j = 0; j < piece.length; j += 1) map.push(i);
    text += piece;
    i += width;
  }
  map.push(source.length);
  return { text, map };
}

function findAll(
  source: string,
  needle: string,
  caseSensitive: boolean,
): Array<Readonly<{ start: number; end: number }>> {
  if (caseSensitive) {
    const found: Array<{ start: number; end: number }> = [];
    let at = 0;
    while (at <= source.length) {
      const index = source.indexOf(needle, at);
      if (index < 0) break;
      found.push({ start: index, end: index + needle.length });
      at = index + Math.max(needle.length, 1);
    }
    return found;
  }

  const foldedSource = foldedWithOffsets(source);
  const foldedNeedle = needle.toLocaleLowerCase("en-US");
  const found: Array<{ start: number; end: number }> = [];
  let at = 0;
  while (at <= foldedSource.text.length) {
    const index = foldedSource.text.indexOf(foldedNeedle, at);
    if (index < 0) break;
    const endFolded = index + foldedNeedle.length;
    found.push({
      start: foldedSource.map[index] ?? source.length,
      end: foldedSource.map[endFolded] ?? source.length,
    });
    at = index + Math.max(foldedNeedle.length, 1);
  }
  return found;
}

export function validateTool042(
  sourceText: string,
  rules: readonly Tool042Rule[],
  caseSensitive = true,
): readonly Tool042ValidationError[] {
  const errors: Tool042ValidationError[] = [];
  if (sourceText.length > TOOL042_SERVICE_LIMITS.maxInputCharacters) {
    errors.push({
      code: "INPUT_LIMIT",
      message: `Input exceeds ${TOOL042_SERVICE_LIMITS.maxInputCharacters} characters.`,
    });
  }
  if (rules.length > TOOL042_SERVICE_LIMITS.maxRules) {
    errors.push({
      code: "RULE_LIMIT",
      message: `At most ${TOOL042_SERVICE_LIMITS.maxRules} rules are allowed.`,
    });
  }

  const seen = new Map<string, number>();
  rules.forEach((rule, index) => {
    if (!rule.find) {
      errors.push({
        code: "EMPTY_FIND",
        ruleIndex: index,
        message: "Find text cannot be empty.",
      });
    }
    if (rule.find.length > TOOL042_SERVICE_LIMITS.maxFindLength) {
      errors.push({
        code: "FIND_LIMIT",
        ruleIndex: index,
        message: `Find text is limited to ${TOOL042_SERVICE_LIMITS.maxFindLength} characters.`,
      });
    }
    if (rule.replacement.length > TOOL042_SERVICE_LIMITS.maxReplacementLength) {
      errors.push({
        code: "REPLACEMENT_LIMIT",
        ruleIndex: index,
        message: `Replacement text is limited to ${TOOL042_SERVICE_LIMITS.maxReplacementLength} characters.`,
      });
    }
    if (rule.find) {
      const collisionKey = caseSensitive
        ? rule.find
        : rule.find.toLocaleLowerCase("en-US");
      if (seen.has(collisionKey)) {
        errors.push({
          code: "DUPLICATE_FIND",
          ruleIndex: index,
          message: "This find text is duplicated under the selected case policy.",
        });
      } else {
        seen.set(collisionKey, index);
      }
    }
  });
  return errors;
}

export function replace042(
  sourceText: string,
  rules: readonly Tool042Rule[],
  caseSensitive: boolean,
): Tool042Result {
  const validation = validateTool042(sourceText, rules, caseSensitive);
  if (validation.length) throw new RangeError(validation[0].code);

  const candidates: Match[] = [];
  rules.forEach((rule, ruleIndex) => {
    for (const span of findAll(sourceText, rule.find, caseSensitive)) {
      candidates.push({ ...span, ruleIndex });
    }
  });

  candidates.sort(
    (a, b) =>
      a.start - b.start ||
      (b.end - b.start) - (a.end - a.start) ||
      a.ruleIndex - b.ruleIndex,
  );

  const accepted: Match[] = [];
  let cursor = -1;
  for (const candidate of candidates) {
    if (candidate.start < cursor) continue;
    accepted.push(candidate);
    cursor = candidate.end;
  }

  const counts = rules.map((rule) => ({ ...rule, count: 0 }));
  let output = "";
  let position = 0;
  for (const match of accepted) {
    output += sourceText.slice(position, match.start);
    output += rules[match.ruleIndex].replacement;
    position = match.end;
    counts[match.ruleIndex] = {
      ...counts[match.ruleIndex],
      count: counts[match.ruleIndex].count + 1,
    };
  }
  output += sourceText.slice(position);
  if (output.length > TOOL042_SERVICE_LIMITS.maxResultCharacters) {
    throw new RangeError("RESULT_LIMIT");
  }

  return {
    output,
    totalCount: accepted.length,
    ruleCounts: counts,
  };
}
