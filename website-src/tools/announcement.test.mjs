import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context = vm.createContext({ window: {}, URL });
vm.runInContext(
  fs.readFileSync(new URL('../admin/announcement.js', import.meta.url), 'utf8'),
  context,
);
const parse = (s, kind = 'courses') =>
  JSON.parse(JSON.stringify(context.window.HaodaoAnnouncement.parse(s, '2026-10-07', kind)));
test('extracts a course announcement and preserves original text', () => {
  const raw =
    '🌿 活動名稱：生命再前進\n日期：2026/10/24（六）～25（日）\n時間：09:00-16:30\n地點：昊道文化教室\n形式：實體\n報名連結：https://forms.gle/example\n報名截止：2026/10/20\n歡迎同行。';
  const { fields, warnings } = parse(raw);
  assert.deepEqual(fields, {
    description: raw,
    title: '生命再前進',
    location: '昊道文化教室',
    mode: '線下',
    start_date: '2026-10-24',
    end_date: '2026-10-25',
    start_time: '09:00',
    end_time: '16:30',
    registration_url: 'https://forms.gle/example',
  });
  assert.deepEqual(warnings, []);
});
test('community, ROC year, full-width characters and afternoon times', () => {
  const { fields } = parse(
    '北區共學\n日期：民國１１５年１０月２４日\n時間：下午２點半～５點\n地點：厚德共修點',
    'community',
  );
  assert.equal(fields.start_date, '2026-10-24');
  assert.equal(fields.region, '北區');
  assert.equal(fields.start_time, '14:30');
  assert.equal(fields.end_time, '17:00');
  assert.equal(fields.registration_url, undefined);
});
test('missing year is disclosed, rollover works, and date-like URLs/deadlines do not become event dates', () => {
  const r = parse('活動名稱：跨年共學\n日期：12/31-1/1\n時間：上午9:00–下午5:00\n地點：教室');
  assert.equal(r.fields.end_date, '2027-01-01');
  assert.match(r.warnings.join(' '), /未寫年份/);
  assert.equal(
    parse('活動名稱：分享\n報名截止：2026/10/20\nhttps://example.org/2026/10/24').fields.start_date,
    undefined,
  );
});
test('invalid or separate dates and multiple time slots require human review', () => {
  for (const date of [
    '2026/2/30',
    '2026/10/24、10/31',
    '2026/10/24、10/25、10/26',
    '2026/11/3-10/2',
  ])
    assert.equal(parse(`活動名稱：共學\n日期：${date}`).fields.start_date, undefined);
  const times = parse('活動名稱：共學\n日期：2026/10/24\n時間：09:00-10:00、14:00-16:00');
  assert.equal(times.fields.start_time, undefined);
  assert.equal(
    parse('活動名稱：共學\n日期：2026/10/24\n時間：25:00-26:00').fields.start_time,
    undefined,
  );
});
test('only registration links are selected; malicious text stays plain and empty input is safe', () => {
  const r = parse(
    '活動名稱：分享\n網站：https://example.org/\n報名連結：\nhttps://example.org/signup\n<script>alert(1)</script>',
  );
  assert.equal(r.fields.registration_url, 'https://example.org/signup');
  assert.match(r.fields.description, /<script>/);
  assert.deepEqual(parse('').fields, {});
  assert.equal(
    parse('活動名稱：活動\n報名：https://x.org/a 與 https://x.org/b').fields.registration_url,
    undefined,
  );
});
test('24-hour hyphenated times do not turn into dates', () => {
  const r = parse('活動名稱：課程\n日期：2026-10-24\n時間：09:00-17:00');
  assert.equal(r.fields.start_date, '2026-10-24');
  assert.equal(r.fields.end_time, '17:00');
});

test('only community announcements fill a region', () => {
  const text = '北區共學\n地區：北區\n日期：2026/10/24';
  assert.equal(parse(text, 'courses').fields.region, undefined);
  assert.equal(parse(text, 'community').fields.region, '北區');
});
