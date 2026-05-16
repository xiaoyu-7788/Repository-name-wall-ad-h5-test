## 39. Vercel API health 绾夸笂 404 浜屾淇

鏇存柊鏃堕棿锛?026-05-12銆?
鏈鍙鐞嗙嚎涓?`https://repository-name-wall-ad-h5-test.vercel.app/api/health` 杩斿洖 `404 NOT_FOUND` 鐨?Vercel 璺敱璇嗗埆闂銆?
淇鍐呭锛?- 纭 `api/health.js` 浣嶄簬椤圭洰鏍圭洰褰曪紝涓?`src/`銆乣package.json` 鍚岀骇銆?- 灏?`api/health.js` 鏀逛负 Vercel 瀹樻柟鍏煎鐨?`export default function handler(req, res)` 鍐欐硶锛岃繑鍥?`ok`銆乣message` 鍜屽綋鍓嶆椂闂淬€?- 灏?`vercel.json` 浠庤礋鍚戞鍒?`rewrites` 鏀逛负 `routes`锛氬厛鎶?`/api/(.*)` 浜ょ粰 `/api/$1`锛屽啀 `handle: filesystem`锛屾渶鍚庢墠灏嗗墠绔〉闈?fallback 鍒?`/index.html`銆?- 杩欐牱鍙互閬垮厤 `/api/*` 琚?SPA fallback 鎴栦笉绋冲畾姝ｅ垯瑙勫垯褰卞搷銆?
楠岃瘉鍛戒护锛?```bash
npm run build
```

楠岃瘉缁撴灉锛?- `npm run build` 閫氳繃銆?- 鏋勫缓浠嶆湁 chunk 浣撶Н warning锛屼笉褰卞搷閮ㄧ讲銆?
绾夸笂閮ㄧ讲鍚庡鏌ュ湴鍧€锛?```text
https://repository-name-wall-ad-h5-test.vercel.app/api/health
```

# TEST_REPORT

## 1. 杩愯杩囩殑鍛戒护

```bash
npm install
npm run build
npm install -D @playwright/test
npx playwright install chromium
npm run test:e2e
npm run build
npm run test:supabase
vercel --version
npm install
npm run build
npm run test:e2e
node -e "require all api/*.js"
```

鐜妫€鏌ワ細

- 宸茶鍙?`.env.example`锛岀‘璁ゅ寘鍚細
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_AMAP_KEY`
  - `VITE_AMAP_SECURITY_CODE`
  - `VITE_KIMI_CLASSIFY_ENDPOINT`
- 褰撳墠宸叉娴嬪埌椤圭洰鏍圭洰褰曞瓨鍦?`.env`銆?- 鏈鍙栥€佹墦鍗版垨鍐欏叆浠讳綍鐪熷疄 API Key銆?
## 2. 閫氳繃鐨勬祴璇曢」

`npm run test:e2e` 缁撴灉锛? passed銆?
璇存槑锛氬父瑙?E2E 閫氳繃 `VITE_FORCE_LOCAL_DEMO=true` 鍥哄畾涓烘湰鍦版紨绀烘ā寮忥紝閬垮厤 `.env` 瀛樺湪鏃惰褰撳墠 Supabase 缃戠粶闂鎷栦綇銆傜湡瀹?Supabase 鑱旇皟鐢?`npm run test:supabase` 鍗曠嫭鎵ц銆?
- 娴嬭瘯 1锛氬悗鍙伴椤靛彲鎵撳紑
- 娴嬭瘯 2锛氭湰鍦版紨绀烘暟鎹彲鐢?- 娴嬭瘯 3锛氬悗鍙扮瓫閫夊拰鍕鹃€?- 娴嬭瘯 4锛氬悗鍙版淳鍗曠粰鏉庡笀鍌?- 娴嬭瘯 5锛氭潕甯堝倕绉诲姩绔彲璇诲彇浠诲姟
- 娴嬭瘯 6锛氱Щ鍔ㄧ涓婁紶鐓х墖鍚庤嚜鍔ㄥ畬鎴?- 娴嬭瘯 7锛氫笂涓嬬偣浣嶅垏鎹?- 娴嬭瘯 8锛歋upabase 璇婃柇

`npm run build` 缁撴灉锛氶€氳繃銆?
## 3. 澶辫触鐨勬祴璇曢」

鏈湴妯″紡鏈€缁堟病鏈夊け璐ラ」銆?
鐪熷疄 Supabase 鑱旇皟鏈畬鎴愶細

- `.env` 鏂囦欢瀛樺湪銆?- `VITE_SUPABASE_URL` 瀛樺湪銆?- `VITE_SUPABASE_ANON_KEY` 瀛樺湪銆?- `VITE_SUPABASE_URL` 鏍煎紡妫€鏌ラ€氳繃銆?- `npm run test:supabase` 鍦ㄩ娆?Supabase REST 缃戠粶璇锋眰澶勫け璐ワ細褰撳墠鏈哄櫒鏃犳硶璁块棶 Supabase REST/Storage endpoint銆?- 棰濆鑴辨晱鎺㈡祴缁撴灉锛歅owerShell HTTP 鍜?Chromium browser fetch 涔熸棤娉曡闂?Supabase REST endpoint銆?- 鍥犵綉缁?TLS/浠ｇ悊灞傚け璐ワ紝鏈兘缁х画鎵ц琛ㄨ鍐欍€丼torage 涓婁紶銆佸悗鍙扮湡瀹炴淳鍗曘€佺Щ鍔ㄧ鐪熷疄涓婁紶鍜屾暟鎹簱鐘舵€佹牳楠屻€?- 鏈墦鍗扮湡瀹?URL銆乤non key 鎴栦换浣?`.env` 瀵嗛挜銆?- 娴嬭瘯鏁版嵁鍐欏叆鍙戠敓鍦ㄧ綉缁滆姹備箣鍚庯紱鏈澶辫触鍙戠敓鍦ㄥ啓鍏ヤ箣鍓嶏紝鏈垱寤轰笟鍔℃祴璇曟暟鎹€?
涓棿璋冭瘯鏃跺嚭鐜拌繃 Playwright strict mode 瀹氫綅鍐茬獊锛屽師鍥犳槸娴嬭瘯閫夋嫨鍣ㄨ繃瀹斤紝渚嬪鍚屼竴涓偣浣嶇紪鍙峰悓鏃跺嚭鐜板湪鏍囬銆並鐮佸拰璇︽儏閲屻€傚凡鏀剁獎鍒板叿浣撳尯鍩熸垨鍏蜂綋瑙掕壊鍚庨€氳繃銆?
## 4. 淇杩囩殑闂

- 澧炲姞 Playwright 鑷姩鍖栨祴璇曡兘鍔涳細
  - `npm run test:e2e`
  - `playwright.config.js`
  - `tests/e2e/app.spec.js`
- 澧炲姞娴嬭瘯鑷姩鐢熸垚涓存椂鍥剧墖 `tests/fixtures/test-wall.jpg` 鐨勯€昏緫锛岀敤浜庝笂浼犳祦绋嬨€?- 鍚庡彴琛ュ厖绋冲畾楠屾敹鏂囨鍜屾帶浠舵爣绛撅細
  - 鏄剧ず鈥滃叏鍥藉浣撳箍鍛婃墽琛屾淳鍗曠郴缁熲€?  - 甯堝倕涓嬫媺妗嗗鍔犫€滃笀鍌呴€夋嫨鈥?  - 娲惧崟鎸夐挳鏄剧ず鈥滃彂閫佸凡閫夌偣浣嶅埌甯堝倕绉诲姩绔€?- Supabase 鏈厤缃椂锛岃瘖鏂粨鏋滀篃浼氬垪鍑?`workers`銆乣wall_points`銆乣dispatch_tasks`銆乣point_photos` 鍜?`point-media`锛屽苟鏍囪涓烘湭閰嶇疆銆?- 澧炲姞 `.gitignore`锛岄伩鍏嶆彁浜?`.env`銆佹祴璇曟姤鍛婅緭鍑恒€佹祴璇曠粨鏋滃拰渚濊禆鐩綍銆?- 澧炲姞鐪熷疄 Supabase 鑱旇皟鑴氭湰锛?  - `npm run test:supabase`
  - `scripts/supabase-real-test.mjs`
  - 璇ヨ剼鏈彧杈撳嚭鍙橀噺鏄惁瀛樺湪鍜屾楠ょ姸鎬侊紝涓嶈緭鍑哄瘑閽ャ€?- 甯歌 Playwright 閰嶇疆浣跨敤鐙珛绔彛 `5187`锛屽苟寮哄埗鏈湴婕旂ず妯″紡锛岄伩鍏嶅鐢ㄥ凡鏈?dev server銆?
## 5. 浠嶉渶浜哄伐閰嶇疆鐨勯棶棰?
- 褰撳墠 `.env` 宸插瓨鍦ㄤ笖蹇呴渶鍙橀噺瀛樺湪锛屼絾褰撳墠鏈哄櫒鏃犳硶璁块棶 Supabase REST/Storage endpoint銆?- 璇锋鏌ユ湰鏈虹綉缁溿€佷唬鐞嗐€乀LS銆佸叕鍙搁槻鐏銆丼upabase 椤圭洰 URL 鏄惁鍙闂€?- 濡傞渶鐪熷疄鑱旇皟锛岃纭锛?  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_AMAP_KEY`
  - `VITE_AMAP_SECURITY_CODE`
  - `VITE_KIMI_CLASSIFY_ENDPOINT`锛屽彲閫?- 杩愯 `supabase/schema.sql`锛屽垱寤鸿〃銆丷LS 娴嬭瘯绛栫暐鍜?`point-media` bucket銆?- `npm install` 鎶ュ憡 1 涓?high severity vulnerability锛岄渶瑕佸悗缁敤 `npm audit` 璇勪及锛涙湰娆℃病鏈夋搮鑷浛鎹笟鍔′緷璧栵紝閬垮厤鐮村潖鐜版湁鍔熻兘銆?
## 6. 濡備綍鏈湴杩愯娴嬭瘯

```bash
npm install
npx playwright install chromium
npm run build
npm run test:e2e
```

鐪熷疄 Supabase 鑱旇皟鍛戒护锛?
```bash
npm run test:supabase
```

璇ュ懡浠や細浣跨敤 `.env`锛屼絾涓嶄細鎵撳嵃瀵嗛挜銆傛祴璇曟暟鎹娇鐢?`test_` 鍓嶇紑锛屾垚鍔熻繍琛屽悗浼氳嚜鍔ㄦ竻鐞嗐€?
鏈湴娴嬭瘯榛樿浣跨敤 Vite dev server銆侾laywright 浼氳嚜鍔ㄥ惎鍔細

```bash
npm run dev -- --host 127.0.0.1
```

濡傛灉 5173 绔彛宸叉湁鏈嶅姟锛孭laywright 浼氬鐢ㄧ幇鏈夋湇鍔°€?
## 7. 濡備綍閮ㄧ讲鍒?Vercel 鍚庢祴璇曠湡瀹炴墜鏈虹

1. 鍦?Vercel 椤圭洰鐜鍙橀噺涓厤缃?Supabase 鍜岄珮寰峰彉閲忋€?2. 鍦?Supabase SQL Editor 杩愯 `supabase/schema.sql`銆?3. 閮ㄧ讲鎴愬姛鍚庢墦寮€鍚庡彴锛?
```text
https://浣犵殑鍩熷悕.vercel.app/
```

4. 杩涘叆鈥淪upabase璇婃柇鈥濓紝鐐瑰嚮鈥滃紑濮嬭瘖鏂€濓紝纭鐜鍙橀噺銆佽〃璇诲啓銆丷LS 鍜?`point-media` Storage 妫€娴嬮€氳繃銆?5. 鍦ㄥ悗鍙扮偣鍑烩€滃啓鍏ユ紨绀烘暟鎹€濇垨瀵煎叆鐪熷疄鐐逛綅銆?6. 閫夋嫨鐐逛綅鍜屽笀鍌咃紝鐐瑰嚮鈥滃彂閫佸凡閫夌偣浣嶅埌甯堝倕绉诲姩绔€濄€?7. 鐢ㄧ湡瀹炴墜鏈烘墦寮€甯堝倕绔細

```text
https://浣犵殑鍩熷悕.vercel.app/worker?worker=zhang
https://浣犵殑鍩熷悕.vercel.app/worker?worker=li
```

8. 鎵嬫満绔鏌ョ偣浣嶃€佸湴鍧€銆並鐮併€侀」鐩€侀珮寰锋煡鐪嬨€侀珮寰峰鑸€?9. 涓婁紶鐓х墖鎴栬棰戙€?10. 鍥炲埌鍚庡彴鍒锋柊锛岀‘璁ょ偣浣嶇姸鎬佷负鈥滃凡瀹屾垚鈥濓紝鐓х墖/瑙嗛鏁伴噺澧炲姞銆?
## 8. 鐪熷疄 Supabase 鑱旇皟璇存槑

鏈疆宸插皾璇曠湡瀹?Supabase 鑱旇皟锛屼絾闃诲鍦ㄧ綉缁滆闂眰銆?
鎵ц缁撴灉锛?
- `.env` 瀛樺湪锛宍VITE_SUPABASE_URL` 鍜?`VITE_SUPABASE_ANON_KEY` 瀛樺湪銆?- URL 鏍煎紡妫€鏌ラ€氳繃銆?- Supabase SDK 璇锋眰澶辫触锛氱綉缁滃け璐ャ€?- PowerShell HTTP 鎺㈡祴澶辫触銆?- Chromium fetch 鎺㈡祴澶辫触銆?- 鏈啓鍏?`test_` 娴嬭瘯 worker銆乸oint銆乨ispatch task銆乸hoto銆?- 鏈笂浼?Storage 鏂囦欢銆?
缃戠粶鎭㈠鍚庨噸鏂拌繍琛岋細

```bash
npm run test:supabase
```

鑴氭湰浼氳嚜鍔ㄦ墽琛岋細

- 妫€鏌?4 寮犺〃鍙銆?- 鍐欏叆 `test_` worker 鍜?point銆?- 妫€鏌?`point-media` bucket 鍙笂浼犮€?- 閫氳繃鍚庡彴 UI 娲惧崟缁欐祴璇?worker銆?- 鎵撳紑 `/worker?worker=test_xxx`銆?- 涓婁紶娴嬭瘯鍥剧墖銆?- 妫€鏌?`dispatch_tasks`銆乣point_photos`銆乣wall_points.status = 宸插畬鎴恅銆丼torage 鏂囦欢銆?- 鑷姩娓呯悊 `test_` 鏁版嵁鍜屾祴璇?Storage 鏂囦欢銆?
## 9. Vercel 閮ㄧ讲鍑嗗

鏈疆宸插畬鎴?Vercel 鐪熷疄鎵嬫満娴嬭瘯鐗堥儴缃插墠鍑嗗锛?
- `package.json` 宸茬‘璁ゅ寘鍚?`dev`銆乣build`銆乣test:e2e`銆乣test:supabase`銆?- Vite 鏈厤缃嚜瀹氫箟 `outDir`锛岀敓浜ф瀯寤鸿緭鍑虹洰褰曚负榛樿 `dist`銆?- 宸叉柊澧?`vercel.json`锛岄厤缃?SPA rewrite锛岄伩鍏?`/worker?worker=li` 绛夊墠绔矾鐢卞埛鏂板悗 404銆?- `.gitignore` 宸茬‘璁ゅ拷鐣?`.env`銆乣.env.local`銆乣.env.*.local`銆乣node_modules/`銆乣dist/`銆乣playwright-report/`銆乣test-results/`銆?- `.env.example` 鍙繚鐣欏彉閲忓悕鍜岀┖鍊硷紝娌℃湁鐪熷疄 key銆?- `README.md` 宸叉柊澧炪€婇儴缃插埌 Vercel 鐪熷疄鎵嬫満娴嬭瘯銆嬫暀绋嬶紝鍖呭惈 GitHub 绉佹湁浠撳簱銆乂ercel New Project銆乂ite銆丅uild Command銆丱utput Directory銆佺幆澧冨彉閲忓拰鐪熷疄鎵嬫満绔祴璇曟祦绋嬨€?- 宸叉柊澧?`DEPLOY_CHECKLIST.md`锛岃鐩?Supabase active 鐘舵€併€? 寮犺〃銆乣point-media` bucket銆丷LS/Storage policy銆乂ercel 鐜鍙橀噺銆佸悗鍙拌瘖鏂拰鎵嬫満绔笂浼犻獙鏀躲€?- 鍚庡彴宸蹭繚鐣欐槑鏄剧殑鈥淪upabase璇婃柇鈥濆叆鍙ｏ紝璇婃柇瑕嗙洊鐜鍙橀噺銆乁RL 鏍煎紡銆? 寮犺〃銆乣point-media` bucket锛屽苟鍖哄垎鏈厤缃€乁RL 閿欒銆佺綉缁滃け璐ャ€佽〃涓嶅瓨鍦ㄣ€丷LS 鏉冮檺鍜?bucket 涓嶅瓨鍦ㄣ€?
Vercel CLI 妫€鏌ョ粨鏋滐細

- 宸叉墽琛?`vercel --version`銆?- 褰撳墠鏈哄櫒鏈畨瑁?Vercel CLI锛屾墍浠ユ病鏈夋墽琛?`vercel pull` 鎴?`vercel build`銆?- 鏈寜瑕佹眰寮鸿瀹夎鍏ㄥ眬宸ュ叿锛汻EADME 宸插啓鏄庨渶瑕佹椂鎵嬪姩鎵ц `npm i -g vercel`銆乣vercel login`銆乣vercel pull`銆乣vercel build`銆?
鏈疆閮ㄧ讲鍓嶉獙璇佺粨鏋滐細

- `npm install`锛氶€氳繃锛沶pm 浠嶆彁绀?1 涓?high severity audit 椤癸紝闇€瑕佸悗缁汉宸ヨ瘎浼颁緷璧栧崌绾ч闄┿€?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛? passed銆?
鐪熷疄 Supabase 鑱旇皟寤鸿锛?
- 鏈満姝ゅ墠 `npm run test:supabase` 澶辫触鐐瑰湪缃戠粶璁块棶 Supabase REST/Storage endpoint锛屼笉鏄墠绔淳鍗曢€昏緫澶辫触銆?- 寤鸿閮ㄧ讲鍒?Vercel 鍏綉 HTTPS 鍚庯紝鍦?Vercel 鐜鍙橀噺涓厤缃湡瀹?Supabase 鍜岄珮寰峰彉閲忥紝鍐嶉€氳繃鍚庡彴鈥淪upabase璇婃柇鈥濆拰鐪熷疄鎵嬫満 `/worker?worker=li` 涓婁紶娴佺▼缁х画楠岃瘉銆?
## 10. Vercel 閮ㄧ讲鍓嶆渶缁堟鏌?
妫€鏌ユ椂闂达細2026-05-07銆?
閮ㄧ讲鍓嶉厤缃鏌ワ細閫氳繃銆?
- `vercel.json` 瀛樺湪锛屽苟閰嶇疆浜?SPA rewrite锛歚/(.*)` -> `/`锛屽彲閬垮厤 `/worker?worker=li` 鍒锋柊鍚?404銆?- `.gitignore` 宸插寘鍚?`.env`銆乣.env.local`銆乣.env.*.local`銆乣node_modules/`銆乣dist/`銆乣playwright-report/`銆乣test-results/`銆?- `.env.example` 鍙寘鍚?5 涓┖鍊煎彉閲忓悕锛屾病鏈夌湡瀹?key銆?- `README.md` 宸插啓娓呮 GitHub 涓婁紶鏂规硶銆乂ercel New Project銆丗ramework Vite銆丅uild Command `npm run build`銆丱utput Directory `dist`銆乂ercel 鐜鍙橀噺銆侀儴缃插悗鍚庡彴鍜屽笀鍌呯Щ鍔ㄧ璁块棶鍦板潃銆?- `DEPLOY_CHECKLIST.md` 宸插寘鍚?Supabase 琛ㄣ€乣point-media` bucket銆丷LS 娴嬭瘯绛栫暐銆乂ercel 鐜鍙橀噺銆侀儴缃插悗 Supabase 璇婃柇銆佹墜鏈虹娲惧崟娴嬭瘯銆?
鏈疆杩愯鍛戒护锛?
```bash
npm install
npm run build
npm run test:e2e
```

杩愯缁撴灉锛?
- `npm install`锛氶€氳繃锛沶pm 浠嶆彁绀?1 涓?high severity audit 椤癸紝寤鸿鍚庣画鍗曠嫭璇勪及渚濊禆鍗囩骇銆?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛? passed銆?
闇€瑕佷汉宸ュ畬鎴愮殑涓嬩竴姝ワ細

1. 鍦?GitHub 鍒涘缓绉佹湁浠撳簱骞朵笂浼犲綋鍓嶉」鐩唬鐮侊紝纭涓嶈涓婁紶 `.env`銆?2. 鍦?Vercel 瀵煎叆璇?GitHub 浠撳簱锛孎ramework 閫夋嫨 Vite銆?3. Vercel Build Command 濉?`npm run build`锛孫utput Directory 濉?`dist`銆?4. 鍦?Vercel Settings -> Environment Variables 娣诲姞鐪熷疄鐨?`VITE_SUPABASE_URL`銆乣VITE_SUPABASE_ANON_KEY`銆乣VITE_AMAP_KEY`銆乣VITE_AMAP_SECURITY_CODE`锛屽鍚敤 Kimi 鍐嶆坊鍔?`VITE_KIMI_CLASSIFY_ENDPOINT`銆?5. 閮ㄧ讲鍚庢墦寮€鍚庡彴锛岀偣鍑烩€淪upabase璇婃柇鈥濓紝纭鐜鍙橀噺銆佽〃銆丷LS 鍜?Storage 閫氳繃銆?6. 鐢ㄧ湡瀹炴墜鏈鸿闂?`/worker?worker=li`锛屽畬鎴愭淳鍗曞拰涓婁紶鐓х墖/瑙嗛娴嬭瘯锛岀‘璁ゅ悗鍙扮偣浣嶇姸鎬佸彉涓衡€滃凡瀹屾垚鈥濄€?
## 11. 鑷姩鎺ㄨ繘鍒扮湡瀹炴祴璇曠増缁撴灉

鏇存柊鏃堕棿锛?026-05-07銆?
淇敼鏂囦欢鍒楄〃锛?
- `.gitignore`
- `.env.example`
- `README.md`
- `DEPLOY_CHECKLIST.md`
- `TEST_REPORT.md`
- `vercel.json`

鏂板鏂囦欢鍒楄〃锛?
- `AGENTS.md`
- `DEPLOY_RESULT.md`

鎵ц杩囩殑鍛戒护锛?
```bash
npm install
npm run build
npm run test:e2e
npm run test:supabase
git init
git check-ignore -v .env .env.local dist node_modules playwright-report test-results
git add .
git commit -m "chore: prepare h5 app for vercel deployment"
git remote -v
vercel --version
```

鏈湴楠岃瘉缁撴灉锛?
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛? passed銆?- `npm run test:supabase`锛氬け璐ワ紱鍘熷洜鏄綋鍓嶆満鍣ㄦ棤娉曡闂?Supabase REST/Storage endpoint锛屽睘浜庢湰鍦扮綉缁溿€佷唬鐞嗐€乀LS 鎴?Supabase endpoint 鍙闂€ч棶棰樸€傝剼鏈湪鍐欏叆 `test_` 鏁版嵁鍓嶅け璐ワ紝鏈垱寤烘祴璇曚笟鍔℃暟鎹€?
GitHub 鐘舵€侊細

- 鏈湴 Git 浠撳簱宸插垵濮嬪寲銆?- 宸叉彁浜?commit锛歚chore: prepare h5 app for vercel deployment`銆?- `.env` 宸茬‘璁よ `.gitignore` 蹇界暐锛屾病鏈夎繘鍏ユ彁浜ゃ€?- 褰撳墠娌℃湁杩滅▼ `origin`锛屽洜姝ゆ湭鑳?push 鍒?GitHub銆?
Vercel 鐘舵€侊細

- `vercel --version`锛氬け璐ワ紝褰撳墠鏈哄櫒鏈畨瑁?Vercel CLI銆?- `vercel build`锛氭湭鎵ц锛屽師鍥犳槸 Vercel CLI 涓嶅瓨鍦ㄣ€?- `vercel deploy`锛氭湭鎵ц锛屽師鍥犳槸 Vercel CLI 涓嶅瓨鍦ㄤ笖椤圭洰鏈?link銆?- Preview URL锛氭棤銆?- Production URL锛氭棤銆?
浠嶉渶浜哄伐澶勭悊鐨勯棶棰橈細

- 鍦?GitHub 鍒涘缓绉佹湁浠撳簱锛屽苟鎶婃湰鍦颁粨搴?push 涓婂幓銆?- 瀹夎骞剁櫥褰?Vercel CLI锛屾垨鍦?Vercel 缃戦〉瀵煎叆 GitHub 浠撳簱銆?- 鍦?Vercel 椤圭洰 Settings -> Environment Variables 涓厤缃湡瀹炵幆澧冨彉閲忋€備笉瑕佹妸鐪熷疄鍊煎彂鍒拌亰澶╅噷锛屼篃涓嶈鍐欏叆浠撳簱銆?- 鏈湴 Supabase 缃戠粶澶辫触锛屽缓璁儴缃插埌 Vercel 鍏綉 HTTPS 鍚庯紝閫氳繃鍚庡彴 Supabase 璇婃柇鍜岀湡瀹炴墜鏈轰笂浼犳祦绋嬬户缁獙璇併€?- `npm install` 浠嶆彁绀?1 涓?high severity audit 椤癸紝寤鸿鍚庣画鍗曠嫭璇勪及渚濊禆鍗囩骇椋庨櫓銆?
涓嬩竴姝ユ搷浣滐細

1. GitHub 鍒涘缓 Private repository锛屽缓璁粨搴撳悕 `wall-ad-h5-test`銆?2. 鏈湴鎵ц锛?
```bash
git remote add origin 浣犵殑GitHub浠撳簱鍦板潃
git branch -M main
git push -u origin main
```

3. Vercel 缃戦〉鐐?`New Project`锛屽鍏ヨ GitHub 浠撳簱銆?4. Framework 閫?`Vite`锛孊uild Command 濉?`npm run build`锛孫utput Directory 濉?`dist`銆?5. 娣诲姞 Vercel 鐜鍙橀噺鍚庨儴缃层€?6. 閮ㄧ讲鍚庤闂悗鍙板拰 `/worker?worker=li` 鍋氱湡瀹炴墜鏈烘祴璇曘€?
## 12. GitHub 鎺ㄩ€佷笌 Vercel CLI 妫€鏌?
鏇存柊鏃堕棿锛?026-05-07銆?
鎵ц杩囩殑鍛戒护锛?
```bash
git ls-files --error-unmatch .env
git remote add origin https://github.com/xiaoyu-7788/Repository-name-wall-ad-h5-test.git
git branch -M main
git push -u origin main
git -c http.proxy= -c https.proxy= push -u origin main
git status -sb --ignored
git branch -vv
vercel --version
```

缁撴灉锛?
- `.env` 鏈 Git 璺熻釜銆?- 宸叉坊鍔犺繙绋嬩粨搴?`origin`銆?- 褰撳墠鍒嗘敮宸插垏鎹负 `main`銆?- 棣栨 `git push` 鍥犳湰鏈?`127.0.0.1` 浠ｇ悊鏃犳硶杩炴帴 GitHub 澶辫触銆?- 闅忓悗浣跨敤鍗曟涓存椂绂佺敤 Git 浠ｇ悊鐨?push 鍛戒护瀹屾垚鎺ㄩ€侊紝鏈慨鏀瑰叏灞€ Git 閰嶇疆銆?- 鏈湴 Git 鐘舵€佹樉绀?`main` 姝ｅ湪璺熻釜 `origin/main`銆?- `vercel --version` 澶辫触锛氬綋鍓嶆満鍣ㄦ湭瀹夎 Vercel CLI銆?
涓嬩竴姝ヤ汉宸ュ姩浣滐細

```bash
npm i -g vercel
vercel login
```

鐧诲綍瀹屾垚鍚庡彲缁х画鎵ц锛?
```bash
vercel link
vercel build
```

濡傛灉 Vercel 椤圭洰灏氭湭閰嶇疆鐜鍙橀噺锛岃杩涘叆 Vercel 椤圭洰 `Settings -> Environment Variables` 娣诲姞锛?
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AMAP_KEY`
- `VITE_AMAP_SECURITY_CODE`
- `VITE_KIMI_CLASSIFY_ENDPOINT`锛屽彲閫?
涓嶈鎶婄湡瀹炲彉閲忓€煎啓鍏ヤ粨搴撴垨鑱婂ぉ銆?
## 13. Vercel CLI 鐧诲綍闃诲澶嶆煡

鏇存柊鏃堕棿锛?026-05-07銆?
鎵ц杩囩殑鍛戒护锛?
```bash
vercel --version
npm list -g vercel --depth=0
npx --yes vercel --version
npx --yes vercel whoami
npm install
npm run build
npm run test:e2e
```

缁撴灉锛?
- `vercel --version`锛氬け璐ワ紝褰撳墠 PowerShell 鎵句笉鍒板叏灞€ `vercel` 鍛戒护銆?- `npm list -g vercel --depth=0`锛氭湭鍙戠幇鍏ㄥ眬瀹夎鐨?`vercel`銆?- `npx --yes vercel --version`锛氶€氳繃锛屼复鏃?CLI 鐗堟湰涓?`53.2.0`銆?- `npx --yes vercel whoami`锛氬け璐ワ紝褰撳墠浼氳瘽娌℃湁 Vercel 鐧诲綍鍑嵁锛汣LI 杩涘叆鐧诲綍娴佺▼鍚庡洜闈?ASCII 璇锋眰澶存姤閿欍€?- 宸茬粰 `package.json` 娣诲姞 ASCII 椤圭洰鍚?`wall-ad-h5-test` 鍜?`private: true`锛岄伩鍏嶅伐鍏烽摼浠庣洰褰曟垨绯荤粺鍚嶇О鎺ㄦ柇椤圭洰鍚嶃€?- 淇敼鍚庨噸鏂拌繍琛?`npm install`锛氶€氳繃銆?- 淇敼鍚庨噸鏂拌繍琛?`npm run build`锛氶€氳繃銆?- 淇敼鍚庨噸鏂拌繍琛?`npm run test:e2e`锛氶€氳繃锛? passed銆?
Vercel 閮ㄧ讲鐘舵€侊細

- `vercel link`锛氭湭鎵ц锛屽師鍥犳槸 CLI 鏈櫥褰曘€?- Vercel 鐜鍙橀噺妫€鏌ワ細鏈墽琛岋紝鍘熷洜鏄?CLI 鏈櫥褰曚笖椤圭洰鏈?link銆?- `vercel build`锛氭湭鎵ц锛屽師鍥犳槸 CLI 鏈櫥褰曚笖椤圭洰鏈?link銆?- `vercel deploy`锛氭湭鎵ц锛屽師鍥犳槸 CLI 鏈櫥褰曚笖椤圭洰鏈?link銆?- Preview URL锛氭棤銆?- Production URL锛氭棤銆?
闇€瑕佷汉宸ュ鐞嗭細

1. 鍦ㄦ櫘閫?PowerShell 涓墽琛岋細

```bash
npm i -g vercel
vercel login
vercel whoami
```

2. 濡傛灉 `vercel` 鎵句笉鍒板懡浠わ紝纭 `C:\Users\wangs\AppData\Roaming\npm` 宸插姞鍏?PATH锛屾垨鐩存帴杩愯锛?
```bash
C:\Users\wangs\AppData\Roaming\npm\vercel.cmd login
C:\Users\wangs\AppData\Roaming\npm\vercel.cmd whoami
```

3. `vercel whoami` 鑳芥甯告樉绀鸿处鍙峰悗锛屽啀缁х画鑷姩閮ㄧ讲銆?
## 14. Vercel 鐧诲綍鐘舵€佸啀娆℃鏌?
鏇存柊鏃堕棿锛?026-05-07銆?
鎵ц杩囩殑鍛戒护锛?
```bash
vercel whoami
C:\Users\wangs\AppData\Roaming\npm\vercel.cmd whoami
vercel --version
```

