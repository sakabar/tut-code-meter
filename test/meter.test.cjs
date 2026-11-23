const test = require('node:test');
const assert = require('node:assert/strict');
const { target, parseLearned, classifyForgetInput, analyze, percentage, practiceText, isMeeting } = require('../tut-code-meter.user.js');

const article = '設計、設計、設計、設計、設計、構築、構築、構成、語彙、語彙';

test('標準配列2,525字を使用し、追加配列の彙を区別する', () => {
  assert.equal(target.size, 2525);
  for (const char of '設計構築成語') assert.ok(target.has(char));
  assert.ok(!target.has('彙'));
});

test('20字の受け入れ例を集計し、頻度・初出順でコピーする', () => {
  const learned = new Set('設計築成語');
  const { counts, characters, words } = analyze(article, learned);
  assert.deepEqual(counts, { learned: 15, missing: 3, outside: 2 });
  assert.deepEqual([percentage(15, 20), percentage(18, 20), percentage(15, 18)], ['75%', '90%', '83.3%']);
  assert.deepEqual(characters, [
    { char: '構', kind: 'missing', count: 3 },
    { char: '彙', kind: 'outside', count: 2 },
  ]);
  assert.deepEqual(words.map(item => [item.word, item.count, item.outside]),
    [['構築', 2, false], ['語彙', 2, true], ['構成', 1, false]]);
  assert.equal(practiceText(words, false), '構築\n構成');
  assert.equal(practiceText(words, true), '構築\n語彙\n構成');
  learned.add('構');
  const updated = analyze(article, learned);
  assert.deepEqual(updated.counts, { learned: 18, missing: 0, outside: 2 });
  assert.equal(practiceText(updated.words, false), '');
});

test('複合語の分節・送り仮名・同じ字の繰り返しを扱う', () => {
  const result = analyze('構築手順、環境を構築する、取り込む、人人', new Set());
  assert.equal(result.words.find(item => item.word === '構築').count, 2);
  assert.ok(result.words.some(item => item.word === '取り込む'));
  assert.equal(result.characters.find(item => item.char === '人').count, 2);
});

test('空範囲・外字のみ・補助面の漢字を扱う', () => {
  assert.deepEqual(analyze('かなABC123！々', new Set()).counts, { learned: 0, missing: 0, outside: 0 });
  assert.deepEqual(analyze('彙𠮷', new Set()).counts, { learned: 0, missing: 0, outside: 2 });
  assert.equal(percentage(0, 0), '—');
  assert.equal(percentage(0, 2), '0%');
  assert.equal(percentage(2, 2), '100%');
});

test('習得済み字の一括登録では空白と重複を除き、対象外を返す', () => {
  const { learned, rejected } = parseLearned(' 設設\n計　彙あ彙');
  assert.deepEqual([...learned], ['設', '計']);
  assert.deepEqual([...rejected], ['彙', 'あ']);
});

test('忘れた字への移動は現在の習得済み字だけを重複なく受け付ける', () => {
  const stored = { 'known:構': true, 'known:設': true, 'known:語': 'forgotten', 'known:築': false };
  assert.deepEqual(classifyForgetInput(' 構築\n語構　設計彙あ彙', stored), {
    move: ['構', '設'], already: ['語'], unlearned: ['築', '計'], outside: ['彙', 'あ'],
  });
  assert.deepEqual(classifyForgetInput('　\n', stored), { move: [], already: [], unlearned: [], outside: [] });
});

test('MeetはHTTPSの標準会議パスに限定する', () => {
  assert.ok(isMeeting(new URL('https://meet.google.com/abc-defg-hij?authuser=1#room')));
  assert.ok(isMeeting(new URL('https://meet.google.com/abc-defg-hij/')));
  for (const input of ['https://meet.google.com/', 'https://meet.google.com/landing',
    'https://meet.google.com/abc-defg-hij/other', 'https://example.com/abc-defg-hij',
    'http://meet.google.com/abc-defg-hij']) assert.equal(isMeeting(new URL(input)), false);
});
