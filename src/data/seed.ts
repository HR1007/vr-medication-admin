/**
 * Demo data. Generated deterministically so every visitor (and every "重置 Demo")
 * starts from the same state. Names, IDs and scripts are fictional.
 */

export type TestStatus = 'done' | 'pending'

export type Folder = {
  id: string
  name: string
  date: string // YYYY/MM/DD
}

export type Answer = {
  id: string
  question: string // what the VR patient asks
  answer: string // what the student replied
  audioSeconds: number
}

export type TestRecord = {
  id: string
  folderId: string
  no: number
  testName: string
  studentId: string
  studentName: string
  grade: number
  testedAt: string // YYYY/MM/DD HH:mm
  score: number
  status: TestStatus
  examiner: string
  durationSeconds: number
  answers: Answer[]
}

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug'

export type LogEntry = {
  id: string
  level: LogLevel
  title: string
  module: string
  message: string
  at: string // YYYY/MM/DD HH:mm:ss
}

export type DemoData = {
  folders: Folder[]
  records: TestRecord[]
  logs: LogEntry[]
}

type Topic = { name: string; date: string; script: [string, string][] }

const TOPICS: Topic[] = [
  {
    name: '胰島素藥用藥諮詢',
    date: '2024/12/13',
    script: [
      ['您好，我有一些問題想要向您諮詢', '好的，沒有問題，請問您今天想詢問什麼？'],
      ['我想詢問胰島素的注射部位打在哪裡呢？', '通常建議以腹部為主要注射區域，但要避開肚臍周圍、紅腫或硬塊處。'],
      ['那每次都打同一個地方可以嗎？', '建議輪替注射部位，每次間隔約 2.5 公分，避免皮下脂肪增生。'],
      ['沒用完的胰島素要怎麼保存？', '未開封的放冰箱冷藏，開封後室溫保存並在 28 天內用完。'],
    ],
  },
  {
    name: '吸入劑使用衛教諮詢',
    date: '2024/12/10',
    script: [
      ['醫生開了吸入劑給我，可是我不太會用', '沒問題，我先示範一次正確的使用步驟給您看。'],
      ['吸之前需要先搖一搖嗎？', '定量噴霧型的需要先搖勻，乾粉型的則不需要搖。'],
      ['吸完之後要做什麼？', '含類固醇的吸入劑用完要漱口，避免口腔念珠菌感染。'],
      ['我怎麼知道裡面還有沒有藥？', '可以看劑量計數器，數字接近零時就要準備新的一支。'],
    ],
  },
  {
    name: '抗凝血劑用藥諮詢',
    date: '2024/12/05',
    script: [
      ['我最近開始吃抗凝血劑，有什麼要注意的嗎？', '要固定時間服用，並留意是否有不正常的出血或瘀青。'],
      ['我可以繼續吃納豆或是保健食品嗎？', '部分食物與保健食品會影響藥效，服用前請先與醫師或藥師確認。'],
      ['如果忘記吃藥怎麼辦？', '想起來時若離下次服藥還很久就補吃，接近下次就跳過，不要一次吃兩倍。'],
      ['看牙醫的時候要說嗎？', '要的，任何手術或拔牙前都要主動告知正在服用抗凝血劑。'],
    ],
  },
  {
    name: '高血壓藥物諮詢',
    date: '2024/11/28',
    script: [
      ['我血壓量起來正常了，可以停藥嗎？', '血壓正常代表藥物有效，請不要自行停藥，需由醫師評估調整。'],
      ['吃藥後站起來會頭暈正常嗎？', '可能是姿勢性低血壓，起身時請放慢動作，若持續請回診。'],
      ['藥要早上吃還是晚上吃？', '依醫師指示，多數降壓藥建議早上固定時間服用。'],
      ['可以配葡萄柚汁一起吃嗎？', '部分降壓藥會與葡萄柚交互作用，建議用白開水服藥。'],
    ],
  },
  {
    name: '降血糖口服藥諮詢',
    date: '2024/11/20',
    script: [
      ['這個降血糖藥要飯前還是飯後吃？', '這類藥物建議隨餐或飯後服用，可以減少腸胃不適。'],
      ['如果覺得手抖、冒冷汗怎麼辦？', '可能是低血糖，請立即補充含糖食物，並測量血糖。'],
      ['生病吃不下飯時還要吃藥嗎？', '吃不下時請先與醫師聯繫，避免空腹服藥造成低血糖。'],
      ['需要多久量一次血糖？', '依醫師建議，通常每天固定時間量測並記錄下來。'],
    ],
  },
  {
    name: '抗生素正確使用諮詢',
    date: '2024/11/12',
    script: [
      ['我吃了兩天抗生素已經好多了，可以不吃了嗎？', '請依醫師處方把整個療程吃完，避免細菌產生抗藥性。'],
      ['吃抗生素可以喝牛奶嗎？', '部分抗生素會與牛奶中的鈣結合，建議間隔兩小時以上。'],
      ['吃完拉肚子怎麼辦？', '輕微腹瀉常見，若嚴重或有血便請立即就醫。'],
      ['上次剩下的抗生素可以給家人吃嗎？', '不可以，抗生素需依個人病況由醫師開立，剩藥請交回藥局處理。'],
    ],
  },
]