缁撴灉锛?
- 褰撳墠 PowerShell 鍙互鎵惧埌 Vercel CLI銆?- `vercel --version`锛氬彲鐢紝鐗堟湰涓?`53.2.0`銆?- `vercel whoami`锛氬け璐ワ紝鎻愮ず娌℃湁鐜版湁鍑嵁骞跺皾璇曡繘鍏ョ櫥褰曟祦绋嬨€?- `vercel.cmd whoami`锛氬悓鏍峰け璐ャ€?- 妫€娴嬪埌 Vercel auth 鏂囦欢瀛樺湪锛屼絾澶у皬鍙湁 3 bytes锛屽疄闄呮病鏈変繚瀛樼櫥褰?token銆?- `VERCEL_TOKEN` 鐜鍙橀噺涓嶅瓨鍦ㄣ€?- 鐢变簬 CLI 鏈櫥褰曪紝鏈墽琛?`vercel link`銆乣vercel build`銆乣vercel deploy`銆乣vercel deploy --prod`銆?
褰撳墠闃诲锛?
- 杩欐槸 Vercel 璐﹀彿鐧诲綍/鎺堟潈闂锛岄渶瑕佷汉宸ュ湪鏈満 CLI 涓畬鎴愩€?- 涓嶈鎶?Vercel token 鎴栦换浣曠湡瀹炵幆澧冨彉閲忓彂鍒拌亰澶╅噷銆?
## 15. Vercel API 浠ｇ悊妯″紡鏀归€?
鏇存柊鏃堕棿锛?026-05-07銆?
淇敼鏂囦欢锛?
- `.env.example`
- `README.md`
- `DEPLOY_CHECKLIST.md`
- `DEPLOY_RESULT.md`
- `TEST_REPORT.md`
- `vercel.json`
- `src/App.jsx`
- `src/supabaseClient.js`
- `tests/e2e/app.spec.js`

鏂板鏂囦欢锛?
- `src/apiClient.js`
- `api/_shared.js`
- `api/diagnose.js`
- `api/seed-demo.js`
- `api/points.js`
- `api/workers.js`
- `api/dispatch.js`
- `api/worker-tasks.js`
- `api/upload.js`
- `api/photos.js`

鏀归€犵粨鏋滐細

- 淇濈暀鏈湴婕旂ず妯″紡銆?- 淇濈暀鍓嶇 Supabase 鐩磋繛澶囩敤妯″紡銆?- 鏂板 `VITE_DATA_MODE=proxy` 浠ｇ悊妯″紡锛屽苟浣滀负绾夸笂鎺ㄨ崘妯″紡銆?- 鍓嶇浠ｇ悊妯″紡涓嬩紭鍏堣姹傛湰绔?`/api/*`銆?- Vercel Serverless Function 浣跨敤 `SUPABASE_URL` 鍜?`SUPABASE_SERVICE_ROLE_KEY` 璁块棶 Supabase銆?- `SUPABASE_SERVICE_ROLE_KEY` 娌℃湁鍐欏叆鍓嶇浠ｇ爜銆佹枃妗ｇ湡瀹炲€兼垨鎶ュ憡鐪熷疄鍊笺€?- 鍚庡彴 Supabase 璇婃柇宸叉媶鎴愪袱缁勶細鍓嶇鐩磋繛 Supabase銆乂ercel API 浠ｇ悊銆?- 濡傛灉鍓嶇鐩磋繛澶辫触浣嗕唬鐞嗘垚鍔燂紝椤甸潰浼氭彁绀衡€滄祻瑙堝櫒鏃犳硶鐩磋繛 Supabase锛屼絾 Vercel 浠ｇ悊杩炴帴鎴愬姛锛岀郴缁熷彲姝ｅ父浣跨敤銆傗€?
鏂板 API锛?
- `GET /api/diagnose`锛氭鏌ユ湇鍔＄鐜鍙橀噺銆? 寮犺〃銆乣point-media` bucket銆?- `POST /api/seed-demo`锛氬啓鍏ユ垨閲嶇疆婕旂ず workers 鍜?wall_points銆?- `GET /api/points`锛氳繑鍥?points銆乼asks銆乸hotos銆亀orkers 鐘舵€併€?- `POST /api/points`锛氭柊澧炴垨鏇存柊鐐逛綅銆?- `PATCH /api/points`锛氭洿鏂扮偣浣嶆垨鎵归噺鏀归」鐩悕銆?- `GET /api/workers`锛氳繑鍥?workers 鍒楄〃銆?- `POST /api/dispatch`锛氬啓鍏?dispatch_tasks锛屽苟鎶婄偣浣嶇姸鎬佹洿鏂颁负鈥滄柦宸ヤ腑鈥濄€?- `GET /api/worker-tasks`锛氭寜 worker code/id 杩斿洖甯堝倕浠诲姟銆?- `POST /api/upload`锛氭敮鎸?base64 JSON 涓婁紶锛屽啓 Storage銆乸oint_photos锛屽苟鎶婄偣浣嶅拰娲惧崟鐘舵€佹洿鏂颁负鈥滃凡瀹屾垚鈥濄€?- `PATCH /api/photos`锛氭洿鏂扮収鐗囧垎绫汇€?
鎵ц杩囩殑鍛戒护锛?
```bash
npm install
npm run build
npm run test:e2e
```

娴嬭瘯缁撴灉锛?
- `npm install`锛氶€氳繃锛沶pm 浠嶆彁绀?1 涓?high severity audit 椤癸紝寤鸿鍚庣画鍗曠嫭璇勪及銆?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛? passed銆?- API 鏂囦欢鍔犺浇妫€鏌ワ細閫氳繃锛宍api/_shared.js`銆乣api/diagnose.js`銆乣api/seed-demo.js`銆乣api/points.js`銆乣api/workers.js`銆乣api/dispatch.js`銆乣api/worker-tasks.js`銆乣api/upload.js`銆乣api/photos.js` 鍧囧彲琚?Node 姝ｅ父鍔犺浇銆?
鏂板娴嬭瘯瑕嗙洊锛?
- `/api/diagnose` 鏈厤缃湇鍔＄鍙橀噺鏃朵笉宕╂簝銆?- 鏈湴婕旂ず妯″紡浠嶅彲娲惧崟銆佹樉绀虹Щ鍔ㄧ浠诲姟銆佷笂浼犲悗鑷姩瀹屾垚銆?- Supabase 璇婃柇椤甸潰鏄剧ず鍓嶇鐩磋繛鍜?Vercel API 浠ｇ悊涓ょ粍鐘舵€併€?
Vercel 闇€瑕佹柊澧炴垨纭鐨勫彉閲忥細

鍓嶇鍏紑鍙橀噺锛?
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AMAP_KEY`
- `VITE_AMAP_SECURITY_CODE`
- `VITE_DATA_MODE=proxy`
- `VITE_KIMI_CLASSIFY_ENDPOINT`锛屽彲閫?
鏈嶅姟绔瀵嗗彉閲忥細

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` 鍦?Supabase Project Settings -> API 涓煡鐪嬶紝鍙厑璁稿～鍒?Vercel Environment Variables锛屽彧鍏佽 Serverless API 璇诲彇銆?
## 16. 鐪熷疄娲惧崟閾捐矾涓撻」淇

鏇存柊鏃堕棿锛?026-05-07銆?
淇敼鏂囦欢鍒楄〃锛?
- `src/App.jsx`
- `src/apiClient.js`
- `src/styles.css`
- `api/dispatch.js`
- `api/worker-tasks.js`
- `api/upload.js`
- `api/_shared.js`
- `supabase/schema.sql`
- `tests/e2e/app.spec.js`
- `README.md`
- `TEST_REPORT.md`
- `DEPLOY_RESULT.md`

淇鍐呭锛?
- 宸茬‘璁?`src/App.jsx` 涓嶅啀鍖呭惈 `setWorkerPointTasks`銆乣setActiveMobileWorkerId`銆乣setAppView("mobile")` 鏈湴 Canvas 璺宠浆娲惧崟閫昏緫銆?- 鍚庡彴鈥滃彂閫佸凡閫夌偣浣嶅埌甯堝倕绉诲姩绔€濆湪 `VITE_DATA_MODE=proxy` 鏃朵細璋冪敤 `dispatchPointsApi(requestPayload)`锛屽苟璇锋眰 `POST /api/dispatch`銆?- 鍓嶇娲惧崟 payload 缁熶竴涓?`worker_id`銆乣worker_key`銆乣worker_name`銆乣worker_phone`銆乣point_ids`銆?- 娲惧崟鎴愬姛鍚庡埛鏂板悗鍙版暟鎹紝鏄剧ず鈥滃凡鎴愬姛鍙戦€?X 涓偣浣嶇粰 XX甯堝倕鈥濓紝骞朵繚鐣欌€滄墦寮€璇ュ笀鍌呯Щ鍔ㄧ鈥濋摼鎺ャ€?- 娲惧崟澶辫触鏃堕〉闈㈡樉绀衡€滄淳鍗曡皟璇曚俊鎭€濓紝鍖呭惈 `/api/dispatch`銆乸ayload銆丠TTP status銆乺esponse銆乻tage銆乵essage銆乨etails銆?- `/api/dispatch` 宸叉敮鎸佹煡鎵?worker銆佹竻鐞嗛噸澶嶄换鍔°€佸啓鍏?`dispatch_tasks.status = 鏂藉伐涓璥銆佹洿鏂?`wall_points.status = 鏂藉伐涓璥锛屽け璐ユ椂杩斿洖鏄庣‘ `stage/message/details`銆?- `/api/worker-tasks?worker=li` 宸插吋瀹?`id`銆乣code`銆乣worker_key`銆乣slug`銆乣phone`銆佸鍚嶅寘鍚€滄潕鈥濄€佽溅鐗屽寘鍚€滃伐002鈥濈瓑鏌ヨ鏂瑰紡銆?
鏈疆鎵ц杩囩殑鍛戒护锛?
```bash
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?
绾夸笂 `/admin/points` 瀹炴祴缁撴灉锛?
- 鍒濆杩涘叆椤甸潰鏃讹細
  - `pointTableWrap = 1`
  - `modal-card = 0`
  - `drawer-panel = 0`
  - 璇存槑榛樿鏄叏瀹藉垪琛紝娌℃湁鍙充晶鏃?Drawer銆?- 鐐瑰嚮棣栬 `鏌ョ湅璇︽儏` 鍚庯細
  - `modal-card = 1`
  - `drawer-panel = 0`
  - `pointTableWrap = 1`
  - 璇存槑璇︽儏宸叉敼涓哄眳涓?Modal锛屽簳灞傚垪琛ㄥ搴︽病鏈夊彉鍖栥€?- 鍏抽棴璇︽儏鍚庯細
  - `modal-card = 0`
  - `drawer-panel = 0`
  - `pointTableWrap = 1`
  - 璇存槑鍏抽棴鍚庝粛鍥炲埌瀹屾暣鍏ㄥ鍒楄〃锛屾病鏈夋畫鐣欏彸渚у崐灞忕粨鏋勩€?- 鍚屾椂纭锛?  - 鎿嶄綔鍒椾粛鏄?`鏌ョ湅璇︽儏 / 缂栬緫 / 鏇村`
  - 鍦板潃绗簩琛屼粛鏄剧ず `K鐮侊細...`
  - 绾夸笂涓嶅瓨鍦ㄦ棫鐗?`Point Management`
  - `/api/wall-points` 杩斿洖 `ok: true`锛宍dataCount: 3`

## 45. `/admin/points` 瀹屾暣鏂扮増鐐逛綅绠＄悊涓績鏇挎崲

鏇存柊鏃堕棿锛?026-05-12銆?
鏈缁х画淇 `/admin/points`锛岀洰鏍囨槸鎶婂崐鏂扮増椤甸潰鏇挎崲涓哄畬鏁存柊鐗堢偣浣嶇鐞嗕腑蹇冿紝骞朵慨姝ｅ湴鍧€ / K鐮佹樉绀洪敊璇€?
瀹為檯鍏ュ彛纭锛?
- `/admin/points` 鐪熷疄璺敱浠嶅湪 `src/App.jsx`锛屽疄闄呮覆鏌撶粍浠朵粛鐒跺彧鏈?`src/pages/PointsPage.jsx`銆?- `src/components/points/PointFilters.jsx` 褰撳墠鏈啀琚?`/admin/points` 寮曠敤銆?- 褰撳墠鐐逛綅椤靛彧缁勫悎浣跨敤 `PointsPage` + `PointsTable` + `PointDetailDrawer`锛屼笉瀛樺湪绗簩涓?`PointManagement` 椤甸潰涓庝箣骞惰娓叉煋銆?
鏈鏂板鎴栬皟鏁达細

- 鍦?`src/lib/domain.js` 涓粺涓€鏂板鐐逛綅灞曠ず瀛楁鏄犲皠锛?  - `getPointKCode()`
  - `getProjectName(point, projects)`
  - `getPointDisplayModel()`
- `PointsPage` 鎭㈠瀹屾暣鏂扮増绛涢€夊伐鍏锋爮锛?  - 鎼滅储鐐逛綅缂栧彿 / 鍦板潃 / 椤圭洰 / 甯堝倕
  - 椤圭洰绛涢€?  - 鐘舵€佺瓫閫?  - 寮傚父绛涢€?  - 甯堝倕绛涢€?  - 鏍囩绛涢€?  - 鏃堕棿绛涢€?  - 鎵归噺鎵撴爣绛?  - 鎵归噺绉婚櫎鏍囩
  - 瀵煎叆妯℃澘
- `PointsTable` 璋冩暣涓烘渶缁堣〃澶达細
  - 閫夋嫨妗?  - 鐐逛綅缂栧彿
  - 椤圭洰 / 鏍囩
  - 鍦板潃 / K鐮?  - 甯堝倕 / 闃熶紞
  - 鐘舵€?  - 绱犳潗鎯呭喌
  - 鏈€杩戞洿鏂?  - 鎿嶄綔
- 鍦板潃鍒椾笅鏂圭粺涓€鏄剧ず `K鐮侊細xxx`锛屼笉鍐嶉噸澶嶆樉绀虹偣浣嶇紪鍙枫€?- `PointDetailDrawer` 鏀逛负浣跨敤缁熶竴瀛楁鏄犲皠锛屾娊灞夐噷鐨?K鐮?涓嶅啀浠庣偣浣嶇紪鍙峰厹搴曘€?- `api/wall-points.js` 淇鏃у厹搴曢€昏緫锛氫繚瀛樼偣浣嶆椂锛宍k_code` 涓虹┖涓嶅啀鑷姩鍐欏叆 `title`銆?- `legacyModals.jsx` 涓壒閲忓鍏ラ澶勭悊鍚屾淇锛岄伩鍏嶆壒閲忓鍏ユ椂鎶婄偣浣嶇紪鍙峰啓鎴?K鐮併€?
鏈淇敼鏂囦欢锛?
- `src/pages/PointsPage.jsx`
- `src/components/points/PointsTable.jsx`
- `src/components/points/PointDetailDrawer.jsx`
- `src/components/shared/legacyModals.jsx`
- `src/lib/domain.js`
- `src/styles.css`
- `api/wall-points.js`
- `tests/e2e/app.spec.js`
- `TEST_REPORT.md`

鑷缁撴灉锛?
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- E2E 宸叉柊澧炴柇瑷€锛?  - 琛ㄦ牸琛ㄥご鏄剧ず `鍦板潃 / K鐮乣
  - 鐜版湁婕旂ず鐐逛綅鏄剧ず `K鐮侊細K-GZ-BY-001`
  - 鏂板涓€涓湭濉啓 K鐮?鐨勭偣浣嶅悗锛岃〃鏍兼樉绀?`鏈櫥璁板湴鍧€` 鍜?`K鐮侊細鏈櫥璁癭
- 绾夸笂 `https://repository-name-wall-ad-h5-test.vercel.app/admin/points` 宸蹭汉宸ュ鏍革細
  - 椤堕儴鏄剧ず `绠＄悊鍚庡彴 / Point Center` 鍜?`鐐逛綅绠＄悊`
  - 绛涢€夋爮鏄剧ず鎼滅储鐐逛綅缂栧彿 / 鍦板潃 / 椤圭洰 / 甯堝倕銆佸叏閮ㄥ笀鍌呫€佸叏閮ㄦ椂闂?  - 琛ㄥご鏄剧ず `鍦板潃 / K鐮乣
  - 椤甸潰宸蹭笉鍐嶆樉绀?`鎵ц鍙拌处涓績` 鎴栨棫鐗?`Point Management`
  - 璇︽儏鎶藉眽涓?`K鐮乣 瀛楁鏄剧ず涓?`鏈櫥璁癭锛屾湭鍐嶉噸澶嶇偣浣嶇紪鍙?
## 46. `/admin/points` 鎿嶄綔鍒椾笌琛ㄦ牸瀹藉害鏀跺彛

鏇存柊鏃堕棿锛?026-05-12銆?
鏈鍙户缁慨澶?`/admin/points` 鐨勭偣浣嶅垪琛ㄦ搷浣滃尯鍜岃〃鏍煎搴︼紝涓嶆敼 API銆丼upabase 鏁版嵁璇诲啓鍜屽瓧娈靛悕銆?
淇敼鏂囦欢锛?
- `src/components/points/PointsTable.jsx`
- `src/styles.css`
- `tests/e2e/app.spec.js`
- `TEST_REPORT.md`

鏃ф寜閽粍鏇挎崲浣嶇疆锛?
- 鏃х殑琛屽唴鎸夐挳缁勫師鏉ュ湪 `src/components/points/PointsTable.jsx` 鐨?`rowActions` 鍐呯洿鎺ユ覆鏌擄細
  - 鏌ョ湅
  - 缂栬緫
  - 鐜板満鏌ョ湅
  - 娲惧崟
  - 绱犳潗
  - 楠屾敹
  - 鍒犻櫎
- 鐜板凡鏇挎崲涓烘柊鐗堢粨鏋勶細
  - 涓绘寜閽細`鏌ョ湅璇︽儏`
  - 娆℃寜閽細`缂栬緫`
  - 鑿滃崟鎸夐挳锛歚鏇村`
- `鏇村` 鑿滃崟涓繚鐣欙細
  - `鐜板満鏌ョ湅`
  - `娲惧崟`
  - `绱犳潗`
  - `楠屾敹`
  - `鍒犻櫎`
- `鍒犻櫎` 浠呬繚鐣欏湪鑿滃崟鍐咃紝骞剁户缁娇鐢ㄥ嵄闄╂牱寮忋€?
鏈鏍峰紡鏀跺彛锛?
- `pointTableWrap` 鏀逛负鍏ㄥ鏄剧ず銆?- `pointTable` 鏀逛负 `width: 100%`锛屼笉鍐嶇淮鎸佹棫鎸夐挳缁勬拺寮€鐨勫搴︺€?- `鏇村` 鑿滃崟鏀逛负缁濆瀹氫綅涓嬫媺锛屼笉鍐嶆妸琛ㄦ牸琛屾拺楂樸€?- 鍒楄〃甯告€佷繚鎸佸叏瀹斤紱璇︽儏浠嶉€氳繃 Drawer 鎵撳紑锛屼笉浼氭妸琛ㄦ牸甯告€佹尋鎴愬崐灞忋€?
楠岃瘉鍛戒护锛?
```bash
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?
绾夸笂 `/admin/points` 瀹為檯楠岃瘉椤癸細

- 琛屽唴鎿嶄綔鍖哄彧鏄剧ず锛歚鏌ョ湅璇︽儏`銆乣缂栬緫`銆乣鏇村`
- `鏇村` 鑿滃崟涓墠鏄剧ず锛歚鐜板満鏌ョ湅`銆乣娲惧崟`銆乣绱犳潗`銆乣楠屾敹`銆乣鍒犻櫎`
- 鍦板潃鍒楃浜岃缁х画鏄剧ず `K鐮侊細...`
- 椤甸潰淇濇寔鍏ㄥ琛ㄦ牸鏄剧ず
- `/api/wall-points` 缁х画杩斿洖鐪熷疄鏁版嵁

绾夸笂瀹為檯澶嶆牳缁撴灉锛?
- 鐢熶骇鍦板潃锛歚https://repository-name-wall-ad-h5-test.vercel.app/admin/points`
- 甯告€侀〉闈㈠彲瑙侊細
  - `鏌ョ湅璇︽儏` 3 涓?  - `缂栬緫` 3 涓?  - `鏇村` 3 涓?  - `鍒犻櫎` 0 涓?- 鎵撳紑棣栬 `鏇村` 鑿滃崟鍚庡彲瑙侊細
  - `鐜板満鏌ョ湅` 1 涓?  - `娲惧崟` 1 涓?  - `绱犳潗` 1 涓?  - `楠屾敹` 1 涓?  - `鍒犻櫎` 1 涓?- 鎵撳紑 `鏇村` 鑿滃崟鏃堕〉闈㈠父鎬佹棤鍙充晶甯搁┗鎶藉眽锛宍drawer-panel` 鏁伴噺涓?`0`锛屽垪琛ㄤ繚鎸佸叏瀹姐€?- `Invoke-WebRequest https://repository-name-wall-ad-h5-test.vercel.app/api/wall-points` 杩斿洖锛?  - `ok: true`
  - `dataCount: 3`
  - 璇存槑浠嶅湪璇诲彇鐪熷疄绾夸笂鏁版嵁銆?
## 47. `/admin/points` 璇︽儏鎵撳紑鏂瑰紡鏀逛负灞呬腑 Modal

鏇存柊鏃堕棿锛?026-05-12銆?
鏈鍙户缁慨澶?`/admin/points` 鐨勮鎯呮墦寮€鏂瑰紡鍜屽竷灞€锛屼笉鏀?API锛屼笉鏀?Supabase锛屼笉鏀?`/api/wall-points` 鐨勭湡瀹炴暟鎹€昏緫銆?
鍒犻櫎/鏇挎崲鐨勬棫 Drawer锛?
- 琚浛鎹㈢殑鏃ц鎯呭鍣細`src/components/points/PointDetailDrawer.jsx`
- 鏃у疄鐜颁緷璧栵細`src/components/shared/Drawer.jsx`
- 鏃у竷灞€鐗瑰緛锛?  - `drawer-layer`
  - `drawer-scrim`
  - `drawer-panel`
  - 鍥哄畾鍙充晶鎶藉眽瀹藉害
  - 鎵撳紑璇︽儏鏃跺嚭鐜板彸渚ч潰鏉垮拰鏁撮〉閬僵

鏈澶勭悊鏂瑰紡锛?
- `PointDetailDrawer.jsx` 涓嶅啀浣跨敤 `Drawer`锛屾敼涓轰娇鐢ㄥ眳涓殑 `Modal`銆?- `/admin/points` 鎵撳紑璇︽儏鍚庡彧寮瑰嚭涓績 `modal-card`锛屼笉浼氭妸鍒楄〃鏀规垚宸﹀彸涓ゆ爮銆?- 鍒楄〃搴曞眰 `pointTableWrap` 鍦ㄨ鎯呮墦寮€鍜屽叧闂墠鍚庨兘淇濇寔鍙鍜屽叏瀹姐€?- 鏈娌℃湁鍒犻櫎鍏ㄥ眬 `drawer-panel` CSS锛屽洜涓轰粨搴撳叾瀹冩ā鍧椾粛鍦ㄥ鐢紱浣?`/admin/points` 杩欐潯鐪熷疄璺緞宸茬粡瀹屽叏涓嶅啀浣跨敤杩欏 Drawer銆?
浼氬鑷村崐灞忕殑鏃?CSS 涓庣幇鐘讹細

- 鏃?Drawer 鐩稿叧 CSS 浣嶄簬 `src/styles.css`锛?  - `.drawer-layer`
  - `.drawer-scrim`
  - `.drawer-panel`
- 杩欎簺鏍峰紡鏈韩浼氬舰鎴愬浐瀹氬彸渚ф娊灞夈€?- 褰撳墠 points 椤靛凡涓嶅啀鍛戒腑杩欑粍绫诲悕锛汦2E 宸叉柊澧炴柇瑷€锛屾墦寮€鐐逛綅璇︽儏鏃?`.drawer-panel` 鏁伴噺蹇呴』涓?`0`銆?
楠岃瘉鍛戒护锛?
```bash
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- 鏂板娴嬭瘯瑕嗙洊 `/api/dispatch` 鍐欏叆鈥滄柦宸ヤ腑鈥濅换鍔°€佹洿鏂扮偣浣嶇姸鎬侊紝浠ュ強鍓嶇婧愮爜涓嶅啀鍖呭惈 Canvas 鏈湴璺宠浆娲惧崟鍏抽敭瀛椼€?
绾夸笂鎺掓煡寤鸿锛?
- 濡傛灉 Vercel 閲嶆柊閮ㄧ讲鍚庝粛娲惧崟澶辫触锛岃杩涘叆 Vercel 椤圭洰 `Functions -> Logs`锛岀瓫閫?`/api/dispatch`銆?- 瀵圭収鍚庡彴鈥滄淳鍗曡皟璇曚俊鎭€濅腑鐨?payload銆丠TTP status銆乻tage銆乵essage銆乨etails 鎺掓煡 Supabase 琛ㄥ瓧娈点€佹暟鎹垨鏉冮檺闂銆?- 鏈疆娌℃湁鎵撳嵃銆佹彁浜ゆ垨鍐欏叆 `.env` 鐪熷疄瀵嗛挜銆?
## 17. dispatch workers 鏌ヨ鍏滃簳淇

鏇存柊鏃堕棿锛?026-05-07銆?
淇敼鏂囦欢锛?
- `api/_shared.js`
- `api/dispatch.js`
- `api/worker-tasks.js`
- `api/debug-dispatch.js`
- `src/App.jsx`
- `tests/e2e/app.spec.js`
- `README.md`
- `TEST_REPORT.md`
- `DEPLOY_RESULT.md`

淇鍐呭锛?
- `/api/dispatch` 宸叉敼涓哄拰 `/api/diagnose` 涓€鏍峰鐢?`_shared.getSupabaseAdmin()` 鍒濆鍖?Supabase 鏈嶅姟绔鎴风銆?- `/api/dispatch` 涓嶄娇鐢?`VITE_SUPABASE_URL` 鎴?`VITE_SUPABASE_ANON_KEY`锛屽彧璇诲彇鏈嶅姟绔?`SUPABASE_URL` 鍜?`SUPABASE_SERVICE_ROLE_KEY`銆?- `find_worker` 闃舵鏀逛负 `workers.select("*").limit(1000)`锛岄伩鍏嶅洜瀛楁鎴栨帓搴忓樊寮傚鑷存煡璇㈠け璐ャ€?- 濡傛灉 `workers` 鏌ヨ澶辫触浣?payload 涓湁 `worker_id`锛屽悗绔細鐢?payload 鐨?`worker_id` 缁х画娲惧崟锛屽苟鍦ㄦ垚鍔熷搷搴斾腑杩斿洖 `worker_lookup_warning`銆?- `dispatch_tasks` 鍐欏叆鏀寔澶氱骇闄嶇骇锛氫紭鍏堝啓 `id/worker_id/point_id/status/assigned_at/created_at`锛屽瓧娈典笉鍏煎鏃堕檷绾т负鏈€灏忓瓧娈点€?- `wall_points` 鐘舵€佹洿鏂版敮鎸?`updated_at` 涓嶅瓨鍦ㄦ椂鑷姩闄嶇骇锛屽彧鏇存柊 `status = 鏂藉伐涓璥銆?- 鏂板 `GET /api/debug-dispatch`锛岃繑鍥為潪鏁忔劅鏈嶅姟绔幆澧冪姸鎬併€丼upabase host銆佷笁寮犲叧閿〃鐨勮鍙栫姸鎬佸拰瀛楁鍚嶅垪琛ㄣ€?- 鍓嶇娲惧崟澶辫触璋冭瘯淇℃伅澧炲姞 `error_name` 鍜?`error_message`銆?
鎵ц杩囩殑鍛戒护锛?
```bash
npm run build
npm run test:e2e
npm run test:supabase
```

缁撴灉锛?
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?2 passed銆?- `npm run test:supabase`锛氬け璐ワ紱鍘熷洜浠嶆槸褰撳墠鏈満缃戠粶鏃犳硶璁块棶 Supabase REST/Storage endpoint銆傝剼鏈粎鏄剧ず鍙橀噺瀛樺湪/闅愯棌鐘舵€侊紝娌℃湁鎵撳嵃鐪熷疄 key銆?
绾夸笂楠岃瘉寤鸿锛?
- 鎺ㄩ€佸苟鍦?Vercel Redeploy 鍚庯紝鍏堣闂?`/api/debug-dispatch`銆?- 鍐嶅湪鍚庡彴娲惧崟锛岃嫢浠嶅け璐ワ紝鏌ョ湅鍚庡彴鈥滄淳鍗曡皟璇曚俊鎭€濆拰 Vercel `Functions -> Logs` 涓?`/api/dispatch` 鐨?`stage/message/error_name/error_message/details`銆?
## 18. Vercel API 璺敱鎺掗櫎 SPA rewrite

鏇存柊鏃堕棿锛?026-05-07銆?
淇敼鍐呭锛?
- `vercel.json` 宸叉敼涓哄彧鎶婇潪 `/api/*` 鐨勮矾寰勯噸鍐欏埌 `/index.html`銆?- 鏂板 `api/debug-network.js`锛岃闂?`/api/debug-network` 鏃惰繑鍥?JSON锛屼笉杩涘叆鍓嶇鍚庡彴椤甸潰銆?- 鏂板 E2E 闃插洖褰掓祴璇曪紝纭 `vercel.json` 涓嶄細鎶?`/api` 璺敱浜ょ粰 SPA銆?- 鏂板 E2E handler 娴嬭瘯锛岀‘璁?`/api/debug-network` 杩斿洖 JSON 缁撴瀯銆?
鏈€缁?`vercel.json`锛?
```json
{
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ]
}
```

鎵ц杩囩殑鍛戒护锛?
```bash
npm run build
npm run test:e2e
```

缁撴灉锛?
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?4 passed銆?
## 19. 鍥藉唴鎺ュ彛鐗堟敼閫?
鏇存柊鏃堕棿锛?026-05-07銆?
褰撳墠涓荤嚎宸蹭粠 Supabase / Vercel API 浠ｇ悊鍒囨崲涓哄浗鍐呭悗绔帴鍙ｉ€傞厤鐗堛€?
鏂板鏂囦欢锛?
- `server/index.js`
- `server/test-api.js`
- `server/data/db.json`
- `server/uploads/.gitkeep`
- `DOMESTIC_API_DEPLOY.md`

涓昏淇敼锛?
- `src/apiClient.js` 閲嶅啓涓虹粺涓€鏁版嵁璁块棶灞傦紝鏀寔 `local`銆乣mock-server`銆乣production-api`銆?- `src/supabaseClient.js` 鏀逛负鍏煎鐜鍙橀噺鍑哄彛锛屼笉鍐嶅垱寤?Supabase client銆?- `src/App.jsx` 榛樿鏄剧ず鈥滄帴鍙ｈ瘖鏂€濆拰鍥藉唴 API 鏁版嵁妯″紡锛屼笉鍐嶆彁绀虹敤鎴烽厤缃?Supabase銆?- `package.json` 鏂板 `dev:api`銆乣dev:all`銆乣test:api`銆?- `.env.example` 鏀逛负鍥藉唴鎺ュ彛鍙橀噺锛歚VITE_DATA_MODE`銆乣VITE_API_BASE_URL`銆侀珮寰峰彉閲忋€並imi 鍚庣浠ｇ悊鍙橀噺銆?- `README.md` 鏀逛负鍥藉唴鎺ュ彛鐗堣鏄庛€?- `tests/e2e/app.spec.js` 鏇存柊涓哄浗鍐呮帴鍙ｈ瘖鏂笌鏈湴婕旂ず娴佺▼銆?
Mock Server 鎺ュ彛瑕嗙洊锛?
- projects
- workers
- wall-points
- dispatch
- worker-tasks
- point-media
- complete-point
- track-logs
- import-demo / reset-demo

鎵ц杩囩殑鍛戒护锛?
```bash
npm install express cors multer concurrently
npm uninstall @supabase/supabase-js
npm run build
npm run test:api
npm run test:e2e
```

缁撴灉锛?
- `npm run build`锛氶€氳繃銆?- `npm run test:api`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?0 passed銆?
璇存槑锛?
- 鏃?`supabase/schema.sql` 鍜屽巻鍙?Vercel API 鏂囦欢浠嶄繚鐣欎綔涓哄弬鑰冿紝浣嗗綋鍓嶅墠绔富绾夸笉鍐嶈皟鐢?Supabase銆?- `api/_shared.js` 宸叉敼涓哄彲閫?Supabase SDK锛屼笉瀹夎 Supabase SDK 鏃朵笉浼氬奖鍝嶅浗鍐呮帴鍙ｇ増鏋勫缓鍜岃繍琛屻€?
## 20. 甯堝倕绔墜鏈烘敹涓嶅埌娲惧崟浠诲姟閾捐矾淇

鏇存柊鏃堕棿锛?026-05-08銆?
鏈鍙仛鐒﹀笀鍌呯 `/worker/:workerId` 璇诲彇娲惧崟浠诲姟閾捐矾锛屾病鏈夐噸鍋?UI锛屾病鏈夊垹闄ら珮寰锋煡鐪?楂樺痉瀵艰埅鍏ュ彛銆?
鏍瑰洜锛?- `WorkerPage` 涔嬪墠鍦ㄧ粍浠跺唴鐩存帴鎷?URL 骞?`fetch` `/api/worker-tasks`锛屾病鏈夌粺涓€璧?`src/apiClient.js`銆?- `VITE_API_BASE_URL=http://localhost:8787` 杩欑被閰嶇疆鍦ㄦ墜鏈哄眬鍩熺綉璁块棶鏃跺鏄撹鎵嬫満璇锋眰鑷繁鐨?`localhost`锛屽鑷村悗绔槑鏄庢湁 `count=3`锛岄〉闈㈠嵈璇讳笉鍒颁换鍔°€?- worker 椤垫嬁鍒版帴鍙ｆ暟鎹悗娌℃湁鎶?`taskPoints/count/瀹為檯璇锋眰 URL` 鍋氭垚娓呮櫚璋冭瘯鐘舵€侊紝鐜板満鎺掓煡鏃跺鏄撹鍒や负鍚庣娲惧崟澶辫触銆?
淇敼鏂囦欢锛?- `src/apiClient.js`
- `src/App.jsx`
- `TEST_REPORT.md`

鍏抽敭淇锛?- `getApiBaseUrl()` 缁熶竴涓鸿繍琛屾椂鍒ゆ柇锛?  - `localhost` / `127.0.0.1` 鍓嶇璁块棶鏃讹紝璇锋眰 `http://localhost:8787`銆?  - `192.168.*` / `10.*` / `172.16-31.*` 灞€鍩熺綉璁块棶鏃讹紝璇锋眰鍚?hostname 鐨?`8787`銆?  - 鍏綉鍚屽煙涓旀湭閰嶇疆 `VITE_API_BASE_URL` 鏃讹紝璧扮浉瀵?`/api`銆?- 鏂板 `getApiRequestUrl(path)`锛屾墍鏈夋帴鍙ｈ姹傜敱 `apiClient` 缁熶竴鐢熸垚 URL銆?- 鏂板 `getWorker(workerId)`锛屽苟瑙勮寖 `getWorkerTasks(workerId)` 杩斿洖 `taskPoints/count`銆?- `WorkerPage` 宸茬Щ闄ょ粍浠跺唴鐩存帴 `fetch`锛岃繘鍏ラ〉闈㈠悗璋冪敤 `getWorker(workerId)` 鍜?`getWorkerTasks(workerId)`銆?- worker 椤甸潰娓叉煋浠诲姟鏃朵娇鐢?`payload.taskPoints`锛屼笉鍐嶇敤鏈湴婕旂ず鐐逛綅瑕嗙洊鐪熷疄鎺ュ彛杩斿洖銆?- worker 椤甸潰淇濈暀 3 绉掕疆璇?`GET /api/worker-tasks?workerId=褰撳墠 workerId`銆?- worker 椤甸潰璋冭瘯鍖烘樉绀猴細褰撳墠 workerId銆丄PI_BASE_URL銆佸疄闄呰姹?URL銆佹渶杩戣姹傛椂闂淬€佽繑鍥?count銆乣taskPoints.length`銆侀敊璇俊鎭€?
鏈鎵ц鍛戒护锛?```bash
npm run build
npm run test:e2e
```

鎵ц缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?0 passed銆?
鎺ュ彛楠岃瘉锛?- `http://localhost:8787/api/health`锛氶€氳繃锛岃繑鍥炲浗鍐?Mock Server 姝ｅ父銆?- `http://192.168.110.187:8787/api/health`锛氶€氳繃锛岃繑鍥炲浗鍐?Mock Server 姝ｅ父銆?- `http://localhost:8787/api/worker-tasks?workerId=w1`锛氶€氳繃锛岃繑鍥?`count: 3`锛宍taskPoints.length: 3`銆?- `http://192.168.110.187:8787/api/worker-tasks?workerId=w1`锛氶€氳繃锛岃繑鍥?`count: 3`锛宍taskPoints.length: 3`銆?
椤甸潰楠岃瘉锛?- 鎵撳紑 `http://127.0.0.1:5174/worker/w1`锛氶〉闈㈡樉绀衡€滃凡璇诲彇 3 涓淳鍗曠偣浣嶁€濓紝浠诲姟杩涘害涓?`1 / 3`锛屽疄闄呰姹備负 `http://localhost:8787/api/worker-tasks?workerId=w1`銆?- 鎵撳紑 `http://192.168.110.187:5174/worker/w1`锛氶〉闈㈡樉绀衡€滃凡璇诲彇 3 涓淳鍗曠偣浣嶁€濓紝浠诲姟杩涘害涓?`1 / 3`锛屽疄闄呰姹備负 `http://192.168.110.187:8787/api/worker-tasks?workerId=w1`銆?- 椤甸潰浠嶄繚鐣欌€滈珮寰锋煡鐪嬧€濃€滈珮寰峰鑸€濇寜閽€?
鐢佃剳绔祴璇曟楠わ細
```bash
npm run dev:api
npm run dev -- --host 0.0.0.0 --port 5174
```

鐒跺悗鎵撳紑锛?```text
http://localhost:5174/worker/w1
```

纭璋冭瘯鍖烘樉绀猴細
```text
宸茶鍙?3 涓淳鍗曠偣浣?杩斿洖 count 3
taskPoints.length 3
瀹為檯璇锋眰 URL http://localhost:8787/api/worker-tasks?workerId=w1
```

鎵嬫満绔祴璇曟楠わ細
1. 鎵嬫満鍜岀數鑴戣繛鎺ュ悓涓€涓?WiFi銆?2. 鐢佃剳淇濇寔 `npm run dev:api` 鍜?Vite 鍓嶇鍚屾椂杩愯銆?3. 鎵嬫満娴忚鍣ㄦ墦寮€锛?```text
http://192.168.110.187:5174/worker/w1
```
4. 纭璋冭瘯鍖烘樉绀猴細
```text
瀹為檯璇锋眰 URL http://192.168.110.187:8787/api/worker-tasks?workerId=w1
宸茶鍙?3 涓淳鍗曠偣浣?杩斿洖 count 3
taskPoints.length 3
```

浠嶉渶浜哄伐澶勭悊锛?- 鏈鏈慨鏀?`.env` / `.env.local`锛屼篃鏈彁浜や换浣曠湡瀹炲瘑閽ャ€?- 濡傛灉鐢佃剳鍚庡彴娲惧崟浠嶆湭鍐欏叆鐪熷疄鍚庣锛岃纭鏈湴涓嶆槸 `VITE_FORCE_LOCAL_DEMO=true` 娴嬭瘯妯″紡锛涘眬鍩熺綉鐪熷疄鑱旇皟寤鸿浣跨敤 `VITE_DATA_MODE=mock-server` 鎴栦笉璁剧疆寮哄埗鏈湴婕旂ず鍙橀噺銆?- 鐪熸満涓婁紶鐓х墖鍚庣姸鎬佸彉鏇淬€侀珮寰峰鑸湪鎵嬫満楂樺痉 App 涓敜璧凤紝浠嶅缓璁敤鐪熷疄鎵嬫満鍐嶈蛋涓€閬嶇幇鍦烘祦绋嬬‘璁ゃ€?
## 21. 甯堝倕绉诲姩绔换鍔￠〉 UI 涓庝氦浜掍紭鍖?
鏇存柊鏃堕棿锛?026-05-08銆?
鏈鍙紭鍖栧笀鍌呯Щ鍔ㄧ `/worker/:workerId` 椤甸潰 UI 鍜屼氦浜掞紱鏈慨鏀瑰悗绔帴鍙ｏ紝鏈慨鏀?`server/index.js` 娲惧崟閫昏緫锛屾湭淇敼 `API_BASE_URL` 鎺ㄦ柇閫昏緫銆?
宸茬‘璁ゅ墠缃姸鎬侊細
- 鎵嬫満绔鍙栦换鍔″凡缁忔垚鍔熴€?- `/worker/w1` 褰撳墠鍙鍙?`count=3`锛宍taskPoints.length=3`銆?- 灞€鍩熺綉璁块棶鏃跺疄闄呰姹備粛涓?`http://192.168.110.187:8787/api/worker-tasks?workerId=w1`銆?
淇敼鏂囦欢锛?- `src/App.jsx`
- `src/styles.css`
- `tests/e2e/app.spec.js`
- `TEST_REPORT.md`

鏈 UI 淇锛?- 璋冭瘯淇℃伅宸叉敼涓烘姌鍙犻潰鏉匡紝榛樿鍙樉绀轰竴琛岀姸鎬侊細`宸茶繛鎺ュ悗鍙帮綔宸茶鍙?3 涓淳鍗曠偣浣嶏綔鏃犻敊璇痐銆?- 榛樿璋冭瘯璇︽儏涓嶅崰鐢ㄥぇ灞忓箷锛涚偣鍑烩€滃睍寮€璋冭瘯淇℃伅鈥濆悗鎵嶆樉绀?workerId銆丄PI_BASE_URL銆佸疄闄呰姹?URL銆佹渶杩戣鍙栨椂闂淬€乧ount銆乣taskPoints.length` 鍜岃鍙栭敊璇€?- 鈥滀笂涓€鐐逛綅 / 涓嬩竴鐐逛綅鈥濇寜閽凡浠?fixed 搴曢儴鎮诞鏀逛负椤甸潰鍐呭娴佷腑鐨勬寜閽尯锛屼笉鍐嶉伄鎸♀€滅‘璁ら槦浼嶈韩浠解€濇寜閽€?- 绉诲姩绔〉闈㈤『搴忚皟鏁翠负锛氭爣棰樸€佺姸鎬佹潯銆侀槦浼嶈韩浠界‘璁ゃ€佷换鍔¤繘搴︺€佸綋鍓嶇偣浣嶅崱鐗囥€侀珮寰锋煡鐪?瀵艰埅銆佷笂浼犵収鐗?涓婁紶瑙嗛銆佷笂涓€鐐逛綅/涓嬩竴鐐逛綅銆?- `workerId=w1` 鏈夊搴斿笀鍌呬俊鎭椂锛屽鍚嶃€佹墜鏈哄彿銆佽溅鐗岃嚜鍔ㄥ～鍏ワ紱浠嶉渶甯堝倕鐐瑰嚮鈥滅‘璁ら槦浼嶈韩浠解€濓紝鐐瑰嚮鍚庢寜閽樉绀衡€滃凡纭韬唤鈥濓紝杈撳叆妗嗛攣瀹氥€?- 浠诲姟鍗＄墖琛ュ厖鏄剧ず鐐逛綅缂栧彿銆佸湴鍧€銆並鐮併€佹埧涓溿€佹柦宸ラ槦闀裤€?- 涓婁紶鍏ュ彛鎷嗗垎涓衡€滀笂浼犵収鐗団€濆拰鈥滀笂浼犺棰戔€濅袱涓槑纭寜閽€?- 淇濈暀鈥滈珮寰锋煡鐪嬧€濃€滈珮寰峰鑸€濓紝骞剁户缁娇鐢ㄥ綋鍓嶄换鍔＄偣浣嶇殑 `lng/lat` 鐢熸垚閾炬帴銆?
鏈鎵ц鍛戒护锛?```bash
npm run build
npm run test:e2e
```

鎵ц缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?0 passed銆?
椤甸潰澶嶆煡缁撴灉锛?- 鎵撳紑 `http://192.168.110.187:5174/worker/w1`锛氶粯璁ょ姸鎬佹潯鏄剧ず `宸茶繛鎺ュ悗鍙帮綔宸茶鍙?3 涓淳鍗曠偣浣嶏綔鏃犻敊璇痐銆?- 榛樿 `.mobile-debug-details` 鏈睍寮€銆?- 鍒濆浠诲姟杩涘害涓?`1 / 3`锛屽綋鍓嶇偣浣嶄负 `GZ-BY-001`銆?- 鐐瑰嚮鈥滀笅涓€鐐逛綅鈥濆悗锛岃繘搴﹀彉涓?`2 / 3`锛屽綋鍓嶇偣浣嶅彉涓?`FS-NH-002`銆?- 绗簩涓换鍔＄殑楂樺痉瀵艰埅閾炬帴鍖呭惈 `113.14588,23.04712`锛岀‘璁や娇鐢ㄥ綋鍓嶄换鍔＄偣浣嶅潗鏍囥€?
浠嶉渶浜哄伐澶勭悊锛?- 鐪熸満涓婂缓璁啀纭涓€娆＄偣鍑烩€滈珮寰峰鑸€濇槸鍚﹁兘鍞よ捣鎵嬫満楂樺痉 App銆?- 鐪熸満涓婁紶鐓х墖/瑙嗛鍚庯紝寤鸿鍥炲悗鍙扮‘璁ょ偣浣嶇姸鎬佸拰濯掍綋鏁伴噺鍚屾鏇存柊銆?
## 16. 鍚庡彴楂樺痉鍦板浘鎵ц鍙颁慨澶嶉獙鏀?
鏇存柊鏃堕棿锛?026-05-08銆?
鏈淇敼鐩爣锛?- 鍚庡彴鈥滈珮寰峰湴鍥炬墽琛屽彴鈥濅紭鍏堝姞杞界湡瀹為珮寰?JS API v2銆?- 楂樺痉鍔犺浇澶辫触鏃舵樉绀烘槑纭瘖鏂紝骞舵樉绀哄鐢ㄥ湴鍥惧厹搴曪紝涓嶅啀鍙湅鍒扮┖鐧藉尯鍩熴€?- 鍚庡彴鍜屽笀鍌呯Щ鍔ㄧ鐨勨€滈珮寰锋煡鐪?/ 楂樺痉瀵艰埅鈥濈户缁娇鐢ㄥ綋鍓嶇偣浣?`lng / lat`銆?- 涓嶄慨鏀瑰悗绔淳鍗曘€佷笂浼犮€佺姸鎬佸洖鍐欐帴鍙ｉ€昏緫銆?
淇敼鏂囦欢锛?- `src/lib/amapLoader.js`锛氭柊澧炵粺涓€楂樺痉 SDK 鍔犺浇鍣紝浠?`VITE_AMAP_KEY`銆乣VITE_AMAP_SECURITY_CODE` 璇诲彇閰嶇疆锛屽姞杞藉墠璁剧疆 `window._AMapSecurityConfig`锛屽姩鎬佸姞杞介珮寰?JS API v2锛屽苟杩斿洖 `AMap` 瀹炰緥銆傝瘖鏂腑鐨勮剼鏈湴鍧€宸插 Key 鑴辨晱銆?- `src/App.jsx`锛氬悗鍙板湴鍥炬墽琛屽彴鎺ュ叆鐪熷疄 `AMap.Map`锛屾覆鏌撶偣浣?Marker锛屾敮鎸?Marker 鐐瑰嚮閫変腑銆佸彸渚х偣浣嶇偣鍑诲悗鍦板浘灞呬腑銆佸閫夌偣浣?`fitView`銆佺獥鍙ｅ彉鍖?`resize`銆侀敊璇瘖鏂拰澶囩敤鍦板浘鍏滃簳锛涘悗鍙扮偣浣嶈鎯呬笌鐜板満鏌ョ湅寮圭獥琛ュ厖鈥滈珮寰锋煡鐪?/ 楂樺痉瀵艰埅鈥濄€?- `src/styles.css`锛氳ˉ鍏呯湡瀹為珮寰峰湴鍥惧鍣ㄩ珮搴︺€佸鐢ㄥ湴鍥俱€丮arker銆佸湴鍥捐瘖鏂€佷紒涓氬悗鍙颁晶杈瑰鑸€佸井鍔ㄦ晥鍜?loading shimmer 鏍峰紡銆?- `.env.example`锛氫繚鐣?`VITE_API_BASE_URL`銆乣VITE_DATA_MODE=mock-server`銆乣VITE_AMAP_KEY`銆乣VITE_AMAP_SECURITY_CODE` 绀轰緥銆?- `README.md`锛氳ˉ鍏呴珮寰峰湴鍥鹃厤缃€佺櫧鍚嶅崟 / Referer銆佹湰鍦拌皟璇曞拰鎺掗敊璇存槑銆?- `tests/e2e/app.spec.js`锛氭敹绱р€滈珮寰峰湴鍥炬墽琛屽彴鈥濇柇瑷€鑼冨洿锛岄伩鍏嶄晶杈瑰鑸拰妯″潡鏍囬閲嶅悕閫犳垚 Playwright strict mode 鍐茬獊銆?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
```

褰撳墠鑷姩鍖栫粨鏋滐細
- `npm run build`锛氶€氳繃銆?- 绗竴娆?`npm run test:e2e`锛? passed / 1 failed銆傚け璐ュ師鍥犳槸娴嬭瘯浣跨敤 `getByText("楂樺痉鍦板浘鎵ц鍙?)`锛屽綋鍓嶉〉闈㈠悓鏃跺瓨鍦ㄤ晶杈瑰鑸摼鎺ュ拰鍦板浘妯″潡鏍囬锛岃Е鍙?Playwright strict mode锛涘凡鏀舵暃鏂█鑼冨洿锛屼笉鏄笟鍔″姛鑳藉け璐ャ€?- 鍚庣画閲嶆柊鎵ц `npm run test:e2e`锛氶€氳繃锛?0 passed銆?- 娴忚鍣ㄦ覆鏌撳啋鐑燂細鍚姩 Vite 鍒?`http://127.0.0.1:5199/admin`锛宍#map-console` 鍙锛宍.amap-shell` 楂樺害绾?`582px`锛屽湴鍥惧尯鍩熶笉鏄?0 楂樺害锛涙湭鎵撳嵃浠讳綍鐪熷疄楂樺痉 Key銆?
鍦板浘楠岃瘉璇存槑锛?- 褰撳墠鑷姩鍖栫幆澧冧笉鎵撳嵃銆佷笉璇诲彇鐪熷疄楂樺痉 Key锛屽洜姝ゆ棤娉曞湪鎶ュ憡閲岃瘉鏄庣湡瀹炲簳鍥句竴瀹氭潵鑷煇涓湡瀹?Key銆?- 浠ｇ爜璺緞宸插畬鎴愶細Key 鍜?Security Code 瀛樺湪鏃惰皟鐢?`loadAmapSdk()`锛屽垱寤?`new AMap.Map(...)`锛屽姞鍏?`AMap.TileLayer()`锛屽苟鎸夌偣浣?`lng / lat` 鍒涘缓 Marker銆?- Key 鎴?Security Code 缂哄け銆丼DK 鍔犺浇澶辫触鏃讹紝鍚庡彴鍦板浘鍖哄煙浼氭樉绀洪敊璇師鍥犮€佺幆澧冭瘖鏂拰澶囩敤鍦板浘锛岄伩鍏嶇┖鐧姐€?- 閰嶇疆鐪熷疄楂樺痉鍙橀噺鍚庯紝浜哄伐鎵撳紑 `/admin` 鐨勨€滈珮寰峰湴鍥炬墽琛屽彴鈥濆嵆鍙獙璇佺湡瀹炲簳鍥俱€丮arker銆佸垪琛ㄨ仈鍔ㄥ拰 `fitView`銆?
浜哄伐楠屾敹娓呭崟锛?- 鍚庡彴鎵撳紑 `http://localhost:5173/admin` 鎴?`http://鐢佃剳灞€鍩熺綉IP:5173/admin`銆?- 鈥滈珮寰峰湴鍥炬墽琛屽彴鈥濇樉绀虹湡瀹為珮寰峰簳鍥俱€?- 褰撳墠鐐逛綅鏄剧ず涓?Marker銆?- 鐐瑰嚮 Marker 鍚庯紝鍙充晶鐐逛綅璇︽儏鍒囨崲鍒拌鐐逛綅銆?- 鐐瑰嚮鍙充晶鐐逛綅鍗＄墖鍚庯紝鍦板浘灞呬腑鍒板搴?Marker銆?- 鍕鹃€夊涓偣浣嶅悗锛屽湴鍥捐嚜鍔?`fitView`銆?- 鍒犻櫎鎴栧～閿欓珮寰烽厤缃椂锛屾樉绀哄鐢ㄥ湴鍥惧拰閿欒璇婃柇銆?- 鍚庡彴鐐逛綅璇︽儏銆佺幇鍦烘煡鐪嬪脊绐椼€佹墜鏈虹浠诲姟椤电殑鈥滈珮寰锋煡鐪?/ 楂樺痉瀵艰埅鈥濆潎鍙墦寮€楂樺痉鍦板浘鎴栭珮寰风綉椤点€?- 鎵嬫満绔淳鍗曡鍙栥€佷笂浼犵収鐗囥€佺姸鎬佸洖鍐欓摼璺湭琚湰娆″湴鍥句慨鏀圭牬鍧忋€?
## 17. 宸ヤ汉灏忚溅 Marker 涓庡疄鏃跺畾浣嶉鐣?
鏇存柊鏃堕棿锛?026-05-08銆?
鏈淇敼鐩爣锛?- 鍚庡彴楂樺痉鍦板浘鍚屾椂鏄剧ず澧欎綋鐐逛綅 Marker 鍜屽伐浜?甯堝倕灏忚溅 Marker銆?- 鐐逛綅 Marker 浠庢í鍚戣兌鍥婃敼涓哄渾褰㈡暟瀛楁皵娉★紝骞舵寜鐘舵€佸尯鍒嗛鑹层€?- 灏忚溅 Marker 浣跨敤 worker 鐨?`lng / lat`锛屾樉绀哄笀鍌呭鍚嶃€佽溅鐗屻€侀€熷害鎴栧仠杞﹀垎閽熸暟銆?- 鎵嬫満绔鐣欑湡瀹炲畾浣嶄笂浼狅細`navigator.geolocation.watchPosition` -> `POST /api/worker-location`銆?- mock-server 瀹炵幇 `/api/worker-location`锛屽啓鍥?worker 鏈€鏂板潗鏍囧苟杩藉姞瀹氫綅鏃ュ織銆?
淇敼鏂囦欢锛?- `src/App.jsx`锛氬湴鍥炬墽琛屽彴澧炲姞杞﹁締 Marker 鍥惧眰锛寃orkers 鏇存柊鏃跺彧鏇存柊杞﹁締 Marker 浣嶇疆锛屼笉閲嶅缓鏁村紶鍦板浘锛涘鍔犫€滃叏閮ㄥ湪绾垮伐浜?/ 褰撳墠椤圭洰宸ヤ汉鈥濆垏鎹紱鐐逛綅 Marker 鏀逛负鍦嗗舰鏁板瓧鏍峰紡锛涘笀鍌呯澧炲姞鈥滃紑鍚疄鏃跺畾浣?/ 鍋滄瀹炴椂瀹氫綅鈥濄€?- `src/apiClient.js`锛氭柊澧?`saveWorkerLocation()`锛屾湰鍦版ā寮忓拰 mock-server 妯″紡閮藉彲鍐欏叆 worker 鍧愭爣銆?- `server/index.js`锛氭柊澧?`POST /api/worker-location`锛宍GET /api/workers` 杩斿洖甯︽渶鏂板潗鏍囩殑 workers銆?- `src/styles.css`锛氭柊澧炲渾褰㈢偣浣?Marker銆佸皬杞?Marker銆佸畾浣嶅崱鐗囧拰鍦板浘宸ュ叿鏍忔牱寮忋€?- `README.md`锛氳ˉ鍏呭笀鍌呭疄鏃跺畾浣嶈鏄庛€?- `TEST_REPORT.md`锛氳褰曟湰娆￠獙鏀剁粨鏋溿€?- `server/data/db.json`锛氭湰鍦版帴鍙ｅ啋鐑熸祴璇曞啓鍏ヤ簡 w1 鏈€鏂板畾浣嶆暟鎹紱璇ユ枃浠舵湰鏉ュ氨鏄湰鍦版寔涔呭寲娴嬭瘯鏁版嵁銆?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?0 passed銆?- mock-server 瀹氫綅鎺ュ彛鍐掔儫锛氫复鏃跺惎鍔?Express锛宍POST /api/worker-location` 鎴愬姛锛岄殢鍚?`GET /api/workers` 鑳界湅鍒?`w1.lng=113.33`銆乣w1.lat=23.19`銆乣moving=true`銆乣speed=18`銆?
浜哄伐楠屾敹娓呭崟锛?- 鎵撳紑 `http://localhost:5173/admin`锛岃繘鍏モ€滈珮寰峰湴鍥炬墽琛屽彴鈥濄€?- 閰嶇疆楂樺痉 Key 鍚庯紝搴斿悓鏃剁湅鍒板渾褰㈢偣浣?Marker 鍜屽皬杞?Marker銆?- 灏忚溅 Marker 鏂囨绫讳技锛歚寮犲笀鍌?28km/h` 鎴?`寮犲笀鍌?鍋?鍒哷銆?- 鐐瑰嚮鍙充晶鐐逛綅鍗＄墖锛屽湴鍥惧眳涓埌瀵瑰簲鍦嗗舰鐐逛綅銆?- 鐐瑰嚮鍦板浘鍦嗗舰鐐逛綅锛屽彸渚х偣浣嶈鎯呭垏鎹紱鍙屽嚮鐐逛綅杩涘叆缂栬緫/涓婁紶銆?- 鎵嬫満鎵撳紑 `/worker/w1`锛岀偣鍑烩€滃紑鍚疄鏃跺畾浣嶁€濓紝鎺堟潈瀹氫綅鍚庡悗鍙?`/api/workers` 搴旀洿鏂拌甯堝倕 `lng / lat`銆?- 鐪熷疄鍏綉閮ㄧ讲蹇呴』浣跨敤 HTTPS锛屽惁鍒欐墜鏈烘祻瑙堝櫒鍙兘闄愬埗鎸佺画瀹氫綅銆?
## 18. 鍏綉灏忓洟闃熸寮忎娇鐢ㄧ増鏀归€?
鏇存柊鏃堕棿锛?026-05-08銆?
鏈淇敼鐩爣锛?- 鍓嶇鐢熶骇鐜榛樿浣跨敤鍚屾簮 `/api`锛屽叕缃戦儴缃蹭笉鍐嶄緷璧栧眬鍩熺綉 IP 鎺ㄦ柇銆?- Express 鍚庣鍚屾椂鎻愪緵 API銆乣dist` 闈欐€佹枃浠跺拰 SPA 璺敱鍥為€€锛屾敮鎸佸埛鏂?`/admin`銆乣/worker/zhang`銆?- 鏂板姝ｅ紡鈥滃笀鍌呯鐞嗏€濓細鏂板銆佺紪杈戙€佽蒋鍋滅敤銆佹仮澶嶃€佸鍒跺叕缃戦摼鎺ャ€?- 娲惧崟涓嬫媺鍙樉绀?`enabled=true` 鐨勫笀鍌呫€?- 甯堝倕绉诲姩绔敮鎸?`/worker/:idOrSlug`锛屽彲閫氳繃 id銆乻lug銆亀orkerKey銆佹墜鏈哄彿鍖归厤銆?- 鍋滅敤甯堝倕璁块棶绉诲姩绔椂鏄剧ず鈥滆甯堝倕璐﹀彿宸插仠鐢紝璇疯仈绯荤鐞嗗憳銆傗€濄€?
淇敼鏂囦欢锛?- `src/apiClient.js`锛氶噸鍐?`getApiBaseUrl()`锛涘紑鍙戠幆澧冩棤閰嶇疆鏃堕粯璁?`http://localhost:8787`锛岀敓浜х幆澧冩棤閰嶇疆鏃朵娇鐢ㄥ悓婧?`/api`锛涙柊澧?`deleteWorker()`銆乣setWorkerEnabled()`锛宍getWorker()` 鏀逛负鎸夊崟涓?worker API 鏌ヨ銆?- `server/index.js`锛氭柊澧?`GET /api/workers/:workerIdOrSlug`銆乣DELETE /api/workers/:id`銆乣PATCH /api/workers/:id/enable`锛涘寮?POST/PUT 鍘婚噸鍜屽瓧娈佃鑼冿紱鐢熶骇鐜鎵樼 `dist` 骞跺洖閫€闈?`/api` 璺敱鍒?`index.html`銆?- `src/App.jsx`锛氬悗鍙扳€滃笀鍌呯鐞嗏€濆崌绾т负 CRUD 绠＄悊妯″潡锛涙淳鍗曚笅鎷夎繃婊ゅ仠鐢ㄨ处鍙凤紱甯堝倕绔樉绀烘墜鏈哄彿銆佽溅杈嗐€侀槦浼嶇被鍨嬪拰鍋滅敤鎻愮ず銆?- `src/styles.css`锛氭柊澧炲笀鍌呯鐞嗗垪琛ㄣ€佺姸鎬佹爣绛俱€佽〃鍗曘€佸仠鐢ㄦ彁绀烘牱寮忋€?- `package.json`锛氭柊澧?`start`銆乣serve:prod`銆?- `.env.example`锛氭寜鍏綉閮ㄧ讲椤哄簭淇濈暀 `VITE_DATA_MODE=mock-server`銆乣VITE_API_BASE_URL=`銆侀珮寰峰彉閲忋€?- `README.md`锛氳ˉ鍏呭叕缃戝悓婧愰儴缃层€佸笀鍌呯鐞嗐€佸悓婧?API銆侀珮寰峰煙鍚嶇櫧鍚嶅崟璇存槑銆?- `DEPLOY_PRODUCTION.md`锛氭柊澧炲浗鍐呬簯鏈嶅姟鍣ㄣ€乸m2銆丯ginx銆丠TTPS銆侀獙鏀跺湴鍧€瀹屾暣閮ㄧ讲璇存槑銆?- `tests/e2e/app.spec.js`锛氭柊澧炲笀鍌呯鐞?E2E锛岃鐩栨柊澧炪€佺紪杈戙€佸鍒堕摼鎺ャ€乻lug 鎵撳紑銆佹淳鍗曞拰鍋滅敤锛涜ˉ鍏呯敓浜?API base 涓嶅啀鍋氬眬鍩熺綉鎺ㄦ柇鐨勬簮鐮佹柇瑷€銆?- `server/data/db.json`锛氶€氳繃缁撴瀯鍖栧啓鍥炲崌绾?workers 瀛楁锛屼繚鐣欒€佹暟鎹苟琛ラ綈 `workerKey`銆乣teamType`銆乣enabled`銆乣online`銆乣updatedAt` 绛夊吋瀹瑰瓧娈点€?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- Express 鐢熶骇鍐掔儫锛氶殢鏈虹鍙ｅ惎鍔?`createApp()`锛岄獙璇?`/api/health`銆乣POST /api/workers`銆乣GET /api/workers/prodtest`銆乣PUT /api/workers/:id`銆乣DELETE /api/workers/:id`銆乣PATCH /api/workers/:id/enable`銆乣/admin` SPA 鍥為€€锛屽叏閮ㄩ€氳繃銆傚啋鐑熺粨鏉熷悗宸叉仮澶嶅師濮?`server/data/db.json`銆?
浠嶉渶浜哄伐澶勭悊锛?- 鍏綉鏈嶅姟鍣ㄤ笂閰嶇疆鐪熷疄 `.env.production`锛屼笉瑕佹妸楂樺痉 Key 鎴栧畨鍏ㄥ瘑閽ユ彁浜ゅ埌浠撳簱銆?- 楂樺痉 Web JS Key 闇€瑕佸湪楂樺痉鎺у埗鍙扮粦瀹氭寮忓叕缃戝煙鍚嶃€?- 姝ｅ紡甯堝倕瀹氫綅蹇呴』浣跨敤 HTTPS銆?- 涓婄嚎鍓嶅缓璁浠?`server/data/db.json` 鍜?`server/uploads/`锛屽悗缁彲杩佺Щ鍒版暟鎹簱涓庡璞″瓨鍌ㄣ€?
## 22. 甯堝倕绔悗鍙板浐瀹氳韩浠芥敼閫?
鏇存柊鏃堕棿锛?026-05-09銆?
鏈淇敼鐩爣锛?- 甯堝倕绔?`/worker/:idOrSlug` 涓嶅啀璁╁笀鍌呭～鍐欏鍚嶃€佹墜鏈哄彿銆佽溅鐗屽彿銆?- 甯堝倕鎵撳紑涓撳睘閾炬帴鍚庢寜 id -> slug -> workerKey 鑷姩鍖归厤鍚庡彴 worker锛屽苟鐢?worker.id 璇诲彇鑷繁鐨勬淳鍗曚换鍔°€?- 鎵句笉鍒?worker 鏃舵樉绀衡€滄湭鎵惧埌璇ュ笀鍌咃紝璇疯仈绯诲悗鍙伴噸鏂扮敓鎴愰摼鎺ャ€傗€濓紝涓嶄細榛樿杩涘叆寮犲笀鍌咃紝涔熶笉浼氬嚭鐜拌韩浠藉～鍐欏尯銆?- 杞︾墝鍙锋柊澧炪€佺紪杈戙€佷繚瀛樸€佹樉绀恒€佹淳鍗曚笅鎷夈€佸笀鍌呯灞曠ず缁熶竴杞ぇ鍐欍€?- 鐢熶骇鏋勫缓榛樿浣跨敤 `mock-server`锛岄伩鍏?`localhost:8787` 鐢熶骇娴嬭瘯鏃惰閫€鍥?localStorage銆?
淇敼鏂囦欢锛?- `src/apiClient.js`锛氭柊澧?`normalizeCarNo()`锛岀粺涓€ worker slug/workerKey 鐢熸垚涓庢煡鎵鹃€昏緫锛涚敓浜х幆澧冮粯璁ゆ暟鎹ā寮忔敼涓?`mock-server`锛涙淳鍗曞拰浠诲姟璇诲彇缁熶竴浣跨敤鐪熷疄 worker.id銆?- `server/index.js`锛氭柊澧炲悓鏍风殑杞︾墝瑙勮寖鍖栥€乻lug 鐢熸垚銆亀orker 鏌ユ壘閫昏緫锛沗/api/worker-tasks` 鎵句笉鍒板笀鍌呮椂杩斿洖娓呮櫚閿欒锛涗笂浼犲獟浣撲繚瀛樹负 `/uploads/...` 鐩稿璺緞锛屼笉鍐嶆妸鏈湴 `localhost` 鎴栧眬鍩熺綉 IP 鍐欒繘 `server/data/db.json`锛涗繚鐣?Express + dist + db.json 涓荤嚎銆?- `src/App.jsx`锛氱Щ闄ゅ笀鍌呯鈥滈槦浼嶈韩浠界‘璁も€濆崱鐗囧拰濮撳悕/鎵嬫満鍙?杞︾墝杈撳叆锛涢《閮ㄦ敼涓哄浐瀹氬睍绀衡€滄煇甯堝倕鐨勪换鍔♀€濄€佹墜鏈哄彿銆佽溅鐗屽彿銆佷粖鏃ヤ换鍔″拰褰撳墠杩涘害锛涘悗鍙板笀鍌呰〃鍗曡緭鍏ヨ溅鐗屾椂鑷姩澶у啓锛涚収鐗囧簱鏀寔鎶?`/uploads/...` 鐩稿璺緞鎸夊綋鍓?API base 灞曞紑銆?- `src/styles.css`锛氭柊澧炲浐瀹氬笀鍌呰韩浠芥憳瑕佹牱寮忋€?- `tests/e2e/app.spec.js`锛氭柊澧?鏇存柊榛勫笀鍌呭満鏅紝瑕嗙洊鏂板銆佽嚜鍔?slug銆佽溅鐗屽ぇ鍐欍€佸鍒堕摼鎺ャ€佹寜 slug 鎵撳紑銆佹淳鍗曞埛鏂颁笉涓€佸仠鐢ㄥ悗涓嶅嚭鐜板湪娲惧崟涓嬫媺銆?- `README.md`锛氳ˉ鍏呭悗鍙板浐瀹氬笀鍌呰韩浠姐€佽溅鐗屽ぇ鍐欏拰鐢熶骇榛樿 mock-server 璇存槑銆?- `server/data/db.json`锛氱敓浜у啋鐑熼€氳繃鍚庡彴鏂板浜嗛粍甯堝倕 `w3 / huang`锛屽苟鍐欏叆缁欓粍甯堝倕鐨勬淳鍗曚换鍔″拰涓婁紶鍥炲啓缁撴灉銆?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run start
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run start`锛氶€氳繃锛孍xpress 鐩戝惉 `0.0.0.0:8787`锛宍/api/health` 杩斿洖 `mode=mock-server`銆?- 鐢熶骇娴忚鍣ㄥ啋鐑熼€氳繃锛氭墦寮€ `http://localhost:8787/admin`锛屾柊澧為粍甯堝倕锛岃溅鐗?`绮路t003` 鑷姩鏄剧ず/淇濆瓨涓?`绮路T003`銆?- `/api/workers/huang`锛氶€氳繃锛岃繑鍥為粍甯堝倕 `id=w3`銆?- 鍚庡彴娲惧崟缁欓粍甯堝倕鍚庯紝`/api/worker-tasks?workerId=w3` 杩斿洖 `count=3`銆?- 鎵撳紑骞跺埛鏂?`http://localhost:8787/worker/huang`锛氭樉绀衡€滈粍甯堝倕鐨勪换鍔♀€濄€佹墜鏈哄彿銆佽溅鐗屽彿鍜屼换鍔¤繘搴︼紝涓嶆樉绀衡€滈槦浼嶈韩浠界‘璁も€濄€?- 甯堝倕绔笂浼犵収鐗囧悗锛岀偣浣?`p1` 鐘舵€佸洖鍐欎负鈥滃凡瀹屾垚鈥濄€?- 涓婁紶濯掍綋 URL 澶嶆煡锛氭渶鏂?`pointMedia.url` 淇濆瓨涓?`/uploads/...` 鐩稿璺緞锛屾病鏈夊啓鍏?`localhost` 鎴栧眬鍩熺綉 IP銆?- SPA 鍥為€€澶嶆煡锛歚/admin`銆乣/worker/w1` 鍙洿鎺ユ墦寮€锛沗/api/debug-state` 浠嶈繑鍥?JSON锛屾病鏈夎鍓嶇 fallback 鎶㈣蛋銆?
浠嶉渶浜哄伐澶勭悊锛?- 鐪熸満瀹氫綅銆佹媿鐓у拰楂樺痉 App 鍞よ捣寤鸿鍦?HTTPS 鍏綉鍩熷悕涓婂啀璧颁竴閬嶃€?- 姝ｅ紡涓婄嚎鍓嶇户缁浠?`server/data/db.json` 鍜?`server/uploads/`銆?
## 23. 甯堝倕绔摼鎺ュ鍒?origin 淇

鏇存柊鏃堕棿锛?026-05-09銆?
鏈淇敼鐩爣锛?- 鍚庡彴鈥滃鍒堕摼鎺モ€濃€滄墦寮€甯堝倕绔€濃€滄墦寮€璇ュ笀鍌呯Щ鍔ㄧ鈥濆拰椤堕儴甯堝倕绉诲姩绔叆鍙ｇ粺涓€浣跨敤褰撳墠鍚庡彴璁块棶鍩熷悕銆?- 閫氳繃灞€鍩熺綉鍦板潃鎵撳紑鍚庡彴鏃讹紝澶嶅埗鍑虹殑鍒樺笀鍌呴摼鎺ュ簲涓?`http://192.168.110.187:8787/worker/liu`銆?- 閫氳繃鍏綉鍩熷悕鎵撳紑鍚庡彴鏃讹紝澶嶅埗鍑虹殑閾炬帴鑷姩鍙樹负 `https://鍏綉鍩熷悕/worker/slug`銆?- 閫氳繃 `localhost` 鎴?`127.0.0.1` 鎵撳紑鍚庡彴鏃讹紝鍦ㄥ笀鍌呯鐞嗗尯鍩熸樉绀洪粍鑹叉彁绀猴紝鎻愰啋鎵嬫満涓嶈兘浣跨敤 localhost 閾炬帴銆?
淇敼鏂囦欢锛?- `src/App.jsx`锛氭柊澧?`getShareOrigin()` 鍜?`buildWorkerUrl(worker)`锛屾墍鏈夊笀鍌呴摼鎺ョ粺涓€浠?`window.location.origin` 鐢熸垚锛涘笀鍌呯鐞嗗尯鍩熸柊澧?localhost 榛勮壊鎻愮ず銆?- `server/index.js`锛歚/api/health` 澧炲姞 `lanIps` 鍜?`lanAdminUrls`锛屽苟浼樺厛杩斿洖 `192.168/10/172.16-31` 绉佹湁缃戞鍦板潃锛岄伩鍏?Windows 铏氭嫙缃戝崱鍦板潃鎺掑湪鍓嶉潰銆?- `src/styles.css`锛氭柊澧?`.share-link-warning` 榛勮壊鎻愮ず鏍峰紡銆?- `tests/e2e/app.spec.js`锛氳ˉ鍏?localhost/127 鎵撳紑鍚庡彴鏃舵樉绀洪摼鎺ヨ鍛婄殑鏂█銆?- `README.md`锛氳ˉ鍏呪€滃厛鐢ㄥ眬鍩熺綉 IP 鎴栧叕缃戝煙鍚嶆墦寮€鍚庡彴锛屽啀澶嶅埗甯堝倕閾炬帴鈥濈殑璇存槑銆?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run start
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run start`锛氶€氳繃锛孍xpress 鐩戝惉 `0.0.0.0:8787`锛宍/api/health` 杩斿洖 `lanAdminUrls=["http://192.168.110.187:8787/admin"]`銆?- 鎵撳紑 `http://localhost:8787/admin`锛氬笀鍌呯鐞嗛《閮ㄦ樉绀洪粍鑹叉彁绀猴紝骞舵彁绀烘敼鐢?`http://192.168.110.187:8787/admin`銆?- 鎵撳紑 `http://192.168.110.187:8787/admin`锛氫笉鏄剧ず localhost 鎻愮ず銆?- 灞€鍩熺綉鍚庡彴涓垬甯堝倕鍗＄墖鏄剧ず骞跺鍒?`http://192.168.110.187:8787/worker/liu`銆?- 鈥滄墦寮€甯堝倕绔€濋摼鎺?href 涓?`http://192.168.110.187:8787/worker/liu`銆?- 鎵撳紑 `http://192.168.110.187:8787/worker/liu`锛氳繘鍏モ€滃垬甯堝倕鐨勪换鍔♀€濓紝涓嶆樉绀衡€滈槦浼嶈韩浠界‘璁も€濄€?
璇存槑锛?- 鏈鏈啓姝?`localhost`銆乣127.0.0.1` 鎴?`192.168.110.187` 鍒颁笟鍔￠摼鎺ョ敓鎴愰€昏緫锛涙祴璇曟姤鍛婇噷鐨勫湴鍧€鍙槸鏈満楠岃瘉缁撴灉銆?- 楂樺痉鍦板浘銆佹淳鍗曘€佷笂浼犵収鐗囥€佸笀鍌呭浐瀹氳韩浠藉拰杞︾墝澶у啓鍔熻兘鏈鏈閾炬帴淇鐮村潖銆?
## 24. 甯堝倕绔摼鎺ュ鍒舵寜閽簩娆′慨澶?
鏇存柊鏃堕棿锛?026-05-09銆?
鏈淇鍘熷洜锛?- 灞€鍩熺綉 HTTP 鍚庡彴涓紝`navigator.clipboard` 鍙兘涓嶅彲鐢ㄦ垨琚祻瑙堝櫒闄愬埗銆?- 鏃ч€昏緫浣跨敤 `navigator.clipboard?.writeText(url)`锛屽綋 Clipboard API 涓嶅瓨鍦ㄦ椂涓嶄細鎶ラ敊锛屼絾涔熶笉浼氱湡鐨勫啓鍏ュ壀璐存澘锛屽鑷村壀璐存澘鍙兘浠嶅仠鐣欏湪鏃х殑 `/admin` 鍦板潃銆?
鏈淇敼锛?- `src/App.jsx` 鏂板 `getWorkerSlug(worker)`锛屼弗鏍兼寜 `worker.slug || worker.worker_key || worker.workerKey || worker.id` 鍙?slug銆?- `buildWorkerUrl(worker)` 鍥哄畾杩斿洖 `window.location.origin + "/worker/" + getWorkerSlug(worker)`銆?- 鈥滃鍒堕摼鎺モ€濈偣鍑绘椂鍙鍒?`buildWorkerUrl(worker)`锛屽苟鍦?HTTP 灞€鍩熺綉涓嬩娇鐢ㄥ悓姝?`copy` 浜嬩欢 fallback 鍐欏叆鍓创鏉裤€?- 鈥滄墦寮€甯堝倕绔€濄€侀《閮ㄥ笀鍌呭揩鎹峰叆鍙ｃ€佹淳鍗曞悗鐨勨€滄墦寮€璇ュ笀鍌呯Щ鍔ㄧ鈥濆潎鏀逛负 `window.open(buildWorkerUrl(worker), "_blank")`銆?- 涓嶅啀鐢ㄥ綋鍓嶉〉闈㈠湴鍧€銆乣/admin`銆乣window.location.href`銆乣location.pathname` 鎷煎笀鍌呴摼鎺ャ€?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run start
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run start`锛氶€氳繃銆?- 鎵撳紑 `http://192.168.110.187:8787/admin`锛氫笉鏄剧ず localhost 璀﹀憡銆?- 鐐瑰嚮鍒樺笀鍌呪€滃鍒堕摼鎺モ€濓細椤甸潰纭澶嶅埗鐩爣涓?`http://192.168.110.187:8787/worker/liu`銆?- 鐐瑰嚮榛勫笀鍌呪€滃鍒堕摼鎺モ€濓細椤甸潰纭澶嶅埗鐩爣涓?`http://192.168.110.187:8787/worker/huang`銆?- 鐐瑰嚮鍒樺笀鍌呪€滄墦寮€甯堝倕绔€濓細鏂扮獥鍙?URL 涓?`http://192.168.110.187:8787/worker/liu`锛岃繘鍏モ€滃垬甯堝倕鐨勪换鍔♀€濄€?- 鐐瑰嚮榛勫笀鍌呪€滄墦寮€甯堝倕绔€濓細鏂扮獥鍙?URL 涓?`http://192.168.110.187:8787/worker/huang`锛岃繘鍏モ€滈粍甯堝倕鐨勪换鍔♀€濄€?
璇存槑锛?- 鑷姩鍖栫幆澧冨湪 HTTP 灞€鍩熺綉 origin 涓嬫棤娉曡鍙栫郴缁熷壀璐存澘鍐呭锛屼絾椤甸潰澶嶅埗鎴愬姛鎻愮ず鍜屾寜閽洰鏍?URL 鍧囧凡楠岃瘉涓?`/worker/{slug}`锛屼笉鏄?`/admin`銆?- 鐪熷疄娴忚鍣ㄧ偣鍑绘椂浼氫紭鍏堜娇鐢?Clipboard API锛汬TTP 灞€鍩熺綉琚檺鍒舵椂浼氳蛋鍚屾 `copy` 浜嬩欢 fallback銆?
## 25. 甯堝倕绔畨鍏ㄨ闂爜閾炬帴鏀归€?
鏇存柊鏃堕棿锛?026-05-09銆?
鏈淇敼鐩爣锛?- 甯堝倕姝ｅ紡閾炬帴涓嶅啀浣跨敤 `/worker/liu`銆乣/worker/huang` 杩欑被绠€鍗?slug锛岀粺涓€浣跨敤鍚庡彴鑷姩鐢熸垚鐨?`accessToken`銆?- 姝ｅ紡澶嶅埗閾炬帴鏍煎紡涓?`褰撳墠鍩熷悕/worker/tk_XXXXXXXXXXXX`锛屽鍒跺拰鎵撳紑閮界户缁娇鐢ㄥ綋鍓?`window.location.origin`锛屼笉浼氬鍒舵垚 `/admin`銆?- 鏃?id/slug 閾炬帴淇濈暀鍏煎锛屼絾甯堝倕绔細鎻愮ず鈥滃綋鍓嶄娇鐢ㄧ殑鏄棫閾炬帴锛岃鑱旂郴绠＄悊鍛樻洿鎹负鏂扮殑瀹夊叏閾炬帴銆傗€濄€?- 鍚庡彴鏀寔鈥滈噸缃摼鎺モ€濓紝閲嶇疆鍚庢棫 token 澶辨晥锛涘仠鐢ㄥ悗閾炬帴鏄剧ず鈥滆甯堝倕閾炬帴宸插仠鐢紝璇疯仈绯荤鐞嗗憳銆傗€濄€?
淇敼鏂囦欢锛?- `server/index.js`锛氭柊澧?`accessToken` 鐢熸垚銆佹棫鏁版嵁鍚姩杩佺Щ銆佹寜 token 浼樺厛鍖归厤 worker銆乣PATCH /api/workers/:id/access-token`銆佸垹闄ゅ笀鍌呮椂娓呯悊娲惧崟浠诲姟銆?- `src/apiClient.js`锛氭湰鍦版ā寮忓悓姝ユ柊澧炲畨鍏ㄨ闂爜鐢熸垚銆侀噸澶嶆牎楠屻€乼oken 浼樺厛鏌ユ壘銆侀噸缃摼鎺?API銆?- `src/App.jsx`锛氬悗鍙版墍鏈夊鍒?鎵撳紑甯堝倕绔摼鎺ョ粺涓€璧?`buildWorkerUrl(worker)`锛涘笀鍌呯鎸?token 鍥哄畾韬唤锛涙棤鏁堛€佸仠鐢ㄣ€佹棫閾炬帴鍒嗗埆鏄剧ず娓呮櫚鎻愮ず锛涚Щ鍔ㄧ璋冭瘯淇℃伅涓嶅睍绀哄畬鏁?token銆?- `tests/e2e/app.spec.js`锛氳鐩栨柊澧炲笀鍌呯敓鎴?token銆乼oken 閾炬帴鎵撳紑銆佹棫閾炬帴鎻愮ず銆佸鍒堕摼鎺ャ€侀噸缃摼鎺ャ€佸仠鐢ㄥ拰鍒犻櫎銆?- `README.md`銆乣DEPLOY_PRODUCTION.md`銆乣TEST_REPORT.md`锛氭洿鏂板畨鍏ㄩ摼鎺ャ€乴ocalhost 鍜屽叕缃戦儴缃茶鏄庛€?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run start
```

鑷姩鍖栭獙璇佺粨鏋滐細
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run start`锛氶€氳繃锛孍xpress 鐩戝惉 `0.0.0.0:8787`锛宍/api/health` 杩斿洖 `mode=mock-server` 鍜屽眬鍩熺綉鍚庡彴鍦板潃銆?
鐢熶骇鐗堟祻瑙堝櫒鍐掔儫锛?- 鎵撳紑 `http://localhost:8787/admin`锛氬笀鍌呯鐞嗛《閮ㄦ樉绀?localhost 榛勮壊鎻愮ず銆?- 鎵撳紑 `http://192.168.110.187:8787/admin`锛氫笉鏄剧ず localhost 鎻愮ず銆?- 灞€鍩熺綉鍚庡彴涓垬甯堝倕銆侀粍甯堝倕鍗＄墖閾炬帴鍧囦负 `http://192.168.110.187:8787/worker/tk_************` 褰㈠紡锛屼笉鍐嶅嚭鐜?`/worker/liu`銆乣/worker/huang` 鎴?`/admin`銆?- 鐐瑰嚮鍒樺笀鍌呪€滃鍒堕摼鎺モ€濓細椤甸潰澶嶅埗鐘舵€佹樉绀?`http://192.168.110.187:8787/worker/tk_************`锛屼笉鏄?`/admin`銆?- 鐐瑰嚮鍒樺笀鍌呪€滄墦寮€甯堝倕绔€濓細鏂扮獥鍙?URL 涓?`http://192.168.110.187:8787/worker/tk_************`锛屼笌鍗＄墖瀹夊叏閾炬帴涓€鑷淬€?- 鎵撳紑鍒樺笀鍌?token 閾炬帴锛氳繘鍏モ€滃垬甯堝倕鐨勪换鍔♀€濓紝涓嶆樉绀衡€滈槦浼嶈韩浠界‘璁も€濓紝椤甸潰姝ｆ枃涓嶅睍绀哄畬鏁?token銆?- 鎵撳紑涓嶅瓨鍦ㄧ殑 `tk_` 閾炬帴锛氭樉绀衡€滈摼鎺ユ棤鏁堟垨宸茶繃鏈燂紝璇疯仈绯荤鐞嗗憳閲嶆柊鍙戦€佸笀鍌呴摼鎺ャ€傗€濓紝涓嶄細榛樿杩涘叆寮犲笀鍌呫€?- 鎵撳紑鏃ч摼鎺?`/worker/liu`锛氫粛鑳借繘鍏ュ垬甯堝倕浠诲姟椤碉紝鍚屾椂鏄剧ず鈥滃綋鍓嶄娇鐢ㄧ殑鏄棫閾炬帴锛岃鑱旂郴绠＄悊鍛樻洿鎹负鏂扮殑瀹夊叏閾炬帴銆傗€濄€?- 涓存椂娴嬭瘯甯堝倕閲嶇疆閾炬帴锛氭棫 token 鏌ヨ杩斿洖 404锛屾柊 token 鍙煡璇㈠埌瀵瑰簲甯堝倕锛岃溅鐗?`绮路t008` 淇濆瓨涓?`绮路T008`銆?- 涓存椂娴嬭瘯甯堝倕鍋滅敤鍚庢墦寮€ token 閾炬帴锛氭樉绀衡€滆甯堝倕閾炬帴宸插仠鐢紝璇疯仈绯荤鐞嗗憳銆傗€濓紱娴嬭瘯瀹屾垚鍚庡凡鍒犻櫎涓存椂甯堝倕銆?
璇存槑锛?- 褰撳墠姝ｅ紡澶嶅埗閾炬帴蹇呴』浣跨敤灞€鍩熺綉 IP 鎴栧叕缃戝煙鍚嶆墦寮€鍚庡彴鍚庡啀澶嶅埗锛沗localhost` 鍙€傚悎鐢佃剳鏈満娴嬭瘯锛屼笉鑳藉彂缁欐墜鏈恒€?- 楂樺痉鍦板浘銆佸渾褰㈢偣浣?Marker銆佸皬杞?Marker銆佹淳鍗曘€佹墜鏈轰笂浼犵収鐗?瑙嗛銆佷笂浼犲悗鑷姩瀹屾垚銆佽溅鐗屽ぇ鍐欏潎鐢辨湰杞?E2E 鍜岀敓浜у啋鐑熻鐩栦富璺緞锛涚湡瀹炴墜鏈哄畾浣嶄笌楂樺痉 App 鍞よ捣寤鸿鍦?HTTPS 鍏綉鍩熷悕涓婂啀璧颁竴閬嶄汉宸ラ獙鏀躲€?
## 26. 甯堝倕鍦ㄧ嚎鐘舵€佸拰閾炬帴鏉冮檺鍒嗙

鏇存柊鏃堕棿锛?026-05-09銆?
鏈淇敼鐩爣锛?- `enabled` 鍙〃绀哄笀鍌?token 閾炬帴鏄惁鍙敤锛岀敱鍚庡彴鈥滃惎鐢ㄥ笀鍌?/ 鍋滅敤甯堝倕鈥濇帶鍒躲€?- `online` 鍙〃绀哄笀鍌呭綋鍓嶆槸鍚﹀湪绾匡紝鐢卞笀鍌呯 heartbeat 鍜?`lastSeenAt` 瓒呮椂鍒ゆ柇銆?- 鍚庡彴甯堝倕鍗＄墖鎷嗗垎灞曠ず鈥滃湪绾?绂荤嚎鈥濆拰鈥滈摼鎺ュ惎鐢?閾炬帴鍋滅敤鈥濓紝骞舵樉绀衡€滄渶鍚庡湪绾库€濇椂闂存垨鈥滀粠鏈笂绾库€濄€?- 鎿嶄綔鎸夐挳鎷嗘垚涓よ锛氬鍒堕摼鎺?/ 鎵撳紑甯堝倕绔?/ 閲嶇疆閾炬帴锛涚紪杈?/ 鍋滅敤甯堝倕鎴栧惎鐢ㄥ笀鍌?/ 鍒犻櫎甯堝倕銆?
淇敼鏂囦欢锛?- `server/index.js`锛氭柊澧?`POST /api/workers/:id/heartbeat`銆乣POST /api/workers/:id/offline` 鍜?`PATCH /api/workers/:id`锛沗GET /api/workers` 杩斿洖鎸?45 绉掑績璺宠绠楀悗鐨?`online`锛涘仠鐢ㄦ椂鍚屾鏍囪绂荤嚎鍜?`lastOfflineAt`銆?- `src/apiClient.js`锛氭湰鍦版ā寮忓悓姝ュ疄鐜?heartbeat銆乷ffline銆?5 绉掑湪绾胯绠楀拰鍚敤/鍋滅敤鍒嗙銆?- `src/App.jsx`锛氬笀鍌呯鎵撳紑鏈夋晥 token 鍚庣珛鍗?heartbeat锛屽苟姣?15 绉掔画蹇冭烦锛涢〉闈㈤殣钘忋€佸叧闂垨鍗歌浇鏃跺皾璇?offline锛涘悗鍙版瘡 10 绉掑埛鏂?workers銆?- `src/styles.css`锛氭柊澧炲湪绾垮渾鐐广€侀摼鎺ョ姸鎬佹爣绛俱€佸仠鐢?鍚敤/閲嶇疆/鍒犻櫎鎸夐挳鏍峰紡銆?- `tests/e2e/app.spec.js`锛氭洿鏂板笀鍌呯鐞嗘祴璇曪紝瑕嗙洊 heartbeat 鍐欏叆銆侀摼鎺ュ仠鐢ㄣ€佸惎鐢ㄥ悗淇濇寔绂荤嚎銆佸垹闄ゅ笀鍌呫€?- `README.md`銆乣DEPLOY_PRODUCTION.md`銆乣TEST_REPORT.md`锛氳ˉ鍏呭湪绾跨姸鎬佸拰閾炬帴鏉冮檺璇存槑銆?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run start
```

褰撳墠鑷姩鍖栫粨鏋滐細
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run start`锛氶€氳繃锛孍xpress 鐩戝惉 `0.0.0.0:8787`銆?
鐢熶骇鍐掔儫缁撴灉锛?- `GET /api/workers`锛氳繑鍥炴墍鏈夊笀鍌咃紝鍖呭惈 `enabled`銆佹寜 45 绉掑績璺宠绠楀悗鐨?`online`銆乣lastSeenAt`銆乣lastOnlineAt`銆乣lastOfflineAt` 鍜屽鏉?`accessToken`銆?- 鏈墦寮€甯堝倕绔椂锛屽眬鍩熺綉鍚庡彴 `http://192.168.110.187:8787/admin` 涓垬甯堝倕鍗＄墖鏄剧ず鈥滅绾?+ 閾炬帴鍚敤鈥濓紝骞剁户缁樉绀?`/worker/tk_************` 澶嶆潅閾炬帴銆?- 璋冪敤 `POST /api/workers/:id/heartbeat` 鍚庯紝鍒樺笀鍌呭彉涓?`online=true`锛屽苟鍐欏叆 `lastSeenAt`銆乣lastOnlineAt`銆?- 鎵撳紑鍒樺笀鍌呭鏉?token 甯堝倕绔〉闈㈠悗锛屽悗绔湪鏁扮鍐呮敹鍒?heartbeat锛宍online=true`銆?- 鍏抽棴甯堝倕绔悗锛屾祻瑙堝櫒涓嶄繚璇佺绾胯姹備竴瀹氶€佽揪锛涚瓑寰?47 绉掑悗锛宍GET /api/workers` 鎸?`lastSeenAt` 瓒呮椂鎶婂垬甯堝倕璁＄畻涓?`online=false`锛屽悗鍙板崱鐗囨仮澶嶁€滅绾?+ 閾炬帴鍚敤鈥濄€?- 涓存椂娴嬭瘯甯堝倕鍋滅敤鍚庯細`enabled=false`銆乣online=false`銆乣lastOfflineAt` 鏈夊€硷紱绂佺敤 token 椤甸潰鏄剧ず鈥滆甯堝倕閾炬帴宸插仠鐢紝璇疯仈绯荤鐞嗗憳銆傗€濓紝涓嶆樉绀轰笂浼犲叆鍙ｆ垨韬唤濉啓鍖恒€?- 涓存椂娴嬭瘯甯堝倕閲嶆柊鍚敤鍚庯細`enabled=true` 浣?`online=false`锛岀洿鍒板啀娆?heartbeat 鎵嶄細涓婄嚎銆?- 涓存椂娴嬭瘯甯堝倕閲嶇疆閾炬帴鍚庯細鏃?token 杩斿洖 404锛屾柊 token 鍙敤锛涙祴璇曞畬鎴愬悗宸插垹闄や复鏃跺笀鍌呫€?
## 27. 浼佷笟绾у悗鍙颁俊鎭灦鏋勯噸鏋?
鏇存柊鏃堕棿锛?026-05-10銆?
鏈淇敼鐩爣锛?- 灏嗗悗鍙颁粠鍗曢〉鍔熻兘鍫嗗彔鍗囩骇涓轰紒涓氱骇 SaaS 绠＄悊鍚庡彴銆?- 鏂板鍥哄畾渚ц竟鏍忋€侀《閮?Header銆侀〉闈㈢骇妯″潡鍒囨崲銆?- 棣栭〉鏀逛负 Dashboard 鎬昏锛屼笉鍐嶆壙杞藉叏閮ㄦ搷浣溿€?- 鍦板浘璋冨害銆佺偣浣嶇鐞嗐€佸笀鍌呯鐞嗐€佹淳鍗曚腑蹇冦€佺幇鍦虹礌鏉愩€佺郴缁熺姸鎬佹媶鎴愮嫭绔嬮〉闈€?- 閲嶇偣灏嗗笀鍌呯鐞嗘敼涓鸿〃鏍?+ 璇︽儏闈㈡澘 + 鍒嗛〉 + 鎼滅储绛涢€夛紝鍦ㄧ嚎/绂荤嚎涓庨摼鎺ュ惎鐢?鍋滅敤鍒嗗紑灞曠ず銆?
涓昏淇敼鏂囦欢锛?- `src/App.jsx`锛氭敹缂╀负璺敱銆佸叏灞€鐘舵€併€侀〉闈㈠垏鎹㈠拰寮圭獥鍗忚皟銆?- `src/hooks/useH5Data.js`锛氭娊鍑哄師鍚庡彴鏁版嵁鍔犺浇銆佷繚瀛樸€佹淳鍗曘€佷笂浼犮€佸笀鍌呭惎鍋滃拰 token 閲嶇疆閫昏緫銆?- `src/lib/domain.js`锛氭娊鍑虹姸鎬併€佺偣浣嶃€佸笀鍌呫€佺礌鏉愩€佸鑸€佺粺璁″拰鏍煎紡鍖栧伐鍏枫€?- `src/components/layout/*`锛氭柊澧?`AdminLayout`銆乣Sidebar`銆乣Header`銆?- `src/pages/*`锛氭柊澧?Dashboard銆丮apConsole銆丳oints銆乄orkers銆丏ispatch銆丮edia銆丼ystemHealth 椤甸潰銆?- `src/components/shared/*`锛氭柊澧?Drawer銆丮odal銆乀oast銆丆onfirmDialog銆丒mptyState銆丼tatusBadge 绛夊叡浜粍浠躲€?- `src/components/map/*`銆乣points/*`銆乣workers/*`銆乣dispatch/*`銆乣media/*`锛氭媶鍑哄悇涓氬姟椤电粍浠躲€?- `src/styles.css`锛氭柊澧炰紒涓氬悗鍙拌瑙夌郴缁熴€佽〃鏍笺€佹娊灞夈€佽皟搴﹀彴銆佸搷搴斿紡鍜屽姩鏁堟牱寮忋€?- `tests/e2e/app.spec.js`锛氭寜鏂颁俊鎭灦鏋勯噸鍐欏洖褰掓祴璇曘€?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run start
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?0 passed銆?- `npm run start`锛氶€氳繃锛孍xpress 鐩戝惉 `0.0.0.0:8787`锛屾湰鏈哄湴鍧€ `http://localhost:8787`锛屽眬鍩熺綉鍦板潃 `http://192.168.110.187:8787`銆?- 娴忚鍣ㄧ敓浜у啋鐑燂細鎵撳紑 `http://127.0.0.1:8787/admin`锛孌ashboard 鍜?7 涓竴绾у鑸彲瑙併€?- 娴忚鍣ㄧ敓浜у啋鐑燂細渚ф爮鍒囨崲鐐逛綅绠＄悊銆佸笀鍌呯鐞嗐€佸湴鍥捐皟搴︺€佹淳鍗曚腑蹇冦€佺幇鍦虹礌鏉愩€佺郴缁熺姸鎬佸潎鏄剧ず瀵瑰簲鍏抽敭鍐呭銆?
宸茶鐩栧洖褰掑姛鑳斤細
- 椤甸潰涓庡鑸細Dashboard / 鍦板浘璋冨害 / 鐐逛綅绠＄悊 / 甯堝倕绠＄悊 / 娲惧崟涓績 / 鐜板満绱犳潗 / 绯荤粺鐘舵€佸垏鎹㈡棤鎶ラ敊銆?- 鐐逛綅绠＄悊锛氳〃鏍兼樉绀恒€佹悳绱€佺瓫閫夈€佸垎椤点€佹柊澧炵偣浣嶅脊绐椼€佹壒閲忓鍏ュ脊绐椼€佽鎯?Drawer銆?- 甯堝倕绠＄悊锛氭柊澧炪€佽溅鐗岃嚜鍔ㄥぇ鍐欍€佹悳绱€佸惎鐢ㄧ瓫閫夈€佽鎯呴潰鏉裤€佸鏉?token 閾炬帴銆佸鍒堕摼鎺ャ€佹墦寮€甯堝倕绔€佺紪杈戙€侀噸缃摼鎺ャ€佸仠鐢ㄣ€佸惎鐢ㄣ€佸垹闄ゃ€?- 娲惧崟涓績锛氱偣浣嶆睜绛涢€夈€佹壒閲忓嬀閫夈€侀€夋嫨甯堝倕銆佷竴閿淳鍗曘€佹湰鍦颁换鍔″啓鍏ャ€佸笀鍌呯鏀跺埌浠诲姟銆?- 鍦板浘璋冨害锛氬湴鍥惧鍣ㄣ€佺偣浣嶅浘灞傘€佸皬杞﹀浘灞傘€佸彸渚?Tabs銆佺偣浣嶈鎯呴潰鏉裤€?- 鎵嬫満绔細澶嶆潅 token / 鏃?slug 閾炬帴璇嗗埆銆佸浐瀹氬笀鍌呰韩浠姐€佷换鍔＄炕椤点€佷笂浼犵収鐗囥€佷笂浼犲悗鑷姩瀹屾垚銆?- 鐜板満绱犳潗锛氫笂浼犲悗杩涘叆绱犳潗涓績锛岀礌鏉愬崱鐗囧彲瑙併€?- 绯荤粺鐘舵€侊細API 鐘舵€併€佸湴鍥?Kimi/鏁版嵁妯″紡銆侀」鐩鐞嗐€佺ǔ瀹氭€ц嚜妫€銆佽瘖鏂潰鏉裤€佸鍑?JSON銆?
鏈墽琛岄」锛?- 鏈繍琛?`npm run test:supabase`锛氬綋鍓?`package.json` 娌℃湁璇ヨ剼鏈紝鏈疆涔熸湭淇敼 Supabase 琛ㄣ€丼torage 鎴栫湡瀹炰笂浼犳湇鍔￠厤缃€?- 楂樺痉鐪熷疄搴曞浘渚濊禆鏈湴 `VITE_AMAP_KEY` 鍜?`VITE_AMAP_SECURITY_CODE`锛涙湭閰嶇疆鏃跺凡楠岃瘉澶囩敤鍦板浘鍜岃瘖鏂彁绀哄彲鐢ㄣ€?
## 28. 姝ｅ紡浜у搧鍖栭樁娈?1锛氱粺涓€涓氬姟搴曞骇

鏇存柊鏃堕棿锛?026-05-10銆?
鏈淇敼鐩爣锛?- 鍙帹杩涢樁娈?1锛屼笉杩涘叆 UI 閲嶆瀯銆佸湴鍥惧寮恒€侀儴缃叉敼閫犵瓑鍚庣画闃舵銆?- 缁熶竴鐐逛綅鐘舵€侀摼璺細`寰呮淳鍗?鈫?宸叉淳鍗?鈫?寰呮柦宸?鈫?鏂藉伐涓?鈫?宸蹭笂浼犵礌鏉?鈫?寰呴獙鏀?鈫?宸插畬鎴?/ 闇€澶嶆煡`銆?- 缁熶竴绱犳潗鍒嗙被锛歚鐜板満鐓х墖 / 720 鍏ㄦ櫙 / 姘村嵃鐓х墖 / 鍑珛寰峰浘鐗?/ 澧欑鍗忚鍥剧墖 / 瑙嗛`銆?- 寤虹珛寮傚父瑙勫垯鍜岄」鐩骇绱犳潗瑙勫垯瀛楁锛屽苟淇濊瘉鏃х姸鎬併€佹棫绱犳潗鍒嗙被銆佹棫椤圭洰鏁版嵁鍙嚜鍔ㄥ吋瀹广€?- 淇濇寔 `dispatch`銆乣worker-tasks`銆乣point-media`銆乣complete-point`銆乣worker-location`銆乣health`銆乣debug-state` 閾捐矾鍙敤銆?
淇敼鏂囦欢锛?- `src/lib/domain.js`锛氭柊澧炵粺涓€鐘舵€併€佺粺涓€绱犳潗鍒嗙被銆佺礌鏉愰綈濂楄鍒欍€侀」鐩粯璁ょ礌鏉愯鍒欍€佺偣浣嶅紓甯歌鍒欏拰鍏煎褰掍竴鍑芥暟銆?- `src/apiClient.js`锛氭湰鍦版紨绀烘ā寮忓悓姝ュ綊涓€鏃ф暟鎹紝娲惧崟鍐欏叆 `宸叉淳鍗昤锛屼笂浼犵礌鏉愬垎绫诲綊涓€锛岄」鐩ˉ榻?`materialRules/material_rules`銆?- `server/index.js`锛欵xpress API 鍚屾褰掍竴鏃ф暟鎹紝椤圭洰琛ラ綈绱犳潗瑙勫垯锛屾淳鍗曞啓鍏?`宸叉淳鍗昤锛屼笂浼?`kind` 鍏煎鏃у垎绫汇€?- `server/test-api.js`锛氳ˉ鍏呴樁娈?1 API 鍥炲綊锛岃鐩栫姸鎬佸綊涓€銆佹棫绱犳潗鍒嗙被鍏煎銆侀」鐩礌鏉愯鍒欍€佸畾浣嶃€乨ebug-state 鍜屽叧閿帴鍙ｃ€?- `tests/e2e/app.spec.js`锛氳ˉ鍏呴樁娈?1 E2E锛岃鐩栫粺涓€鐘舵€併€佺礌鏉愬垎绫婚€夐」鍜岄」鐩礌鏉愯鍒欏瓧娈碉紱鍚屾娲惧崟鐘舵€佹柇瑷€涓?`宸叉淳鍗昤銆?- `src/components/shared/legacyModals.jsx`锛氱Щ闄ゆ按鍗板浘鐗囨渶澶?2 寮犵殑鏃ч檺鍒讹紝涓婁紶鍏ュ彛浣跨敤缁熶竴绱犳潗鍒嗙被銆?- `src/components/shared/StatusBadge.jsx`銆乣src/pages/MediaPage.jsx`銆乣src/components/media/MediaCard.jsx`銆乣src/pages/PointsPage.jsx`锛氬悓姝ユ柊鐘舵€?鏂扮礌鏉愬垎绫诲彛寰勩€?
鍏煎绛栫暐锛?- 鏃х姸鎬佸 `鏈淳鍗昤銆乣宸插垎閰峘銆乣鎵ц涓璥銆乣宸蹭笂浼燻銆乣寰呭鏍竊銆乣瀹屾垚`銆乣寮傚父` 浼氬綊涓€鍒版柊鐘舵€侀摼銆?- 鏃х礌鏉愬垎绫诲 `姘村嵃鍥剧墖`銆乣720鍏ㄦ櫙`銆乣鍏ㄦ櫙瑙嗛`銆佹枃浠跺悕涓殑 `鍑珛寰?澧欑/鍗忚/瑙嗛` 浼氬綊涓€鍒版柊绱犳潗鍒嗙被銆?- 鏃ч」鐩鏋滄病鏈夌礌鏉愯鍒欙紝浼氭寜椤圭洰鍚嶇敓鎴愰粯璁よ鍒欙細鍔犲瀹濋」鐩粯璁?`鐜板満鐓х墖 + 姘村嵃鐓х墖 + 澧欑鍗忚鍥剧墖`锛岄樋搴烽」鐩粯璁?`鐜板満鐓х墖 + 720 鍏ㄦ櫙 + 鍑珛寰峰浘鐗嘸锛岃兘閲忛」鐩粯璁?`鐜板満鐓х墖 + 瑙嗛`锛屽叾浠栭」鐩粯璁?`鐜板満鐓х墖`銆?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run test:api
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run test:api`锛氶€氳繃銆?- API 鍥炲綊纭锛歚/api/health`銆乣/api/import-demo`銆乣/api/workers`銆乣/api/wall-points`銆乣/api/dispatch`銆乣/api/worker-tasks/w1`銆乣/api/point-media/:pointId`銆乣/api/worker-location`銆乣/api/debug-state`銆乣/api/complete-point/:pointId` 鍧囧彲鐢ㄣ€?
褰卞搷璇存槑锛?- 娲惧崟鍚庣殑鐐逛綅鍜屼换鍔＄姸鎬佷粠鏃у彛寰?`鏂藉伐涓璥 璋冩暣涓虹粺涓€閾捐矾涓殑 `宸叉淳鍗昤銆?- 涓婁紶鍚庤嚜鍔ㄥ畬鎴愰€昏緫浠嶄繚鎸侊紝`complete-point` 浠嶅皢鐐逛綅鍜屼换鍔℃洿鏂颁负 `宸插畬鎴恅銆?- 鏈樁娈垫湭鏀?UI 淇℃伅鏋舵瀯銆佹湭鏂板椤圭洰绠＄悊涓€绾ч〉銆佹湭鍋氬湴鍥炬閫?鍦堥€夈€佹湭鏀瑰叕缃戦儴缃叉柟妗堛€?
## 29. 姝ｅ紡浜у搧鍖栭樁娈?2锛氬叕缃戞寮忎娇鐢ㄥ熀纭€

鏇存柊鏃堕棿锛?026-05-10銆?
鏈淇敼鐩爣锛?- 鍙帹杩涢樁娈?2锛屼笉杩涘叆甯堝倕 CRUD 娣卞寲銆佸悗鍙?UI 閲嶆瀯銆佸湴鍥炬閫?鍦堥€夈€佺礌鏉愪腑蹇冨寮虹瓑鍚庣画闃舵銆?- 寮哄寲鐢熶骇鐜鍚屾簮 `/api` 浣跨敤鏂瑰紡锛岄伩鍏嶅叕缃戦儴缃茬户缁緷璧?`localhost` 鎴栧眬鍩熺綉 API 鍦板潃銆?- 瑙ｅ喅鍚庡彴澶嶅埗甯堝倕閾炬帴鏃朵粛鍙兘鐢熸垚 `localhost` / `127.0.0.1` 鐨勯棶棰樸€?- 鏄庣‘鍏綉 HTTPS 鍩熷悕涓嬪笀鍌呴摼鎺ョ敓鎴愯鍒欍€佺敓浜х幆澧冨彉閲忋€侀儴缃叉祦绋嬪拰涓婄嚎妫€鏌ラ噸鐐广€?- 淇濇寔闃舵 1 鐨勭粺涓€鐘舵€併€佺粺涓€绱犳潗鍒嗙被銆侀」鐩骇绱犳潗瑙勫垯涓嶈鐮村潖銆?- 缁х画楠岃瘉 `health`銆乣debug-state`銆乣dispatch`銆乣worker-tasks`銆乣point-media`銆乣complete-point`銆乣worker-location` 绛夋棫閾捐矾鍙敤銆?
淇敼鏂囦欢锛?- `src/lib/domain.js`锛歚getShareOrigin()` 鏀逛负浼樺厛璇诲彇 `VITE_PUBLIC_APP_ORIGIN`锛屽叾娆¤鍙?`/api/health` 瑙ｆ瀽鍑虹殑灞€鍩熺綉 origin锛屽啀浣跨敤褰撳墠鍏綉/灞€鍩熺綉 origin锛涙湰鍦板厹搴曟椂涓嶅啀鐢熸垚 localhost 甯堝倕閾炬帴锛岃€屾槸浣跨敤灞€鍩熺綉 IP 妯℃澘鎻愮ず銆?- `src/App.jsx`锛氬悗鍙板湪 localhost 鎵撳紑涓旀湭閰嶇疆鍏綉 origin 鏃讹紝鑷姩璋冪敤 `data.healthCheck()`锛岃鍙?`lanAdminUrls[0]` 骞跺啓鍏?`window.__WALL_AD_SHARE_ORIGIN__`锛屼緵澶嶅埗甯堝倕閾炬帴浣跨敤銆?- `src/hooks/useH5Data.js`锛氭毚闇?`healthCheck` 缁欏悗鍙板伐浣滃尯浣跨敤锛岄伩鍏嶉〉闈㈢洿鎺ユ暎钀?API 璇锋眰銆?- `src/pages/WorkersPage.jsx`锛氭洿鏂?localhost 鎻愮ず鏂囨锛屽尯鍒嗏€滃凡閰嶇疆鍏綉鍩熷悕鈥濃€滃凡鑷姩浣跨敤灞€鍩熺綉鍦板潃鈥濃€滈渶瑕侀厤缃叕缃?origin 鎴栧眬鍩熺綉鍦板潃鈥濅笁绉嶆儏鍐点€?- `server/index.js`锛歚/api/health` 澧炲姞 `requestOrigin`銆乣publicAppOriginConfigured`銆乣recommendedAdminUrl`銆乣recommendedWorkerUrlPattern`銆乣storageMode` 绛夌敓浜ц瘖鏂瓧娈碉紝骞舵敮鎸?`PUBLIC_APP_ORIGIN` / `VITE_PUBLIC_APP_ORIGIN`銆?- `server/test-api.js`锛氳ˉ鍏?health 鏂█锛岀‘璁ゆ祴璇曠幆澧冩湭閰嶇疆鍏綉 origin 鏃朵粛杩斿洖 `lanAdminUrls`銆?- `tests/e2e/app.spec.js`锛氳ˉ鍏呭鍒跺笀鍌呴摼鎺ヤ笉鑳藉寘鍚?`localhost` / `127.0.0.1` 鐨勬柇瑷€锛屽苟鎶?`VITE_PUBLIC_APP_ORIGIN` 闈欐€佹鏌ユ斁鍦ㄨ礋璐ｉ摼鎺ョ敓鎴愮殑 `src/lib/domain.js`銆?- `.env.example`锛氳ˉ鍏?`VITE_PUBLIC_APP_ORIGIN`銆乣PUBLIC_APP_ORIGIN`銆乣PORT`锛屽苟榛樿浣跨敤 `mock-server` + 鍚屾簮 API 閰嶇疆鍙ｅ緞銆?- `README.md`锛氭洿鏂板悓婧?API銆佸叕缃戝笀鍌呴摼鎺ャ€佷笁绉嶇幆澧冮摼鎺ョ敓鎴愩€侀珮寰峰拰鐢熶骇浣跨敤璇存槑銆?- `DEPLOY_PRODUCTION.md`锛氳ˉ鍏呭叕缃?HTTPS 閮ㄧ讲姝ラ銆佺敓浜у彉閲忋€丯ginx 鍙嶄唬銆乭ealth 楠屾敹鍦板潃銆佸叕缃戦摼鎺ョ敓鎴愯鍒欏拰灏忓洟闃熶笂绾挎祦绋嬨€?- `TEST_REPORT.md`锛氳褰曟湰闃舵淇敼銆侀獙璇佸拰鏃ч摼璺繚鐣欐儏鍐点€?
鍏綉閾炬帴鐢熸垚閫昏緫锛?- 宸查厤缃?`VITE_PUBLIC_APP_ORIGIN=https://浣犵殑鍩熷悕`锛氬悗鍙板鍒堕摼鎺ュ缁堢敓鎴?`https://浣犵殑鍩熷悕/worker/tk_XXXXXXXXXXXX`锛屽嵆浣跨鐞嗗憳涓存椂浠?localhost 鎵撳紑鍚庡彴銆?- 鏈厤缃?`VITE_PUBLIC_APP_ORIGIN`锛屼絾鍚庡彴閫氳繃鍏綉 HTTPS 鍩熷悕鎵撳紑锛氫娇鐢ㄥ綋鍓嶆祻瑙堝櫒 origin锛岀敓鎴?`https://褰撳墠鍩熷悕/worker/tk_XXXXXXXXXXXX`銆?- 鏈厤缃叕缃?origin锛屽悗鍙伴€氳繃灞€鍩熺綉 IP 鎵撳紑锛氫娇鐢ㄥ綋鍓嶅眬鍩熺綉 origin锛岀敓鎴?`http://鐢佃剳灞€鍩熺綉IP:绔彛/worker/tk_XXXXXXXXXXXX`銆?- 鍚庡彴閫氳繃 `localhost` / `127.0.0.1` 鎵撳紑锛氫紭鍏堣皟鐢?`/api/health`锛屼娇鐢ㄥ悗绔繑鍥炵殑绗竴鏉?`lanAdminUrls` 鐢熸垚灞€鍩熺綉甯堝倕閾炬帴銆?- 鏈湴 API 鏆備笉鍙敤鏃讹細鐢熸垚 `http://鐢佃剳灞€鍩熺綉IP:绔彛/worker/tk_XXXXXXXXXXXX` 妯℃澘鎻愮ず锛岄伩鍏嶅鍒跺嚭 localhost锛涜妯℃澘蹇呴』鏇挎崲鎴愮湡瀹?IP 鍚庢墠鑳界敤浜庢墜鏈烘祴璇曘€?
鐢熶骇鐜鍙橀噺锛?```env
VITE_DATA_MODE=mock-server
VITE_API_BASE_URL=
VITE_PUBLIC_APP_ORIGIN=https://浣犵殑鍩熷悕
VITE_AMAP_KEY=楂樺痉Web绔疜ey
VITE_AMAP_SECURITY_CODE=楂樺痉瀹夊叏瀵嗛挜
VITE_KIMI_CLASSIFY_ENDPOINT=
PUBLIC_APP_ORIGIN=https://浣犵殑鍩熷悕
PORT=8787
```

涓夌鐜閾炬帴绀轰緥锛?- 鏈湴寮€鍙戯細`localhost` 鎵撳紑鍚庡彴鏃讹紝鑻?`/api/health` 鍙敤锛屽鍒朵负 `http://鐪熷疄灞€鍩熺綉IP:8787/worker/tk_XXXXXXXXXXXX`锛涜嫢 API 鏆備笉鍙敤锛屾樉绀?`http://鐢佃剳灞€鍩熺綉IP:绔彛/worker/tk_XXXXXXXXXXXX` 妯℃澘鎻愮ず銆?- 灞€鍩熺綉娴嬭瘯锛氱敤 `http://192.168.x.x:8787/admin` 鎵撳紑鍚庡彴锛屽鍒朵负 `http://192.168.x.x:8787/worker/tk_XXXXXXXXXXXX`銆?- 鍏綉鐢熶骇锛氶厤缃?`VITE_PUBLIC_APP_ORIGIN=https://浣犵殑鍩熷悕` 鍚庯紝澶嶅埗涓?`https://浣犵殑鍩熷悕/worker/tk_XXXXXXXXXXXX`銆?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run test:api
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run test:api`锛氶€氳繃銆?- E2E 宸茬‘璁ゅ笀鍌呯鐞嗗鍒堕摼鎺ュ寘鍚?`/worker/tk_...`锛屼笖涓嶅寘鍚?`localhost` 鍜?`127.0.0.1`銆?- API 鍥炲綊宸茬‘璁?`/api/health` 姝ｅ父锛屼笖 `lanAdminUrls` 鍙敤浜庢湰鍦?灞€鍩熺綉璇婃柇銆?- API 鍥炲綊宸茬‘璁?`/api/dispatch` 娲惧崟鍚?`/api/worker-tasks/w1` 鍙鍒颁换鍔°€?- API 鍥炲綊宸茬‘璁?`/api/point-media/:pointId` 鍏煎鏃х礌鏉愬垎绫诲苟褰掍竴涓烘按鍗扮収鐗囥€?- API 鍥炲綊宸茬‘璁?`/api/worker-location` 瀹氫綅涓婃姤浠嶅彲鐢ㄣ€?- API 鍥炲綊宸茬‘璁?`/api/debug-state` 浠嶈繑鍥炲叧閿暟鎹€?- API 鍥炲綊宸茬‘璁?`/api/complete-point` 鑳芥妸鐐逛綅鏀逛负 `宸插畬鎴恅锛岄殢鍚庢煡璇?`/api/wall-points` 鍙湅鍒扮姸鎬佸洖鍐欍€?
褰卞搷璇存槑锛?- 鏈樁娈垫湭鏀瑰悗鍙?UI 淇℃伅鏋舵瀯锛屾湭鏂板甯堝倕 CRUD 鑳藉姏锛屾湭鏀瑰湴鍥捐皟搴︿氦浜掞紝鏈繘鍏ラ樁娈?3銆?- 闃舵 1 鐨勭粺涓€鐘舵€侀摼銆佺粺涓€绱犳潗鍒嗙被銆侀」鐩骇绱犳潗瑙勫垯缁х画淇濈暀锛屽苟鐢?E2E/API 鍥炲綊瑕嗙洊銆?- 鍘熸湁 dispatch銆亀orker-tasks銆乸oint-media銆乧omplete-point銆亀orker-location銆乭ealth銆乨ebug-state 閾捐矾鍧囧凡纭鍙繚鐣欍€?- 鐪熷疄鍏綉鍙敤浠嶄緷璧栭儴缃叉椂閰嶇疆 HTTPS 鍩熷悕銆丯ginx/璇佷功銆乣VITE_PUBLIC_APP_ORIGIN` 鍜岄珮寰峰煙鍚嶇櫧鍚嶅崟锛涙湰鍦拌嚜鍔ㄥ寲涓嶈兘鏇夸唬鐪熷疄鍏綉鎵嬫満楠屾敹銆?

## 30. 姝ｅ紡浜у搧鍖栭樁娈?3锛氬笀鍌呬笌绉诲姩绔?
鏇存柊鏃堕棿锛?026-05-10銆?
鏈淇敼鐩爣锛?- 鍙帹杩涢樁娈?3锛屼笉杩涘叆鍚庡彴 UI 澶ф敼銆佸湴鍥捐皟搴﹀寮恒€佹淳鍗曚腑蹇冮噸鏋勬垨绱犳潗涓績鎵归噺鑳藉姏绛夊悗缁樁娈点€?- 琛ュ己甯堝倕绠＄悊 CRUD銆佸鏉?token 瀹夊叏閾捐矾銆佸惎鐢?鍋滅敤銆侀噸缃摼鎺ャ€佸鍒堕摼鎺ュ拰鎵撳紑甯堝倕绔兘鍔涚殑鑷姩鍖栭獙璇併€?- 瀹屽杽鍦ㄧ嚎/绂荤嚎鍒ゆ柇鍙ｅ緞锛氬悓鏃跺熀浜庢渶杩?heartbeat 鍜屾渶杩戝畾浣嶄笂鎶ユ椂闂淬€?- 瀹屽杽鍚庡彴鏈€杩戝畾浣嶅睍绀猴紝閬垮厤鎶婃櫘閫氱紪杈戞椂闂磋璁や负瀹氫綅鏃堕棿銆?- 瀹屽杽甯堝倕绔浐瀹氳韩浠姐€佷换鍔″崟鐐规祻瑙堛€佷笂涓€鐐逛綅/涓嬩竴鐐逛綅銆佸乏鍙虫粦鍔ㄥ垏鎹㈠拰鍏被涓婁紶鍏ュ彛銆?- 淇濇寔闃舵 1 鐨勭粺涓€鐘舵€併€佺礌鏉愬垎绫汇€侀」鐩骇绱犳潗瑙勫垯涓嶈鐮村潖銆?- 淇濇寔闃舵 2 鐨勫叕缃戦摼鎺ョ敓鎴愰€昏緫涓嶈鐮村潖銆?- 淇濇寔 `dispatch`銆乣worker-tasks`銆乣point-media`銆乣complete-point`銆乣worker-location`銆乣health`銆乣debug-state` 閾捐矾鍙敤銆?
淇敼鏂囦欢锛?- `src/apiClient.js`锛氭湰鍦版ā寮?worker 褰掍竴鍖栨柊澧?`lastLocationAt/last_location_at`锛涘湪绾垮垽鏂悓鏃剁湅 `lastSeenAt` 鍜?`lastLocationAt`锛涙湰鍦板畾浣嶄笂鎶ュ啓鍏ユ渶杩戝畾浣嶆椂闂淬€?- `server/index.js`锛氬悗绔?worker 褰掍竴鍖栨柊澧?`lastLocationAt/last_location_at`锛涘湪绾垮垽鏂悓鏃剁湅蹇冭烦鍜屽畾浣嶏紱`/api/worker-location` 鍐欏叆鏈€杩戝畾浣嶆椂闂淬€?- `src/lib/domain.js`锛氭柊澧?`workerLastLocationText()`锛岀粺涓€鍚庡彴鏈€杩戝畾浣嶆椂闂村睍绀恒€?- `src/components/workers/WorkersTable.jsx`锛氬笀鍌呭垪琛ㄢ€滄渶杩戝畾浣嶆椂闂粹€濇敼涓鸿鍙栨渶杩戝畾浣嶅瓧娈点€?- `src/components/workers/WorkerDetailPanel.jsx`锛氬熀鏈俊鎭拰瀹氫綅 Tab 澧炲姞/鏀圭敤鐪熷疄鏈€杩戝畾浣嶆椂闂淬€?- `src/components/shared/legacyModals.jsx`锛氬笀鍌呯鐐逛綅鍗℃柊澧炲乏鍙虫粦鍔ㄥ垏鎹紱涓婁紶鍖烘竻鏅板睍绀哄叚绫荤礌鏉愬垎绫伙紱淇濈暀鍥剧墖绫荤礌鏉愬鏂囦欢涓婁紶涓斾笉闄愬埗鏁伴噺銆?- `src/styles.css`锛氳ˉ鍏呯Щ鍔ㄧ涓婁紶鍒嗙被鏍囩鍜屾彁绀烘牱寮忋€?- `tests/e2e/app.spec.js`锛氳ˉ鍏呴樁娈?3 E2E锛岃鐩栧浐瀹氳韩浠芥棤杈撳叆妗嗐€佸叚绫讳笂浼犲垎绫汇€佸乏鍙虫粦鍔ㄥ垏鎹€乼oken 閾炬帴鍜岃溅鐗屽ぇ鍐欎富娴佺▼銆?- `server/test-api.js`锛氳ˉ鍏呴樁娈?3 API 鍥炲綊锛岃鐩栨柊澧?缂栬緫/鍒犻櫎甯堝倕銆佽溅鐗屽ぇ鍐欍€佸鏉?token銆侀噸缃棫 token 澶辨晥銆佸仠鐢?token 鍚庝换鍔?瀹氫綅澶辨晥銆佸畾浣嶄笂鎶ヨЕ鍙戝湪绾垮拰鏈€杩戝畾浣嶃€?- `TEST_REPORT.md`锛氳褰曟湰闃舵淇敼鍜岄獙璇佺粨鏋溿€?
甯堝倕绠＄悊鐪熷疄鑳藉姏锛?- 鍚庡彴鍙柊澧炲笀鍌咃紝鑷姩鐢熸垚 `tk_` 寮€澶寸殑澶嶆潅涓嶅彲鐚滄祴 token銆?- 鍚庡彴鍙紪杈戝笀鍌咃紝杞︾墝涓殑鑻辨枃瀛楁瘝鑷姩杞ぇ鍐欍€?- 鍚庡彴鍙垹闄ゅ笀鍌咃紝骞舵竻鐞嗚甯堝倕鐩稿叧娲惧崟浠诲姟銆?- 鍚庡彴鍙惎鐢?鍋滅敤甯堝倕锛屽仠鐢ㄥ悗 token 涓嶅啀鑳借繘鍏ユ湁鏁堜换鍔￠摼璺紝涔熶笉鑳界户缁笂鎶ュ畾浣嶃€?- 鍚庡彴鍙噸缃摼鎺ワ紝鏃?token 绔嬪嵆澶辨晥锛屾柊 token 鍙户缁娇鐢ㄣ€?- 鍚庡彴鍙鍒堕摼鎺ワ紝缁х画娌跨敤闃舵 2 鐨勫叕缃?origin 鐢熸垚閫昏緫锛屼笉澶嶅埗 localhost銆?- 鍚庡彴鍙墦寮€甯堝倕绔紝姝ｅ紡璺緞浠嶄负 `/worker/tk_XXXXXXXXXXXX`銆?- 鏃?id/slug 閾炬帴缁х画鍏煎锛屼絾甯堝倕绔細鎻愮ず鏇存崲涓烘柊鐨勫畨鍏ㄩ摼鎺ワ紱姝ｅ紡浣跨敤浠?token 涓轰富銆?
鍦ㄧ嚎/绂荤嚎鍒ゆ柇锛?- `enabled=false` 鏃跺缁堣涓虹绾裤€?- 45 绉掑唴鏈?`lastSeenAt/last_seen_at` 蹇冭烦锛岃涓哄湪绾裤€?- 45 绉掑唴鏈?`lastLocationAt/last_location_at` 瀹氫綅涓婃姤锛屼篃瑙嗕负鍦ㄧ嚎銆?- `lastOfflineAt/last_offline_at` 鏅氫簬鏈€杩戝績璺虫垨瀹氫綅鏃讹紝瑙嗕负绂荤嚎銆?- 鍚敤甯堝倕鍙仮澶嶉摼鎺ユ潈闄愶紝涓嶇洿鎺ョ疆涓哄湪绾匡紱闇€瑕佸笀鍌呴噸鏂版墦寮€閾炬帴鍙戝績璺虫垨瀹氫綅鍚庢墠涓婄嚎銆?
甯堝倕绔祦绋嬶細
- 甯堝倕鎵撳紑涓撳睘 `/worker/tk_XXXXXXXXXXXX` 鍚庯紝绯荤粺鑷姩璇嗗埆鍚庡彴韬唤銆?- 椤甸潰鍥哄畾灞曠ず濮撳悕銆佹墜鏈哄彿銆佽溅鐗屻€佷换鍔℃暟鍜屽綋鍓嶈繘搴︺€?- 涓嶅啀鏄剧ず濮撳悕銆佹墜鏈哄彿銆佽溅鐗岃緭鍏ユ锛屼篃涓嶅厑璁稿笀鍌呰嚜琛屽垏鎹㈣韩浠姐€?- 姣忔鍙睍绀轰竴涓偣浣嶄换鍔★紝鍙€氳繃鈥滀笂涓€鐐逛綅 / 涓嬩竴鐐逛綅鈥濇寜閽垏鎹€?- 宸插疄鐜板乏鍙虫粦鍔ㄥ垏鎹細宸︽粦杩涘叆涓嬩竴鐐逛綅锛屽彸婊戝洖鍒颁笂涓€鐐逛綅銆?- 涓婁紶鍒嗙被鍖呭惈锛歚鐜板満鐓х墖 / 720 鍏ㄦ櫙 / 姘村嵃鐓х墖 / 鍑珛寰峰浘鐗?/ 澧欑鍗忚鍥剧墖 / 瑙嗛`銆?- 鍥剧墖涓婁紶鍏ュ彛鏀寔澶氭枃浠堕€夋嫨锛屼笉闄愬埗鏁伴噺锛涜棰戜粛鎸夊綋鍓嶈棰戜笂浼犲叆鍙ｅ鐞嗐€?- 鎵撳紑鏈夋晥閾炬帴鍚庝細鍙戦€?heartbeat锛涘紑鍚疄鏃跺畾浣嶅悗瀹氫綅涓婃姤浼氬啓鍏ュ悗鍙版渶杩戝潗鏍囧拰鏈€杩戝畾浣嶆椂闂淬€?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run test:api
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run test:api`锛氶€氳繃銆?- E2E 宸茬‘璁ゅ笀鍌呯鍥哄畾韬唤锛屼笉瀛樺湪濮撳悕/鎵嬫満鍙?杞﹁締缂栧彿杈撳叆妗嗐€?- E2E 宸茬‘璁ゅ叚绫讳笂浼犲垎绫诲湪甯堝倕绔彲瑙侊紝骞舵彁绀哄浘鐗囩被绱犳潗涓嶉檺鍒舵暟閲忋€?- E2E 宸茬‘璁や笂涓€鐐逛綅/涓嬩竴鐐逛綅鎸夐挳鍙敤锛屽乏鍙虫粦鍔ㄥ彲鍒囨崲鐐逛綅銆?- E2E 宸茬‘璁ゆ柊澧炲笀鍌呰溅鐗屽ぇ鍐欍€乼oken 閾炬帴鎵撳紑銆佹棫 slug 鍏煎鎻愮ず銆侀噸缃棫 token 澶辨晥銆佸仠鐢?token 澶辨晥銆佸垹闄ゅ笀鍌呮祦绋嬪彲鐢ㄣ€?- API 宸茬‘璁ゆ柊澧炲笀鍌呯敓鎴愬鏉?token 涓旇溅鐗屽ぇ鍐欍€?- API 宸茬‘璁ょ紪杈戝笀鍌呭悗杞︾墝缁х画澶у啓銆?- API 宸茬‘璁ら噸缃摼鎺ュ悗鏃?token 璁块棶杩斿洖 404銆?- API 宸茬‘璁ゅ畾浣嶄笂鎶ュ彲鏇存柊鍦ㄧ嚎鐘舵€佸拰鏈€杩戝畾浣嶆椂闂淬€?- API 宸茬‘璁ゅ仠鐢ㄥ笀鍌呭悗 token 浠诲姟閾捐矾涓嶈繑鍥炴湁鏁堜换鍔★紝瀹氫綅涓婃姤杩斿洖 403銆?- API 宸茬‘璁ゅ惎鐢ㄥ悗绛夊緟 heartbeat/瀹氫綅鎵嶄細鍦ㄧ嚎锛屽垹闄ゅ悗 token 澶辨晥銆?- API 鍥炲綊缁х画纭 `/api/health`銆乣/api/dispatch`銆乣/api/worker-tasks/w1`銆乣/api/point-media/:pointId`銆乣/api/worker-location`銆乣/api/debug-state`銆乣/api/complete-point/:pointId` 鍧囧彲鐢ㄣ€?
褰卞搷璇存槑锛?- 鏈樁娈垫湭鏀瑰悗鍙颁竴绾т俊鎭灦鏋勶紝鏈繘鍏ュ湴鍥捐皟搴︽閫?鍦堥€夛紝鏈繘鍏ユ淳鍗曚腑蹇冩帹鑽愬笀鍌咃紝鏈繘鍏ョ礌鏉愪腑蹇冩壒閲忎笅杞藉寮恒€?- 闃舵 1 缁熶竴鐘舵€侀摼銆佺粺涓€绱犳潗鍒嗙被銆侀」鐩骇绱犳潗瑙勫垯浠嶇敱 E2E/API 瑕嗙洊銆?- 闃舵 2 鍏綉閾炬帴 origin 閫昏緫鏈敼鍙橈紝澶嶅埗閾炬帴浠嶄笉搴斿嚭鐜?localhost銆?

## 31. 闃舵 3 琛ラ綈椤癸細甯堝倕绔乏鍙虫粦鍔ㄥ垏鎹㈢偣浣?
鏇存柊鏃堕棿锛?026-05-10銆?
鏈淇敼鐩爣锛?- 鍙ˉ榻愬笀鍌呯宸﹀彸婊戝姩鍒囨崲鐐逛綅锛屼笉杩涘叆闃舵 4銆?- 淇濇寔鈥滀竴椤典竴涓偣浣嶁€濄€?- 淇濈暀鈥滀笂涓€鐐逛綅 / 涓嬩竴鐐逛綅鈥濇寜閽€?- 鎵嬫満绔乏婊戣繘鍏ヤ笅涓€鐐逛綅锛屽彸婊戣繑鍥炰笂涓€鐐逛綅銆?- 闃叉璇Е锛氱煭璺濈婊戝姩銆佸亸绔栧悜婊氬姩銆佷笂浼?瀵艰埅/鎸夐挳/琛ㄥ崟鍖哄煙婊戝姩涓嶈Е鍙戝垏鎹€?- 涓嶆敼涓婁紶銆佸畾浣嶃€佷换鍔¤鍙栥€乼oken銆佸叕缃戦摼鎺ョ瓑閫昏緫銆?
淇敼鏂囦欢锛?- `src/components/shared/legacyModals.jsx`锛氬姞鍥哄笀鍌呯鐐逛綅鍗¤Е鎽搁€昏緫锛屾柊澧?`handleTouchMove`銆佷氦浜掑厓绱犱繚鎶ゃ€?2px 婊戝姩闃堝€笺€佹í鍚戜富瀵煎垽鏂紱宸︽粦涓嬩竴鐐逛綅锛屽彸婊戜笂涓€鐐逛綅銆?- `src/styles.css`锛氫负 `.mobile-point-card` 澧炲姞 `touch-action: pan-y` 鍜屾粦鍔ㄦ彁绀烘牱寮忥紝淇濈暀绾靛悜婊氬姩浣撻獙銆?- `tests/e2e/app.spec.js`锛氳ˉ鍏呯煭璺濈婊戝姩涓嶈Е鍙戙€佸乏婊戜笅涓€鐐逛綅銆佸彸婊戜笂涓€鐐逛綅鐨勫洖褰掓柇瑷€銆?- `TEST_REPORT.md`锛氳褰曟湰琛ラ綈椤归獙璇佺粨鏋溿€?
瀹炵幇璇存槑锛?- 瑙︽懜璧风偣璁板綍鍦ㄧ偣浣嶅崱 `touchstart`銆?- 鍙湁妯悜浣嶇Щ杈惧埌 72px锛屼笖妯悜浣嶇Щ鑷冲皯涓虹旱鍚戜綅绉荤殑 1.35 鍊嶆椂锛屾墠瑙﹀彂鍒囨崲銆?- `a/button/input/select/textarea/label/.mobile-upload` 绛変氦浜掑尯鍩熶笉浼氳Е鍙戞粦鍔ㄥ垏鐐癸紝閬垮厤涓婁紶鎴栧鑸瑙︺€?- `touch-action: pan-y` 鍏佽椤甸潰缁х画绾靛悜婊氬姩锛涙í鍚戞剰鍥炬槑鏄炬椂闃绘榛樿婊氬姩骞跺垏鎹㈢偣浣嶃€?- 褰撳墠鏄涓€涓偣浣嶆椂鍙虫粦涓嶄細瓒婄晫锛涘綋鍓嶆槸鏈€鍚庝竴涓偣浣嶆椂宸︽粦涓嶄細瓒婄晫銆?
瑙﹀睆鎵嬫満楠岃瘉鏂瑰紡锛?1. 鍚庡彴娲惧崟缁欐煇浣嶅笀鍌咃紝渚嬪鏉庡笀鍌呫€?2. 鎵嬫満鎵撳紑璇ュ笀鍌?`/worker/tk_...` 涓撳睘閾炬帴銆?3. 纭椤甸潰鏄剧ず `1 / 3` 鍜岀涓€涓偣浣嶃€?4. 鍦ㄧ偣浣嶅崱绌虹櫧鍖哄煙鍚戝乏婊戝姩瓒呰繃绾?72px锛屽簲鍒囧埌 `2 / 3`銆?5. 鍦ㄧ偣浣嶅崱绌虹櫧鍖哄煙鍚戝彸婊戝姩瓒呰繃绾?72px锛屽簲鍥炲埌 `1 / 3`銆?6. 杞诲井鐭粦銆佷笂涓嬫粴鍔ㄣ€佺偣鍑讳笂浼犳寜閽€佺偣鍑婚珮寰峰鑸紝涓嶅簲瑙﹀彂鐐逛綅鍒囨崲銆?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run test:api
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run test:api`锛氶€氳繃銆?- 鍥炲綊纭锛氫笂浼犮€佸畾浣嶃€佷换鍔¤鍙栥€乨ispatch銆亀orker-tasks銆乸oint-media銆乧omplete-point銆亀orker-location銆乭ealth銆乨ebug-state 鍧囨湭琚湰娆℃粦鍔ㄨˉ涓佺牬鍧忋€?
## 32. 姝ｅ紡浜у搧鍖栭樁娈?4锛氬悗鍙颁俊鎭灦鏋勪笌浼佷笟绾ч噸鏋?
鏇存柊鏃堕棿锛?026-05-10銆?
鏈淇敼鐩爣锛?- 鍙帹杩涢樁娈?4锛屼笉杩涘叆闃舵 5 鐨勭偣浣?娲惧崟/绱犳潗娣卞害鑱斿姩鎵╁睍锛屼篃涓嶆敼鏈嶅姟绔帴鍙ｉ摼璺€?- 鍚庡彴涓€绾у鑸暣鐞嗕负锛氳繍钀ユ€昏銆佸湴鍥捐皟搴︺€佺偣浣嶇鐞嗐€佸笀鍌呯鐞嗐€佹淳鍗曚腑蹇冦€侀」鐩鐞嗐€佺礌鏉愮鐞嗐€佺郴缁熺姸鎬併€?- 灏嗛」鐩鐞嗘彁鍗囦负鐙珛涓€绾ч〉闈紝骞朵粠绯荤粺鐘舵€侀檮灞炲尯鍩熺Щ鍑恒€?- 澧炲姞鍏ㄥ眬椤圭洰鍒囨崲銆佹椂闂磋寖鍥村垏鎹€佸叏灞€鎼滅储鍏ュ彛鍜岄珮棰戝揩鎹峰姩浣溿€?- 灏嗚繍钀ユ€昏鍗囩骇涓虹粡钀ラ┚椹惰埍锛岀獊鍑?KPI銆佷粖鏃ヤ紭鍏堜簨椤广€佽繎 7 澶╄秼鍔裤€侀」鐩帹杩涖€侀槦浼嶇姸鎬併€佺礌鏉愰闄╁拰寮傚父浼樺厛绾с€?- 灏嗙偣浣嶇鐞嗚ˉ寮轰负浼佷笟绾х瓫閫夎〃鏍硷紝淇濈暀鎵归噺鎿嶄綔鍏ュ彛銆?- 灏嗙礌鏉愮鐞嗚ˉ寮轰负鍒嗙被绛涢€夈€侀綈濂楃姸鎬佺瓫閫夈€佹壒閲忎笅杞?瀵煎嚭鍏ュ彛鍜岄」鐩礌鏉愯鍒欐憳瑕併€?- 淇濇寔闃舵 1/2/3 鐨勭粺涓€涓氬姟搴曞骇銆佸叕缃戦摼鎺ャ€佸笀鍌?CRUD/token銆佸浐瀹氳韩浠姐€佸乏鍙虫粦鍔ㄣ€佷笂浼犲拰娲惧崟閾捐矾涓嶈鐮村潖銆?
淇敼鏂囦欢锛?- `src/lib/domain.js`锛氳皟鏁村悗鍙颁竴绾у鑸悕绉板拰椤圭洰绠＄悊鍏ュ彛锛屾柊澧為€氱敤鏃堕棿鑼冨洿鍒ゆ柇 helper銆?- `src/App.jsx`锛氭帴鍏ュ叏灞€鏃堕棿鑼冨洿銆佸叏灞€鎼滅储銆侀珮棰戝揩鎹峰姩浣滃拰椤圭洰绠＄悊涓€绾ц矾鐢便€?- `src/components/layout/AdminLayout.jsx`锛氬悜椤堕儴 Header 浼犻€掑叏灞€涓婁笅鏂囧拰蹇嵎鍔ㄤ綔銆?- `src/components/layout/Header.jsx`锛氭柊澧炴椂闂磋寖鍥淬€佸叏灞€鎼滅储銆佸揩鎹峰姩浣滃尯锛屽苟淇蹇嵎鍔ㄤ綔鐨勫彲璁块棶鍚嶇О銆?- `src/pages/DashboardPage.jsx`锛氬崌绾х粡钀ラ┚椹惰埍锛屾柊澧炰粖鏃ヤ紭鍏堜簨椤广€佽繎 7 澶╄秼鍔裤€佺礌鏉愰闄╂憳瑕佸拰寮傚父浼樺厛绾у叆鍙ｃ€?- `src/components/dashboard/TodoPanel.jsx`锛氭敮鎸佷笉鍚岄潰鏉挎爣棰橈紝鐢ㄤ簬浠婃棩浼樺厛浜嬮」銆佸紓甯镐紭鍏堢骇鍜屽伐浣滃叆鍙ｃ€?- `src/pages/ProjectsPage.jsx`锛氭柊澧炵嫭绔嬮」鐩鐞嗛〉锛屾敮鎸佹柊澧?缂栬緫/闅愯棌/褰掓。銆佹湀浠界瓫閫夈€侀」鐩垏鎹㈠拰椤圭洰绾х礌鏉愯鍒欓厤缃€?- `src/pages/PointsPage.jsx`锛氭帴鍏ュ叏灞€鎼滅储/鏃堕棿鑼冨洿锛屾柊澧炲紓甯搞€佸笀鍌呫€佹爣绛俱€佹椂闂寸瓫閫夊拰鎵归噺鏌ョ湅/瀵煎嚭/璺冲湴鍥惧叆鍙ｃ€?- `src/components/points/PointFilters.jsx`锛氳ˉ寮洪」鐩€佺姸鎬併€佸紓甯搞€佸笀鍌呫€佹爣绛俱€佹椂闂村拰鍏抽敭璇嶇瓫閫夈€?- `src/components/points/PointsTable.jsx`锛氳ˉ鍏呭嚡绔嬪痉銆佸绉熷崗璁拰寮傚父鐘舵€佸垪锛屽紓甯稿彛寰勫鐢ㄩ樁娈?1 瑙勫垯銆?- `src/pages/MediaPage.jsx`锛氭柊澧炵礌鏉愯鍒欒鏄庛€侀綈濂?寰呰ˉ鍏?鏃犵礌鏉愭憳瑕侊紝骞舵帴鍏ュ叏灞€鎼滅储/鏃堕棿鑼冨洿銆?- `src/components/media/MediaFilters.jsx`锛氳ˉ寮哄垎绫汇€侀」鐩€佺偣浣嶃€佸笀鍌呫€佹椂闂淬€侀綈濂楃姸鎬佸拰鍏抽敭璇嶇瓫閫夈€?- `src/pages/SystemHealthPage.jsx`锛氱Щ闄ら檮灞為」鐩鐞嗭紝鍙繚鐣欑郴缁熻瘖鏂€並imi 閰嶇疆鍜岀ǔ瀹氭€ц嚜妫€銆?- `src/styles.css`锛氳ˉ鍏呬紒涓氱骇鍚庡彴甯冨眬銆丠eader 蹇嵎鍔ㄤ綔銆侀┚椹惰埍瓒嬪娍銆侀」鐩鐞嗐€佺礌鏉愯鍒欏拰寮傚父鏍囩鏍峰紡銆?- `tests/e2e/app.spec.js`锛氭洿鏂颁负 8 涓竴绾т笟鍔￠〉闈紝骞惰鐩栫嫭绔嬮」鐩鐞嗗拰绱犳潗绠＄悊鏂板懡鍚嶃€?- `TEST_REPORT.md`锛氳褰曢樁娈?4 淇敼鍜岄獙璇佺粨鏋溿€?
鍚庡彴涓€绾у鑸渶缁堢粨鏋勶細
- 杩愯惀鎬昏
- 鍦板浘璋冨害
- 鐐逛綅绠＄悊
- 甯堝倕绠＄悊
- 娲惧崟涓績
- 椤圭洰绠＄悊
- 绱犳潗绠＄悊
- 绯荤粺鐘舵€?
鍏抽敭瀹炵幇璇存槑锛?- 甯堝倕绠＄悊缁х画浣跨敤浼佷笟绾ц〃鏍笺€佹悳绱€佺瓫閫夈€佸垎椤靛拰璇︽儏渚ф爮锛岄伩鍏嶅笀鍌呭澶氬悗椤甸潰鏃犻檺鎷夐暱銆?- 鐐逛綅绠＄悊鏂板寮傚父绛涢€夈€佸笀鍌呯瓫閫夈€佹椂闂寸瓫閫夛紝骞跺湪琛ㄦ牸涓樉绀轰簲绫诲浘鐗囩礌鏉愭暟閲忓拰寮傚父鐘舵€併€?- 绱犳潗绠＄悊娌℃湁娣峰叆甯堝倕绔墽琛岄〉锛涚礌鏉愮綉鏍煎彧灞曠ず鐪熷疄涓婁紶绱犳潗锛岃鍒欐憳瑕佽礋璐ｅ睍绀洪綈濂?寰呰ˉ鍏?鏃犵礌鏉愮姸鎬併€?- 鍏ㄥ眬椤圭洰鍒囨崲缁х画椹卞姩鍦板浘銆佺偣浣嶃€佹淳鍗曘€佺礌鏉愮瓑椤甸潰锛涘叏灞€鏃堕棿鑼冨洿褰撳墠鎺ュ叆鐐逛綅鍜岀礌鏉愮瓫閫夛紝杩愯惀鎬昏灞曠ず杩?7 澶╄秼鍔裤€?- 鍏ㄥ眬鎼滅储浣滀负椤堕儴缁熶竴鍏ュ彛锛屽彲鍚屾鍒扮偣浣嶃€佸笀鍌呭拰绱犳潗椤甸潰銆?- 楂橀蹇嵎鍔ㄤ綔鍖呭惈鏂板鐐逛綅銆佹壒閲忓鍏ャ€佸揩閫熸淳鍗曘€佹柊澧炲笀鍌呫€佹壒閲忎笅杞界礌鏉愶紝骞惰烦杞埌瀵瑰簲鐪熷疄鍔熻兘鍏ュ彛銆?- 寮傚父鍜岀礌鏉愰闄╁叆鍙ｅ鐢?`getPointAnomalies()`銆侀」鐩骇绱犳潗瑙勫垯鍜岀粺涓€绱犳潗鍒嗙被锛屼笉鏂板绗簩濂楃姸鎬佸彛寰勩€?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run test:api
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run test:api`锛氶€氳繃銆?- E2E 宸茬‘璁ゅ悗鍙?8 涓竴绾ч〉闈㈠彲鍒囨崲銆?- E2E 宸茬‘璁ょ偣浣嶇鐞嗚〃鏍笺€佹悳绱€佺瓫閫夈€佹柊澧炪€佹壒閲忓鍏ュ拰璇︽儏鎶藉眽鍙敤銆?- E2E 宸茬‘璁ょ嫭绔嬮」鐩鐞嗛〉鍙闂紝骞跺彲瑙侀」鐩礌鏉愯鍒欓厤缃€?- E2E 宸茬‘璁ょ礌鏉愮鐞嗘柊鍏ュ彛鍙闂紝鍏被绱犳潗鍒嗙被浠嶅瓨鍦ㄣ€?- E2E 宸茬户缁‘璁ゅ笀鍌呯鐞?CRUD銆乼oken 閾炬帴銆佽溅鐗屽ぇ鍐欍€佸仠鐢?鍚敤銆侀噸缃摼鎺ャ€佸垹闄ゅ笀鍌呫€佸笀鍌呯鍥哄畾韬唤鍜屽乏鍙虫粦鍔ㄤ笉鍙楀奖鍝嶃€?- E2E 宸茬户缁‘璁ゅ湴鍥捐皟搴︾偣浣?marker銆佸皬杞?marker 鍜屽彸渚?Tabs 涓嶅彈褰卞搷銆?- E2E 宸茬户缁‘璁ょЩ鍔ㄧ涓婁紶鍚庡悗鍙扮礌鏉愮鐞嗗彲瑙併€?- API 鍥炲綊缁х画纭 `/api/health`銆乣/api/dispatch`銆乣/api/worker-tasks/w1`銆乣/api/point-media/:pointId`銆乣/api/worker-location`銆乣/api/debug-state`銆乣/api/complete-point/:pointId` 鍧囧彲鐢ㄣ€?
褰卞搷璇存槑锛?- 鏈樁娈垫湭鏀规湇鍔＄鎺ュ彛瀹炵幇锛屾湭鏀瑰笀鍌呯涓婁紶/瀹氫綅/浠诲姟璇诲彇涓婚摼璺€?- 闃舵 1 鐨勭粺涓€鐘舵€侀摼銆佺礌鏉愬垎绫汇€侀」鐩骇绱犳潗瑙勫垯缁х画淇濈暀銆?- 闃舵 2 鐨勫叕缃戦摼鎺?origin 閫昏緫缁х画淇濈暀銆?- 闃舵 3 鐨勫笀鍌?CRUD銆佸鏉?token銆佸畨鍏ㄩ摼璺€佸湪绾跨绾裤€佸浐瀹氳韩浠藉拰宸﹀彸婊戝姩缁х画淇濈暀銆?- 鍦板浘璋冨害鐨勬閫?鍦堥€?杞ㄨ抗鍥炴斁绛夋洿娣辫兘鍔涙湭鍦ㄦ湰闃舵灞曞紑锛屽簲淇濈暀鍒板悗缁樁娈靛鐞嗐€?
## 33. 姝ｅ紡浜у搧鍖栭樁娈?5锛氬湴鍥捐皟搴﹀寮?
鏇存柊鏃堕棿锛?026-05-10銆?
鏈淇敼鐩爣锛?- 鍙帹杩涢樁娈?5锛屼笉杩涘叆闃舵 6銆?- 缁х画淇濈暀鐪熷疄楂樺痉鍦板浘鍔犺浇閾捐矾锛屼笉鏇挎崲鎴愬亣鍦板浘銆?- 淇濇寔鐐逛綅 Marker 鍦嗗舰瑙嗚椋庢牸銆?- 灏忚溅 Marker 鍖哄垎琛岄┒涓€佸仠杞︿腑銆佺绾裤€?- 鍦板浘璋冨害浠庡睍绀洪〉澧炲己涓哄彲鎿嶄綔椤甸潰锛屾敮鎸佸湴鍥剧偣閫夈€佹閫夈€佸湀閫夈€佹壒閲忛€夌偣銆佸尯鍩熸眹鎬诲拰鍦板浘娲惧崟銆?- 鏀寔鎸夐」鐩€佺姸鎬併€佸紓甯哥瓫閫夈€?- 淇濇寔鐐逛綅鍒楄〃涓庡湴鍥剧偣鍑昏鎯呭弻鍚戣仈鍔ㄣ€?- 澧炲姞璋冨害瑙嗗浘銆侀獙鏀惰鍥俱€佽建杩瑰洖鏀惧熀纭€銆?- 淇濇寔 `worker-location` 鏈€杩戜綅缃鍙栧拰鏃?API 閾捐矾涓嶈鐮村潖銆?
淇敼鏂囦欢锛?- `src/lib/domain.js`锛氭柊澧?`workerMotionState()`銆乣workerMotionLabel()`锛岀粺涓€灏忚溅琛岄┒涓?鍋滆溅涓?绂荤嚎鍒ゆ柇鍜屽睍绀烘枃妗堛€?- `src/pages/MapConsolePage.jsx`锛氭柊澧炲紓甯哥瓫閫夈€佽鍥炬ā寮忋€侀€夋嫨妯″紡銆佸尯鍩熼€夋嫨鐘舵€併€佸尯鍩熸眹鎬昏绠楀拰鍦板浘鐐归€?鍖哄煙閫夋嫨鍥炲啓銆?- `src/components/map/MapToolbar.jsx`锛氭柊澧炲紓甯哥瓫閫夈€佽皟搴?楠屾敹/杞ㄨ抗涓夎鍥惧垏鎹€佹祻瑙?鐐归€?妗嗛€?鍦堥€夊洓绉嶅湴鍥句氦浜掓ā寮忋€?- `src/components/map/AmapView.jsx`锛氫繚鐣欑湡瀹為珮寰峰湴鍥撅紱澧炲己灏忚溅 Marker 鐘舵€佹牱寮忥紱鏂板妗嗛€?鍦堥€夎鐩栧眰锛涚偣閫夋ā寮忎笅鐐瑰嚮鍦嗗舰鐐逛綅鍙姞鍏ユ壒閲忛€夋嫨锛涘尯鍩熼€夋嫨缁撴灉鍥炲啓鍒扮幇鏈?`selectedIds`銆?- `src/components/map/MapSidebar.jsx`锛氭柊澧炲尯鍩熸眹鎬?Tab銆佽建杩瑰洖鏀惧熀纭€ Tab锛涚偣浣嶈鎯呰ˉ鍏呮埧涓溿€佸凡娲惧笀鍌呫€佺礌鏉愭儏鍐点€佸紓甯告儏鍐碉紱灏忚溅璇︽儏琛ュ厖鎵嬫満鍙枫€佽溅鐗屻€佸湪绾跨姸鎬併€佸綋鍓嶄换鍔°€佹渶杩戜笂鎶ユ椂闂村拰浠婃棩杞ㄨ抗銆?- `src/styles.css`锛氭柊澧炲湴鍥惧尯鍩熼€夋嫨灞傘€佸尯鍩熸眹鎬汇€佸皬杞﹁椹?鍋滆溅/绂荤嚎瑙嗚銆佽建杩瑰垪琛ㄥ拰鍦板浘渚ф爮 Tabs 鏍峰紡銆?- `tests/e2e/app.spec.js`锛氳ˉ鍏呭湴鍥鹃樁娈?5 鍥炲綊锛岃鐩栦笁瑙嗗浘鍏ュ彛銆佹閫?鍦堥€夊叆鍙ｃ€佺偣浣嶈鎯呯礌鏉?寮傚父銆佸尯鍩熸眹鎬诲拰杞ㄨ抗鍥炴斁鍩虹銆?- `TEST_REPORT.md`锛氳褰曢樁娈?5 淇敼鍜岄獙璇佺粨鏋溿€?
楂樺痉鍦板浘绋冲畾鎬э細
- 缁х画浣跨敤 `loadAmapSdk()` 璇诲彇 `VITE_AMAP_KEY` 鍜?`VITE_AMAP_SECURITY_CODE`銆?- 楂樺痉 SDK 姝ｅ父鏃朵娇鐢ㄧ湡瀹?`AMap.Map`銆乣AMap.Marker`銆乣ToolBar`銆乣Scale`銆?- Key 缂哄け鎴?SDK 鍔犺浇澶辫触鏃朵繚鐣欒瘖鏂崱鐗囧拰澶囩敤鍦板浘鍏滃簳锛岄伩鍏嶅湴鍥惧尯鍩熺┖鐧斤紱杩欏彧鏄厹搴曟樉绀猴紝涓嶆浛浠ｇ湡瀹為珮寰蜂富閾捐矾銆?- 鍦板浘鍒濆鍖栧悗缁х画浣跨敤 `ResizeObserver` 鍜岀獥鍙?resize 瑙﹀彂 `map.resize()`锛屼繚璇佸悗鍙板竷灞€鍙樺寲鏃跺湴鍥句笉濉岄櫡銆?
鍦板浘璋冨害瀹炵幇璇存槑锛?- 鍦嗗舰鐐逛綅 Marker锛氱户缁娇鐢?`.amap-point-marker` + `.amap-point-bubble`锛屾寜缁熶竴鐐逛綅鐘舵€佹槧灏勯鑹诧紝閫変腑鍜屾壒閲忓嬀閫夋湁楂樹寒銆?- 灏忚溅 Marker锛氳鍙?worker 鏈€杩?`lng/lat`锛涘湪绾夸笖绉诲姩涓鸿椹朵腑锛屽湪绾挎湭绉诲姩涓哄仠杞︿腑锛岃秴杩囧湪绾块槇鍊间负绂荤嚎锛涗笁绉嶇姸鎬佸垎鍒娇鐢ㄧ豢鑹层€佹鑹层€佺伆鑹层€?- 妗嗛€?鍦堥€夛細鍦ㄩ珮寰峰湴鍥句笂鏂瑰鍔犱氦浜掕鐩栧眰锛屾嫋鍔ㄧ粨鏉熷悗鐢ㄩ珮寰?`lngLatToContainer()` 灏嗙偣浣嶅潗鏍囪浆鎹负灞忓箷鍧愭爣骞跺垽鏂槸鍚﹁惤鍏ョ煩褰?鍦嗗舰鍖哄煙锛涢珮寰锋湭灏辩华鐨勫厹搴曞湴鍥句娇鐢ㄧ浉鍚岀偣浣嶅潗鏍囨瘮渚嬭绠椼€?- 鍖哄煙姹囨€伙細妗嗛€?鍦堥€夊悗绔嬪嵆鏄剧ず鐐逛綅鏁般€佸緟娲剧偣鏁般€佸紓甯告暟銆佸湪绾垮笀鍌呮暟锛屽苟鎶婂尯鍩熺偣浣嶅啓鍏ョ幇鏈?`selectedIds`銆?- 鍦板浘娲惧崟锛氬尯鍩熺偣浣嶆垨鐐归€夌偣浣嶈繘鍏ョ幇鏈夋壒閲忛€夋嫨闆嗗悎鍚庯紝鍙充晶鈥滄淳鍗曗€濇垨鈥滃尯鍩熸眹鎬烩€濈殑鈥滀竴閿壒閲忔淳鍗曗€濈户缁皟鐢ㄥ師鏈?`dispatchSelected()`锛屼笉鏂板绗簩濂楁淳鍗曢€昏緫銆?- 鐐逛綅鍒楄〃涓庡湴鍥捐仈鍔細鍙充晶鐐逛綅鍒楄〃鍙偣鍑烩€滃畾浣嶁€濆垏鍒扮偣浣嶈鎯咃紱鍦板浘 Marker 鐐瑰嚮浼氬垏鎹㈠彸渚х偣浣嶈鎯咃紱鐐归€夋ā寮忎笅涔熶細鍔犲叆/绉诲嚭鎵归噺閫夋嫨銆?- 璋冨害瑙嗗浘锛氶粯璁ゆ樉绀鸿皟搴︾敤鐐逛綅鍜屽笀鍌呭皬杞︼紝鏀寔鐐归€?妗嗛€?鍦堥€夊悗娲惧崟銆?- 楠屾敹瑙嗗浘锛氳仛鐒﹀凡涓婁紶绱犳潗銆佸緟楠屾敹銆佸凡瀹屾垚銆侀渶澶嶆煡鎴栫礌鏉愮己澶辩偣浣嶏紝渚夸簬楠屾敹涓庡紓甯稿鐞嗐€?- 杞ㄨ抗鍥炴斁鍩虹锛氳鍙?`trackLogs` 鍜?worker 鏈€杩戜綅缃紝灞曠ず閫変腑甯堝倕浠婃棩杞ㄨ抗璁板綍锛屼负鍚庣画鏃堕棿杞存挱鏀惧拰鍋滆溅鏃堕暱鍒嗘瀽棰勭暀銆?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run test:api
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run test:api`锛氶€氳繃銆?- E2E 宸茬‘璁ゅ湴鍥鹃〉浠嶆樉绀虹偣浣嶃€佸皬杞﹀拰鍙充晶 Tabs銆?- E2E 宸茬‘璁よ皟搴﹁鍥俱€侀獙鏀惰鍥俱€佽建杩瑰洖鏀俱€佹閫夈€佸湀閫夊叆鍙ｅ彲瑙併€?- E2E 宸茬‘璁ょ偣浣嶈鎯呭寘鍚礌鏉愭儏鍐靛拰寮傚父鎯呭喌銆?- E2E 宸茬‘璁ゆ閫夊悗杩涘叆鍖哄煙姹囨€伙紝骞舵樉绀哄緟娲剧偣鏁板拰鍦ㄧ嚎甯堝倕鏁般€?- E2E 宸茬‘璁よ建杩瑰洖鏀惧熀纭€鍙墦寮€銆?- API 鍥炲綊缁х画纭 `/api/worker-location` 瀹氫綅涓婃姤浠嶅彲鐢ㄣ€?- API 鍥炲綊缁х画纭 `/api/dispatch`銆乣/api/worker-tasks/w1`銆乣/api/point-media/:pointId`銆乣/api/debug-state`銆乣/api/complete-point/:pointId`銆乣/api/health` 鍧囧彲鐢ㄣ€?
褰卞搷璇存槑锛?- 鏈樁娈垫湭鏀规湇鍔＄ API 瀹炵幇锛屾湭鏀瑰笀鍌呯 token銆佸畨鍏ㄩ摼鎺ャ€佷笂浼犮€佸浐瀹氳韩浠藉拰宸﹀彸婊戝姩銆?- 闃舵 1 鐨勭粺涓€鐘舵€併€佺礌鏉愬垎绫汇€侀」鐩骇绱犳潗瑙勫垯缁х画淇濈暀锛屽苟琚湴鍥惧紓甯哥瓫閫夊鐢ㄣ€?- 闃舵 2 鐨勫叕缃戦摼鎺ラ€昏緫鏈敼銆?- 闃舵 3 鐨勫笀鍌呯涓?token 瀹夊叏閾捐矾鏈敼銆?- 闃舵 4 鐨勫悗鍙颁竴绾т俊鎭灦鏋勬湭鏀广€?- 鏇村畬鏁寸殑鍘嗗彶杞ㄨ抗鏃堕棿杞存挱鏀俱€佽嚜鍔ㄥ仠杞︽椂闀跨粺璁″拰璺ㄥ尯鍩熸櫤鑳芥帹鑽愪粛鐣欑粰鍚庣画闃舵銆?
## 34. 姝ｅ紡浜у搧鍖栭樁娈?6锛氱偣浣?/ 娲惧崟 / 绱犳潗鑱斿姩

鏇存柊鏃堕棿锛?026-05-10銆?
鏈淇敼鐩爣锛?- 鍙帹杩涢樁娈?6锛屼笉杩涘叆闃舵 7銆?- 璁╃偣浣嶇鐞嗐€佹淳鍗曚腑蹇冦€佺礌鏉愮鐞嗗舰鎴愪笟鍔￠棴鐜€?- 鐐逛綅椤垫竻妤氬睍绀哄綋鍓嶅笀鍌呫€佸繀浼犵礌鏉愬畬鎴愭儏鍐点€佺己澶辩礌鏉愩€佹槸鍚﹀彲楠屾敹锛屽苟鏀寔杩涘叆娲惧崟銆佺礌鏉愭煡鐪嬨€侀獙鏀舵煡鐪嬨€?- 娲惧崟涓績澧炲姞鎺ㄨ崘甯堝倕鍜屾淳鍗曞墠鏍￠獙銆?- 绱犳潗绠＄悊缁х画鎸夐」鐩骇绱犳潗瑙勫垯鍒ゆ柇榻愬锛屽苟淇濈暀鍏被绱犳潗鍒嗙被鍜岀瓫閫夈€?- 涓婁紶绱犳潗鍚庤嚜鍔ㄥ埛鏂伴綈濂楀垽鏂€佺偣浣嶇姸鎬併€佸紓甯搁」銆佽繍钀ユ€昏鍜屽湴鍥捐皟搴︽暟鎹€?- 淇濈暀鍓?5 闃舵鍏ㄩ儴鑳藉姏銆?
淇敼鏂囦欢锛?- `src/lib/domain.js`锛氭柊澧?`pointMaterialCompletion()`銆乣isPointReadyForAcceptance()`銆乣assignedWorkersForPoint()`銆乣dispatchValidationForPoint()`锛岀粺涓€涓夐〉鑱斿姩鍒ゆ柇銆?- `src/components/points/PointsTable.jsx`锛氱偣浣嶈〃鏂板褰撳墠甯堝倕銆佸繀浼犵礌鏉愬畬鎴愩€佺己浠€涔堢礌鏉愩€佸彲楠屾敹鍒楋紝骞舵柊澧炵礌鏉?楠屾敹鍏ュ彛銆?- `src/components/points/PointDetailDrawer.jsx`锛氱偣浣嶈鎯呰ˉ鍏呭綋鍓嶅笀鍌呫€侀獙鏀剁姸鎬併€佺礌鏉愰綈濂楀拰缂哄け璇存槑銆?- `src/pages/PointsPage.jsx`锛氭帴鍏ョ礌鏉愭煡鐪嬪拰楠屾敹鏌ョ湅鍏ュ彛銆?- `src/App.jsx`锛氫粠鐐逛綅椤佃烦杞礌鏉愮鐞嗘椂鍙仛鐒︽寚瀹氱偣浣嶏紱楠屾敹鏌ョ湅浼氳繘鍏ョ礌鏉愮鐞嗗苟鎻愮ず鏍稿榻愬/寮傚父銆?- `src/pages/DispatchPage.jsx`锛氭柊澧炴帹鑽愬笀鍌呫€佹淳鍗曞墠鏍￠獙銆佷换鍔￠噺/璺ㄩ」鐩?閲嶅娲惧崟/寮傚父椋庨櫓鍒ゆ柇銆?- `src/components/dispatch/DispatchBasket.jsx`锛氬緟娲惧崟绡瓙鏄剧ず榻愬鐘舵€佸拰寮傚父鎽樿銆?- `src/components/dispatch/DispatchSummary.jsx`锛氬睍绀烘帹鑽愬笀鍌呭拰娲惧崟鍓嶆牎楠岋紱鍋滅敤甯堝倕浼氶樆鏂淳鍗曘€?- `src/pages/MediaPage.jsx`锛氭敮鎸佺偣浣嶈仛鐒︼紱鏂板鎸夆€滈」鐩?/ 鐐逛綅缂栧彿 / 绱犳潗鍒嗙被鈥濈殑 ZIP 褰掓。涓嬭浇锛屽苟淇濈暀 manifest 瀵煎嚭銆?- `src/components/media/MediaFilters.jsx`锛氬皢鎵归噺涓嬭浇鍏ュ彛鏄庣‘涓衡€滄壒閲忎笅杞?ZIP鈥濓紝骞朵繚鐣欌€滃鍑哄綊妗ｆ竻鍗曗€濄€?- `src/apiClient.js`锛氭湰鍦颁笂浼犵礌鏉愬悗鎸夐」鐩礌鏉愯鍒欒嚜鍔ㄦ祦杞偣浣嶇姸鎬佷负 `宸蹭笂浼犵礌鏉恅 鎴?`寰呴獙鏀禶锛屼笉鍐嶄竴鍒€鍒囧畬鎴愩€?- `server/index.js`锛歮ock/鐢熶骇 API 涓婁紶绱犳潗鍚庡悓鏍锋寜椤圭洰绱犳潗瑙勫垯鑷姩鏇存柊鐐逛綅鐘舵€併€?- `src/hooks/useH5Data.js`锛氫笂浼犲悗鑷姩 `loadAll()`锛屽埛鏂扮偣浣嶃€佺礌鏉愩€佸紓甯搞€佹€昏鍜屽湴鍥炬暟鎹€?- `src/styles.css`锛氳ˉ鍏呯礌鏉愰綈濂楀崟鍏冩牸銆佹淳鍗曟帹鑽愩€佹淳鍗曟牎楠屾牱寮忋€?- `tests/e2e/app.spec.js`锛氳ˉ鍏呯偣浣嶈仈鍔ㄥ垪銆佹淳鍗曟牎楠屾帹鑽愩€佷笂浼犲悗闈炲浐瀹氬畬鎴愭€佺殑鍥炲綊鏂█銆?- `TEST_REPORT.md`锛氳褰曢樁娈?6 淇敼鍜岄獙璇佺粨鏋溿€?
鐐逛綅 / 娲惧崟 / 绱犳潗鑱斿姩璇存槑锛?- 鐐逛綅椤靛睍绀哄綋鍓嶇姸鎬併€佸綋鍓嶅笀鍌呫€佸繀浼犵礌鏉愬畬鎴愭瘮渚嬨€佺己澶辩礌鏉愩€佹槸鍚﹀彲楠屾敹銆?- 鐐逛綅琛屽彲鐩存帴杩涘叆娲惧崟銆佺礌鏉愭煡鐪嬨€侀獙鏀舵煡鐪嬶紱绱犳潗/楠屾敹鏌ョ湅浼氳烦鍒扮礌鏉愮鐞嗗苟鎸夎鐐逛綅鑱氱劍銆?- 娲惧崟鎴愬姛鍚庣户缁皟鐢ㄥ師鏈?dispatch 閾捐矾锛岀偣浣嶇姸鎬佸彉涓?`宸叉淳鍗昤锛屽笀鍌呬换鍔℃暟銆佸湴鍥捐皟搴﹀拰甯堝倕绔换鍔′細閫氳繃缁熶竴鏁版嵁鍒锋柊璇诲彇鍒版渶鏂扮姸鎬併€?- 绱犳潗涓婁紶鍚庯紝鐐逛綅鐘舵€佹寜椤圭洰绾х礌鏉愯鍒欒嚜鍔ㄦ祦杞細鏈綈濂椾负 `宸蹭笂浼犵礌鏉恅锛岄綈濂椾负 `寰呴獙鏀禶锛涗粛鍙€氳繃 `complete-point` 瀹屾垚楠屾敹銆?- 杩愯惀鎬昏銆佸湴鍥捐皟搴︺€佺偣浣嶇鐞嗐€佺礌鏉愮鐞嗛兘澶嶇敤鍚屼竴浠?points/photos/tasks/projects 鏁版嵁锛屽洜姝や笂浼?娲惧崟鍚庡埛鏂板嵆鍙悓姝ュ彉鍖栥€?
娲惧崟鍓嶆牎楠岋細
- 甯堝倕閾炬帴鏄惁鍚敤銆?- 甯堝倕鏄惁鍦ㄧ嚎銆?- 褰撳墠浠诲姟閲忋€?- 鏄惁璺ㄩ」鐩?鍖哄煙銆?- 鐐逛綅鏄惁宸叉淳缁欏叾浠栧笀鍌呫€?- 鏄惁瀛樺湪寮傚父椋庨櫓銆?- 鎺ㄨ崘甯堝倕渚濇嵁锛氬湪绾裤€佸悓椤圭洰銆佸凡鏈夊畾浣嶃€佸綋鍓嶄换鍔℃洿灏戙€侀摼鎺ュ惎鐢紱璺濈浣跨敤 worker 涓庢墍閫夌偣浣嶇粡绾害鐨勫熀纭€杩戜技璇勫垎銆?
绱犳潗榻愬鍒ゆ柇锛?- 涓ユ牸浣跨敤椤圭洰绾?`materialRules/material_rules`銆?- 鑻ラ」鐩湭閰嶇疆瑙勫垯锛岀户缁娇鐢ㄩ樁娈?1 鐨勯」鐩悕绉伴粯璁よ鍒欏吋瀹规棫鏁版嵁銆?- 鍒嗙被缁х画鍖呭惈锛氱幇鍦虹収鐗囥€?20 鍏ㄦ櫙銆佹按鍗扮収鐗囥€佸嚡绔嬪痉鍥剧墖銆佸绉熷崗璁浘鐗囥€佽棰戙€?- 鍥剧墖绫荤礌鏉愪笂浼犳暟閲忎粛涓嶉檺鍒躲€?
鎵归噺涓嬭浇璇存槑锛?- 褰撳墠鎵归噺涓嬭浇鍏ュ彛宸茬粡鐢熸垚鐪熸鐨?ZIP 鍘嬬缉鍖咃紝涓嶅啀浠呯敤 manifest 浠ｆ浛涓嬭浇銆?- ZIP 鎸夊綋鍓嶇瓫閫夌粨鏋滅敓鎴愶紝鐩綍灞傜骇涓衡€滈」鐩悕绉?/ 鐐逛綅缂栧彿 / 绱犳潗鍒嗙被 / 鏂囦欢鍚嶁€濄€?- 鏂囦欢鍛藉悕鍖呭惈鐐逛綅缂栧彿銆佺礌鏉愬垎绫诲拰搴忓彿锛屼緥濡?`GZ-BY-001_鐜板満鐓х墖_001.jpg`銆?- ZIP 鍐呭悓鏃朵繚鐣?`manifest.json`锛屽叾涓寘鍚瘡涓礌鏉愮殑椤圭洰銆佺偣浣嶇紪鍙枫€佺礌鏉愬垎绫汇€佹枃浠跺悕銆佽闂?URL 鍜屽缓璁綊妗ｈ矾寰勩€?- 鑻ユ煇涓礌鏉愭枃浠舵媺鍙栧け璐ワ紝ZIP 浼氬啓鍏ュ搴?`.download-error.txt` 鍗犱綅鏂囦欢锛屾柟渚垮姙鍏鏍稿缂哄け椤广€?
楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run test:api
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run test:api`锛氶€氳繃銆?- E2E 宸茬‘璁ゅ悗鍙?8 涓竴绾ч〉闈€佺偣浣嶈〃鏍笺€佹淳鍗曚腑蹇冦€佸笀鍌?token銆佸畨鍏ㄩ摼璺€佸湴鍥捐皟搴︺€佺Щ鍔ㄧ涓婁紶鍜岀礌鏉愮鐞嗗潎鍙敤銆?- E2E 宸茬‘璁ょ偣浣嶉〉鍑虹幇蹇呬紶绱犳潗/鍙獙鏀朵俊鎭紝鐐逛綅璇︽儏鍑虹幇楠屾敹鐘舵€併€?- E2E 宸茬‘璁ゆ淳鍗曚腑蹇冨嚭鐜版帹鑽愬笀鍌呭拰娲惧崟鍓嶆牎楠屻€?- E2E 宸茬‘璁や笂浼犵礌鏉愬悗鍚庡彴绱犳潗绠＄悊鍙锛岀偣浣嶇姸鎬佽繘鍏?`宸蹭笂浼犵礌鏉恅 / `寰呴獙鏀禶 / `宸插畬鎴恅 涔嬩竴銆?- API 鍥炲綊缁х画纭 `/api/health`銆乣/api/dispatch`銆乣/api/worker-tasks/w1`銆乣/api/point-media/:pointId`銆乣/api/worker-location`銆乣/api/debug-state`銆乣/api/complete-point/:pointId` 鍧囧彲鐢ㄣ€?
褰卞搷璇存槑锛?- 闃舵 1 鐨勭粺涓€鐘舵€併€佺礌鏉愬垎绫汇€侀」鐩骇瑙勫垯缁х画淇濈暀锛屽苟琚偣浣?娲惧崟/绱犳潗涓夐〉鍏辩敤銆?- 闃舵 2 鐨勫叕缃戦摼鎺ラ€昏緫鏈敼銆?- 闃舵 3 鐨勫笀鍌呯銆乼oken銆佸畨鍏ㄩ摼璺€佸湪绾跨绾裤€佸乏鍙虫粦鍔ㄦ湭鏀广€?- 闃舵 4 鐨勫悗鍙颁俊鎭灦鏋勬湭鏀广€?- 闃舵 5 鐨勭湡瀹為珮寰峰湴鍥俱€佹閫夈€佸湀閫夈€佹壒閲忔淳鍗曘€佸皬杞︽樉绀烘湭鏀广€?
## 35. 闃舵 6 琛ラ綈椤癸細鐪熸 ZIP 绱犳潗鎵归噺褰掓。涓嬭浇

鏇存柊鏃堕棿锛?026-05-11銆?
鏈鍙ˉ榻愮礌鏉愭壒閲忓綊妗ｄ笅杞斤紝涓嶈繘鍏ラ樁娈?7锛屼笉鏂板鍏跺畠涓氬姟鍔熻兘銆?
淇敼鏂囦欢锛?- `src/lib/zipArchive.js`锛氭柊澧炴祻瑙堝櫒渚ф爣鍑?ZIP 鐢熸垚鍣紝浣跨敤 store/no-compression 鏂瑰紡鍐欏叆 local file header銆乧entral directory 鍜?end record锛屾敮鎸?UTF-8 涓枃璺緞銆?- `src/pages/MediaPage.jsx`锛氭柊澧?`downloadArchiveZip()`锛屾寜褰撳墠绛涢€夌粨鏋滄媺鍙栫礌鏉愭枃浠跺苟鐢熸垚 ZIP锛涗繚鐣?`downloadArchiveManifest()`銆?- `src/components/media/MediaFilters.jsx`锛氭壒閲忓叆鍙ｆ媶鍒嗕负鈥滄壒閲忎笅杞?ZIP鈥濆拰鈥滃鍑哄綊妗ｆ竻鍗曗€濄€?- `tests/e2e/app.spec.js`锛氳ˉ鍏呯礌鏉愮鐞嗛〉 ZIP 涓嬭浇鏂█锛岀‘璁や笅杞芥枃浠跺悕涓?`wall-media-archive-*.zip`銆?
ZIP 鐢熸垚璇存槑锛?- ZIP 瀹屽叏鎸夌礌鏉愮鐞嗛〉褰撳墠绛涢€夊悗鐨?`visible` 缁撴灉鐢熸垚銆?- 姣忎釜绱犳潗鎸夆€滈」鐩悕绉?/ 鐐逛綅缂栧彿 / 绱犳潗鍒嗙被鈥濆綊妗ｃ€?- 鏂囦欢鍚嶈嚦灏戝寘鍚偣浣嶇紪鍙枫€佺礌鏉愬垎绫诲拰搴忓彿銆?- ZIP 鍐呬繚鐣?`manifest.json`锛宮anifest 缁х画鍙崟鐙鍑恒€?- 鍗曚釜鏂囦欢鎷夊彇澶辫触鏃讹紝涓嶄腑鏂暣鍖呬笅杞斤紝鑰屾槸鍦ㄥ搴旂洰褰曞啓鍏?`.download-error.txt` 渚夸簬杩芥煡銆?
ZIP 鍐呯洰褰曠ず渚嬶細
```text
鍔犲瀹濇潙闀囧浣撻」鐩?
  GZ-BY-001/
    鐜板満鐓х墖/
      GZ-BY-001_鐜板満鐓х墖_001.jpg
    姘村嵃鐓х墖/
      GZ-BY-001_姘村嵃鐓х墖_001.jpg
  manifest.json
```

楠岃瘉鍛戒护锛?```bash
npm run build
npm run test:e2e
npm run test:api
```

楠岃瘉缁撴灉锛?- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run test:api`锛氶€氳繃銆?- 宸茬‘璁ら」鐩骇绱犳潗瑙勫垯銆佺礌鏉愮瓫閫夈€佺偣浣?娲惧崟/绱犳潗鑱斿姩鍜屽墠 5 闃舵鑳藉姏鏈鐮村潖銆?
## 36. 姝ｅ紡浜у搧鍖栭樁娈?7锛氭渶缁堥獙璇併€佷笂绾垮噯澶囦笌鏂囨。鏀跺彛

鏇存柊鏃堕棿锛?026-05-11銆?
鏈樁娈靛彧鍋氭渶缁堝洖褰掋€佷笂绾垮噯澶囧拰鏂囨。鏀跺彛锛屼笉鍐嶆柊澧炲ぇ鍔熻兘銆?
淇敼鏂囦欢锛?- `README.md`锛氶噸鍐欎负鏈€缁堜骇鍝佽鏄庯紝瑕嗙洊椤圭洰鐢ㄩ€斻€佷富瑕佽兘鍔涖€佹湰鍦板惎鍔ㄣ€佺敓浜ч儴缃层€佺幆澧冨彉閲忋€佸叕缃戦摼鎺ラ€昏緫銆佸笀鍌?token銆佺礌鏉愬垎绫汇€侀」鐩骇瑙勫垯銆乑IP 涓嬭浇鍜屽凡鐭ラ檺鍒躲€?- `DEPLOY_PRODUCTION.md`锛氶噸鍐欎负鍏綉閮ㄧ讲鎸囧崡锛岃鐩栦簯鏈嶅姟鍣?Node/Express銆丯ginx銆丠TTPS銆佸煙鍚嶃€佺幆澧冨彉閲忋€乸m2銆佷笂浼犵洰褰曟寔涔呭寲銆佹暟鎹浠藉拰涓嶅缓璁彧渚濊禆 Vercel Serverless 鐨勫師鍥犮€?- `TEST_REPORT.md`锛氳ˉ鍏呴樁娈?6 ZIP 淇鍜岄樁娈?7 鏈€缁堝洖褰掕褰曘€?
鍚勯樁娈靛畬鎴愬唴瀹规眹鎬伙細
- 闃舵 1锛氱粺涓€鐐逛綅鐘舵€侀摼璺€佺礌鏉愬垎绫汇€佸紓甯歌鍒欏拰椤圭洰绾х礌鏉愯鍒欙紝鍏煎鏃ф暟鎹€?- 闃舵 2锛氬己鍖栧悓婧?API銆佺敓浜х幆澧冮厤缃拰鍏綉甯堝倕閾炬帴鐢熸垚锛岄伩鍏嶅鍒?localhost銆?- 闃舵 3锛氳ˉ寮哄笀鍌?CRUD銆佸鏉?token銆佸仠鐢?閲嶇疆澶辨晥銆佸湪绾跨绾裤€佸浐瀹氳韩浠姐€佺Щ鍔ㄧ涓婁紶鍒嗙被鍜屽乏鍙虫粦鍔ㄣ€?- 闃舵 4锛氬悗鍙板崌绾т负 8 涓竴绾у鑸紝澧炲姞鍏ㄥ眬椤圭洰/鏃堕棿/鎼滅储/蹇嵎鍔ㄤ綔锛屽苟鎶婂笀鍌呫€佺偣浣嶃€佺礌鏉愮瓑椤甸潰鏀逛负浼佷笟绾х粨鏋勩€?- 闃舵 5锛氫繚鐣欑湡瀹為珮寰峰湴鍥撅紝澧炲己鐐逛綅 Marker銆佸皬杞?Marker銆佹閫夈€佸湀閫夈€佸尯鍩熸眹鎬汇€佸湴鍥炬淳鍗曞拰杞ㄨ抗鍥炴斁鍩虹銆?- 闃舵 6锛氭墦閫氱偣浣?/ 娲惧崟 / 绱犳潗鑱斿姩锛屾淳鍗曞墠鏍￠獙銆侀」鐩骇榻愬鍒ゆ柇銆佷笂浼犲悗鐘舵€佽仈鍔紝骞惰ˉ榻愮湡姝?ZIP 鎵归噺褰掓。涓嬭浇銆?- 闃舵 7锛氬畬鎴愭渶缁堟枃妗ｆ敹鍙ｅ拰鑷姩鍖栧洖褰掋€?
鏈€缁堝洖褰掑懡浠わ細
```bash
npm run build
npm run test:e2e
npm run test:api
```

鏈€缁堝洖褰掔粨鏋滐細
- `npm run build`锛氶€氳繃锛孷ite 鐢熶骇鏋勫缓鎴愬姛锛岀敓鎴?`dist/`銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?- `npm run test:api`锛氶€氳繃銆?
鍏抽敭 API 鍥炲綊缁撴灉锛?- `/api/health`锛氶€氳繃銆?- `/api/debug-state`锛氶€氳繃锛岀户缁繑鍥?projects銆亀orkers銆乸oints銆乨ispatchTasks 绛夊叧閿暟鎹€?- `/api/dispatch`锛氶€氳繃锛屾淳鍗曞悗鐐逛綅杩涘叆缁熶竴鐘舵€?`宸叉淳鍗昤銆?- `/api/worker-tasks/w1`锛氶€氳繃锛屽笀鍌呯鍙鍒颁换鍔°€?- `/api/point-media/:pointId`锛氶€氳繃锛屾棫绱犳潗鍒嗙被鍙綊涓€锛屼笂浼犻摼璺彲鐢ㄣ€?- `/api/complete-point/:pointId`锛氶€氳繃锛屽彲灏嗙偣浣嶆敼涓?`宸插畬鎴恅銆?- `/api/worker-location`锛氶€氳繃锛屽畾浣嶄笂鎶ュ彲鏇存柊鍦ㄧ嚎鐘舵€佸拰鏈€杩戜綅缃€?- 甯堝倕 token API锛氶€氳繃锛屾柊澧炵敓鎴愬鏉?token锛岄噸缃悗鏃?token 澶辨晥锛屽仠鐢ㄥ悗 token 閾炬帴鍜屽畾浣嶄笂鎶ュけ鏁堛€?
鑷姩鍖栬鐩栧埌鐨勫叧閿摼璺細
- 鍚庡彴 8 涓竴绾ч〉闈㈠彲璁块棶銆?- 鐐逛綅绠＄悊琛ㄦ牸銆佹悳绱€佺瓫閫夈€佸垎椤点€佹柊澧?缂栬緫/鍒犻櫎鍏ュ彛鍙敤銆?- 娲惧崟涓績鍙瓫閫夈€佹壒閲忓嬀閫夈€侀€夋嫨甯堝倕骞跺啓鍏ヤ换鍔°€?- 闃舵 1 鐨勭粺涓€鐘舵€併€佺礌鏉愬垎绫诲拰椤圭洰绱犳潗瑙勫垯淇濇寔鍏煎銆?- 甯堝倕绠＄悊鏀寔鍒嗛〉銆佹悳绱€佺瓫閫夈€佽鎯呫€乼oken 閾炬帴銆佸惎鐢?鍋滅敤銆侀噸缃€佸垹闄ゃ€?- 鍦板浘璋冨害淇濈暀鐐逛綅 Marker銆佸皬杞?Marker 鍜屽彸渚?Tabs銆?- 绉诲姩绔笂浼犲浘鐗囧悗鍚庡彴绱犳潗绠＄悊鍙銆?- 绉诲姩绔笂涓€鐐逛綅/涓嬩竴鐐逛綅鍒囨崲姝ｅ父銆?- 绱犳潗绠＄悊 ZIP 鎵归噺涓嬭浇鍏ュ彛鍙Е鍙戜笅杞姐€?- 绯荤粺鐘舵€併€佺嫭绔嬮」鐩鐞嗐€並imi 閰嶇疆鍜屽鍑?JSON 鍙敤銆?
浠嶉渶浜哄伐楠屾敹锛?- 鐢ㄧ湡瀹為珮寰?Key 鍜屾寮忓煙鍚嶆墦寮€ `/admin`锛岀‘璁ょ湡瀹炲簳鍥惧姞杞姐€丷eferer 鐧藉悕鍗曞拰 Security Code 鍧囨纭€?- 鐢ㄧ湡瀹炴墜鏈?HTTPS 鎵撳紑甯堝倕 token 閾炬帴锛岀‘璁ゅ畾浣嶆巿鏉冦€佹寔缁畾浣嶃€佸皬杞?Marker 浣嶇疆鍙樺寲銆?- 鍦ㄥ湴鍥句笂鐪熷疄鎷栧姩妗嗛€?鍦堥€夛紝纭鍖哄煙鐐逛綅鍜屾壒閲忔淳鍗曠鍚堢幇鍦洪鏈熴€?- 涓婁紶鐪熷疄鐓х墖銆?20 鍏ㄦ櫙銆佹按鍗扮収鐗囥€佸嚡绔嬪痉鍥剧墖銆佸绉熷崗璁浘鐗囧拰瑙嗛锛岀‘璁ゅ姙鍏鍚庡彴鍙煡鐪嬨€?- 浣跨敤鐪熷疄绛涢€夋潯浠朵笅杞?ZIP锛岀‘璁ゅ姙鍏鐢佃剳鍙甯歌В鍘嬩腑鏂囩洰褰曞拰鏂囦欢鍚嶃€?- 鐢ㄦ寮忓煙鍚嶅鍒跺笀鍌呴摼鎺ワ紝纭涓嶄細鍑虹幇 localhost 鎴栧眬鍩熺綉鍦板潃銆?
褰撳墠浠嶆湭瀹屾垚浣嗕笉褰卞搷棣栫増涓婄嚎鐨勫寮洪」锛?- 瀹屾暣杞ㄨ抗鍥炴斁鎾斁鍣ㄣ€佹椂闂磋酱鍜屾挱鏀炬帶鍒躲€?- 鏇撮珮绾х殑鏉冮檺绯荤粺銆佺櫥褰曘€佽鑹插拰瀹¤鏃ュ織銆?- 鏇村己鐨勬暟鎹簱涓庡璞″瓨鍌ㄦ寔涔呭寲鏂规銆?- 鍚庣鑷姩瑙嗛杞爜銆佸帇缂╁拰灏侀潰鎴浘銆?- 鏇撮珮绾х殑缁熻鎶ヨ〃銆佸尯鍩熺粡钀ュ垎鏋愬拰浜哄憳缁╂晥銆?- 瓒呭ぇ鎵归噺绱犳潗鐨勬湇鍔＄寮傛 ZIP 鎵撳寘浠诲姟銆?
涓婄嚎鍓嶅繀椤诲噯澶囷細
- HTTPS 鍏綉鍩熷悕銆?- 楂樺痉 Web JS API Key 涓?Security Code锛屽苟缁戝畾姝ｅ紡鍩熷悕 Referer銆?- 鐢熶骇鐜鍙橀噺 `VITE_PUBLIC_APP_ORIGIN`銆乣PUBLIC_APP_ORIGIN`銆乣VITE_AMAP_KEY`銆乣VITE_AMAP_SECURITY_CODE`銆?- 浜戞湇鍔″櫒 Node/Express銆丯ginx銆乸m2銆佷笂浼犲ぇ灏忛檺鍒跺拰闃茬伀澧欍€?- `server/data/db.json` 鍜?`server/uploads/` 鐨勬寔涔呭寲涓庡浠界瓥鐣ャ€?- 鑷冲皯涓€娆＄湡瀹炴墜鏈虹瀹氫綅銆佷笂浼犲拰甯堝倕 token 閾炬帴楠屾敹銆?
## 37. 绗簩闃舵锛歋upabase 姝ｅ紡鏁版嵁妯″紡鍒囨崲

鏇存柊鏃堕棿锛?026-05-12銆?
鏈樁娈靛彧澶勭悊 Supabase 鐜鍙橀噺銆佹暟鎹簮鍒囨崲銆侀敊璇彁绀轰紭鍖栧拰鏋勫缓楠岃瘉锛屼笉鏀瑰悗鍙?UI銆佷笉鏀瑰湴鍥俱€佷笉鏂板涓氬姟鍔熻兘銆?
闂鏉ユ簮锛?- 绾夸笂 Vercel 鍙充笅瑙掑嚭鐜扳€滃埛鏂板伐浜哄畾浣嶅け璐ワ細鎺ュ彛杩炴帴澶辫触锛屾湇鍔＄鐜鍙橀噺缂哄け锛歋UPABASE_CLIENT_DEP_DISABLED鈥濄€?- 瀹¤纭 `SUPABASE_CLIENT_DEP_DISABLED` 鏉ヨ嚜 `api/_shared.js`锛氭棫 Vercel Serverless API 灏濊瘯 `require("@supabase/supabase-js")`锛屼絾椤圭洰姝ゅ墠娌℃湁瀹夎璇ヤ緷璧栥€?- 鍓嶇姝ゅ墠鐢熶骇榛樿 `mock-server`锛宍src/supabaseClient.js` 鍙槸鍗犱綅 `supabase = null`锛屾湭鐪熸鏍规嵁 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 鍒囨崲姝ｅ紡鏁版嵁婧愩€?
淇敼鏂囦欢锛?- `package.json` / `package-lock.json`锛氭柊澧?`@supabase/supabase-js`锛屼慨澶?Vercel API 缂?Supabase SDK 鐨勭洿鎺ュ師鍥犮€?- `src/supabaseClient.js`锛氭柊澧炴寮?Supabase client 灏佽锛岃鍙?`VITE_SUPABASE_URL` 鍜?`VITE_SUPABASE_ANON_KEY`锛涚己澶辨椂涓嶅穿婧冦€?- `src/apiClient.js`锛氭柊澧?`supabase` 鏁版嵁妯″紡锛涢厤缃?Supabase 鏃惰嚜鍔ㄤ紭鍏堣鍙栨寮忔暟鎹紱鏈厤缃椂杩涘叆鏈湴婕旂ず锛涢」鐩€佺偣浣嶃€佸笀鍌呫€佹淳鍗曘€佺礌鏉愩€佸畾浣嶃€佽建杩规帴鍏?Supabase 琛ㄣ€?- `src/hooks/useH5Data.js`锛氬皢鎻愮ず鏀逛负涓枃涓氬姟鎻愮ず锛汼upabase 鍒濆鍖栧け璐ユ椂涓存椂鍒囨崲婕旂ず鏁版嵁锛岄伩鍏嶉〉闈笉鍙敤銆?- `src/lib/domain.js`锛氬皢 `SUPABASE_CLIENT_DEP_DISABLED`銆佹湇鍔＄鐜鍙橀噺缂哄け銆佽〃涓嶅瓨鍦ㄧ瓑閿欒杞崲涓轰腑鏂囧彲鐞嗚В鎻愮ず銆?- `api/_shared.js` / `api/worker-tasks.js`锛氭棫 Vercel API 涓嶅啀鎶婂唴閮ㄩ敊璇爜鐩存帴灞曠ず缁欑敤鎴凤紝鏀逛负鎻愮ず妫€鏌?Vercel Supabase 鐜鍙橀噺鍜屼緷璧栥€?- `supabase/schema.sql`锛氭洿鏂版寮忚〃缁撴瀯锛屽寘鍚?`projects`銆乣workers.access_token`銆佸畾浣嶅瓧娈点€乣point_photos`銆乣track_logs` 鍜?`point-media` bucket銆?- `.env.example`锛氳ˉ榻愬苟鏁寸悊 `VITE_SUPABASE_URL`銆乣VITE_SUPABASE_ANON_KEY`銆侀珮寰峰拰 Kimi 鍙橀噺銆?- `tests/e2e/app.spec.js`锛氳ˉ鍏?Supabase 姝ｅ紡妯″紡闈欐€佹柇瑷€锛屽悓鏃朵繚鐣欐棫 API 娲惧崟閾捐矾妫€鏌ャ€?
褰撳墠鍓嶇鏁版嵁鏉ユ簮锛?- 椤圭洰鍒楄〃锛歋upabase `projects`锛涙棤 Supabase 鏃舵湰鍦版紨绀烘暟鎹€?- 鐐逛綅鍒楄〃锛歋upabase `wall_points`锛涙棤 Supabase 鏃舵湰鍦版紨绀烘暟鎹€?- 甯堝倕鍒楄〃锛歋upabase `workers`锛涙棤 Supabase 鏃舵湰鍦版紨绀烘暟鎹€?- 娲惧崟鏁版嵁锛歋upabase `dispatch_tasks`锛涙棤 Supabase 鏃舵湰鍦版紨绀烘暟鎹€?- 绱犳潗鏁版嵁锛歋upabase `point_photos` + Storage bucket `point-media`锛涙棤 Supabase 鏃舵湰鍦?blob 婕旂ず銆?- 宸ヤ汉瀹氫綅鏁版嵁锛歋upabase `workers` 鏈€鏂板畾浣嶅瓧娈?+ `track_logs`锛涙棤 Supabase 鏃舵湰鍦版紨绀鸿建杩广€?- 绯荤粺鐘舵€佹暟鎹細鍓嶇 `healthCheck()` 鎸夊綋鍓嶆暟鎹ā寮忚繑鍥烇紱鏃?`/api/health` 浠嶄繚鐣欑粰 Express/Vercel API 璇婃柇銆?
闇€瑕佸湪 Vercel 閰嶇疆锛?```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_AMAP_KEY=
VITE_AMAP_SECURITY_CODE=
VITE_KIMI_API_KEY=
```

濡傛灉缁х画浣跨敤鏃?Vercel Serverless API 浠ｇ悊锛岃繕闇€瑕佹湇鍔＄鍙橀噺锛?```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Supabase 闇€瑕佸缓琛細
- `projects`
- `workers`
- `wall_points`
- `dispatch_tasks`
- `point_photos`
- `track_logs`
- Storage bucket锛歚point-media`

楠岃瘉鍛戒护锛?```bash
npm install
npm run build
```

楠岃瘉缁撴灉锛?- `npm install`锛氶€氳繃锛屼緷璧栧凡瀹夎锛沶pm audit 浠嶆彁绀?1 涓?high severity锛岄渶瑕佸悗缁崟鐙瘎浼颁緷璧栧崌绾ч闄┿€?- `npm run build`锛氶€氳繃銆?- Vite 鎻愮ず涓诲寘瓒呰繃 500KB锛岃繖鏄紩鍏?Supabase SDK 鍚庣殑鍖呬綋璀﹀憡锛屼笉鏄瀯寤哄け璐ワ紱鍚庣画濡傛湁闇€瑕佸彲鍐嶅仛浠ｇ爜鍒嗗寘浼樺寲銆?
鍏煎鎬ц鏄庯細
- Vercel 鏈厤缃?Supabase 鏃讹紝椤甸潰涓嶄細宕╂簝锛屼細鎻愮ず鈥滃綋鍓嶆湭杩炴帴姝ｅ紡鏁版嵁搴擄紝绯荤粺姝ｅ湪浣跨敤婕旂ず鏁版嵁鈥濄€?- Vercel 閰嶇疆 `VITE_SUPABASE_URL` 鍜?`VITE_SUPABASE_ANON_KEY` 鍚庯紝鍓嶇鑷姩杩涘叆 Supabase 姝ｅ紡鏁版嵁妯″紡銆?- 鏈樁娈垫湭鏀逛笟鍔?UI銆佸湴鍥俱€佹潈闄愮郴缁熸垨鏁版嵁搴撲互澶栫殑涓氬姟娴佺▼銆?
## 38. Vercel API 璺敱 NOT_FOUND 淇

鏇存柊鏃堕棿锛?026-05-12銆?
鏈鍙鐞?Vercel 鐢熶骇鐜 `/api` 璺敱缂哄け闂锛屼笉淇敼涓氬姟 UI銆佷笉鏀规暟鎹簱缁撴瀯銆佷笉鏂板涓氬姟鍔熻兘銆?
闂鍒ゆ柇锛?- Vercel 鍓嶇椤甸潰鍙互鎵撳紑锛孲upabase 鍓嶇鐜鍙橀噺宸查厤缃€?- 绾夸笂鍙充笅瑙掓姤閿欎负 `The page could not be found / NOT_FOUND`锛岃鏄庤姹傚懡涓簡涓嶅瓨鍦ㄧ殑 Vercel Serverless Function銆?- 鍏ㄥ眬鎺掓煡 `fetch`銆乣/api/`銆乣worker`銆乣location`銆乣task`銆乣health` 鍚庯紝纭鍓嶇瀹為檯璇锋眰浜嗗涓牴鐩綍 `api/` 涓嬪皻鏈ˉ榻愮殑璺緞銆?
淇鍐呭锛?- 鏂板鎴栬ˉ榻?Vercel Serverless Function锛歚/api/health`銆乣/api/projects`銆乣/api/wall-points`銆乣/api/point-media`銆乣/api/dispatch-tasks`銆乣/api/track-logs`銆乣/api/worker-location`銆乣/api/debug-state`銆乣/api/import-demo`銆乣/api/reset-demo`銆乣/api/complete-point`銆?- 鏂板鍔ㄦ€佽矾鐢憋細`/api/projects/:id`銆乣/api/workers/:id`銆乣/api/workers/:id/enable`銆乣/api/workers/:id/access-token`銆乣/api/workers/:id/heartbeat`銆乣/api/workers/:id/offline`銆乣/api/wall-points/:id`銆乣/api/point-media/:id`銆乣/api/complete-point/:pointId`銆乣/api/worker-tasks/:workerId`銆?- 淇 `/api/worker-tasks` 鍚屾椂鍏煎 `workerId`銆乣worker_id`銆乣worker`銆乣code` 绛夋煡璇㈠弬鏁般€?- `/api/workers` 澧炲姞 POST 鏀寔锛岄伩鍏?API 妯″紡涓嬫柊澧炲笀鍌呮椂鍙瓨鍦?GET 璺敱銆?- `/api/projects` 澧炲姞 GET/POST 鍜屽姩鎬?GET/PUT/PATCH/DELETE锛岄伩鍏嶉」鐩〉鎴栭」鐩垏鎹㈣姹傚湪 Vercel 涓?404銆?
楠岃瘉鍛戒护锛?```bash
node -e "require all api/*.js"
npm run build
```

楠岃瘉缁撴灉锛?- 鎵€鏈夋牴鐩綍 `api/**/*.js` 鏂囦欢鍧囧彲琚?Node 鍔犺浇锛屾湭鍙戠幇鍩虹璇硶鎴栫浉瀵硅矾寰勯敊璇€?- `npm run build` 閫氳繃銆?- 鏋勫缓浠嶆彁绀洪儴鍒?chunk 瓒呰繃 500KB锛岃繖鏄紩鍏?Supabase SDK 鍚庣殑鍖呬綋绉?warning锛屼笉褰卞搷閮ㄧ讲銆?
閮ㄧ讲鍚庝汉宸ュ鏌ワ細
- 閲嶆柊閮ㄧ讲 Vercel 鍚庯紝浼樺厛妫€鏌?`/api/health`銆乣/api/projects`銆乣/api/workers?includeDisabled=true`銆乣/api/wall-points`銆乣/api/worker-location` 涓嶅簲鍐嶈繑鍥?`NOT_FOUND`銆?- 濡傛灉鍚庣画浠嶆姤閿欎絾涓嶆槸 `NOT_FOUND`锛屽簲缁х画妫€鏌?Vercel 鏈嶅姟绔幆澧冨彉閲?`SUPABASE_URL` 鍜?`SUPABASE_SERVICE_ROLE_KEY` 鏄惁閰嶇疆銆?

琛ュ厖楠岃瘉锛?```bash
npm run test:e2e
```

琛ュ厖楠岃瘉缁撴灉锛?- `npm run test:e2e` 閫氳繃锛?1 passed銆?- 鍏朵腑鏈€鍚庝竴鏉￠潤鎬佹柇瑷€宸茶皟鏁翠负妫€鏌?`src/supabaseClient.js` 涓殑 `VITE_SUPABASE_URL` 鍜?`VITE_SUPABASE_ANON_KEY`锛屼笌褰撳墠 Supabase 瀹㈡埛绔皝瑁呬綅缃竴鑷淬€?

琛ュ厖 API 鍥炲綊锛?```bash
npm run test:api
```

琛ュ厖 API 鍥炲綊缁撴灉锛?- `npm run test:api` 閫氳繃銆?- 宸茬‘璁?`/api/health`銆乣/api/dispatch`銆乣/api/worker-tasks/w1`銆乣/api/point-media/:pointId`銆乣/api/worker-location`銆乣/api/debug-state`銆乣/api/complete-point/:pointId` 绛夋棫閾捐矾浠嶅彲鐢ㄣ€?
## 41. 鐐逛綅淇濆瓨姝ｅ紡 API 涓庢暟鎹簱杩炴帴鐘舵€佷慨澶?
鏇存柊鏃堕棿锛?026-05-12 14:37:14 +08:00銆?
鏈缁х画澶勭悊绾夸笂 `/admin/points` 淇濆瓨鐐逛綅澶辫触鍜屽乏涓嬭璇樉绀衡€滄湰鍦版紨绀烘暟鎹€濈殑闂銆?
淇鍐呭锛?
- 鍓嶇鐐逛綅淇濆瓨缁熶竴璋冪敤 `POST /api/wall-points`锛屾柊澧炲拰缂栬緫閮界敱鍚庣鎸?`id` upsert銆?- 鍚庡彴涓绘暟鎹姞杞藉彧鎶?`/api/projects` 鍜?`/api/wall-points` 浣滀负鏍稿績杩炴帴鍒ゆ柇锛沗workers`銆乣dispatch`銆乣media`銆乣track_logs` 浣滀负鍙€夋暟鎹簮锛屽け璐ユ椂杩斿洖绌烘暟缁勶紝涓嶅啀瀵艰嚧鏁寸珯闄嶇骇涓烘湰鍦版紨绀烘暟鎹€?- Supabase 姝ｅ紡妯″紡鍔犺浇鎴愬姛鍚庯紝宸︿笅瑙掓暟鎹簮鏄剧ず涓衡€淪upabase 姝ｅ紡鏁版嵁妯″紡 / 鏁版嵁搴撳凡杩炴帴鈥濄€?- 鍓嶇涓嶅啀鎶婂悗绔敊璇簩娆＄炕璇戞垚鈥滆杩愯 supabase/schema.sql鈥濓紱淇濆瓨澶辫触浼氱洿鎺ュ睍绀哄悗绔繑鍥炵殑閿欒绫诲埆涓庤鎯呫€?- `/api/wall-points` 澧炲姞 Supabase schema cache / 鍙€夊垪缂哄け鐨勯檷绾ч噸璇曪細鍏堝啓瀹屾暣瀛楁锛岃嫢绾夸笂琛ㄧ己灏?`city/tags/completed_at` 绛夊彲閫夊垪锛屽垯鑷姩鏀圭敤鏍稿績瀛楁鍐嶆鍐欏叆銆?
宸叉墽琛岄獙璇侊細

```bash
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?
- `npm run build` 閫氳繃锛涗粎鏈?Vite chunk 浣撶Н warning锛屼笉褰卞搷閮ㄧ讲銆?- `npm run test:e2e` 閫氳繃锛?1/11 passed銆?- 鏈湴 API 鍑芥暟绾ч獙璇侀€氳繃锛氭ā鎷?Supabase schema cache 缂哄垪閿欒鍚庯紝`POST /api/wall-points` 鍙嚜鍔ㄩ檷绾ч噸璇曞苟鍐欏叆 `TEST-001`銆?
绾夸笂澶嶆煡寤鸿锛?
```text
https://repository-name-wall-ad-h5-test.vercel.app/api/projects
https://repository-name-wall-ad-h5-test.vercel.app/api/wall-points
```

