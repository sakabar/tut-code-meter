// ==UserScript==
// @name         tut-code-meter
// @namespace    https://github.com/sakabar/tut-code-meter
// @version      1.2.1
// @description  ページ本文全体や選択範囲のTUT-Codeカバー率を測り、未習得字を含む練習語をコピーします。
// @license      MIT AND BSD-3-Clause
// @match        https://*/*
// @match        http://*/*
// @noframes
// @run-at       document-start
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

  if (typeof document === 'undefined') {
    module.exports = { target, parseLearned, classifyForgetInput, analyze, percentage, practiceText, isMeeting };
    return;
  }

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

  function sheet(css) {
    const result = new CSSStyleSheet();
    result.replaceSync(css);
    return result;
  }

  const missingMark = 'tut-code-meter-missing';
  const outsideMark = 'tut-code-meter-outside';
  const markStyle = sheet(`
    ::highlight(${missingMark}) { background-color: #fff0ad; color: #322d20; }
    ::highlight(${outsideMark}) { text-decoration: underline dotted #808080; }
  `);
  function clearMarks() {
    CSS.highlights.delete(missingMark);
    CSS.highlights.delete(outsideMark);
  }
  function mark(pieces, learned) {
    const missing = new Highlight();
    const outside = new Highlight();
    for (const { node, start, end } of pieces) {
      let offset = start;
      for (const char of node.data.slice(start, end)) {
        if (kanji.test(char) && !learned.has(char)) {
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

  function el(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  const host = el('div');
  host.id = 'tut-code-meter';
  const shadow = host.attachShadow({ mode: 'closed' });
  shadow.adoptedStyleSheets = [sheet(`
    :host { all: initial !important; position: fixed !important; right: 12px !important;
      bottom: 14px !important; z-index: 2147483646 !important; display: block !important;
      width: max-content !important; max-width: calc(100vw - 24px) !important;
      color-scheme: light; direction: ltr; }
    * { box-sizing: border-box; }
    .meter { color: #273932; background: #fafbf8; font: 13px/1.55 system-ui, sans-serif;
      border: 1px solid #bac8bc; border-radius: 10px; overflow: hidden;
      box-shadow: 0 2px 12px #172c231c; max-width: 100%; }
    button, textarea, input { font: inherit; color: inherit; }
    button { cursor: pointer; background: #fff; border: 1px solid #b8c6bc; border-radius: 6px; }
    button:focus-visible, summary:focus-visible, textarea:focus-visible { outline: 2px solid #227356; outline-offset: -2px; }
    button:hover { background: #ebf1ea; }
    button:disabled { opacity: .6; cursor: default; }
    .toggle { border: 0; width: 100%; min-height: 30px; padding: 4px 10px;
      background: transparent; display: flex; justify-content: space-between; align-items: center;
      gap: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
    .toggle::after { content: '▴'; font-size: 10px; color: #566a5e; }
    .toggle[aria-expanded="true"]::after { content: '▾'; }
    .panel { border-top: 1px solid #d8dfd6; width: 320px; max-width: calc(100vw - 26px);
      max-height: min(66vh, 570px); overflow-y: auto; overscroll-behavior: contain; padding: 12px; }
    .scope, .meta { color: #516459; font-size: 12px; }
    .metrics { display: grid; grid-template-columns: auto 1fr; gap: 3px 10px; margin: 6px 0; }
    .metrics dd { margin: 0; text-align: right; font-variant-numeric: tabular-nums; }
    .metrics dd:first-of-type { color: #206448; font-weight: 700; }
    h2, summary { font-size: 13px; font-weight: 650; }
    h2 { margin: 12px 0 3px; }
    summary { cursor: pointer; padding: 6px 0; }
    ul { padding: 0; margin: 0; list-style: none; max-height: 13em; overflow-y: auto; }
    li { display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
      border-bottom: 1px solid #e1e8df; padding: 4px 0; overflow-wrap: anywhere; }
    .word { font-weight: 600; }
    .note { font-size: 12px; margin-left: 7px; color: #5e6459; }
    .quantity { flex-shrink: 0; }
    .copy { background: #285e49; color: white; width: 100%; padding: 5px 8px; font-weight: 600; }
    .copy:hover { background: #204e3c; }
    .option { display: flex; align-items: center; gap: 5px; margin: 6px 0; }
    .editor { display: block; margin: 8px 0 4px; }
    textarea { width: 100%; min-height: 55px; resize: vertical; display: block; }
    .save, .forget { margin-top: 5px; }
    .status:not(:empty) { margin-top: 5px; font-size: 12px; }
    [hidden] { display: none !important; }
  `)];
  const meter = el('section', undefined, 'meter');
  meter.setAttribute('aria-label', 'TUT-Code カバー率');
  const toggle = el('button', '現在 —', 'toggle');
  const panel = el('div', undefined, 'panel');
  panel.id = 'details';
  toggle.setAttribute('aria-controls', panel.id);
  const scope = el('div', '', 'scope');
  const metrics = el('dl', undefined, 'metrics');
  const metricValues = ['現在', '全習得時', '対象内の習得率'].map(label => {
    const value = el('dd');
    metrics.append(el('dt', label), value);
    return value;
  });
  const totals = el('div', '', 'meta');
  const wordList = el('ul');
  const charList = el('div');
  const charGroups = {};
  for (const [kind, label] of [['forgotten', '忘れた字'], ['missing', '未習得字'], ['outside', '外字']]) {
    const heading = el('h2', label);
    const list = el('ul');
    charList.append(heading, list);
    charGroups[kind] = list;
  }
  const copy = el('button', '単語をコピー', 'copy');
  function option(label) {
    const wrapper = el('label', undefined, 'option');
    const input = el('input');
    input.type = 'checkbox';
    wrapper.append(input, label);
    return { wrapper, input };
  }
  function status() {
    const output = el('div', undefined, 'status');
    output.setAttribute('role', 'status');
    return output;
  }
  const includeOutside = option('外字を含む語もコピー');
  const decorate = option('本文の未習得字と外字を装飾');
  const copyStatus = status();
  const settings = el('details');
  const editLabel = el('label', '習得済みの漢字', 'editor');
  const editor = el('textarea');
  editor.placeholder = '習得済みの漢字を貼り付け';
  editLabel.append(editor);
  const save = el('button', '習得済み字を保存', 'save');
  const saveStatus = status();
  const forgetLabel = el('label', '忘れた字', 'editor');
  const forgetEditor = el('textarea');
  forgetEditor.placeholder = '忘れた漢字をまとめて入力';
  forgetLabel.append(forgetEditor);
  const forget = el('button', '忘れた字に移す', 'forget');
  const forgetStatus = status();
  const forgottenCount = el('h2', '忘れた字の一覧（0字）');
  const forgottenList = el('ul');
  settings.append(el('summary', '設定'), decorate.wrapper, editLabel, save, saveStatus,
    forgetLabel, forget, forgetStatus, forgottenCount, forgottenList);
  const chars = el('details');
  chars.append(el('summary', '打てない字と出現回数'), charList);
  panel.append(scope, metrics, totals, el('h2', '練習候補'), copy, includeOutside.wrapper,
    copyStatus, wordList, chars, settings);
  meter.append(toggle, panel);
  shadow.append(meter);

  let learned = new Set();
  let forgotten = new Set();
  let editBaseline = new Set();
  let editDirty = false;
  let expanded = false;
  let clipboardText = '';
  let active = false;
  let suspended = false;
  let savedSelection = null;
  let interacting = false;
  let refreshTimer;
  let marksTimer;
  let markedSelection = null;
  let pageDirty = true;
  let pageCache = {};
  let selectionCache = {};
  let renderedResult;

  function readSettings() {
    const values = GM_getValues();
    // Legacy true/false values retain their meanings. A character has one
    // storage key so it cannot be both learned and forgotten.
    const nextLearned = [];
    const nextForgotten = [];
    for (const char of target) {
      const state = values['known:' + char];
      if (state === true) nextLearned.push(char);
      else if (state === 'forgotten') nextForgotten.push(char);
    }
    if (learned.size !== nextLearned.length || nextLearned.some(char => !learned.has(char))) {
      learned = new Set(nextLearned);
      pageCache.result = selectionCache.result = null;
    }
    if (forgotten.size !== nextForgotten.length || nextForgotten.some(char => !forgotten.has(char))) {
      forgotten = new Set(nextForgotten);
      forgottenCount.textContent = `忘れた字の一覧（${forgotten.size}字）`;
      updateCharacterRows(forgottenList, 'forgotten', new Map(nextForgotten.map(char => [char, undefined])));
    }
    expanded = values.expanded === true;
    decorate.input.checked = values.decorate === true;
    includeOutside.input.checked = values.includeOutside === true;
    panel.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    if (!editDirty) {
      editBaseline = new Set(learned);
      editor.value = [...learned].join('');
    } else {
      // Keep unrelated draft edits when a saved character is forgotten here or in another tab.
      const removed = new Set([...editBaseline].filter(char => forgotten.has(char)));
      if (removed.size) {
        editor.value = [...editor.value].filter(char => !removed.has(char)).join('');
        for (const char of removed) editBaseline.delete(char);
      }
    }
    renderedResult = null;
    schedule(0);
  }

  for (const key of ['expanded', 'decorate', 'includeOutside', 'learnedRevision']) {
    GM_addValueChangeListener(key, readSettings);
  }
  async function storeOption(key, value) {
    try {
      await GM.setValue(key, value);
    } finally {
      readSettings();
    }
  }
  toggle.onclick = () => storeOption('expanded', !expanded);
  includeOutside.input.onchange = () => storeOption('includeOutside', includeOutside.input.checked);
  decorate.input.onchange = () => storeOption('decorate', decorate.input.checked);

  editor.oninput = () => { editDirty = true; saveStatus.textContent = ''; };
  const nonce = () => Date.now() + '-' + Math.random();
  async function writeCharacterStates(changes) {
    if (Object.keys(changes).length) {
      await GM.setValues({ ...changes, learnedRevision: nonce() });
    }
    readSettings();
  }
  save.onclick = async () => {
    const parsed = parseLearned(editor.value);
    // Store the edits relative to what the user saw. Concurrent edits to
    // other characters in another tab survive a bulk save.
    const changes = {};
    const stored = GM_getValues();
    for (const char of editBaseline) {
      const key = 'known:' + char;
      if (!parsed.learned.has(char) && stored[key] === true) changes[key] = false;
    }
    for (const char of parsed.learned) if (!editBaseline.has(char)) changes['known:' + char] = true;
    save.disabled = editor.disabled = true;
    try {
      await writeCharacterStates(changes);
      editDirty = false;
      readSettings();
      saveStatus.textContent = `${learned.size}字を登録しました。` +
        (parsed.rejected.size ? ' 対象外：' + [...parsed.rejected].join('') : '');
    } catch {
      saveStatus.textContent = '保存できませんでした。もう一度お試しください。';
    } finally {
      save.disabled = editor.disabled = false;
    }
  };
  forgetEditor.oninput = () => { forgetStatus.textContent = ''; };
  forget.onclick = async () => {
    if (!forgetEditor.value.trim()) {
      forgetStatus.textContent = '移す字を入力してください。';
      return;
    }
    const { move, already, unlearned, outside } = classifyForgetInput(forgetEditor.value, GM_getValues());
    forget.disabled = forgetEditor.disabled = true;
    try {
      await writeCharacterStates(Object.fromEntries(move.map(char => ['known:' + char, 'forgotten'])));
      const messages = [move.length ? `移した字（${move.length}字）：${move.join('')}` : '移した字はありません。'];
      if (already.length) messages.push('すでに忘れた字：' + already.join(''));
      if (unlearned.length) messages.push('習得済みにない字：' + unlearned.join(''));
      if (outside.length) messages.push('TUT-Code対象外：' + outside.join(''));
      forgetStatus.textContent = messages.join('　');
      if (move.length) forgetEditor.value = '';
    } catch {
      forgetStatus.textContent = '保存できませんでした。もう一度お試しください。';
    } finally {
      forget.disabled = forgetEditor.disabled = false;
    }
  };
  // Only the latest click may adjust the panel after an asynchronous save.
  let pendingPosition = null;
  function cancelPosition() { pendingPosition = null; }
  panel.addEventListener('wheel', cancelPosition, { passive: true });
  document.addEventListener('keydown', cancelPosition, true);
  document.addEventListener('pointerdown', cancelPosition, true);

  panel.addEventListener('click', async event => {
    const button = event.target.closest('button[data-char]');
    if (!button) return;
    const feedback = forgottenList.contains(button) ? forgetStatus : copyStatus;
    const char = button.dataset.char;
    const row = button.closest('li');
    const list = row.parentElement;
    const next = (row.nextElementSibling || row.previousElementSibling)?.querySelector('button');
    const position = next && button.getBoundingClientRect().height
      ? { listTop: list.getBoundingClientRect().top, top: button.getBoundingClientRect().top } : null;
    pendingPosition = position;
    button.disabled = true;
    try {
      await writeCharacterStates({ ['known:' + char]: true });
      if (feedback === forgetStatus) feedback.textContent = char + 'を習得済みに戻しました。';
      if (position && position === pendingPosition && active && expanded) {
        // Include the resized word list and save feedback in the final layout.
        refresh();
        if (next.isConnected && next.getBoundingClientRect().height) {
          panel.scrollTop += list.getBoundingClientRect().top - position.listTop;
          const listBox = list.getBoundingClientRect();
          const nextBox = next.getBoundingClientRect();
          const topInList = Math.max(listBox.top, Math.min(position.top, listBox.bottom - nextBox.height));
          list.scrollTop += nextBox.top - topInList;
          panel.scrollTop += next.getBoundingClientRect().top - position.top;
        }
      }
    } catch {
      feedback.textContent = '登録できませんでした。もう一度お試しください。';
    } finally {
      button.disabled = false;
      if (pendingPosition === position) cancelPosition();
    }
  });
  copy.onclick = async () => {
    if (!active) return;
    refresh();
    if (!clipboardText) return;
    try {
      await GM.setClipboard(clipboardText, 'text');
      copyStatus.textContent = 'コピーしました。';
    } catch {
      copyStatus.textContent = 'コピーできませんでした。もう一度お試しください。';
    }
  };

  function characterRow(char, kind) {
    const row = el('li');
    row.dataset.char = char;
    row.append(el('span'));
    if (kind !== 'outside') {
      const restoring = kind === 'forgotten';
      const button = el('button', restoring ? '習得済みに戻す' : '習得済みにする');
      button.dataset.char = char;
      button.setAttribute('aria-label', char + 'を' + button.textContent);
      row.append(button);
    }
    return row;
  }

  function updateCharacterRows(list, kind, counts) {
    const rows = new Map();
    for (const row of [...list.children]) {
      const char = row.dataset.char;
      if (counts.has(char)) rows.set(char, row);
      else row.remove();
    }
    let next = list.firstElementChild;
    for (const [char, count] of counts) {
      const row = rows.get(char) || characterRow(char, kind);
      const label = count === undefined ? char : `${char}　${count}回`;
      if (row.firstElementChild.textContent !== label) row.firstElementChild.textContent = label;
      if (row !== next) list.insertBefore(row, next);
      next = row.nextElementSibling;
    }
  }

  function render(result, selected) {
    const { counts, words, characters } = result;
    const inside = counts.learned + counts.missing;
    const total = inside + counts.outside;
    toggle.textContent = '現在 ' + percentage(counts.learned, total);
    toggle.title = toggle.textContent + ' ｜ 全習得時 ' + percentage(inside, total);
    if (!expanded) return;
    scope.textContent = selected ? '選択範囲' : 'ページ全体';
    const ratios = [[counts.learned, total], [inside, total], [counts.learned, inside]];
    ratios.forEach(([num, den], index) => {
      metricValues[index].textContent = `${percentage(num, den)}（${num}/${den}字）`;
    });
    totals.textContent = `習得済み ${counts.learned}字 ｜ 未習得 ${counts.missing}字 ｜ 外字 ${counts.outside}字`;
    clipboardText = practiceText(words, includeOutside.input.checked);
    copy.disabled = !clipboardText;
    copyStatus.textContent = '';
    wordList.replaceChildren(...words.map(({ word, missing, outside, count }) => {
      const row = el('li');
      const name = el('span', word, 'word');
      name.append(el('span', missing.join('・') + (outside ? ' ／ 外字あり' : ''), 'note'));
      row.append(name, el('span', count + '回', 'quantity'));
      return row;
    }));
    if (!words.length) wordList.append(el('li', '練習候補はありません。'));
    const groups = { forgotten: new Map(), missing: new Map(), outside: new Map() };
    for (const { char, kind, count } of characters) {
      groups[forgotten.has(char) ? 'forgotten' : kind].set(char, count);
    }
    for (const [kind, counts] of Object.entries(groups)) {
      const list = charGroups[kind];
      updateCharacterRows(list, kind, counts);
      list.previousElementSibling.hidden = list.hidden = !counts.size;
    }
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

  function cachedAnalysis(cache, text) {
    if (!cache.result || cache.text !== text) {
      cache.result = analyze(text, learned);
      cache.text = text;
    }
    return cache.result;
  }

  function refreshMarks() {
    clearTimeout(marksTimer);
    if (active && document.body && decorate.input.checked) mark(collect(markedSelection, true), learned);
    else clearMarks();
  }

  function refresh() {
    clearTimeout(refreshTimer);
    refreshTimer = undefined;
    if (!active || !document.body) return;
    const range = interacting ? savedSelection : pageSelection();
    const selection = range && !range.collapsed && range.commonAncestorContainer.isConnected ? collect(range) : [];
    markedSelection = selection.length ? range : null;
    let result;
    if (markedSelection) {
      result = cachedAnalysis(selectionCache, textOf(selection));
    } else {
      result = cachedAnalysis(pageCache, pageDirty ? textOf(collect()) : pageCache.text);
      pageDirty = false;
    }
    if (result !== renderedResult) {
      render(result, Boolean(markedSelection));
      renderedResult = result;
    }
    refreshMarks();
    if (!host.isConnected) document.documentElement.append(host);
  }
  function schedule(delay = 120) {
    clearTimeout(refreshTimer);
    if (active) refreshTimer = setTimeout(refresh, delay);
  }

  // Keep the article selection while the user moves focus into the panel.
  function trackInteraction(event) {
    const inside = event.composedPath().includes(host);
    if (inside && !interacting) savedSelection = pageSelection();
    if (!inside) savedSelection = null;
    interacting = inside;
    if (!inside) schedule(0);
  }
  document.addEventListener('pointerdown', trackInteraction, true);
  document.addEventListener('focusin', trackInteraction, true);
  document.addEventListener('selectionchange', () => {
    if (interacting) {
      // Keyboard and programmatic article selections can arrive while a
      // panel control still has focus. A panel-only change keeps the snapshot.
      const range = pageSelection();
      if (!range || !document.body?.contains(range.commonAncestorContainer)) return;
      savedSelection = range;
    }
    schedule(0);
  });
  document.addEventListener('scroll', () => {
    if (!active || !decorate.input.checked) return;
    clearTimeout(marksTimer);
    marksTimer = setTimeout(refreshMarks, 120);
  }, true);

  function invalidatePage() {
    pageDirty = true;
    if (!refreshTimer) schedule();
  }
  window.addEventListener('resize', invalidatePage);
  window.addEventListener('load', invalidatePage);
  document.addEventListener('DOMContentLoaded', invalidatePage);
  document.fonts?.addEventListener('loadingdone', invalidatePage);

  const observer = new MutationObserver(records => {
    // Coalesce a continuously changing page without postponing a pending read.
    if (records.some(r => r.type !== 'childList' || r.removedNodes.length
      || [...r.addedNodes].some(node => node !== host))) invalidatePage();
  });
  function allowDisplay(allowed) {
    if (active === allowed) return;
    active = allowed;
    if (active) {
      observer.observe(document, {
        childList: true, subtree: true, characterData: true, attributes: true,
        attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'open', 'role', 'contenteditable'],
      });
      readSettings();
    } else {
      cancelPosition();
      clearTimeout(refreshTimer);
      clearTimeout(marksTimer);
      refreshTimer = undefined;
      observer.disconnect();
      host.remove();
      clearMarks();
      clipboardText = '';
      pageDirty = true;
      pageCache = {};
      selectionCache = {};
      renderedResult = markedSelection = savedSelection = null;
      interacting = false;
    }
  }

  // The live tab registry owns membership. The shared value is only a
  // wake-up signal, so two simultaneous meetings cannot overwrite each other.
  let registered;
  let checking = false;
  let revision = 0;
  async function checkMeetings(conceal = false) {
    revision++;
    if (conceal || isMeeting(location)) allowDisplay(false);
    if (checking || suspended) return;
    checking = true;
    try {
      let checked;
      do {
        checked = revision;
        const meeting = isMeeting(location);
        if (registered !== meeting) {
          const tab = await GM.getTab();
          if (suspended || checked !== revision) continue;
          if (Boolean(tab.tutCodeMeeting) !== meeting) {
            tab.tutCodeMeeting = meeting;
            await GM.saveTab(tab);
            await GM.setValue('meetRevision', nonce());
          }
          registered = meeting;
        }
        const tabs = await GM.getTabs();
        if (!suspended && checked === revision) {
          allowDisplay(!meeting && !Object.values(tabs).some(tab => tab.tutCodeMeeting));
        }
      } while (!suspended && checked !== revision);
    } catch {
      // Retry on the next poll. Keep the screen clear while state is unknown.
      registered = undefined;
      allowDisplay(false);
    } finally {
      checking = false;
    }
  }

  GM_addValueChangeListener('meetRevision', () => checkMeetings(true));
  for (const event of ['urlchange', 'popstate']) {
    window.addEventListener(event, () => checkMeetings(true));
  }
  window.addEventListener('pagehide', () => {
    suspended = true;
    revision++;
    allowDisplay(false);
  });
  window.addEventListener('pageshow', () => {
    suspended = false;
    registered = undefined; // Another document may have occupied this tab.
    checkMeetings(true);
  });
  document.addEventListener('visibilitychange', () => checkMeetings(true));
  window.addEventListener('focus', () => checkMeetings());
  setInterval(() => checkMeetings(), 2500);
  checkMeetings();
})();
