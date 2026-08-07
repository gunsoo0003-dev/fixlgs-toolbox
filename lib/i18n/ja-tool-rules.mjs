export const JA_AVOID_TERMS = [
  { preferred: "サイズ変更", avoid: ["リサイズ"] },
  { preferred: "ぼかし", avoid: ["ブラー"] },
  { preferred: "変換ツール", avoid: ["コンバーター"] },
  { preferred: "確認ツール", avoid: ["検査ツール"] },
  { preferred: "Webサイト", avoid: ["ウェブサイト"] },
  { preferred: "Web画像", avoid: ["ウェブ画像"] },
];

export const JA_CARD_TITLE_RULES = {
  maxLines: 2,
  protectedSuffixes: ["ツール", "作成ツール", "生成ツール", "確認ツール"],
  requireExplicitSemanticBreaks: true,
  checkMobileSeparately: true,
};