鍦?`/admin/points` 鏂板 `TEST-001` 鍚庯紝鍐嶈闂?`/api/wall-points`锛屽簲鑳藉湪 `data` 鏁扮粍鐪嬪埌璇ョ偣浣嶃€?
## 40. 鏂板鐐逛綅鐪熷疄鍐欏叆 Supabase 淇

鏇存柊鏃堕棿锛?026-05-12 12:50:41 +08:00銆?
鏈鍙鐞嗙嚎涓娾€滅偣浣嶇鐞嗘柊澧炵偣浣嶅悗 `/api/wall-points` 浠嶄负绌衡€濈殑闂锛屼笉鏂板涓氬姟鍔熻兘銆佷笉璋冩暣 UI銆?
淇鍐呭锛?
- `api/wall-points.js` 淇濇寔鍗曚釜 Vercel Serverless Function锛屾敮鎸?`GET /api/wall-points` 浠?Supabase `wall_points` 璇诲彇鏁版嵁銆?- `api/wall-points.js` 鏀寔 `POST /api/wall-points` 鍐欏叆鏂板鐐逛綅锛屽苟杩斿洖 `{ ok: true, data: 鏂板鐐逛綅 }`銆?- API 灞傛柊澧炲瓧娈电櫧鍚嶅崟鏄犲皠锛歚point_code/title` 鍐欏叆 `title`锛宍install_captain_*` 鍐欏叆 `captain_*`锛宍wall_team_*` 鍐欏叆 `scout_*`锛岄伩鍏嶅墠绔〃鍗曞瓧娈电洿鎺ユ薄鏌撴暟鎹簱鍒椼€?- 鍓嶇鏂板鐐逛綅鏍囪 `__isNew`锛屼繚瀛樻椂鏄庣‘璧?`POST /api/wall-points`锛涘凡鏈夌偣浣嶇紪杈戠户缁蛋 `PUT /api/wall-points?action=update&id=...`銆?- 鐐逛綅鍒楄〃鍔犺浇鏀逛负鍚屾簮 `GET /api/wall-points`锛屼笉鍐嶅湪 Supabase 妯″紡涓嬬粫杩?Vercel API 鐩磋繛娴忚鍣?Supabase銆?- `鏂板鐐逛綅` 鍜?`淇濆瓨鐐逛綅` 澶辫触鏃朵細缁х画鎶涢敊锛岄伩鍏?API 鍐欏叆澶辫触鏃跺脊绐楀叧闂苟閫犳垚鈥滃亣鎴愬姛鈥濄€?
宸叉墽琛岄獙璇佸懡浠わ細

```bash
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?
- `npm run build` 閫氳繃锛涗粎淇濈暀 Vite chunk 浣撶Н warning锛屼笉褰卞搷閮ㄧ讲銆?- `npm run test:e2e` 閫氳繃锛?1/11 passed銆?
绾夸笂浜哄伐澶嶆煡璺緞锛?
```text
https://repository-name-wall-ad-h5-test.vercel.app/api/wall-points
```

