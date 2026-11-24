const test = require('node:test');
const assert = require('node:assert/strict');
const { snapshot, recordText, summarizePeriod, rankMissingCharacters, parseHosts, permits, historyStore, localDay } = require('../tut-code-meter.user.js');

const article = '設計、設計、設計、設計、設計、構築、構築、構成、語彙、語彙';
const states = Object.fromEntries([...'設計築成語'].map(c => ['known:' + c, true]));
states['known:構'] = 'forgotten';
const page = { title: '設計の記事', host: 'news.test', siteName: '通信', url: 'https://news.test/story?p=1#top' };
const day1 = new Date(2025, 1, 28, 23, 59, 58), day2 = new Date(2025, 2, 1, 0, 0, 1);
const record = (date, extra = {}) => snapshot(article, states, { ...page, ...extra }, date);
const eligible = () => true;

function memory() {
  const data = new Map();
  const storage = {
    getValues: async keys => Object.fromEntries(keys.filter(k => data.has(k)).map(k => [k, data.get(k)])),
    setValue: async (k, v) => { data.set(k, structuredClone(v)); },
    listValues: async () => [...data.keys()],
    deleteValues: async keys => keys.forEach(k => data.delete(k)),
  };
  return { data, storage, ...historyStore(storage) };
}

test('未習得字を記事内と期間全体の延べ出現回数で並べ、旧履歴も合算する', () => {
  const current = snapshot('設計、構築、構築、語彙', { 'known:築': true }, page, day2);
  const legacy = {
    words: [
      { word: '設設', missing: ['設'], count: 2 },
      { word: '語彙', missing: ['語', '彙'], count: 1 },
    ],
  };
  assert.deepEqual(rankMissingCharacters([current]), [['構', 2], ['設', 1], ['計', 1], ['語', 1]]);
  assert.deepEqual(rankMissingCharacters([current, legacy]), [['設', 5], ['構', 2], ['語', 2], ['計', 1]]);
});

test('期間集計は保存済みの字数からミクロ平均を計算し、同じ未知語の回数を合算する', () => {
  const newer = snapshot('構築', {}, page, day2);
  const report = summarizePeriod([newer, record(day1)], localDay(day1), localDay(day2));
  assert.deepEqual(report.text.split('\n'), [
    '期間　2025-02-28 ～ 2025-03-01', '記事件数　2件',
    '現在のカバー率　68.2%（15/22字）', '全習得時のカバー率　90.9%（20/22字）', '対象内の習得率　75%（15/20字）',
    '未知語', '構築　3回', '構成　1回',
  ]);
  assert.equal(report.wordText, '構築\n語彙\n構成');
  assert.equal(report.tutWordText, '構築\n構成');
});

test('未知語の同数は新しい記録の初出順とし、対象字ゼロ・未知語ゼロ・日付の片側指定を扱う', () => {
  const newer = snapshot('構成、語彙', {}, page, day2);
  const older = snapshot('構築、語彙', {}, page, day1);
  assert.equal(summarizePeriod([newer, older], '', '').wordText, '語彙\n構成\n構築');
  const outside = summarizePeriod([snapshot('彙', {}, page, day1)], '', localDay(day1));
  assert.ok(outside.text.startsWith('期間　2025-02-28 以前\n'));
  assert.ok(outside.text.includes('対象内の習得率　—（0/0字）'));
  const known = summarizePeriod([snapshot('設計', states, page, day2)], localDay(day2), '');
  assert.ok(known.text.startsWith('期間　2025-03-01 以降\n'));
  assert.ok(known.text.endsWith('未知語\nなし'));
  assert.equal(known.wordText, '');
});

test('記録モードは明示的に選択し、正規化したホスト名だけを照合する', () => {
  const hosts = parseHosts('NEWS.test　news.test.\n例.jp, [::1]');
  assert.deepEqual(hosts, ['news.test', 'xn--fsq.jp', '[::1]']);
  for (const mode of ['allow', 'exclude']) {
    assert.equal(permits({ mode, hosts }, 'news.test'), mode === 'allow');
    assert.equal(permits({ mode, hosts }, 'other.news.test'), mode === 'exclude');
  }
  for (const policy of [null, { mode: 'off', hosts }, { mode: 'exclude' }]) assert.equal(permits(policy, 'news.test'), false);
  for (const bad of ['https://news.test/', 'new.test/a', '*.example.com', 'user@news.test', 'news.test:22']) {
    assert.throws(() => parseHosts(bad));
  }
});

