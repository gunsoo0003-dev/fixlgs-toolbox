import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type RecordItem = {
  title: string;
  project: string;
  status: TestResult["status"];
  durationMs: number;
  skipReason: string;
  errorSummary: string;
};

function projectName(test: TestCase): string {
  try {
    return test.parent.project()?.name ?? "unknown-project";
  } catch {
    return "unknown-project";
  }
}

function compactError(result: TestResult): string {
  const message = result.error?.message ?? result.errors?.[0]?.message ?? "";
  return message
    .replace(/\x1B\[[0-9;]*m/g, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? "원인 미기록";
}

function skipReason(test: TestCase): string {
  const annotation = [...test.annotations].reverse().find((item) => item.type === "skip" || item.type === "fixme");
  return annotation?.description?.trim() || "의도된 조건부 스킵(사유 미기록)";
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const value = key(item);
    const bucket = grouped.get(value) ?? [];
    bucket.push(item);
    grouped.set(value, bucket);
  }
  return grouped;
}

export default class GroupedSummaryReporter implements Reporter {
  private readonly records: RecordItem[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    this.records.push({
      title: test.titlePath().slice(1).join(" > "),
      project: projectName(test),
      status: result.status,
      durationMs: result.duration,
      skipReason: result.status === "skipped" ? skipReason(test) : "",
      errorSummary: result.status === "failed" || result.status === "timedOut" || result.status === "interrupted"
        ? compactError(result)
        : "",
    });
  }

  onEnd(result: FullResult): void {
    const outputDir = resolve(process.cwd(), "test-results");
    mkdirSync(outputDir, { recursive: true });

    const passed = this.records.filter((item) => item.status === "passed");
    const failed = this.records.filter((item) => ["failed", "timedOut", "interrupted"].includes(item.status));
    const skipped = this.records.filter((item) => item.status === "skipped");
    const flaky = this.records.filter((item) => item.status === "passed" && item.durationMs > 60_000);

    const failureGroups = [...groupBy(failed, (item) => `${item.title}\n${item.errorSummary}`).values()].map((items) => ({
      title: items[0].title,
      cause: items[0].errorSummary,
      affectedProjects: [...new Set(items.map((item) => item.project))],
      occurrences: items.length,
    }));

    const skipGroups = [...groupBy(skipped, (item) => `${item.title}\n${item.skipReason}`).values()].map((items) => ({
      title: items[0].title,
      reason: items[0].skipReason,
      affectedProjects: [...new Set(items.map((item) => item.project))],
      occurrences: items.length,
    }));

    const summary = {
      generatedAt: new Date().toISOString(),
      overallStatus: result.status,
      counts: {
        total: this.records.length,
        passed: passed.length,
        failed: failed.length,
        skipped: skipped.length,
      },
      failureGroups,
      skipGroups,
      slowPassedTests: flaky.map((item) => ({ title: item.title, project: item.project, durationMs: item.durationMs })),
    };

    const lines: string[] = [
      "TOOLBOX 통합 자동검수 요약",
      `생성: ${summary.generatedAt}`,
      `최종 상태: ${summary.overallStatus}`,
      "",
      `전체 ${summary.counts.total} / 통과 ${summary.counts.passed} / 실패 ${summary.counts.failed} / 스킵 ${summary.counts.skipped}`,
      "",
      "[동일 원인으로 묶은 실패]",
    ];

    if (failureGroups.length === 0) {
      lines.push("없음");
    } else {
      failureGroups.forEach((group, index) => {
        lines.push(`${index + 1}. ${group.title}`);
        lines.push(`   원인: ${group.cause}`);
        lines.push(`   영향: ${group.affectedProjects.join(", ")} (${group.occurrences}건)`);
      });
    }

    lines.push("", "[의도된 스킵과 사유]");
    if (skipGroups.length === 0) {
      lines.push("없음");
    } else {
      skipGroups.forEach((group, index) => {
        lines.push(`${index + 1}. ${group.title}`);
        lines.push(`   사유: ${group.reason}`);
        lines.push(`   대상: ${group.affectedProjects.join(", ")} (${group.occurrences}건)`);
      });
    }

    if (flaky.length > 0) {
      lines.push("", "[60초 초과 통과 항목]");
      flaky.forEach((item) => lines.push(`- ${item.title} / ${item.project} / ${item.durationMs}ms`));
    }

    writeFileSync(resolve(outputDir, "toolbox-validation-summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    writeFileSync(resolve(outputDir, "toolbox-validation-summary.txt"), `${lines.join("\n")}\n`, "utf8");

    console.log("\n[TOOLBOX VALIDATION SUMMARY]");
    console.log(`PASS ${passed.length} / FAIL ${failed.length} / SKIP ${skipped.length}`);
    if (failureGroups.length > 0) {
      console.log(`Grouped failures: ${failureGroups.length}`);
      failureGroups.forEach((group, index) => {
        console.log(`${index + 1}. ${group.title} | ${group.affectedProjects.join(", ")} | ${group.cause}`);
      });
    }
    if (skipGroups.length > 0) {
      console.log(`Intentional skip groups: ${skipGroups.length}`);
      skipGroups.forEach((group, index) => {
        console.log(`${index + 1}. ${group.title} | ${group.affectedProjects.join(", ")} | ${group.reason}`);
      });
    }
    console.log("Summary files: test-results/toolbox-validation-summary.txt / .json\n");
  }
}