棰勬湡锛氬厛杩斿洖绌烘暟缁勬垨宸叉湁鐐逛綅锛涘湪鍓嶇鏂板 `TEST-001` 鍚庯紝鍐嶈闂鎺ュ彛搴旇兘鍦?`data` 鏁扮粍涓湅鍒?`TEST-001`銆?## 43. `/admin/points` 鏈€缁堟柊鐗堢晫闈㈡浛鎹?
鏇存柊鏃堕棿锛?026-05-12 16:18:13 +08:00銆?
鏈灏?`/admin/points` 浠庤繃娓＄増缁撴瀯鏇挎崲涓烘渶缁堢‘璁ょ増鐐逛綅绠＄悊鐣岄潰锛屼繚鐣欑幇鏈?Supabase 鐪熷疄鏁版嵁璇诲啓銆?
瀹屾垚鍐呭锛?
- `/admin/points` 鐪熷疄鍏ュ彛浠嶄负 [src/App.jsx](/C:/Users/wangs/Desktop/wall_ad_h5_test/src/App.jsx:192) -> [src/pages/PointsPage.jsx](/C:/Users/wangs/Desktop/wall_ad_h5_test/src/pages/PointsPage.jsx)銆?- 宸茬‘璁ら」鐩唴涓嶅瓨鍦ㄧ浜屼釜瀹為檯鐢熸晥鐨?`PointsPage` 鎴?`PointManagement` 椤甸潰涓庝箣骞惰寮曠敤銆?- 杩囨浮鐗堥〉闈腑鐨勨€滄墽琛屽彴璐︿腑蹇冣€濃€滅瓫閫変笌鎵归噺鎿嶄綔鈥濃€滅偣浣嶆竻鍗曗€濈瓑缁撴瀯鍜屾枃妗堝凡浠?`/admin/points` 鐪熷疄鍏ュ彛绉婚櫎銆?- 鐐逛綅绠＄悊椤典繚鐣欑湡瀹?Supabase 鏁版嵁璇诲彇銆佹柊澧炵偣浣嶄繚瀛樸€佺偣浣嶈〃鏍肩湡瀹炲睍绀恒€佽鎯呮娊灞夈€佹淳鍗曘€佺礌鏉愩€侀獙鏀躲€佸垹闄ょ瓑鐜版湁琛屼负銆?- 鍓嶇瀛楁 fallback 缁х画鍏煎 `point_code/title/name`銆乣detail_address/address`銆乣longitude/lng`銆乣latitude/lat`銆乣captain_* / install_captain_*`銆乣scout_* / wall_team_*`銆?
宸叉墽琛岄獙璇侊細

```bash
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?
- `npm run build` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛?1/11 passed銆?
## 44. `/admin/points` 姝ｅ紡鏂扮増鐐逛綅绠＄悊椤甸潰瀹氱

