export const TOOL040_INPUT_LIMIT_CANDIDATE = 300_000 as const;
export const TOOL040_CUSTOM_DELIMITER_LIMIT_CANDIDATE = 50 as const;
export const TOOL040_ITEM_LIMIT_CANDIDATE = 50_000 as const;

export type Tool040DelimiterKind = "newline" | "comma" | "tab" | "semicolon" | "pipe" | "space" | "custom";
export type Tool040QuoteMode = "none" | "single" | "double";
export type Tool040ListMode = "none" | "number" | "bullet" | "hyphen";

export type Tool040Options = Readonly<{
  sourceKind: Tool040DelimiterKind;
  targetKind: Tool040DelimiterKind;
  sourceCustom?: string;
  targetCustom?: string;
  trimItems: boolean;
  removeEmpty: boolean;
  quoteMode: Tool040QuoteMode;
  listMode: Tool040ListMode;
}>;

export type Tool040Result = Readonly<{
  output: string;
  itemCount: number;
  inputDelimiter: string;
  outputDelimiter: string;
}>;

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n|\r|\u2028|\u2029/g, "\n");
}

export function resolveTool040Delimiter(kind: Tool040DelimiterKind, custom = "", forSource = false): string {
  if (kind === "newline") return "\n";
  if (kind === "comma") return forSource ? "," : ", ";
  if (kind === "tab") return "\t";
  if (kind === "semicolon") return forSource ? ";" : "; ";
  if (kind === "pipe") return "|";
  if (kind === "space") return " ";
  if (!custom) throw new Error(forSource ? "SOURCE_CUSTOM_EMPTY" : "TARGET_CUSTOM_EMPTY");
  return custom;
}

export function parseTool040Items(text: string, kind: Tool040DelimiterKind, custom = ""): string[] {
  if (!text) return [];
  if (kind === "newline") return normalizeNewlines(text).split("\n");
  const delimiter = resolveTool040Delimiter(kind, custom, true);
  return text.split(delimiter);
}

export function escapeAndWrapTool040Item(item: string, mode: Tool040QuoteMode): string {
  if (mode === "none") return item;
  if (mode === "double") return `"${item.replaceAll('"', '""')}"`;
  return `'${item.replaceAll("'", "''")}'`;
}

export function decorateTool040Items(items: readonly string[], mode: Tool040ListMode): string[] {
  if (mode === "none") return [...items];
  if (mode === "number") return items.map((item, index) => `${index + 1}. ${item}`);
  if (mode === "bullet") return items.map((item) => `• ${item}`);
  return items.map((item) => `- ${item}`);
}

export function convertTool040(sourceText: string, options: Tool040Options): Tool040Result {
  const sourceDelimiter = resolveTool040Delimiter(options.sourceKind, options.sourceCustom ?? "", true);
  const targetDelimiter = resolveTool040Delimiter(options.targetKind, options.targetCustom ?? "", false);

  let items = parseTool040Items(sourceText, options.sourceKind, options.sourceCustom ?? "");
  if (options.trimItems) items = items.map((item) => item.trim());
  if (options.removeEmpty) items = items.filter((item) => item.length > 0);
  items = items.map((item) => escapeAndWrapTool040Item(item, options.quoteMode));
  items = decorateTool040Items(items, options.listMode);

  return {
    output: items.join(targetDelimiter),
    itemCount: items.length,
    inputDelimiter: sourceDelimiter,
    outputDelimiter: targetDelimiter,
  };
}