test('各割合・分子分母・当時の忘れた字と外字だけを記録し、同じ内容をテキスト化する', () => {
  const saved = record(day1);
  assert.deepEqual(saved.metrics.map(m => [m.percent, m.num, m.den]), [['75%', 15, 20], ['90%', 18, 20], ['83.3%', 15, 18]]);
  assert.deepEqual(saved.words.map(w => [w.word, w.count, w.missing, w.forgotten, w.outside]),
    [['構築', 2, ['構'], ['構'], false], ['語彙', 2, ['彙'], [], true], ['構成', 1, ['構'], ['構'], false]]);
  const text = recordText(saved);
  for (const term of [page.title, page.url, page.siteName, '2025-02-28 23:59:58', '75%（15/20字）', '忘れた字：構']) assert.ok(text.includes(term));
  assert.ok(!text.includes('語彙'));
  assert.ok(!JSON.stringify(saved).includes('設計、設計'));
  assert.equal(snapshot('no kanji', states, page, day1), null);
  assert.equal(snapshot('彙', states, page, day1).metrics[2].percent, '—');
});

test('同日再訪、タブの逆順保存、日付をまたいだ別件と期間の両端を扱う', async () => {
  const db = memory();
  const old = record(day1);
  const newer = record(new Date(+day1 + 500), { title: '再訪' });
  const tomorrow = record(day2);
  const other = record(day1, { url: 'http://other.test/', host: 'other.test' });
  await Promise.all([newer, other, tomorrow].map(r => db.save(r, r.at, eligible)));
  await db.save(old, old.at, eligible);
  assert.equal([...db.data.keys()].filter(k => k.startsWith('article:')).length, 3);
  assert.deepEqual((await db.list()).map(r => r.title), [tomorrow.title, '再訪', other.title]);
  assert.equal((await db.list(localDay(day1), localDay(day1))).length, 2);
  assert.equal((await db.list(localDay(day2), '')).length, 1);
  assert.equal((await db.list('', '2025-02-27')).length, 0);
});

test('記事・サイト・全件削除が及ぶ範囲と開いたタブの再保存を区別する', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: +day2 + 50 });
  const db = memory();
  db.data.set('known:設', true);
  const old = record(day1), newer = record(day2);
  const other = record(day1, { url: 'https://other.test/a', host: 'other.test' });
  for (const r of [old, newer, other]) await db.save(r, r.at, eligible);
  await db.remove({ day: old.day, url: old.url });
  await db.save(old, old.at, eligible);
  assert.deepEqual((await db.list()).map(r => r.url), [newer.url, other.url]);
  await db.remove({ host: page.host });
  await db.save(newer, newer.at, eligible);
  assert.deepEqual((await db.list()).map(r => r.url), [other.url]);
  t.mock.timers.tick(1);
  const revisit = record(new Date());
  await db.save(revisit, revisit.at, eligible);
  assert.equal((await db.list()).length, 2);
  await db.remove({});
  assert.equal((await db.list()).length, 0);
  assert.ok(db.data.get('known:設'));
  assert.ok(![...db.data].some(([k]) => k.includes(page.host) || k.startsWith('article:')));
});

test('削除に重なった書き込みが遅れて完了しても履歴が復活しない', async () => {
  const db = memory();
  const naturalWrite = db.storage.setValue;
  let resume, entered;
  const paused = new Promise(r => { entered = r; });
  const gate = new Promise(r => { resume = r; });
  db.storage.setValue = async (k, v) => {
    if (k.startsWith('article:')) { entered(); await gate; }
    await naturalWrite(k, v);
  };
  const r = record(day1);
  const saving = db.save(r, r.at, eligible);
  await paused;
  await db.remove({ host: r.host });
  resume(); await saving;
  assert.deepEqual(await db.list(), []);
  assert.ok(![...db.data.keys()].some(k => k.startsWith('article:')));
});