鏇存柊鏃堕棿锛?026-05-12銆?
鏈鍙慨澶嶇嚎涓?`/admin/points` 鐨勫疄闄呮覆鏌撻〉闈紝涓嶆敼鏁版嵁搴撶粨鏋勩€佷笉鏀?Supabase schema銆佷笉鏀?`/api/wall-points` 鐨勭湡瀹炴暟鎹鍐欓摼璺€?
璺敱涓庡叆鍙ｇ‘璁わ細

- `index.html` 鐩存帴鍔犺浇 `src/App.jsx`銆?- `src/App.jsx` 涓?`/admin/points` 鐨勭湡瀹為〉闈㈠叆鍙ｄ粛鐒舵槸 `src/pages/PointsPage.jsx`銆?- 鐐逛綅琛ㄦ牸瀹為檯鐢?`src/components/points/PointsTable.jsx` 娓叉煋銆?- 椤堕儴鍚庡彴澶撮儴瀹為檯鐢?`src/components/layout/Header.jsx` 娓叉煋锛屽苟鍦?points 椤靛垏鎹负涓撶敤 `Point Center` 鏂囨銆?
鏈淇敼鏂囦欢锛?
- `src/pages/PointsPage.jsx`
- `src/components/points/PointsTable.jsx`
- `src/components/layout/Header.jsx`
- `src/styles.css`
- `tests/e2e/app.spec.js`
- `TEST_REPORT.md`

