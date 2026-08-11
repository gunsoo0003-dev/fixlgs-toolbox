import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'node:fs';
import path from 'node:path';

type AttachmentRecord = { name: string; contentType: string; path: string };
type Row = {
  title: string;
  project: string;
  status: TestResult['status'];
  durationMs: number;
  errors: string[];
  attachments: AttachmentRecord[];
};

function stripAnsi(value: string): string {
  return value.replace(/\x1B\[[0-9;]*m/g, '');
}

function projectName(test: TestCase): string {
  try { return test.parent.project()?.name ?? 'unknown-project'; } catch { return 'unknown-project'; }
}

function safeRelative(root: string, filePath?: string): string {
  if (!filePath) return '';
  const abs = path.resolve(filePath);
  const rel = path.relative(root, abs);
  return rel.startsWith('..') ? abs : rel;
}

export default class Tool001WorkflowDiagnosticReporter implements Reporter {
  private readonly rows: Row[] = [];
  private root = process.cwd();

  onTestEnd(test: TestCase, result: TestResult): void {
    const errors = (result.errors?.length ? result.errors : result.error ? [result.error] : [])
      .map((e) => stripAnsi(String(e?.message || e?.stack || e || '')).trim())
      .filter(Boolean);
    const attachments = (result.attachments || []).map((a) => ({
      name: a.name || 'attachment',
      contentType: a.contentType || '',
      path: safeRelative(this.root, a.path),
    }));
    this.rows.push({
      title: test.titlePath().slice(1).join(' > '),
      project: projectName(test),
      status: result.status,
      durationMs: result.duration,
      errors,
      attachments,
    });
  }

  onEnd(result: FullResult): void {
    const outDir = path.join(this.root, 'test-results');
    fs.mkdirSync(outDir, { recursive: true });
    const failedStatuses = new Set(['failed', 'timedOut', 'interrupted']);
    const counts = {
      total: this.rows.length,
      passed: this.rows.filter((r) => r.status === 'passed').length,
      failed: this.rows.filter((r) => failedStatuses.has(r.status)).length,
      skipped: this.rows.filter((r) => r.status === 'skipped').length,
    };
    const payload = {
      version: 19,
      generatedAt: new Date().toISOString(),
      overallStatus: result.status,
      counts,
      tests: this.rows,
    };
    fs.writeFileSync(path.join(outDir, 'tool001-mobile-workflow-detail.json'), JSON.stringify(payload, null, 2) + '\n');

    const lines: string[] = [
      'TOOL001 MOBILE WORKFLOW DETAIL V19',
      `OVERALL=${result.status}`,
      `TOTAL=${counts.total}`,
      `PASS=${counts.passed}`,
      `FAIL=${counts.failed}`,
      `SKIP=${counts.skipped}`,
      '',
    ];
    this.rows.forEach((row, i) => {
      lines.push(`[${i + 1}] ${row.status.toUpperCase()} | ${row.project} | ${row.title} | ${row.durationMs}ms`);
      if (row.errors.length) {
        row.errors.forEach((err, j) => lines.push(`  ERROR_${j + 1}: ${err.replace(/\r?\n/g, '\n  ')}`));
      }
      if (row.attachments.length) {
        row.attachments.forEach((a, j) => lines.push(`  ATTACH_${j + 1}: ${a.name} | ${a.contentType} | ${a.path || 'BODY_ONLY'}`));
      }
    });
    fs.writeFileSync(path.join(outDir, 'tool001-mobile-workflow-detail.txt'), lines.join('\n') + '\n');
  }
}
