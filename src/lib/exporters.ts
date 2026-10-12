import type { TestRecord } from '../data/seed'

/** Header + rows for exporting test records as CSV. */
export function recordCsv(records: TestRecord[]): [string[], (string | number)[][]] {
  return [
    ['測驗編號', '測驗名稱', '學號', '姓名', '年級', '測驗時間', '測驗成績', '測驗狀況', '考官'],
    records.map((r) => [r.no, r.testName, r.studentId, r.studentName, r.grade, r.testedAt, r.status === 'done' ? r.score : '', r.status === 'done' ? '已完成' : '未完成', r.examiner]),
  ]
}