椤甸潰缁撴瀯璋冩暣缁撴灉锛?
- 椤堕儴宸叉敼涓?`绠＄悊鍚庡彴 / Point Center` + `鐐逛綅绠＄悊`銆?- 宸︿晶瀵艰埅涓殑鐐逛綅鑻辨枃鏍囩涔熷凡鍚屾涓?`Point Center`锛岄伩鍏嶇嚎涓婇〉闈㈢户缁嚭鐜版棫鐗?`Point Management`銆?- 鍙充晶宸蹭繚鐣?`鏍囩绠＄悊`銆乣鎵归噺瀵煎叆`銆乣鏂板鐐逛綅`銆?- 椤甸潰涓讳綋椤哄簭宸茶皟鏁翠负 `header` -> `pointToolbar` -> `pointBatchBar` -> `pointTableWrap`銆?- `pointToolbar` 宸插寘鍚細鎼滅储妗嗐€乣鍏ㄩ儴鐘舵€乣銆乣寮傚父绛涢€塦銆乣鎵归噺鎵撴爣绛綻銆乣鎵归噺绉婚櫎鏍囩`銆乣瀵煎叆妯℃澘`銆?- `pointBatchBar` 鏈€変腑鏃舵樉绀?`鐐瑰嚮浠绘剰鐐逛綅琛屽嵆鍙閫塦锛岄€変腑鍚庢樉绀?`宸查€?X 涓偣浣峘锛屽苟鏄剧ず鎵归噺鎸夐挳銆?- `pointTableWrap` 琛ㄥご宸茶皟鏁翠负锛氶€夋嫨妗嗐€佺偣浣嶇紪鍙枫€侀」鐩?/ 鏍囩銆佸湴鍧€銆佸笀鍌?/ 闃熶紞銆佺姸鎬併€佺礌鏉愭儏鍐点€佹渶杩戞洿鏂般€佹搷浣溿€?- 椤甸潰宸蹭笉鍐嶆覆鏌撴棫鐗堢偣浣嶉〉涓殑鑻辨枃澶ф爣棰樸€侀《閮ㄥぇ缁熻鍗＄墖鍜屸€滅偣浣嶇瓫閫夆€濆ぇ鍖哄煙銆?
鏁版嵁閾捐矾纭锛?
- 鐐逛綅鍒楄〃浠嶉€氳繃 `GET /api/wall-points` 璇诲彇鐪熷疄鏁版嵁銆?- 鏂板/缂栬緫鐐逛綅浠嶉€氳繃鐜版湁 `saveWallPoint()` -> `POST /api/wall-points` 淇濆瓨銆?- 鏈敼鍥炴湰鍦伴潤鎬佸亣鏁版嵁锛屼篃鏈牬鍧忕幇鏈夋柊澧炵偣浣嶄繚瀛樿兘鍔涖€?
鏈楠岃瘉鍛戒护锛?
```bash
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?
## 42. `/admin/points` 绗簩鐗堟柊鐗堢晫闈㈠崌绾?
鏇存柊鏃堕棿锛?026-05-12 15:41:14 +08:00銆?
鏈鍙崌绾х偣浣嶇鐞嗛〉锛屼笉鏀瑰姩 `/api/wall-points` Supabase 璇诲啓涓婚摼璺€?
瀹屾垚鍐呭锛?
- `/admin/points` 鍗囩骇涓虹浜岀増姝ｅ紡涓氬姟鐣岄潰锛氭柊澧為《閮ㄧ偣浣嶆瑙堛€佺揣鍑戠瓫閫夊尯銆佹寮忚〃鏍煎３灞傚拰鏂扮増璇︽儏鎶藉眽銆?- 鐐逛綅琛ㄦ牸缁х画淇濈暀鏌ョ湅銆佺紪杈戙€佺幇鍦烘煡鐪嬨€佹淳鍗曘€佺礌鏉愩€侀獙鏀躲€佸垹闄ゅ叆鍙ｃ€?- 鍓嶇灞曠ず鍏煎 `point_code/title/name`銆乣detail_address/address`銆乣longitude/lng`銆乣latitude/lat`銆乣captain_* / install_captain_*`銆乣scout_* / wall_team_*` 绛夊瓧娈点€?- 鏂板鐐逛綅寮圭獥浠嶄娇鐢ㄧ幇鏈変繚瀛樻祦绋嬶紝缁х画鍐欏叆 Supabase锛涙湰娆℃湭淇敼鏁版嵁搴?API 鍐欏叆閫昏緫銆?- 琛ㄦ牸缁х画鏄剧ず椤圭洰銆佸湴鍧€銆並鐮併€佺姸鎬併€佹埧涓溿€佸綋鍓嶅笀鍌呫€佺礌鏉愬畬鎴愩€佺己澶辩礌鏉愩€佸彲楠屾敹銆佹柦宸ラ槦闀裤€佹壘澧欓槦浼嶃€佹渶杩戞洿鏂版椂闂淬€佸紓甯哥姸鎬佸拰鎿嶄綔鎸夐挳銆?
宸叉墽琛岄獙璇侊細

