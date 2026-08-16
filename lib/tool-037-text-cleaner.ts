export type Tool037Eol = 'lf' | 'crlf';

export type Tool037Options = {
  collapseSpaces: boolean;
  trimEachLine: boolean;
  removeTabs: boolean;
  removeBlankLines: boolean;
  eol: Tool037Eol;
};

export type Tool037Summary = {
  spacesCollapsed: number;
  edgeWhitespaceRemoved: number;
  tabsRemoved: number;
  blankLinesRemoved: number;
  eolNormalized: boolean;
};

export const TOOL037_SERVICE_LIMITS = {
  maxCharacters: 1_000_000,
} as const;

export const TOOL037_DEFAULT_OPTIONS: Tool037Options = {
  collapseSpaces: true,
  trimEachLine: true,
  removeTabs: true,
  removeBlankLines: true,
  eol: 'lf',
};

function normalizeInternalEol(input: string) {
  return input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function normalizeText(input: string, options: Tool037Options) {
  if (input.length > TOOL037_SERVICE_LIMITS.maxCharacters) {
    throw new RangeError(`TOOL037_INPUT_TOO_LARGE:${TOOL037_SERVICE_LIMITS.maxCharacters}`);
  }

  const original = input;
  let text = normalizeInternalEol(input);
  const hadNonLfEol = /\r/.test(original);
  let spacesCollapsed = 0;
  let edgeWhitespaceRemoved = 0;
  let tabsRemoved = 0;
  let blankLinesRemoved = 0;

  if (options.removeTabs) {
    const matches = text.match(/\t/g);
    tabsRemoved = matches?.length ?? 0;
    text = text.replace(/\t/g, '');
  }

  let lines = text.split('\n');

  if (options.trimEachLine) {
    lines = lines.map((line) => {
      const next = line.replace(/^[ \t]+|[ \t]+$/g, '');
      edgeWhitespaceRemoved += line.length - next.length;
      return next;
    });
  }

  if (options.collapseSpaces) {
    lines = lines.map((line) => line.replace(/ {2,}/g, (run) => {
      spacesCollapsed += run.length - 1;
      return ' ';
    }));
  }

  if (options.removeBlankLines) {
    const before = lines.length;
    lines = lines.filter((line) => line.length > 0);
    blankLinesRemoved = before - lines.length;
  }

  let output = lines.join('\n');
  if (options.eol === 'crlf') output = output.replace(/\n/g, '\r\n');

  const summary: Tool037Summary = {
    spacesCollapsed,
    edgeWhitespaceRemoved,
    tabsRemoved,
    blankLinesRemoved,
    eolNormalized: hadNonLfEol || options.eol === 'crlf',
  };

  return { output, summary };
}
