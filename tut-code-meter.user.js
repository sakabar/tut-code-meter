// ==UserScript==
// @name         tut-code-meter
// @namespace    https://github.com/sakabar/tut-code-meter
// @version      2.2.6
// @description  許可したページのTUT-Codeカバー率と未知語を端末内に記録し、あとから振り返ります。
// @license      MIT AND BSD-3-Clause
// @match        https://*/*
// @match        http://*/*
// @noframes
// @run-at       document-start
// @run-in       normal-tabs
// @sandbox      DOM
// @grant        GM_info
// @grant        GM_registerMenuCommand
// @grant        GM.listValues
// @grant        GM.deleteValues
// @grant        GM.getValues
// @grant        GM_getValues
// @grant        GM.setValues
// @grant        GM.setValue
// @grant        GM_addValueChangeListener
// @grant        GM.getTab
// @grant        GM.saveTab
// @grant        GM.getTabs
// @grant        GM.setClipboard
// @grant        window.onurlchange
// ==/UserScript==

/*
MIT License

Copyright (c) 2026 sakabar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
TUT-Code base character set derived from uim's scm/tutcode-rule.scm
https://github.com/uim/uim/blob/master/scm/tutcode-rule.scm
Git blob 7958f6fcca352d014ce383e00c50b483752d2f9b
Copyright (c) 2003-2013 uim Project https://github.com/uim/uim

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. Neither the name of authors nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS ``AS IS'' AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
SUCH DAMAGE.
*/
(() => {
  'use strict';

  const target = new Set([
    '個視練状倉永栄市可文村険省路印撃将統石朝格旅玉県尾敷巻彼況即菱秋庫支室沢古構型装敗司械秀休農吉仲曜築竹融雨才景辺浴陸波森渋馬袋郵故',
    '働授居護油豊億齢極環角泉浦低例図究賞芸江不北歩教技号係側段巨清原商近容宝佐坂履権申確歌深賃約天直写助期続悪寮毎目根族書星言張過派未',
    '史花率介多意強実思再消身感始便挙切迎響別宇説席提義児守改補防戦対当委党流愛演応静施貸調何登私渡売打考長勤独全各保作話人定早平他無堂',
    '会街開指死合残免数結公談治者議両信団待諸子母店価望方増観自関世交語員女糸音米案兵上鈴男込規政習変住運現社重点生成試計利額監通帝含比',
    '準位藤軍南東高新円連力化夜由級松山代名製横動浜精航払材劇島職映大万中分夫画校題番首洋京前区楽制務階鋼聞止難在付土谷二国年四車験下物',
    '局課安電月部種台川戸友件審裁式経神道日三一十以間回所体育都五田業用橋給料収師殺適済正造共時八同面完設歴際薬色与小後問界武木火寺害量',
    '督塁葉城条海宿郎宅断様値編養担越岡卒門之幸蔵塚鉱署華厚末研岩草急崎光次然良論般字閣河半丸林庁芝元津振寄顔差親士雄阪六建九立加心銀告',
    '常毛船理百西園証駅労停満普洗爆坪春昇株鉄午外能販転勢領券久営接富終浅頭板州使左展空念曇黒青警主相講必解配並整税伝祭食返決向輸家赤茶',
    '品優細協先手特乗報参白修出熱選風足明管晴有今送募性発総病広福仕従場許美放味集形昨座最費反初的法専太基港版行退飛陽善衛井宮屋本地事千',
    '表氏度英院等口七野和及池産週服婦録答査志程役軽素組要来入受検着術買財帰追知積冷取効真算得線右注資活託見府官気予態少質健訪持競命導声',
    '争示御庭非具投進備記引想認求限羽遊単館短徳情推隊減丁王遇昭科学金工内民勝歳紙球果興町機第割央水伊企起抜違置奏酒評類討判器策若任失負',
    '読達伸復医好裏刊落雑扶畔壊端鶴季荻呂燃囲診拍殿喧殻盆蔑塾据腹繰碁酌衡閥拙孟蚊秦宍喝姦藻諭暇殖粒聡恭坐崩禄稼茨讃尋肯砕緊霧仁吸慕肩随',
    '顧伍乙侯詫吏鉢頑肥珍斎陳馳暦穀蒸矩虜芯賎萌薮帖叙云妃愉牡箇蔭釦戚允苛諜諺姐櫛淋渇丑峻烹惇抹汎迄苔弛兎鯛燭韓宴紺眺逐蜂悠禍窃頚悔桧覗',
    '或咽且己旋巳巧褐偵謀篤敦堤銚醍仔凌剥駿畿匁姑獅塵倭瓜醐溺箕脆烏劫椀餓琢爾褒縞枠龍牝碍娼葛叶璃狸蝕逸逓慈枯曙弧塊卑畠晃斑恕預丈硬債忠',
    '汽塩窯遺柳礎豚葬酢漸渥廓肇獣劣溜浸萩噴瞳盲斡爵挨匙拭堺嚇紛酔寒瓦馨唆膨沸寅賠隙詮冒偏斉柄卸甲避尻駒輝那栽敏碑該梢叡樫墳騎袖猛弊衰耶',
    '柵巾渚如盾奪滋愚虫倒牛維拡禁隻淑弥添痛納禅鳩遵旨翼滝折恋照漠唇怪鶏皆縄弐洛祇蓋滑冠誰抱拾牙豹寂楠賜尉尤耽饗牟晋毅梓婆麿伽膿榎乎罷柴',
    '帥幌燐疎桐抵唯到喪紘楓尽詠恩奴盃禿逗坦糾刈嗣朱崇椿斧斥汝泌眉蜜鎚汀凸灰享酬狩隷埼慾貰嶋藩抄塑淀狽稽虚貼撤頁睡遼厭缶栓峠鈍麗耗凹艦銭',
    '雲里渉徹透謄啓斗俊浩酪慧糊覆閉硫旗廃剣擦紐傑垂掘懸勺湘蛾腫釜伯孤称溶妄榊逢遮購鍵升礁卯索刑迫揮影刻偽椅芳曽緑漫乳亡控異婚夏幹供節存',
    '箱域幡周奥皮舟柱脱恵固岸客漁畑網綿勉副歓雇后駈厘駐頼礼倍兄宛摂桑悟隆辰廻圭宋揺冊菌晩射髪丙頬賄漬滞拝綱胃唄紅肉盛丘杉帯黄侵弁宗績炭',
    '略是削脳走令妻革属患威隣厳秘訳魂惟鞍羊泰墨聴乃戒菩銑潔暫畜篇刀雌靖廷宏娘傾欲誤廉尺鍛洞腕敬看敵鉛努絶援舎圧焼菓鴨君震荒又鳴妙粋唱均',
    '堀譲除桜浪虎則充幅催窮洪臆筒摘峰犬鎌陰迭煩勲峡沿祖蹟諏迦濁笠貝銅胸脅溝芙怠翁脇唐腰凡懲困障盟瀬繊移弦慢幕灯錠筆微祈遷毒列創魚典宣黙',
    '惜踊緒遅需晶宰癒叫濃祝暖珠杯累桶携斐魔彫兼抽脂責須依盗寝操飯招鏡就梶胎苑嘱狼還淡堅悩斜佳揚挑愁炎拷蓉旺蕗叱寛縦眠奨斤涼隔奮昆嶺勾嵯',
    '掲綾畳湯湖呼絡匹仙薄描桃皇哀燈刷雅逃突彦糖干陣押房核混余亭抑幾呑軌桂衝弟棄顕妹芦搭繭遭磯怨輩醜伺徴銃逮忍軸砲沈拒恨狭茎勃貨栗症模易',
    '希邸僚鳥郡枚拠粉腸戯因賦儀康布紡識扱温象血飲父至尊胴惰虐悲誇献童枕裳卓粛殴庶哉朔蝶冗皿暮騒亀絵憶肌奉蓄矛卵蛮遥岳伎項闘採疑仏旬離秒',
    '功吾飾怒仰筋致喫針舞徒喜豪密系遠欧謡宙零菅蘭涙危被乞替誕縮載吹握序俺茜床隈励片辞弱勇嘉牧浮勧惨仮憤劾寿疲硝邦境衆姿潟借攻夕臣博染較',
    '湾姉謝締破換犯眼舗傷豆穴災糧赴尿殉訟躍貫欠栃猟嵐懇貞租帽儒謎庸覇衷律壁襲釣妓炊憂蓮襟屈妖鹸獄悦暑酸併札丹扇執像菊泥届於仇刃陵痢包昌',
    '息踏掌訓呉穂翻捨伐羅篠屍餅朴癖縛戴碇鈎鮎鯉蝿頻檀硯屯糞琵苗践棚艶阜狗膜赦蛙粍凧桓篭挺旦乾遣秩頂跳欄壮薩曲拘玲此偶塀絞泳撮籍撲叉陛阻',
    '其冴擁玩卦酉杖迂詐燥脈狙妾蚕湧繍鮭吊歎潰罫鷲溢衿亨絢瑞勿彬岬畏腺頓竪鵬猪蟹佃艇猶暁賊臼鼓吟枢曳洩憧塞棒僧孫互樹竜夢緩梅塗了征封涯弔',
    '蹴甫呆磨岐柔腐倣縁湿蛇笹賭麓肘惣箔釘誉泡貌諾喉窟堕郭麺嬉詣珊鋭詞鼻票章背刺耳呈貴巡滅貯斬霞触机閑著鮮絹複妥冬措裕妨促幣拐腎吠汲嘩蒼',
    '壷糎痔廿壱肢俄朋蛋俣梨膝樽款錯邪剖飴帆飢撒稜蛍柑堆潤懐但途超沼束傍曹幼飼疾我慨挿夷綻弄咳葦悼芋鍋胤謬灼睦樺葵璽怖餌隼靴尚蒲詩快骨符',
    '喰誘匠錦哲胆飽筑寸範魅救継詰娠奔嫁嘆忘智灸麹倦呪繕嫌雰胞杏燕肋輔苫訊桟舌亮諦憾紋伏潜臓駆匡暢鯨凄烈弓贈聖罰窓衣激散捕捜脚墓歯鬼昼稲',
    '克択孔跡香測処請抗句耐慶惑雪源穣痕凪棺搬披祉瞬宵濫狐肪壌没猿頒唾奄辛稿酵彰熟浄欣虹剰慌耕猫露壇倫菜笑織盤降底俳麦承却順郷郊薫墾凍占',
    '鹿誌療銘鎖嬢焦譜矢探架馴亘俵詳粧戻更薦陥漏霊濯犠軟柏牌贋只吐筈乏准姓煎冥寡癌賓匂獲僕臥掛繁批願貿逆慰粗祥慣熊為謹凶巌狂層朗留亜伴笛',
    '侍既憩紳恐姻諒舘轄迷舶琴縫雷喬脹括疫裂析阿驚排賀延純奈孝標乱旧潮償拓牲崖蘇錘忙圏訂欺薪幻妊芽藍坑鳳雫棟悌虞趣往泣兆噂騰汗咲尭循怜裟',
    '賛昔煙苦去察速鑑益暴訴慎茂姫綜牢槻竿痘穫播徐李辱楚采嘘冨剛醤拳侮祐概帳也掃簡汚囚漆恒媒契液昂瑠粕甚煮謙泊甘澄挟朕錬叔彩臭魁卿曾庵凝',
    '遍厄憎旭芭撫緋舵裾渓淫碓捺嵩某滴庄諮胡賑叩恰甥忌尼埋穏傘奇憲候沖麻荘廊窒剤淵罪弾貧楼韻軒紹述臨砂双揃痴損釈覚誠濡昏灘幽似班辻覧汁搾',
    '碧匿殆漂頃噌苅屑汰紗瑛沙僅亦蓬蕉粟鼠塔柿剃釧槍肖墜鋳翌坊召欽把瓶寧肝堪爪脊稀逝酷誓隠賢恥羨蟻倹窪骸朽閃腿壬俸閲娯附径喚雁峯郁箸綴闇',
    '淳炉垣紀弘輪老函巣慮摩遂殊偉迅緯蔦爺鐘棋鷹簿股漢俗紫矯裸伶芹嫡鴎洲巴隅肺敢歪扉婿膳萎謁峨鋸稚膚駄群植否荷玄枝陶暗鎮氷擬橘酋醒鞭註串',
    '槙禎渦琶屠堰楯椎瞭舷鍾拶樋陪雀醸勘距磁佑芥丞詔貢培尖茅漕鞄勅宜霜槽粘倶兜畝莫髄亥悶蕪袴潅梱桁稔汐凱茸遡髭蒙杜砦',
  ].join(''));

  const kanji = /[\p{Script=Han}&&\p{Ideographic}]/v;
  const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });

  function parseLearned(input) {
    const learned = new Set();
    const rejected = new Set();
    for (const char of input) {
      if (!/\s/u.test(char)) (target.has(char) ? learned : rejected).add(char);
    }
    return { learned, rejected };
  }

  function classifyForgetInput(input, stored) {
    const { learned: candidates, rejected } = parseLearned(input);
    const result = { move: [], already: [], unlearned: [], outside: [...rejected] };
    for (const char of candidates) {
      const state = stored['known:' + char];
      if (state === true) result.move.push(char);
      else if (state === 'forgotten') result.already.push(char);
      else result.unlearned.push(char);
    }
    return result;
  }

  function analyze(text, learned) {
    const counts = { learned: 0, missing: 0, outside: 0 };
    const characters = new Map();
    for (const char of text) {
      if (!kanji.test(char)) continue;
      const kind = !target.has(char) ? 'outside' : learned.has(char) ? 'learned' : 'missing';
      counts[kind]++;
      if (kind === 'learned') continue;
      if (!characters.has(char)) characters.set(char, { char, kind, count: 0 });
      characters.get(char).count++;
    }
    const words = new Map();
    for (const { segment, isWordLike } of segmenter.segment(text)) {
      if (!isWordLike) continue;
      if (words.has(segment)) {
        words.get(segment).count++;
        continue;
      }
      const missing = [...new Set(segment)].filter(char => characters.has(char));
      if (missing.length) {
        words.set(segment, {
          word: segment, missing, outside: missing.some(char => !target.has(char)), count: 1,
        });
      }
    }
    // Stable sort preserves first occurrence on ties.
    const byFrequency = (items) => [...items.values()].sort((a, b) => b.count - a.count);
    return { counts, characters: byFrequency(characters), words: byFrequency(words) };
  }

  function percentage(numerator, denominator) {
    return denominator ? Number((100 * numerator / denominator).toFixed(1)) + '%' : '—';
  }

  function practiceText(words, includeOutside) {
    return words.filter(item => includeOutside || !item.outside).map(item => item.word).join('\n');
  }

  function isMeeting(url) {
    return url.origin === 'https://meet.google.com' && /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}\/?$/.test(url.pathname);
  }

  const metricNames = ['現在のカバー率', '全習得時のカバー率', '対象内の習得率'];
  const pad = n => String(n).padStart(2, '0');
  const localDay = date => [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
  const nonce = () => crypto.getRandomValues(new Uint32Array(3)).join('-');
  const profileKeys = [...target].map(char => 'known:' + char);

  function snapshot(text, states, page, date) {
    const learned = new Set([...target].filter(char => states['known:' + char] === true));
    const { counts, characters, words } = analyze(text, learned);
    const inside = counts.learned + counts.missing;
    const total = inside + counts.outside;
    if (!total) return null;
    return {
      ...page, at: date.getTime(), day: localDay(date),
      time: [date.getHours(), date.getMinutes(), date.getSeconds()].map(pad).join(':'),
      metrics: [[counts.learned, total], [inside, total], [counts.learned, inside]].map(
        ([num, den]) => ({ num, den, percent: percentage(num, den) })),
      missingCharacters: characters.filter(item => item.kind === 'missing').map(({ char, count }) => ({ char, count })),
      words: words.map(item => ({ ...item, forgotten: item.missing.filter(char => states['known:' + char] === 'forgotten') })),
    };
  }

  function rankMissingCharacters(records) {
    const counts = new Map();
    const add = (char, count) => counts.set(char, (counts.get(char) || 0) + count);
    for (const record of records) {
      if (record.missingCharacters) {
        for (const { char, count } of record.missingCharacters) add(char, count);
      } else {
        // Older records only retain occurrences of words containing unknown characters.
        for (const { word, missing, count } of record.words) {
          for (const char of word) if (target.has(char) && missing.includes(char)) add(char, count);
        }
      }
    }
    return [...counts].sort(([ , a], [ , b]) => b - a);
  }

  function metricLine({ num, den, percent = percentage(num, den) }, index) {
    return metricNames[index] + '　' + percent + '（' + num + '/' + den + '字）';
  }

  // history.list supplies the latest record per URL/day, newest first.
  function summarizePeriod(records, start, end) {
    const totals = metricNames.map(() => ({ num: 0, den: 0 }));
    const counts = new Map();
    for (const record of records) {
      record.metrics.forEach(({ num, den }, i) => {
        totals[i].num += num;
        totals[i].den += den;
      });
      for (const { word, count, outside } of record.words) {
        const total = counts.get(word);
        counts.set(word, { word, count: (total?.count || 0) + count, outside: outside || total?.outside });
      }
    }
    // A stable sort retains first appearance in the selected history on ties.
    const words = [...counts.values()].sort((a, b) => b.count - a.count);
    const tutWords = words.filter(item => !item.outside);
    let period = '全期間';
    if (start && end) period = start === end ? start : start + ' ～ ' + end;
    else if (start) period = start + ' 以降';
    else if (end) period = end + ' 以前';
    const text = [
      '期間　' + period, '記事件数　' + records.length + '件',
      ...totals.map(metricLine), '未知語',
      ...(tutWords.length ? tutWords.map(({ word, count }) => word + '　' + count + '回') : ['なし']),
    ].join('\n');
    return { text, wordText: practiceText(words, true), tutWordText: practiceText(words, false) };
  }

  function recordText(record) {
    const words = record.words.filter(item => !item.outside);
    return [
      record.day + ' ' + record.time, record.title, record.siteName, record.url,
      ...record.metrics.map(metricLine),
      '未知語', ...(words.length ? words.map(item => [
        item.word + '　' + item.count + '回', '打てなかった字：' + item.missing.join('・'),
        ...(item.forgotten.length ? ['忘れた字：' + item.forgotten.join('・')] : []),
      ].join(' ／ ')) : ['なし']),
    ].join('\n');
  }

  function parseHosts(input) {
    const hosts = new Set();
    for (const item of input.split(/[\s,、]+/u).filter(Boolean)) {
      // URL normalizes IDNs and IPv6. Require a hostname, without paths, ports or wildcards.
      if (/[/@?#*\\%]/u.test(item) || (item.includes(':') && !(item.startsWith('[') && item.endsWith(']')))) throw Error(item);
      const host = new URL('http://' + item).hostname.replace(/\.$/, '');
      if (!host || (!host.startsWith('[') && !host.split('.').every(label => /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(label)))) throw Error(item);
      hosts.add(host);
    }
    return [...hosts];
  }

  function permits(policy, hostname) {
    if (!policy || !Array.isArray(policy.hosts)) return false;
    const listed = policy.hosts.includes(hostname.replace(/\.$/, ''));
    return policy.mode === 'allow' ? listed : policy.mode === 'exclude' && !listed;
  }

  // A deletion fence only needs an opaque scope identifier and a cutoff time.
  // Use the same fingerprint on HTTPS and HTTP, where SubtleCrypto is unavailable.
  function scopeId(scope) {
    let hash = 0xcbf29ce484222325n;
    for (let i = 0; i < scope.length; i++) {
      hash = BigInt.asUintN(64, (hash ^ BigInt(scope.charCodeAt(i))) * 0x100000001b3n);
    }
    return hash.toString(36);
  }
  const hostnameOf = url => new URL(url).hostname.replace(/\.$/, '');
  const allFence = 'historyDeleted';
  const siteFence = host => allFence + ':' + scopeId(host);
  const articleFence = (day, url) => siteFence(hostnameOf(url)) + ':' + scopeId(day + '\n' + url);
  const recordPrefix = (day, url) => 'article:' + day + '\n' + url + '\n';

  // Distinct writes never overwrite one another, even from different origins.
  // The most recent version wins. Superseded versions can be removed independently.
  function historyStore(storage) {
    async function blocked(day, url, since) {
      const keys = [allFence, siteFence(hostnameOf(url)), articleFence(day, url)];
      const values = await storage.getValues(keys);
      return keys.some(key => values[key] >= since);
    }
    async function save(record, since, eligible) {
      const { day, url } = record;
      const prefix = recordPrefix(day, url);
      const key = prefix + String(record.at).padStart(16, '0') + '-' + nonce();
      if (await blocked(day, url, since) || !eligible()) return;
      await storage.setValue(key, { ...record, started: since });
      if (await blocked(day, url, since)) {
        await storage.deleteValues([key]);
        return;
      }
      const versions = (await storage.listValues()).filter(k => k.startsWith(prefix));
      const older = versions.filter(k => k < key);
      // A slower tab can finish writing after the latest visit already compacted the group.
      const newer = versions.filter(k => k > key);
      if (newer.length) {
        const candidates = Object.values(await storage.getValues(newer));
        for (const candidate of candidates) {
          if (candidate && !await blocked(day, url, candidate.started)) { older.push(key); break; }
        }
      }
      if (older.length) await storage.deleteValues(older);
    }
    async function list(start = '', end = '') {
      const groups = new Map();
      for (const key of await storage.listValues()) {
        if (!key.startsWith('article:')) continue;
        const day = key.slice(8, 18);
        if ((start && day < start) || (end && day > end)) continue;
        const group = key.slice(0, key.lastIndexOf('\n'));
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group).push(key);
      }
      if (!groups.size) return [];
      const keys = new Set([allFence]);
      for (const versions of groups.values()) {
        const [dateKey, url] = versions[0].split('\n');
        keys.add(siteFence(hostnameOf(url)));
        keys.add(articleFence(dateKey.slice(8), url));
        for (const key of versions) keys.add(key);
      }
      const values = await storage.getValues([...keys]);
      const records = [];
      for (const versions of groups.values()) {
        for (const key of versions.sort().reverse()) {
          const record = values[key];
          if (!record || [allFence, siteFence(record.host), articleFence(record.day, record.url)]
            .some(fence => values[fence] >= record.started)) continue;
          records.push(record);
          break;
        }
      }
      return records.sort((a, b) => b.at - a.at || a.url.localeCompare(b.url));
    }
    async function remove(scope) {
      const cutoff = Date.now();
      const fence = scope.url ? articleFence(scope.day, scope.url) : scope.host ? siteFence(scope.host) : allFence;
      await storage.setValue(fence, cutoff);
      const obsolete = [];
      for (const key of await storage.listValues()) {
        if (!key.startsWith('article:')) continue;
        const [dateKey, url, version] = key.split('\n');
        if (scope.url && (scope.url !== url || dateKey !== 'article:' + scope.day)) continue;
        if (scope.host && hostnameOf(url) !== scope.host) continue;
        if (Number(version.split('-')[0]) <= cutoff) obsolete.push(key);
      }
      if (obsolete.length) await storage.deleteValues(obsolete);
    }
    return { save, list, remove, blocked };
  }

  if (typeof document === 'undefined') {
    module.exports = { target, parseLearned, classifyForgetInput, analyze, percentage, practiceText, isMeeting,
      snapshot, recordText, summarizePeriod, rankMissingCharacters, parseHosts, permits, historyStore, localDay };
    return;
  }
  if (GM_info.isIncognito) return;

  const skip = [
    'script, style, noscript, template, nav, aside, dialog, input, textarea, select, button, rt, rp',
    'header:not(article header, main header, [role="main"] header)',
    'footer:not(article footer, main footer, [role="main"] footer)',
    '[contenteditable]:not([contenteditable="false"]), [aria-hidden="true"], [hidden]',
    '[role="navigation"], [role="banner"], [role="complementary"], [role="contentinfo"], [role="dialog"]',
  ].join(', ');

  const mainSelector = 'main, article, [role="main"]';

  function intersects(rect, clip) {
    return rect.width > 0 && rect.height > 0 && rect.right > clip.left && rect.left < clip.right
      && rect.bottom > clip.top && rect.top < clip.bottom;
  }

  // Accept whole text runs whenever possible. Subdivide only runs cut by a
  // viewport or overflow edge, preserving UTF-16 offsets for DOM Ranges.
  function visibleSlices(node, clip, range, start, end) {
    const slices = [];
    function scan(start, end) {
      range.setStart(node, start);
      range.setEnd(node, end);
      const rects = [...range.getClientRects()].filter(rect => rect.width && rect.height);
      if (!rects.some(rect => intersects(rect, clip))) return;
      let mid = (start + end) >>> 1;
      if (mid > start && /[\uDC00-\uDFFF]/.test(node.data[mid])) mid--;
      if (mid === start || rects.every(rect => intersects(rect, clip)
        && rect.left >= clip.left && rect.right <= clip.right)) {
        const prev = slices.at(-1);
        if (prev && prev.end === start) prev.end = end;
        else slices.push({ node, start, end });
      } else {
        scan(start, mid);
        scan(mid, end);
      }
    }
    scan(start, end);
    return slices;
  }

  function collect(selection, visibleOnly = false) {
    if (!document.body) return [];
    const viewport = visibleOnly
      ? { left: 0, top: 0, right: document.documentElement.clientWidth, bottom: innerHeight }
      : null;
    const measure = visibleOnly ? document.createRange() : null;
    const pieces = [];
    let boundary = true;
    const roots = [...document.body.querySelectorAll(mainSelector)].filter(el =>
      !el.closest(skip) && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }));
    // Walk the ancestors too: a main/article can live inside a clipped scroller.
    const rootSet = new Set(roots);
    const ancestors = new Set();
    for (const root of roots) {
      for (let el = root.parentElement; el && !ancestors.has(el); el = el.parentElement) ancestors.add(el);
    }

    function visit(node, clip, inBody) {
      if (selection && !selection.intersectsNode(node)) return;
      if (node.nodeType === Node.TEXT_NODE) {
        if (!inBody || !node.length) return;
        const start = node === selection?.startContainer ? selection.startOffset : 0;
        const end = node === selection?.endContainer ? selection.endOffset : node.length;
        if (end <= start) return;
        const slices = clip ? visibleSlices(node, clip, measure, start, end) : [{ node, start, end }];
        for (const slice of slices) {
          pieces.push({ ...slice, boundary: boundary || slice.start > 0 });
          boundary = slice.end < node.length;
        }
        if (!slices.length && node.data.trim()) boundary = true;
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE || node === host || node.matches(skip)) return;
      inBody ||= rootSet.has(node);
      if (!inBody && !ancestors.has(node)) return;
      if (node.localName === 'br') { boundary = true; return; }
      const css = getComputedStyle(node);
      if (css.display === 'none' || css.visibility !== 'visible' || css.opacity === '0'
        || css.contentVisibility === 'hidden') return;
      const block = !['inline', 'contents', 'ruby', 'ruby-base'].includes(css.display);
      if (block) boundary = true;
      if (clip && block && node !== document.body) {
        const box = node.getBoundingClientRect();
        // A zero-height wrapper may still contain visible positioned children.
        if (box.height && box.width && !intersects(box, clip)) return;
        const clipX = css.overflowX !== 'visible';
        const clipY = css.overflowY !== 'visible';
        if (clipX || clipY) {
          const left = box.left + node.clientLeft;
          const top = box.top + node.clientTop;
          clip = {
            left: clipX ? Math.max(clip.left, left) : clip.left,
            right: clipX ? Math.min(clip.right, left + node.clientWidth) : clip.right,
            top: clipY ? Math.max(clip.top, top) : clip.top,
            bottom: clipY ? Math.min(clip.bottom, top + node.clientHeight) : clip.bottom,
          };
          if (clip.left >= clip.right || clip.top >= clip.bottom) return;
        }
      }
      if (node.localName === 'details' && !node.open) {
        const summary = node.querySelector(':scope > summary');
        if (summary) visit(summary, clip, inBody);
      } else {
        for (let child = node.firstChild; child; child = child.nextSibling) visit(child, clip, inBody);
      }
      if (block) boundary = true;
    }
    visit(document.body, viewport, !roots.length);
    return pieces;
  }

  const missingMark = 'tut-code-meter-missing';
  const outsideMark = 'tut-code-meter-outside';
  const markStyle = new CSSStyleSheet();
  markStyle.replaceSync(`
    ::highlight(${missingMark}) { background-color: #fff0ad; color: #322d20; }
    ::highlight(${outsideMark}) { text-decoration: underline dotted #808080; }
  `);
  function clearMarks() {
    CSS.highlights.delete(missingMark);
    CSS.highlights.delete(outsideMark);
  }
  function mark(pieces, states) {
    const missing = new Highlight();
    const outside = new Highlight();
    for (const { node, start, end } of pieces) {
      let offset = start;
      for (const char of node.data.slice(start, end)) {
        if (kanji.test(char) && states['known:' + char] !== true) {
          const range = document.createRange();
          range.setStart(node, offset);
          range.setEnd(node, offset + char.length);
          (target.has(char) ? missing : outside).add(range);
        }
        offset += char.length;
      }
    }
    if (!document.adoptedStyleSheets.includes(markStyle)) document.adoptedStyleSheets.push(markStyle);
    CSS.highlights.set(missingMark, missing);
    CSS.highlights.set(outsideMark, outside);
  }

  function pageSelection() {
    const selection = document.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) return null;
    const range = selection.getRangeAt(0);
    return range.commonAncestorContainer.getRootNode() === document ? range.cloneRange() : null;
  }

  function textOf(pieces) {
    return pieces.map(({ node, start, end, boundary }) =>
      (boundary ? '\n' : '') + node.data.slice(start, end)).join('');
  }

  const history = historyStore(GM);
  const policyKey = 'historyPolicy';
  const readPolicy = () => GM_getValues([policyKey])[policyKey] || { mode: 'off', hosts: [] };
  const readHighlightSetting = () => GM_getValues(['decorate']).decorate !== false;
  let highlightEnabled = readHighlightSetting();
  let host, dialog;
  let refreshSettings, refreshHistory, refreshHistoryCharacters;
  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function field(label, input) {
    const node = el('label', label);
    node.append(input);
    return node;
  }
  function button(label, handler, status, available = () => true) {
    const node = el('button', label);
    node.type = 'button';
    node.disabled = !available();
    node.onclick = async () => {
      node.disabled = true;
      try { await handler(); }
      catch { if (status) status.textContent = '操作に失敗しました。もう一度お試しください。'; }
      finally { node.disabled = !available(); }
    };
    return node;
  }

  function closePanel(resume = true) {
    if (dialog?.open) dialog.close();
    host?.remove();
    host = dialog = refreshSettings = refreshHistory = refreshHistoryCharacters = null;
    if (resume) updateActivity();
  }

  function openPanel(title) {
    closePanel(false);
    host = el('div');
    host.id = 'tut-code-meter';
    const shadow = host.attachShadow({ mode: 'closed' });
    const style = new CSSStyleSheet();
    style.replaceSync(`
      :host { all: initial !important; }
      dialog { color-scheme: light dark; box-sizing: border-box; width: min(42rem, 94vw);
        max-height: 84vh; margin: auto; padding: 0; border: 1px solid GrayText; border-radius: .6rem;
        background: Canvas; color: CanvasText; font: 15px/1.55 system-ui,sans-serif; text-align: start; }
      dialog::backdrop { background: rgb(0 0 0 / .36); }
      header, .actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
      header { position: sticky; top: 0; z-index: 1; background: Canvas; justify-content: space-between;
        padding: .7rem 1.2rem; border-bottom: 1px solid GrayText; }
      section { padding: 0 1.2rem 1.2rem; } h1 { font-size: 1.15rem; margin: 0; }
      h2 { font-size: 1.05rem; margin: 1.2rem 0 .4rem; }
      p { margin: .6rem 0; } label { display: block; margin: .7rem 0; }
      input, select, textarea, button { font: inherit; } input, textarea, select { display: block; }
      .highlight-option { display: flex; gap: .4rem; align-items: center; }
      textarea { box-sizing: border-box; width: 100%; min-height: 4em; } button { cursor: pointer; }
      button:disabled { cursor: default; } pre { white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; }
      .period-summary { max-height: 40vh; overflow: auto; }
      article { border-top: 1px solid GrayText; margin-top: .75rem; }
      [role=status]:empty { display: none; } ul { padding: 0; list-style: none; }
      li { display: flex; align-items: center; justify-content: space-between; padding: .15rem 0; }
      li[hidden] { display: none; }
    `);
    shadow.adoptedStyleSheets = [style];
    dialog = el('dialog');
    dialog.setAttribute('aria-label', title);
    const header = el('header');
    header.append(el('h1', title), button('閉じる', closePanel));
    const section = el('section');
    dialog.append(header, section);
    shadow.append(dialog);
    document.documentElement.append(host);
    dialog.addEventListener('cancel', event => { event.preventDefault(); closePanel(); });
    dialog.showModal();
    syncHighlights();
    return section;
  }

  function openSettings() {
    const section = openPanel('学習設定');
    const status = el('p');
    status.setAttribute('role', 'status');
    const policy = readPolicy();
    const mode = el('select');
    for (const [value, name] of [['off', '記録しない'], ['allow', '許可したサイトだけ記録'], ['exclude', '除外したサイト以外を記録']]) {
      const option = el('option', name);
      option.value = value;
      mode.append(option);
    }
    mode.value = policy.mode;
    const hosts = el('textarea');
    hosts.value = policy.hosts.join('\n');
    hosts.placeholder = 'example.com';
    const savePolicy = button('記録設定を保存', async () => {
      let normalized;
      try { normalized = parseHosts(hosts.value); } catch {
        status.textContent = 'サイトはホスト名で入力してください（例：example.com）。'; return;
      }
      await GM.setValue(policyKey, { mode: mode.value, hosts: normalized });
      hosts.value = normalized.join('\n');
      status.textContent = '記録設定を保存しました。';
    }, status);
    section.append(el('h2', '閲覧の自動記録'),
      el('p', '閲覧日時、サイト名、タイトル、URL（クエリを含む）、3つのカバー率と字数、打てなかった字を含む語と回数、その時点の忘れた字・外字を保存します。'),
      el('p', '記録はTampermonkey内に、自分で削除するまで残ります。本文全文の保存や外部送信は行いません。シークレットとMeet休止中は記録しません。'),
      field('記録するサイト', mode), el('p', '「除外したサイト以外を記録」でホスト名を空欄にすると、すべてのサイトが対象になります。'),
      field('ホスト名（1行に1件、サブドメインは個別に指定）', hosts), savePolicy, status);

    const decorate = el('input');
    decorate.type = 'checkbox';
    decorate.checked = highlightEnabled;
    decorate.onchange = async () => {
      decorate.disabled = true;
      try { await GM.setValue('decorate', decorate.checked); }
      catch {
        decorate.checked = readHighlightSetting();
        status.textContent = 'ハイライト設定を保存できませんでした。';
      } finally { decorate.disabled = false; }
    };
    const highlightLabel = el('label');
    highlightLabel.className = 'highlight-option';
    highlightLabel.append(decorate, '本文の未習得字と外字をハイライト');
    section.append(highlightLabel);

    const editor = el('textarea');
    const learnedLabel = el('label');
    const learnedLabelText = document.createTextNode('');
    learnedLabel.append(learnedLabelText, editor);
    const forget = el('textarea');
    const result = el('p');
    result.setAttribute('role', 'status');
    const count = el('h2');
    const list = el('ul');
    let baseline = new Set();
    let dirty = false;
    editor.oninput = () => { dirty = true; };
    const write = async changes => {
      if (Object.keys(changes).length) await GM.setValues({ ...changes, learnedRevision: nonce() });
    };
    const update = () => {
      decorate.checked = highlightEnabled;
      const states = GM_getValues(profileKeys);
      const learned = [...target].filter(c => states['known:' + c] === true);
      learnedLabelText.data = `習得済みの漢字 (${learned.length}文字/${target.size}文字)`;
      const forgotten = [...target].filter(c => states['known:' + c] === 'forgotten');
      if (!dirty) {
        editor.value = learned.join('');
        baseline = new Set(learned);
      } else {
        const moved = new Set(forgotten.filter(c => baseline.delete(c)));
        if (moved.size) editor.value = [...editor.value].filter(c => !moved.has(c)).join('');
      }
      count.textContent = '忘れた字の一覧（' + forgotten.length + '字）';
      const rows = new Map([...list.children].map(row => [row.dataset.char, row]));
      let next = list.firstElementChild;
      for (const char of forgotten) {
        let row = rows.get(char);
        if (row) rows.delete(char);
        else {
          row = el('li');
          row.dataset.char = char;
          const restore = button('習得済みに戻す', async () => {
            const sibling = row.nextElementSibling || row.previousElementSibling;
            const top = row.getBoundingClientRect().top;
            await write({ ['known:' + char]: true });
            update();
            if (sibling?.isConnected) {
              sibling.querySelector('button').focus({ preventScroll: true });
              dialog.scrollTop += sibling.getBoundingClientRect().top - top;
            }
          }, result);
          restore.setAttribute('aria-label', char + 'を習得済みに戻す');
          row.append(el('span', char), restore);
        }
        if (row !== next) list.insertBefore(row, next);
        next = row.nextElementSibling;
      }
      for (const row of rows.values()) row.remove();
    };
    const save = button('習得済み字を保存', async () => {
      const states = GM_getValues(profileKeys);
      const parsed = parseLearned(editor.value);
      const changes = {};
      for (const c of baseline) if (!parsed.learned.has(c) && states['known:' + c] === true) changes['known:' + c] = false;
      for (const c of parsed.learned) if (!baseline.has(c)) changes['known:' + c] = true;
      await write(changes);
      dirty = false;
      update();
      result.textContent = baseline.size + '字を登録しました。' + (parsed.rejected.size ? ' 対象外：' + [...parsed.rejected].join('') : '');
    }, result);
    const move = button('忘れた字に移す', async () => {
      if (!forget.value.trim()) { result.textContent = '移す字を入力してください。'; return; }
      const { move, already, unlearned, outside } = classifyForgetInput(forget.value, GM_getValues(profileKeys));
      await write(Object.fromEntries(move.map(c => ['known:' + c, 'forgotten'])));
      update();
      result.textContent = [
        move.length ? '移した字：' + move.join('') : '移した字はありません。',
        already.length && 'すでに忘れた字：' + already.join(''), unlearned.length && '習得済みにない字：' + unlearned.join(''),
        outside.length && 'TUT-Code対象外：' + outside.join(''),
      ].filter(Boolean).join('　');
      if (move.length) forget.value = '';
    }, result);
    section.append(el('h2', '習得状態'), learnedLabel, save,
      field('忘れた字', forget), move, result, count, list);
    refreshSettings = update;
    update();
  }

  function openHistory() {
    const section = openPanel('学習履歴');
    const start = el('input'), end = el('input');
    start.type = end.type = 'date';
    start.value = end.value = localDay(new Date());
    const filters = el('div');
    filters.className = 'actions';
    filters.append(field('開始日', start), field('終了日', end));
    const status = el('p'), confirmation = el('div'), results = el('div');
    status.setAttribute('role', 'status');
    let revision = 0;
    async function copy(text) {
      const request = revision;
      try {
        await GM.setClipboard(text, 'text');
        if (request === revision) status.textContent = 'コピーしました。';
      } catch {
        if (request === revision) status.textContent = 'コピーに失敗しました。もう一度お試しください。';
      }
    }
    let report;
    function learningList(records) {
      const group = el('details');
      group.className = 'history-characters';
      group.append(el('summary', '習得していない漢字'));
      const list = el('ul');
      group.append(list, el('p', '登録できる未習得字はありません。'));
      for (const [char, count] of rankMissingCharacters(records)) {
        const row = el('li');
        row.dataset.char = char;
        const learn = button('習得済みにする', async () => {
          const panel = dialog;
          const visible = [...list.children].filter(item => !item.hidden);
          const index = visible.indexOf(row);
          const neighbor = visible[index + 1] || visible[index - 1];
          const top = row.getBoundingClientRect().top;
          await GM.setValues({ ['known:' + char]: true, learnedRevision: nonce() });
          refreshHistoryCharacters?.();
          if (dialog === panel && neighbor?.isConnected && !neighbor.hidden && group.open) {
            panel.scrollTop += neighbor.getBoundingClientRect().top - top;
          }
        }, status);
        learn.setAttribute('aria-label', char + 'を習得済みにする');
        row.append(el('span', char + '　' + count + '回'), learn);
        list.append(row);
      }
      return group;
    }
    refreshHistoryCharacters = () => {
      const states = GM_getValues(profileKeys);
      for (const group of results.querySelectorAll('.history-characters')) {
        let remaining = 0;
        for (const row of group.querySelectorAll('li')) {
          row.hidden = states['known:' + row.dataset.char] === true;
          if (!row.hidden) remaining++;
        }
        group.firstElementChild.textContent = '習得していない漢字（' + remaining + '字）';
        group.lastElementChild.hidden = remaining > 0;
      }
    };
    const copyRange = button('この期間の記録をコピー', () => copy(report.text), status, () => Boolean(report));
    function wordCopyButton(getText, includeOutside) {
      const label = includeOutside ? '未知語をコピー(外字含む)' : '未知語をコピー';
      return button(label, () => copy(getText()), status, () => Boolean(getText()));
    }
    const copyWords = wordCopyButton(() => report?.tutWordText, false);
    const copyWordsWithOutside = wordCopyButton(() => report?.wordText, true);
    function confirmDelete(scope, message) {
      confirmation.replaceChildren(el('p', message), button('削除する', async () => {
        await history.remove(scope);
        await GM.setValue('historyRevision', nonce());
        await load();
        status.textContent = '削除しました。';
      }, status), button('キャンセル', () => confirmation.replaceChildren()));
      confirmation.querySelector('button').focus();
    }
    const removeAll = button('全件を削除', () => confirmDelete({}, '指定期間の外も含め、すべての学習履歴を削除しますか？'));
    const actions = el('div');
    actions.className = 'actions';
    actions.append(copyRange, copyWords, copyWordsWithOutside, removeAll);
    section.append(filters, actions, confirmation, status, results);

    async function load() {
      const request = ++revision;
      const from = start.value, to = end.value;
      confirmation.replaceChildren();
      copyRange.disabled = copyWords.disabled = copyWordsWithOutside.disabled = true;
      report = undefined;
      results.replaceChildren();
      if (from && to && from > to) {
        status.textContent = '終了日は開始日以降を指定してください。'; return;
      }
      status.textContent = '';
      try {
        const found = await history.list(from, to);
        if (revision !== request || !section.isConnected) return;
        if (!found.length) {
          results.append(el('p', 'この期間の記録はありません。'));
          return;
        }
        report = summarizePeriod(found, from, to);
        copyRange.disabled = false;
        copyWords.disabled = !report.tutWordText;
        copyWordsWithOutside.disabled = !report.wordText;
        const summaryText = el('pre', report.text);
        summaryText.className = 'period-summary';
        results.append(el('h2', '期間集計'), summaryText, learningList(found), el('h2', '記事別の記録'));
        for (const record of found) {
          const article = el('article');
          const detail = el('details');
          const summary = el('summary', record.day + ' ' + record.time + '　' + record.title);
          const tools = el('div');
          tools.className = 'actions';
          tools.append(button('この記事の記録をコピー', () => copy(recordText(record)), status),
            wordCopyButton(() => practiceText(record.words, false), false),
            wordCopyButton(() => practiceText(record.words, true), true),
            button('この記事の記録を削除', () => confirmDelete({ day: record.day, url: record.url }, 'この記事の' + record.day + 'の記録を削除しますか？')),
            button('このサイトの記録を削除', () => confirmDelete({ host: record.host }, record.host + ' の全期間の記録を削除しますか？')));
          detail.append(summary, el('pre', recordText(record)), tools, learningList([record]));
          article.append(detail);
          results.append(article);
        }
        refreshHistoryCharacters();
      } catch { if (revision === request) status.textContent = '履歴を読み込めませんでした。'; }
    }
    start.oninput = end.oninput = load;
    refreshHistory = load;
    load();
  }

  let meetingClear, suspended = false;
  let url = location.href;
  let started = Math.floor(performance.timeOrigin);
  let reload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
  let visitReady = false, focusedDay = '', capturing = false, waitingForBody = false;
  const pending = new Map(); // Keep the latest focus and learning state for each local day.
  const bodyChanges = { subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'open', 'role', 'contenteditable'] };
  let bodyTimer;
  const observer = new MutationObserver(() => {
    if (!bodyTimer) bodyTimer = setTimeout(bodyChanged, 100);
  });

  const isForeground = () => document.visibilityState === 'visible' && document.hasFocus();
  const siteAllowed = () => !suspended && url === location.href && !isMeeting(location) && permits(readPolicy(), location.hostname);

  let highlighting = false, highlightTimer, highlightStates;
  const highlightObserver = new MutationObserver(scheduleHighlights);
  function scheduleHighlights() {
    if (!highlighting || highlightTimer) return;
    highlightTimer = setTimeout(() => {
      highlightTimer = undefined;
      if (!highlighting) return;
      highlightStates ??= GM_getValues(profileKeys);
      mark(collect(pageSelection(), true), highlightStates);
    }, 80);
  }
  function syncHighlights() {
    const enabled = Boolean(meetingClear && highlightEnabled && !host && document.visibilityState === 'visible' && siteAllowed());
    if (enabled === highlighting) return;
    highlighting = enabled;
    if (enabled) {
      highlightObserver.observe(document, bodyChanges);
      scheduleHighlights();
    } else {
      highlightObserver.disconnect();
      clearTimeout(highlightTimer);
      highlightTimer = highlightStates = undefined;
      clearMarks();
    }
  }

  // Latch focus synchronously, even if Meet/tab registration or the article DOM
  // hasn't arrived yet. Losing focus alone cannot cancel a qualified visit.
  function rememberFocus() {
    if (focusedDay || meetingClear === false || host || !isForeground() || !siteAllowed()) return;
    const date = new Date();
    focusedDay = localDay(date);
    pending.set(focusedDay, { date, states: GM_getValues(profileKeys) });
  }
  function stopWatchingBody() {
    observer.disconnect();
    clearTimeout(bodyTimer);
    bodyTimer = undefined;
    waitingForBody = false;
  }
  function bodyChanged() {
    stopWatchingBody();
    capturePending();
  }
  function cancelVisit() {
    stopWatchingBody();
    pending.clear();
    focusedDay = '';
  }
  function updateActivity() {
    rememberFocus();
    syncHighlights();
    capturePending();
  }
  async function capturePending() {
    if (!pending.size || capturing || waitingForBody || !visitReady || !meetingClear || !siteAllowed()) return;
    const [day, visit] = pending.entries().next().value;
    const eligible = () => pending.get(day) === visit && visitReady && meetingClear && siteAllowed();
    capturing = true;
    try {
      if (await history.blocked(day, url, started)) {
        if (eligible()) pending.delete(day);
        return;
      }
      if (!eligible()) return;
      const text = document.readyState !== 'loading' && textOf(collect());
      if (!text || !kanji.test(text)) {
        waitingForBody = true;
        observer.observe(document, bodyChanges);
        return;
      }
      const tabs = await GM.getTabs();
      if (Object.values(tabs).some(tab => tab.tutCodeMeeting)) { setMeetingClear(false); return; }
      if (!eligible()) return;
      const record = snapshot(text, visit.states, {
        url, host: hostnameOf(url), title: document.title || location.hostname,
        siteName: document.querySelector('meta[property="og:site_name"]')?.content.trim() || location.hostname,
      }, visit.date);
      await history.save(record, started, eligible);
      if (eligible()) {
        pending.delete(day);
        await GM.setValue('historyRevision', nonce());
      }
    } catch {
      // Leave the visit pending for the next registry poll if storage is unavailable.
    } finally {
      capturing = false;
      if (pending.get(day) !== visit) capturePending();
    }
  }
  function setMeetingClear(clear) {
    meetingClear = clear;
    if (!clear) {
      cancelVisit();
      if (host) closePanel(false);
    }
    updateActivity();
  }
  function newVisit() {
    url = location.href;
    started = Date.now();
    reload = false;
    visitReady = false;
    cancelVisit();
    if (host) closePanel(false);
    // A SPA can change articles without a visibility or focus event.
    scheduleHighlights();
  }

  // Keep the existing cross-tab Meet registry. A reload inherits the start of
  // the visit so that an open tab cannot repopulate a manually deleted record.
  let registered, checking = false, revision = 0;
  async function checkMeetings(conceal = false) {
    if (url !== location.href) newVisit();
    revision++;
    if (conceal || isMeeting(location)) setMeetingClear(false);
    rememberFocus();
    if (checking || suspended) return;
    checking = true;
    try {
      let checked;
      do {
        checked = revision;
        const meeting = isMeeting(location);
        const trackVisit = !visitReady && permits(readPolicy(), location.hostname);
        if (registered !== meeting || trackVisit) {
          const tab = await GM.getTab();
          if (suspended || checked !== revision) continue;
          const changed = Boolean(tab.tutCodeMeeting) !== meeting;
          if (changed) tab.tutCodeMeeting = meeting;
          if (trackVisit) {
            const route = scopeId(url);
            if (reload && tab.tutCodeVisit?.route === route) started = tab.tutCodeVisit.started;
            tab.tutCodeVisit = { route, started };
          }
          if (changed || trackVisit) await GM.saveTab(tab);
          if (changed) await GM.setValue('meetRevision', nonce());
          if (suspended || checked !== revision) continue;
          registered = meeting;
          if (trackVisit) visitReady = true;
        }
        const tabs = await GM.getTabs();
        if (!suspended && checked === revision) setMeetingClear(!meeting && !Object.values(tabs).some(tab => tab.tutCodeMeeting));
      } while (!suspended && checked !== revision);
    } catch {
      registered = undefined;
      setMeetingClear(false);
    } finally { checking = false; }
  }

  async function fromMenu(open) {
    try {
      const tabs = await GM.getTabs();
      if (!suspended && !isMeeting(location) && !Object.values(tabs).some(tab => tab.tutCodeMeeting)) open();
    } catch { /* Keep history concealed if the meeting state is unavailable. */ }
  }
  GM_registerMenuCommand('学習履歴を開く', () => fromMenu(openHistory));
  GM_registerMenuCommand('学習設定を開く', () => fromMenu(openSettings));
  GM_addValueChangeListener(policyKey, () => {
    if (!siteAllowed()) cancelVisit();
    syncHighlights();
    checkMeetings();
  });
  GM_addValueChangeListener('decorate', () => {
    highlightEnabled = readHighlightSetting();
    syncHighlights();
    refreshSettings?.();
  });
  GM_addValueChangeListener('learnedRevision', () => {
    highlightStates = undefined;
    scheduleHighlights();
    refreshSettings?.();
    refreshHistoryCharacters?.();
  });
  document.addEventListener('scroll', scheduleHighlights, true);
  document.addEventListener('selectionchange', scheduleHighlights);
  window.addEventListener('resize', scheduleHighlights);
  document.fonts?.addEventListener('loadingdone', scheduleHighlights);
  GM_addValueChangeListener('historyRevision', () => refreshHistory?.());
  GM_addValueChangeListener('meetRevision', () => checkMeetings(true));
  for (const event of ['urlchange', 'popstate', 'hashchange']) window.addEventListener(event, () => checkMeetings());
  window.addEventListener('pagehide', () => {
    suspended = true;
    revision++;
    setMeetingClear(false);
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) newVisit();
    suspended = false;
    registered = undefined;
    checkMeetings();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' && !host) focusedDay = '';
    syncHighlights();
    checkMeetings();
  });
  function checkWaitingBody() { if (waitingForBody) bodyChanged(); }
  document.addEventListener('DOMContentLoaded', checkWaitingBody);
  window.addEventListener('load', checkWaitingBody);
  window.addEventListener('resize', checkWaitingBody);
  window.addEventListener('focus', () => {
    if (focusedDay !== localDay(new Date())) focusedDay = '';
    checkMeetings();
  });
  setInterval(() => checkMeetings(), 2500);
  checkMeetings();
})();