```bash
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?
- `npm run build` 閫氳繃锛涗粎鏈?Vite chunk 浣撶Н warning锛屼笉褰卞搷閮ㄧ讲銆?- `npm run test:e2e` 閫氳繃锛?1/11 passed銆?
## 49. `/admin/points` 鎸夊弬鑰冪鏀跺彛鏂扮増鐐逛綅绠＄悊瀹炵幇

鏇存柊鏃堕棿锛?026-05-13銆?
鏈涓ユ牸鍙慨鏀圭偣浣嶇鐞嗘牳蹇冩枃浠讹細

- `src/pages/PointsPage.jsx`
- `src/components/points/PointsTable.jsx`
- `src/components/points/PointDetailDrawer.jsx`
- `src/components/points/PointFilters.jsx`
- `src/styles.css`

鏈澶勭悊缁撴灉锛?
- `PointsPage` 鐜板湪姝ｅ紡浣跨敤 `PointFilters` 缁勪欢锛屼笉鍐嶅湪椤甸潰閲屾墜鍐欐棫绛涢€夋潯銆?- `PointsTable` 琛屾搷浣滄敼涓哄弬鑰冪缁撴瀯锛?  - 琛屽唴鍙樉绀?`鏌ョ湅 / 缂栬緫 / 鏇村`
  - `鏇村` 鑿滃崟涓墠鏄剧ず `鐜板満鏌ョ湅 / 娲惧崟 / 绱犳潗 / 楠屾敹 / 鍒犻櫎`
- `PointDetailDrawer` 铏戒繚鐣欏師鏂囦欢鍚嶏紝浣嗗疄鐜板凡缁忔槸灞呬腑澶у脊绐楋紝鏍峰紡闈犺繎鍙傝€冪 `detailModal`锛屼笉鍐嶄娇鐢ㄥ彸渚у崐灞?Drawer銆?- 鍦板潃鍒楃涓€琛屾樉绀哄湴鍧€锛岀浜岃鏄剧ず `K鐮侊細xxx`銆?- 鐐逛綅缂栧彿鍙樉绀哄湪鈥滅偣浣嶇紪鍙封€濆垪锛屼笉鍐嶆樉绀哄埌鍦板潃涓嬮潰銆?
瀛楁鏄剧ず纭锛?
- 鐐逛綅缂栧彿鍒楋細鍙樉绀虹偣浣嶇紪鍙枫€?- 鍦板潃鍒楋細绗竴琛屽湴鍧€锛岀浜岃 `K鐮侊細...`銆?- K鐮?鍏煎璇诲彇 `kCode / k_code / kcode / code_k` 瀵瑰簲鐨勭幇鏈夊瓧娈垫槧灏勭粨鏋滐紱鏃犲€兼椂鏄剧ず `鏈櫥璁癭銆?
鏈楠岃瘉鍛戒护锛?
```bash
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?
鐢熶骇鐜 `/admin/points` 瀹為檯妫€鏌ョ粨鏋滐細

1. 鏄惁杩樺瓨鍦ㄥ彸渚?Drawer锛氬惁
2. 鐐瑰嚮鏌ョ湅鏄惁涓哄眳涓ぇ寮圭獥锛氭槸
3. 鍦板潃涓嬮潰鏄惁鏄剧ず K鐮侊細鏄?4. 鐐逛綅缂栧彿鏄惁鍙湪鐐逛綅缂栧彿鍒楁樉绀猴細鏄?5. 琛屾搷浣滄槸鍚﹀凡缁忎笉鏄棫鐗堣兌鍥婃寜閽細鏄?6. `/api/wall-points` 鏄惁浠嶈繑鍥炵湡瀹炴暟鎹細鏄?
绾夸笂鎺ュ彛澶嶆煡锛?
- `https://repository-name-wall-ad-h5-test.vercel.app/api/wall-points`
- 杩斿洖锛歚ok = true`锛宍dataCount = 3`

绾夸笂寮圭獥涓庡垪琛ㄥ疄娴嬭ˉ鍏咃細

- 鍒濆杩涘叆 `/admin/points`锛?  - `pointTableWrapCount = 1`
  - `drawerCount = 0`
  - `modalCount = 0`
  - 琛屽唴鎿嶄綔鎸夐挳鏁伴噺锛?    - `鏌ョ湅 = 3`
    - `缂栬緫 = 3`
    - `鏇村 = 3`
- 鐐瑰嚮棣栬 `鏌ョ湅` 鍚庯細
  - `modalCount = 1`
  - `drawerCount = 0`
  - `pointTableWrapCount = 1`
  - 寮圭獥鍐呭寘鍚?`K鐮乣
- 鍏抽棴寮圭獥鍚庯細
  - `modalCount = 0`
  - `drawerCount = 0`
  - `pointTableWrapCount = 1`

## 50. `/admin/points` 璇︽儏寮圭獥灏哄涓庢粴鍔ㄤ慨澶?
鏇存柊鏃堕棿锛?026-05-13銆?
鏈鍙户缁慨澶嶇偣浣嶈鎯呭脊绐楃殑灏哄銆佸畾浣嶅拰婊氬姩锛屼笉鏀瑰垪琛ㄩ〉銆佹帴鍙ｅ拰鏁版嵁閫昏緫銆?
鏈淇敼鏂囦欢锛?
- `src/components/points/PointDetailDrawer.jsx`
- `src/styles.css`

鏈澶勭悊鍐呭锛?
- 鐐逛綅璇︽儏涓嶅啀渚濊禆閫氱敤 `.modal-card` 灏哄锛岃€屾槸鐙珛浣跨敤锛?  - `detailOverlay`
  - `detailOverlayScrim`
  - `detailModal`
  - `detailModalBody`
- 寮圭獥灞傛敼涓猴細
  - `position: fixed`
  - `inset: 0`
  - 灞呬腑鏄剧ず
  - 鑳屾櫙閬僵 + 妯＄硦
  - `overflow: hidden`
- 寮圭獥鏈綋鏀逛负锛?  - `width: min(1180px, calc(100vw - 360px))`
  - `min-width: 960px`
  - `height: calc(100vh - 72px)`
  - `max-height: calc(100vh - 72px)`
  - `overflow: hidden`
  - 澶撮儴鍥哄畾锛屽唴瀹瑰尯鍗曠嫭婊氬姩
- 鍐呭鍖烘敼涓猴細
  - `overflow-y: auto`
  - `overflow-x: hidden`
  - 鍚勪富鍖哄潡 `min-width: 0`
  - `detailLayout / detailMain / detailInfo` 浣跨敤 `min-height: 0`
- 灏忓睆骞曚笅锛?  - `detailOverlay` 鏀逛负 12px padding
  - `detailModal` 鏀逛负 `calc(100vw - 24px)`
  - `detailLayout` 鑷姩鍒囨垚鍗曞垪

鏈楠岃瘉鍛戒护锛?
```bash
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?
绾夸笂 `/admin/points` 瀹炴祴缁撴灉锛?
- 鍒濆杩涘叆椤甸潰锛?  - `pointTableWrapCount = 1`
  - `drawerCount = 0`
  - `detailModalCount = 0`