const STUDENT_NAMES = [
  'Jack Chen', '林怡君', '王志明', 'Amy Wu', '張雅婷', '李承恩', '黃柏翰', '陳思妤',
  '吳冠廷', '劉佳穎', '蔡宗翰', '鄭雅文', 'Kevin Lin', '許庭瑋', '周品妍', '曾子豪',
]

const EXAMINERS = ['Dr. Mary Chen', 'Dr. 王建民', 'Dr. 李美華']

/** Small seeded PRNG so the demo data is identical on every reset. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export function createSeed(): DemoData {
  const rand = mulberry32(20241213)
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)]

  const folders: Folder[] = TOPICS.map((t, i) => ({ id: `f${i + 1}`, name: t.name, date: t.date }))
  const records: TestRecord[] = []

  TOPICS.forEach((topic, fi) => {
    const count = 6 + Math.floor(rand() * 7) // 6–12 records per folder
    // folders 1, 3 and 6 still have ungraded tests so the 未完成 state shows up
    const pendingFrom = [0, 2, 5].includes(fi) ? count - 2 - Math.floor(rand() * 3) : count
    for (let n = 0; n < count; n++) {
      const hour = 9 + n
      const status: TestStatus = n >= pendingFrom ? 'pending' : 'done'
      const answered = status === 'done' ? topic.script.length : 1 + Math.floor(rand() * 3)
      records.push({
        id: `r${fi + 1}-${n + 1}`,
        folderId: folders[fi].id,
        no: n + 1,
        testName: 'test',
        studentId: `4105401${pad(n + 2 + fi * 12)}`,
        studentName: STUDENT_NAMES[(n + fi * 3) % STUDENT_NAMES.length],
        grade: 1 + ((n + fi) % 4),
        testedAt: `${topic.date} ${pad(hour)}:${pad(n % 2 === 0 ? 30 : 0)}`,
        score: status === 'done' ? 62 + Math.floor(rand() * 37) : 0,
        status,
        examiner: pick(EXAMINERS),
        durationSeconds: 300 + Math.floor(rand() * 420),
        answers: topic.script.slice(0, answered).map(([question, answer], ai) => ({
          id: `r${fi + 1}-${n + 1}-a${ai + 1}`,
          question,
          answer,
          audioSeconds: 6 + Math.floor(rand() * 18),
        })),
      })
    }
  })

  const logs: LogEntry[] = [
    { id: 'l1', level: 'warning', title: '密碼輸入錯誤', module: '驗證模組', message: '使用者連續 3 次輸入錯誤密碼，帳號已暫時鎖定 15 分鐘', at: '2024/12/13 15:10:33' },
    { id: 'l2', level: 'error', title: 'VR 模組異常', module: 'VR 模組', message: 'VR 虛擬環境渲染引擎回應逾時，已自動重啟服務', at: '2024/12/13 16:55:22' },
    { id: 'l3', level: 'info', title: '審核測驗', module: '測驗模組', message: '審核並發布「抗凝血劑用藥諮詢」測驗情境，共新增 3 題', at: '2024/12/13 16:00:00' },
    { id: 'l4', level: 'success', title: '完成測驗', module: '測驗模組', message: '學生完成胰島素用藥諮詢測驗，得分 92 分', at: '2024/12/13 13:05:45' },
    { id: 'l5', level: 'debug', title: '同步排程執行', module: '系統排程', message: '每日測驗資料備份完成，耗時 2.4 秒', at: '2024/12/13 03:00:02' },
    { id: 'l6', level: 'info', title: '使用者登入', module: '登入模組', message: '陳瑪麗老師登入後台管理系統', at: '2024/12/12 08:58:12' },
    { id: 'l7', level: 'error', title: '匯出失敗', module: '資料模組', message: '匯出檔案時磁碟空間不足，已中止並通知管理員', at: '2024/12/11 17:42:09' },
    { id: 'l8', level: 'success', title: '新增測驗資料夾', module: '資料模組', message: '建立「抗生素正確使用諮詢」測驗資料夾', at: '2024/11/12 10:15:40' },
  ]

  return { folders, records, logs }
}