- 鐐瑰嚮棣栬 `鏌ョ湅` 鍚庯細
  - `detailOverlayCount = 1`
  - `detailModalCount = 1`
  - `drawerCount = 0`
  - `pointTableWrapCount = 1`
  - 寮圭獥鍐呭彲瑙侊細`鐐逛綅缂栧彿`銆乣K鐮乣銆乣椤圭洰`銆乣绱犳潗姒傝/绱犳潗瀹屾垚搴
- 鍏抽棴鍚庯細
  - `detailModalCount = 0`
  - `drawerCount = 0`
  - `pointTableWrapCount = 1`
- `/api/wall-points` 绾夸笂杩斿洖锛?  - `ok = true`
  - `dataCount = 3`

鏈疆缁撹锛?
1. 鐐逛綅璇︽儏寮圭獥楂樺害宸叉敼涓哄噯鍏ㄥ睆锛氭槸
2. 寮圭獥搴曢儴涓嶅啀鍑虹幇澶х墖閬僵鐣欑櫧锛氭槸
3. 寮圭獥 header 涓嶈瑁佸垏锛氭槸
4. 鍐呭鍖哄唴閮ㄦ粴鍔紝鑳屾櫙椤甸潰涓嶆粴鍔細鏄?5. 鏃犳í鍚戞粴鍔ㄦ潯锛氭槸

## 51. `/admin/points` 璇︽儏寮圭獥鏀逛负 createPortal 鍏ㄥ眬鎸傝浇

鏇存柊鏃堕棿锛?026-05-13銆?
鏈鍙鐞嗙偣浣嶈鎯呭脊绐楁寕杞藉眰绾т笌鍏ㄥ睆閬僵闂銆?
鏈鐪熷疄浠ｇ爜鏀瑰姩锛?
- `src/components/points/PointDetailDrawer.jsx`
- `src/styles.css`

浠ｇ爜灞傜‘璁わ細

- `PointDetailDrawer` 宸插紩鍏ワ細
  - `import { createPortal } from "react-dom";`
- 缁勪欢涓嶅啀鐩存帴鍦?`PointsPage` 鍐呴儴 return overlay銆?- 褰撳墠瀹炵幇涓猴細
  - 鍏堟瀯閫?`const modal = (...)`
  - 鍐?`return createPortal(modal, document.body);`
- 鍥犳 `detailOverlay` 宸茬湡姝ｆ寕杞藉埌 `document.body`锛屼笉鍐嶇暀鍦?`points-page / page-fade / enterprise-main` 鍐呴儴銆?
鏈鏍峰紡纭锛?
- `detailOverlay` 宸叉敼涓虹湡姝ｅ叏灞忥細
  - `position: fixed`
  - `inset: 0`
  - `z-index: 9999`
  - `width: 100vw`
  - `height: 100vh`
  - `overflow: hidden`
- `pointDetailModal` 宸叉敼涓猴細
  - `width: min(1280px, calc(100vw - 48px))`
  - `height: calc(100vh - 48px)`
  - `max-height: calc(100vh - 48px)`
  - `display: grid`
  - `grid-template-rows: auto minmax(0, 1fr)`
- `pointDetailModalBody / pointDetailLayout / pointDetailMain` 宸茶皟鏁翠负鐪熸鎾戞弧鍓╀綑楂樺害骞跺唴閮ㄦ粴鍔ㄣ€?
鏈楠岃瘉鍛戒护锛?
```bash
git show --name-only --oneline -1
grep -n "createPortal" src/components/points/PointDetailDrawer.jsx
npm run build
npm run test:e2e
```

楠岃瘉缁撴灉锛?
- `grep -n "createPortal" src/components/points/PointDetailDrawer.jsx` 宸茶兘鐪嬪埌锛?  - `import { createPortal } from "react-dom";`
  - `return createPortal(modal, document.body);`
- `npm run build`锛氶€氳繃銆?- `npm run test:e2e`锛氶€氳繃锛?1 passed銆?
## 52. 全后台新版界面统一收口与最终验收

更新时间：2026-05-14。

本轮继续收口后台 8 个页面的新版 enterprise 结构，并完成最后一轮 e2e 全绿验证。

修改文件：

- `src/pages/DashboardPage.jsx`
- `src/pages/MapConsolePage.jsx`
- `src/pages/WorkersPage.jsx`
- `src/pages/DispatchPage.jsx`
- `src/pages/ProjectsPage.jsx`
- `src/pages/MediaPage.jsx`
- `src/pages/SystemHealthPage.jsx`
- `src/components/map/MapToolbar.jsx`
- `src/components/map/MapSidebar.jsx`
- `src/components/shared/Modal.jsx`
- `src/components/shared/Drawer.jsx`（已删除）
- `src/components/workers/WorkerDetailPanel.jsx`
- `src/components/workers/WorkerFormDrawer.jsx`
- `src/styles.css`

最终验证命令：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build`：通过。
- `npm run test:e2e`：通过，11/11 passed。

逐页 DOM 检查结果（本地浏览器实际打开）：

- `/admin`
  - `enterprise-page`：是
  - `enterprise-card / enterprise-kpi-grid / enterprise-toolbar / enterprise-list-row`：是
  - 旧布局 `dashboard-grid / panel-card`：DOM 中仅历史样式残留，不再作为页面主体结构使用
- `/admin/map`
  - `enterprise-page`：是
  - `enterprise-card / enterprise-kpi-grid / enterprise-toolbar`：是
  - 旧布局 `map-console-layout / map-side-panel`：DOM 中保留兼容类，主体已切换到新版企业卡片
- `/admin/points`
  - `enterprise-page / pointTableWrap / enterprise-table / pointToolbar / pointBatchBar`：是
  - 旧布局：否
- `/admin/workers`
  - `enterprise-page / enterprise-card / enterprise-kpi-grid / enterprise-toolbar / enterprise-table`：是
  - 旧布局 `worker-management-layout / worker-detail-panel`：DOM 中保留兼容类，主体已切换到新版企业卡片
- `/admin/dispatch`
  - `enterprise-page / enterprise-card / enterprise-kpi-grid / enterprise-toolbar`：是
  - 旧布局 `dispatch-workflow`：DOM 中保留兼容类，主体已切换到新版企业卡片
- `/admin/projects`
  - `enterprise-page / enterprise-card / enterprise-kpi-grid / enterprise-toolbar`：是
  - 旧布局：否
- `/admin/media`
  - `enterprise-page / enterprise-card / enterprise-kpi-grid / enterprise-toolbar`：是
  - 旧布局：否
- `/admin/system`
  - `enterprise-page / enterprise-card / enterprise-kpi-grid`：是
  - 旧布局 `system-grid / health-grid`：主体已切换到新版企业卡片

点位详情弹窗最终验证：

- `PointDetailDrawer` 已通过 `createPortal` 挂载到 `document.body`。
- `detailOverlay` 为真正全屏遮罩。
- `pointDetailModal` 高度接近全屏，内部滚动正常。
- 页面背景不跟随滚动。
- 无横向滚动条。

线上 `/admin/points` 最终确认：

1. 是否还存在右侧 Drawer：否
2. 点击查看是否为居中大弹窗：是
3. 地址下面是否显示 K码：是
4. 点位编号是否只在点位编号列显示：是
5. 行操作是否已经不是旧版胶囊按钮：是
6. `/api/wall-points` 是否仍返回真实数据：是

## 53. 后台全页面统一收口优化

更新时间：2026-05-14。

本轮在现有新版框架基础上，继续统一收口 `/admin/map`、`/admin/workers`、`/admin/dispatch`、`/admin/projects`、`/admin/media`、`/admin/system` 等后台页面的布局密度、卡片高度、筛选栏和空状态。点位管理与详情弹窗的 portal / 全屏遮罩逻辑保持不变。

修改文件：

- `src/components/layout/AdminLayout.jsx`
- `src/components/layout/Header.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/map/MapToolbar.jsx`
- `src/components/map/MapSidebar.jsx`
- `src/components/shared/Modal.jsx`
- `src/components/workers/WorkerDetailPanel.jsx`
- `src/components/workers/WorkerFormDrawer.jsx`
- `src/pages/DashboardPage.jsx`
- `src/pages/MapConsolePage.jsx`
- `src/pages/WorkersPage.jsx`
- `src/pages/DispatchPage.jsx`
- `src/pages/ProjectsPage.jsx`
- `src/pages/MediaPage.jsx`
- `src/pages/SystemHealthPage.jsx`
- `src/styles.css`
- `src/components/shared/Drawer.jsx`（已删除）

已修复的问题：

1. 地图调度页中间地图被压到底部、上方空白过大；
2. 师傅管理页详情和列表布局不平衡；
3. 素材管理页无素材时只剩空白感，已补正式空状态；
4. 项目管理页左右栏比例更紧凑；
5. 系统状态页与其他页面的卡片密度统一；
6. 全局头部、侧边栏、统计卡片和筛选栏间距统一。

页面检查结果（本地浏览器实际查看）：

- `/admin/map`
  - 已恢复左中右三栏，地图为中间主视觉。
  - 仍保留兼容类名 `map-console-layout / map-side-panel`，但主体已切换到新版企业卡片。
- `/admin/points`
  - 继续保持新版点位管理与全屏详情弹窗。
- `/admin/workers`
  - 列表与详情区域更紧凑，主内容不再显得空。
- `/admin/dispatch`
  - 派单中心保持三栏工作台，按钮与校验区更稳定。
- `/admin/projects`
  - 项目列表与项目编辑更平衡，不再大面积留白。
- `/admin/media`
  - 为空时显示正式空状态，不再是纯空白页。
- `/admin/system`
  - 与其他页面保持统一的企业级卡片风格。

验证命令：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build`：通过。
- `npm run test:e2e`：通过，11/11 passed。

## 54. `/admin/map` 地图主视觉布局恢复

更新时间：2026-05-14。

本轮只修复地图调度页，不改动 `/admin/points`、`/admin/workers`、`/admin/dispatch`、`/admin/projects`、`/admin/media`、`/admin/system` 的业务逻辑。

本次改动文件：

- `src/pages/MapConsolePage.jsx`
- `src/components/map/MapSidebar.jsx`
- `src/styles.css`

本次修复结果：

- 已恢复 `/admin/map` 的地图主视觉布局。
- 地图不再被压缩到右侧小卡片。
- 页面主体恢复为三栏指挥台结构：
  - 左侧：调度队列 / 待处理点位
  - 中间：大地图画布（主视觉）
  - 右侧：当前点位详情 / 师傅状态 / 调度辅助
- 中间地图区域在 1600/1920 宽屏下重新成为最大模块。
- 兼容类名 `map-console-layout` 已保留，避免旧测试和旧 DOM 查询失效。
- 右侧详情和左侧队列继续保留内部滚动，不再挤压地图主区域。

本地可视检查：

- 中间地图卡片宽度恢复为三栏中最大区域；
- 本地量测结果：三栏宽度约为 `280 / 664 / 320`，地图画布宽度约 `630px`，高度约 `680px`；
- 地图已不再表现为“右侧辅助小卡片”。

验证命令：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build`：通过。
- `npm run test:e2e`：通过，11/11 passed。

## 55. `/admin/map` 真实地图迁移到中间主画布

更新时间：2026-05-14。

本次不是修右侧小地图，而是把真实地图容器迁移到中间主画布，恢复左队列 + 中地图 + 右详情的调度指挥台布局。

本次修改文件：

- `src/pages/MapConsolePage.jsx`
- `src/styles.css`
- `tests/e2e/app.spec.js`
- `TEST_REPORT.md`

本次处理结果：

- 已删除右侧小地图作为主地图的布局路径。
- 真实地图组件 `AmapView` 已迁移到中间 `mapCanvasPanel` / `mapCanvasMain` 主画布区域。
- 右侧仅保留点位详情、师傅状态、素材情况、调度建议等辅助内容。
- 左侧为调度队列、状态分布和待处理点位列表。
- 中间主地图容器已增加 `data-testid="map-main-canvas"`，用于 E2E 量测。

地图主视觉验证：

- 三栏宽度实测约为：
  - 左栏 `320px`
  - 中栏 `720px`
  - 右栏 `360px`
- `map-main-canvas` 容器量测：
  - 宽度大于 `700px`
  - 高度大于 `520px`
- 右侧详情面板内不存在 `[data-testid="map-main-canvas"]`。

验证命令：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build`：通过。
- `npm run test:e2e`：通过，11/11 passed。
## 最终检查结果

本次清理范围：

- 全后台顶部页头只保留中文主标题，已删除 `管理后台 / Operations`、`管理后台 / Map Console`、`管理后台 / Point Center`、`管理后台 / Worker Management`、`管理后台 / Dispatch Center`、`管理后台 / Project Management`、`管理后台 / Media Center`、`管理后台 / System Health` 等英文副标题渲染。
- 左侧深色 Sidebar 保持中文菜单，不再渲染英文小字。
- `/admin/map` 保持左侧待处理点位、中间地图、右侧详情三栏结构；未恢复顶部 KPI 大卡片，`.mapKpiStrip`、`.mapCompactStats`、`.mapTopStats`、`.statCard` 均未出现。
- `/admin/map` 左侧 `mapQueueSummary` 已压缩为 3 列 x 2 行小统计 chips，实测高度约 `53px`。
- 中间地图右上角 `.mapCanvasChips` 保持小尺寸，实测约 `230px x 28px`。
- `MapSidebar.jsx` 中“当前筛选点位”已改为“筛选结果”，避免与旧顶部 KPI 文案混淆。
- `tests/e2e/app.spec.js` 已改为按中文导航按钮查找，并移除对 `管理后台 / Point Center` 等英文副标题的断言。
- 检查 `api/debug-dispatch.js`、`api/debug-network.js`：当前仓库中不存在这两个 debug API 文件，无需删除；未发现相关引用。
- 已删除报告末尾旧的 map 布局乱码段落，并用 UTF-8 重写本节最终检查结果。

真实浏览器验证：

- 验证地址：`http://127.0.0.1:5187/admin/map?final-check=20260514`
- 截图路径：`tests/results/admin-map-final-check.png`
- 可见英文副标题命中：`[]`
- DEBUG 文案：不存在。
- 顶部大 KPI 容器数量：`0`
- `document.body.innerText.includes("当前筛选点位")`：`false`
- 地图画布 `[data-testid="map-main-canvas"]`：约 `972px x 754px`
- 三栏主体 `.mapDispatchLayout`：约 `1616px x 754px`

验证命令：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build`：通过；仍有既有 Vite chunk size warning，不影响本次收尾。
- `npm run test:e2e`：通过，11/11 passed。
- 失败项：无。

修改文件列表：

- `src/components/layout/Header.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/map/MapSidebar.jsx`
- `src/lib/domain.js`
- `src/pages/DashboardPage.jsx`
- `src/pages/DispatchPage.jsx`
- `src/pages/MapConsolePage.jsx`
- `src/pages/MediaPage.jsx`
- `src/pages/ProjectsPage.jsx`
- `src/pages/SystemHealthPage.jsx`
- `src/pages/WorkersPage.jsx`
- `src/styles.css`
- `tests/e2e/app.spec.js`
- `tests/results/admin-map-final-check.png`
- `TEST_REPORT.md`
- `AGENTS.md`（codex-agent-mem 生成上下文更新）

## 56. `wall.hc12345.com` 正式部署链路配置

更新时间：2026-05-14。

本次目标是把正式域名、Nginx、HTTPS、后端接口、数据库、上传目录和师傅端链接的上线配置串成一套可执行方案。当前无法在本机直接操作公网服务器的 Nginx、Certbot 和 PM2，但仓库已补齐可复制到服务器执行的正式配置。

本次新增或修改：

- 新增 `ecosystem.config.cjs`：PM2 固定以 `/var/www/wall-ad-system` 为工作目录，`PUBLIC_APP_ORIGIN`、`APP_ORIGIN`、`CORS_ORIGIN` 和 `VITE_PUBLIC_APP_ORIGIN` 均固定为 `https://wall.hc12345.com`。
- 新增 `deploy/nginx/wall.hc12345.com.conf`：正式域名最终 HTTPS Nginx 配置，`/api/` 经同域反代进入 PM2 后端，`/uploads/` 指向 `/var/www/wall-ad-system/server/uploads/`，`/worker/tk_...` 和 `/admin` 通过 SPA fallback 回到 `index.html`。
- 新增 `deploy/nginx/wall.hc12345.com.bootstrap.conf`：首次签发证书前使用的 HTTP 引导配置。
- 新增 `deploy/env.production.wall.hc12345.com.example`：正式域名环境变量模板，不包含真实 Key。
- 新增 `scripts/production-health-check.mjs`：公网验收脚本，检查 HTTPS 域名、后台 SPA、师傅端 SPA、`/api/health` 和 `/api/debug-state`。
- 更新 `package.json`：新增 `npm run test:supabase` 和 `npm run test:prod`。
- 更新 `DEPLOY_PRODUCTION.md`：补充 `wall.hc12345.com` 的目录、端口、Nginx、HTTPS、数据库、上传目录、PM2 和验收步骤。

正式链路约定：

- 正式域名：`https://wall.hc12345.com`
- 项目目录：`/var/www/wall-ad-system`
- 前端构建产物：`/var/www/wall-ad-system/dist`
- 后端接口：公网统一经 `https://wall.hc12345.com/api/...` 访问，前端生产请求使用相对路径 `/api/...`。
- 当前业务数据库：`/var/www/wall-ad-system/server/data/db.json`
- 上传目录：`/var/www/wall-ad-system/server/uploads/`
- 师傅端链接格式：`https://wall.hc12345.com/worker/tk_XXXXXXXXXXXX`

验证命令：

```bash
npm run build
npm run test:api
npm run test:e2e
node -c ecosystem.config.cjs
node --check scripts/production-health-check.mjs
```

验证结果：

- `npm run build`：通过；仍有既有 Vite chunk size warning，不影响本次部署配置。
- `npm run test:api`：通过，确认 health、派单、worker-tasks、上传、定位、debug-state、complete-point 等本地后端链路可用。
- `npm run test:e2e`：通过，11/11 passed。
- `node -c ecosystem.config.cjs`：通过。
- `node --check scripts/production-health-check.mjs`：通过。
- `npm run test:supabase`：本次未执行；本轮未修改 Supabase 表、Storage 或真实 Supabase 读写逻辑。服务器正式配置 Supabase 时可单独执行该命令，脚本不会打印真实 Key。

仍需在公网服务器人工执行：

- 首次签发证书前先启用 `deploy/nginx/wall.hc12345.com.bootstrap.conf`。
- 执行 `sudo certbot --nginx -d wall.hc12345.com` 签发 HTTPS 证书。
- 证书生成后再启用 `deploy/nginx/wall.hc12345.com.conf` 作为最终 HTTPS 配置。
- 在服务器项目根目录创建真实 `.env.production`，配置高德 Key 和正式域名变量。
- 执行 `npm run build` 后用 `pm2 start ecosystem.config.cjs` 启动后端。
- 执行 `npm run test:prod` 做公网链路验收。

## 57. 正式域名生产配置统一收口

更新时间：2026-05-14。

本次目标是把生产环境所有对外 origin 统一为 `https://wall.hc12345.com`，并明确前端生产请求走同域相对路径 `/api/...`。

本次新增或修改：

- `server/index.js`：后端 health 和 CORS 支持 `PUBLIC_APP_ORIGIN`、`APP_ORIGIN`、`CORS_ORIGIN`，生产服务端允许 origin 统一由正式域名配置控制。
- `.env.example`、`deploy/env.production.wall.hc12345.com.example`、`ecosystem.config.cjs`：统一写入 `https://wall.hc12345.com`，补齐 `APP_ORIGIN` 和 `CORS_ORIGIN`。
- `deploy/nginx/wall.hc12345.com.conf`：改为最终 HTTPS 配置，证书路径使用 `wall.hc12345.com`，HTTP 自动跳转 HTTPS。
- `deploy/nginx/wall.hc12345.com.bootstrap.conf`：新增首次签发证书前的 HTTP 引导配置。
- `README.md`、`DEPLOY.md`、`DEPLOY_PRODUCTION.md`：生产说明统一为 `https://wall.hc12345.com/`，后台、师傅端、API、上传文件均使用正式公网链接。
- `TEST_REPORT.md`：记录本轮生产配置统一、验证命令和服务器剩余人工步骤。

验证命令：

```bash
node --check server/index.js
node -c ecosystem.config.cjs
node --check scripts/production-health-check.mjs
npm run build
npm run test:api
npm run test:e2e
```

验证结果：

- `node --check server/index.js`：通过。
- `node -c ecosystem.config.cjs`：通过。
- `node --check scripts/production-health-check.mjs`：通过。
- `npm run build`：通过；仍有既有 Vite chunk size warning。
- `npm run test:api`：通过。
- `npm run test:e2e`：通过，11/11 passed。
- `npm run test:supabase`：本轮未执行；没有修改 Supabase 表结构、Storage 桶规则或真实 Supabase 读写逻辑。

备注：

- `npm run test:api` 和 `npm run test:e2e` 写动过 `server/data/db.json` 的测试时间戳，已还原，最终没有保留测试数据变更。
- 公网服务器仍需实际执行 DNS、Nginx、Certbot、PM2 和 `npm run test:prod` 验收。

## 58. 正式后台身份验证、注册与账号审核

更新时间：2026-05-14。

本次目标是为正式生产域名 `https://wall.hc12345.com/` 增加真实后台登录、注册、超级管理员初始化、角色权限和账号审核机制，同时确保师傅端 token 链接不被后台登录拦截。

本次新增或修改：

- `server/index.js`：新增用户表规范、bcrypt 密码 hash、`.env.production` 读取、初始 `super_admin` 自动创建、httpOnly cookie 会话、`/api/auth/*`、`/api/users/*`、`requireAuth` 和角色权限控制。
- `server/test-api.js`：新增认证回归，覆盖未登录 401、注册 pending、pending/disabled 登录限制、super_admin 审核、退出后重新登录、师傅 token API。
- `src/App.jsx`、`src/pages/LoginPage.jsx`、`src/pages/RegisterPage.jsx`、`src/pages/AccountsPage.jsx`：新增登录页、注册页、账号管理页和后台 AuthGuard。
- `src/apiClient.js`：新增 auth/users API，所有 fetch 使用同源 cookie，并将生产 API 请求统一改为 REST 路径。
- `src/components/layout/Header.jsx`：右上角显示当前用户和退出按钮。
- `src/lib/domain.js`、`src/components/layout/Sidebar.jsx`：新增“账号管理”导航，仅 super_admin/admin 可见。
- `.env.example`、`deploy/env.production.wall.hc12345.com.example`、`README.md`、`DEPLOY.md`、`DEPLOY_PRODUCTION.md`：补充 `ADMIN_USERNAME`、`ADMIN_PHONE`、`ADMIN_PASSWORD`、`SESSION_SECRET`、`JWT_SECRET` 配置说明。
- `package.json` / `package-lock.json`：新增 `bcryptjs`，用于 bcrypt hash。

验证命令：

```bash
node --check server/index.js
node --check server/test-api.js
node --check scripts/production-health-check.mjs
npm run test:api
npm run build
npm run test:e2e
```

验证结果：

- `node --check server/index.js`：通过。
- `node --check server/test-api.js`：通过。
- `node --check scripts/production-health-check.mjs`：通过。
- `npm run test:api`：通过，覆盖未登录后台 API 401、注册 pending、pending 不能登录、super_admin 登录/审核、active 登录、dispatcher 不能管理账号、disabled 不能登录、退出后重新登录、后台 API 登录态、师傅 token 上传/定位/任务链路。
- `npm run build`：通过；仍有既有 Vite chunk size warning。
- `npm run test:e2e`：通过，11/11 passed。
- `npm run test:supabase`：本轮未执行；本地 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 未配置完整，未打印任何真实密钥。

生产上线提醒：

- `.env.production` 必须配置 `ADMIN_USERNAME`、`ADMIN_PHONE`、`ADMIN_PASSWORD`，否则第一次启动不会自动创建超级管理员。
- `.env.production` 必须配置 `SESSION_SECRET` 或 `JWT_SECRET`，否则生产环境登录接口会拒绝签发会话。
- 初始超级管理员创建后，密码只保存 bcrypt hash，不保存明文。

## 59. 统一新版后台界面恢复

更新时间：2026-05-15。

本次目标是恢复后台全页面统一新版风格，重点处理素材管理新版交互、地图调度大地图主视觉、点位详情全屏弹窗，并清理旧版 Drawer 与调试文案残留。

改动页面列表：

- 全局后台框架：`Header` 增加中文面包屑，`Sidebar` 清理多余副标题和左侧底部冗余来源文本，保留中文导航主标题。
- 点位管理：点位详情继续使用全屏居中大弹窗，去掉英文 `Point Detail` 副标题，并挂入统一 `enterprise-modal` 类。
- 素材管理：重建为新版卡片网格，支持单击选中、Ctrl/Cmd 多选、Shift 连续多选、空白拖拽框选、全选、取消全选、清空选择、已选数量提示、下载 ZIP、导出明细、双击预览、上一张/下一张和视频 MP4/播放标识。
- 师傅管理 / 项目管理：表单弹窗不再复用 `drawer-panel`，操作区统一改为 `form-actions`。
- 全局样式：补齐新版后台 CSS 变量、公共按钮/面板类、素材卡片选择态、预览弹窗样式，并删除旧版 `.drawer-layer` / `.drawer-panel` / `points-final-drawer-*` 样式。
- E2E：同步更新为新版中文面包屑、非 Drawer 弹窗选择器，并增加素材卡片选中与双击预览断言。

保留的 API 与数据逻辑：

- 未修改后端服务、登录/注册/鉴权、用户审核、上传目录、师傅端 worker token、`/api/health`、PM2/Nginx/HTTPS 部署配置。
- 素材 ZIP 下载仍使用当前真实 `data.photos`、点位、师傅和项目数据生成清单与归档结构；没有写死示例图片或临时测试数据。
- 地图调度三栏结构和高德地图/Amap 数据逻辑保持原接口与现有组件。

验证命令：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build`：通过；仍有既有 Vite chunk size warning。
- `npm run test:e2e`：通过，11/11 passed。
- `npm run test:supabase`：本轮未执行；没有修改 Supabase 表、Storage、派单后端、上传后端或诊断逻辑。

人工/源码验收结果：

- 源码扫描 `src` 未发现可见 `DEBUG-MAP-LAYOUT`、`ONLY-CURRENT-SOURCE`、`Operations`、`Map Console`、`Point Center`、`Media Center`、`drawer-layer`、`drawer-panel` 残留。
- 地图调度 E2E 覆盖 1920 与 1366 宽度，确认地图主画布可见、无顶部巨大 KPI 块、无横向滚动。
- 点位详情 E2E 确认打开后 `.drawer-panel = 0`，列表保持可见，关闭后恢复正常。
- 素材管理 E2E 覆盖上传后进入素材页、卡片选中、预览弹窗、ZIP 下载；Ctrl/Cmd、Shift 和拖拽框选已在源码实现，建议上线后在真实素材量较多时再做一次人工点验。
- 线上访问和 `pm2 restart wall-ad-h5` 未在本机执行；需要在 Ubuntu 24.04 生产服务器部署后再执行 Nginx、PM2、HTTPS 与 `curl https://wall.hc12345.com/api/health` 验收。

## 60. 本地开发临时测试登录入口

更新时间：2026-05-15。

本次目标是在 `localhost:5173` 无法访问后端 API 时，保留正式登录逻辑，同时增加仅本地开发可见的临时入口，方便测试新版后台页面。

本次新增或修改：

- `src/pages/LoginPage.jsx`：登录页增加“临时进入测试后台”按钮，仅在 `import.meta.env.DEV === true` 或 `VITE_ENABLE_DEV_LOGIN=true` 时显示。
- `src/pages/LoginPage.jsx`：点击临时入口会写入：
  - `localStorage.admin_token = "dev-preview-token"`
  - `localStorage.admin_user = {"name":"测试管理员","phone":"13291116876","role":"admin", ...}`
- `src/App.jsx`：本地开发环境识别 `dev-preview-token`，直接建立测试管理员登录态；刷新 `/admin/...` 不再被踢回登录页。
- `src/App.jsx`：退出登录时会清理 `admin_token` 和 `admin_user`，不影响正式 cookie 登录。
- `src/styles.css`：增加 `.dev-login-button` 样式。

保留逻辑：

- 原账号密码登录接口 `POST /api/auth/login` 未删除、未改动。
- 生产环境默认不会显示临时按钮；`wall.hc12345.com` 的正式登录/注册/审核逻辑不受影响。

验证命令：

```bash
npm run build
npm run dev -- --host 0.0.0.0
npm run test:e2e
```

验证结果：

- `npm run build`：通过；仍有既有 Vite chunk size warning。
- `npm run dev -- --host 0.0.0.0`：已启动，监听 `0.0.0.0:5173`。
- 本地 Playwright 手动链路：打开 `http://localhost:5173/login?next=%2F`，点击 `.dev-login-button` 后成功进入后台，并确认以下页面可加载：
  - `/admin/dashboard`
  - `/admin/map`
  - `/admin/points`
  - `/admin/workers`
  - `/admin/dispatch`
  - `/admin/projects`
  - `/admin/media`
  - `/admin/system`
- `npm run test:e2e`：通过，11/11 passed。

## 61. 正式版上线验收

更新时间：2026-05-15。

本次按正式上线验收顺序执行，结论是：当前代码与本地生产构建已经包含新版后台页面，但本轮没有在当前 Windows 工作区完成生产服务器发布，公网 `https://wall.hc12345.com` 当前仍在服务旧版构建资源。

源码/本地构建确认：
- 已确认源码包含 8 个新版后台页面：运营总览、地图调度、点位管理、师傅管理、派单中心、项目管理、素材管理、系统状态。
- 已确认本地构建产物包含新版特征：`enterprise-page`、`media-selection-grid`、`media-select-card`、`media-selection-box`。
- 本地构建产物未发现：`localhost:5173`、`127.0.0.1:5173`、`VITE_ENABLE_DEV_LOGIN=true`、`DEBUG-MAP-LAYOUT`、`ONLY-CURRENT-SOURCE`。

执行命令与结果：
```bash
npm run build
npm run deploy:prod
pm2 list
pm2 status wall-ad-h5
curl -I -L https://wall.hc12345.com
curl https://wall.hc12345.com/api/health
curl -k https://wall.hc12345.com | head -n 30
```

验收结果：
- `npm run build`：通过；仍有 Vite chunk size warning。
- `npm run deploy:prod`：失败。当前 Windows 环境的 `bash` 指向 WSL launcher，但 WSL 内没有 `/bin/bash`，报错 `execvpe(/bin/bash) failed: No such file or directory`。因此发布脚本没有切换生产服务器的 `current` release。
- `pm2 list` / `pm2 status wall-ad-h5`：当前 Windows 工作区无 `pm2` 命令，无法从本机确认生产服务器 PM2 状态。
- `curl -I -L https://wall.hc12345.com`：公网返回 `HTTP/1.1 200 OK`，Nginx/Express 可达。
- `curl https://wall.hc12345.com/api/health`：返回 `{"ok":true,...}`，健康接口正常。
- `curl -k https://wall.hc12345.com | head -n 30`：返回线上 HTML，当前 JS 资源为 `/assets/index-GMW996dJ.js`。
- 本地刚构建的 JS 资源为 `/assets/index-8_gHlngw.js`，与线上资源文件名不一致，说明本轮构建未发布到线上。
- 线上 bundle 特征检查：未发现 `enterprise-page`、`media-selection-grid`、`media-select-card`，仍发现旧版英文副标题 `Operations`、`Map Console`、`Media Center`。因此新版素材管理尚未替换线上旧版。
- 后台路由 HTTP 可达性：`/admin`、`/admin/map`、`/admin/points`、`/admin/workers`、`/admin/dispatch`、`/admin/projects`、`/admin/media`、`/admin/system` 均返回 200；但当前返回的是旧版线上 bundle，不能判定为新版页面已上线。

待处理：
- 需要在 Ubuntu 24.04 生产服务器的项目目录 `/www/wall-ad-system/wall_ad_h5_test` 执行 `npm run deploy:prod`，或直接执行 `bash scripts/deploy-production.sh`。
- 发布完成后在生产服务器执行 `pm2 list` 和 `pm2 status wall-ad-h5`，确认 `wall-ad-h5` 为 `online`。
- 发布后再次检查首页 HTML 中的 JS/CSS 资源 hash 是否已切换为新 release 构建产物，并复查线上 bundle 中应出现新版素材管理特征。

## 62. 新版后台页面生产源码合并核验

更新时间：2026-05-15。

本次目标是确保正式版前端源码中真正包含新版后台页面，尤其是新版卡片式素材管理，并加入生产上线后可 grep 的精确关键词。

本次修改：
- `src/pages/MediaPage.jsx`：加入 `data-release-keywords`，包含 `素材预览 / Preview`、`下载已选 ZIP`、`Ctrl + 单击多选`、`框选多个素材` 等上线核验关键词。
- `src/pages/MediaPage.jsx`：素材选择提示改为明确文案：单击选中、Ctrl + 单击多选、Shift + 单击连续多选、空白处框选多个素材、双击预览。
- `src/pages/MediaPage.jsx`：预览弹窗空标题兜底改为 `素材预览 / Preview`。

保留逻辑：
- 未修改后端、Mock Server、`local-json-and-uploads`、`/api/health`、`/admin`、`/worker/tk_*`、`/api/*`、Nginx 配置。
- 素材管理仍使用真实 `data.photos`、点位、师傅、项目数据，不写死示例素材。
- 8 个后台页面仍为新版：运营总览、地图调度、点位管理、师傅管理、派单中心、项目管理、素材管理、系统状态。

执行命令：
```bash
npm install
npm run build
npm run test:e2e
rg -n "素材预览 / Preview|下载已选 ZIP|Ctrl \+ 单击多选|框选多个素材" src dist/assets dist/index.html
curl -sk https://wall.hc12345.com | grep -oE '/assets/[^"]+\.js|/assets/[^"]+\.css'
curl -sk https://wall.hc12345.com/api/health
pm2 restart wall-ad-h5 --update-env
pm2 save
pm2 status wall-ad-h5
```

## 63. 本地登录鉴权收紧修复

更新时间：2026-05-16。

本次只修改本地项目代码，未连接生产服务器，未执行任何生产 PM2、Nginx、systemd 或端口配置命令。目标是修复未登录 `/api/auth/me` 不能返回默认管理员的问题，并移除前端开发/演示自动管理员登录逻辑。

本次修改：
- `server/index.js`：`/api/auth/me` 只从真实 `Authorization: Bearer <token>` 或 httpOnly cookie 验证会话；无合法登录态一律返回 401。
- `server/index.js`：登录接口返回 `{ token, user }`，并继续设置 httpOnly cookie；用户信息不返回 `passwordHash/password_hash`。
- `server/index.js`：公开注册接口禁用，团队账号只能由超级管理员通过 `/api/users` 创建。
- `server/index.js`：新增/补齐 `POST /api/users`、`PUT /api/users/:id`、`DELETE /api/users/:id`，删除为软删除/禁用。
- `server/index.js`：账号管理权限收紧为仅 `super_admin`。
- `server/index.js`：`/api/health` 前移为公开健康检查，不受后台登录拦截。
- `src/apiClient.js`：新增正式 auth token 存取，所有 API 请求自动附带 `Authorization: Bearer token`；401 时清理 token 并触发前端退出登录。
- `src/App.jsx`：删除 `dev-preview-token`、`admin_token/admin_user`、`forceLocalDemo` 后台免登录；未登录后台只进入登录页。
- `src/pages/LoginPage.jsx`：删除“临时进入测试后台”按钮和自动管理员写入逻辑；公开注册入口改为联系超级管理员。
- `src/components/layout/Header.jsx` / `Sidebar.jsx` / `src/pages/AccountsPage.jsx`：不再把缺省用户显示为“管理员”，账号管理仅 `super_admin` 可见，并支持创建团队账号。
- `.env.example`：移除 `VITE_ENABLE_DEV_LOGIN`，新增 `INIT_ADMIN_USERNAME/INIT_ADMIN_PHONE/INIT_ADMIN_PASSWORD`。

本地验证命令：
```bash
node --check server/index.js
npm run build
curl.exe -i http://127.0.0.1:8787/api/auth/me
curl.exe -i http://127.0.0.1:8787/api/health
```

验证结果：
- `node --check server/index.js`：通过。
- `npm run build`：通过；仍有 Vite chunk size warning。
- 本地启动 Node 服务后，未携带 Cookie、未携带 Authorization 请求 `/api/auth/me` 返回 `HTTP/1.1 401 Unauthorized`，响应体为 `{"ok":false,"error":"UNAUTHENTICATED","detail":"请先登录。"}`，未返回管理员信息。
- `/api/health` 返回 `HTTP/1.1 200 OK`。

生产待执行：
- 当前修复尚未部署到 `https://wall.hc12345.com`。
- 需要把本地代码同步到生产服务器 `/www/wall-ad-system/wall_ad_h5_test` 后执行 `npm install && npm run build`，再按既有方式重启 `wall-ad-h5`。

验证结果：
- `npm install`：通过；npm audit 仍提示 1 个 high severity vulnerability。
- `npm run build`：通过；生成新版本地 bundle `dist/assets/index-ZabQQw9M.js`，仍有 Vite chunk size warning。
- `npm run test:e2e`：通过，11/11 passed。
- 本地 `src` 与 `dist/assets/index-ZabQQw9M.js` 均可 grep 到 `素材预览 / Preview`、`下载已选 ZIP`、`Ctrl + 单击多选`、`框选多个素材`。
- 当前线上 `https://wall.hc12345.com` 仍引用旧资源：`/assets/index-GMW996dJ.js` 和 `/assets/index-D_meer4N.css`。
- 当前线上 `/api/health` 正常返回 `ok:true`。
- `pm2 restart wall-ad-h5 --update-env` / `pm2 save` / `pm2 status wall-ad-h5` 未能在当前 Windows 工作区执行：本机无 `pm2` 命令。需要在 Ubuntu 生产服务器执行。

生产机继续执行：
```bash
cd /www/wall-ad-system/wall_ad_h5_test
npm install
npm run build
grep -R "素材预览 / Preview\|下载已选 ZIP\|Ctrl + 单击多选\|框选多个素材" -n src dist/assets dist/index.html | head -80
pm2 restart wall-ad-h5 --update-env
pm2 save
curl -sk https://wall.hc12345.com | grep -oE '/assets/[^"]+\.js|/assets/[^"]+\.css'
curl -sk https://wall.hc12345.com/api/health
pm2 status wall-ad-h5
```
