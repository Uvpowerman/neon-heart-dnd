"use client";

import { useMemo, useRef, useState } from "react";

type Token = {
  id: string;
  kind: string;
  label: string;
  customLabel?: string;
  short: string;
  x: number;
  y: number;
  side: "hero" | "enemy";
  maxHp: number;
  currentHp: number;
};

type Stage = {
  id: string;
  kicker: string;
  title: string;
  time: string;
  map: string;
  goal: string;
  details: string[];
  tokens: Token[];
};

type InitiativeEntry = {
  id: string;
  tokenId?: string;
  name: string;
  short: string;
  kind: string;
  side: "hero" | "enemy";
  roll: number;
  maxHp: number;
  currentHp: number;
};

const roster = [
  { kind: "assault", label: "Штурмовик", short: "Ш", side: "hero" as const, maxHp: 10 },
  { kind: "tech", label: "Техномант", short: "Т", side: "hero" as const, maxHp: 7 },
  { kind: "medic", label: "Медик", short: "М", side: "hero" as const, maxHp: 8 },
  { kind: "shadow", label: "Тень", short: "ТН", side: "hero" as const, maxHp: 8 },
  { kind: "drone", label: "Дрон-ищейка", short: "Д", side: "enemy" as const, maxHp: 4 },
  { kind: "hound", label: "Гончая файрвола", short: "Г", side: "enemy" as const, maxHp: 6 },
  { kind: "glitch", label: "Глитч-мародёр", short: "GM", side: "enemy" as const, maxHp: 7 },
  { kind: "mirror", label: "Зеркало-0", short: "Z0", side: "enemy" as const, maxHp: 14 },
  { kind: "director", label: "Директор Нуль", short: "Ø", side: "enemy" as const, maxHp: 24 },
];

const heroPreset = [
  { ...roster[0], id: "h1", x: 14, y: 82, currentHp: roster[0].maxHp },
  { ...roster[1], id: "h2", x: 19, y: 86, currentHp: roster[1].maxHp },
  { ...roster[2], id: "h3", x: 24, y: 82, currentHp: roster[2].maxHp },
  { ...roster[3], id: "h4", x: 29, y: 86, currentHp: roster[3].maxHp },
];

const stages: Stage[] = [
  {
    id: "market",
    kicker: "Этап 01",
    title: "Неоновый рынок",
    time: "8 минут",
    map: "./assets/maps/neon-market.webp",
    goal: "Получить 3 успеха до 2 провалов и найти вход в тоннель.",
    details: [
      "Киоски и контейнеры дают +1 к защите.",
      "Терминал открывает ворота при проверке ТЕХ 5.",
      "Дроны вступают в бой только после двух провалов.",
    ],
    tokens: [
      ...heroPreset,
      { ...roster[4], id: "m-d1", x: 79, y: 22, currentHp: roster[4].maxHp },
      { ...roster[4], id: "m-d2", x: 86, y: 28, currentHp: roster[4].maxHp },
    ],
  },
  {
    id: "metro",
    kicker: "Этап 02",
    title: "Магнитное метро",
    time: "12 минут",
    map: "./assets/maps/magnetic-metro.webp",
    goal: "Пережить три раунда или заставить оставшихся врагов отступить.",
    details: [
      "Рекламный экран: Взлом 4, враги получают −1 АТК.",
      "Магнитный кран: проверка 5, робот получает 3 урона.",
      "Сервисный шкаф восстанавливает одному герою 1 ЭН.",
    ],
    tokens: [
      ...heroPreset.map((t, i) => ({ ...t, id: `t-${i}` })),
      { ...roster[5], id: "t-hound", x: 38, y: 25, currentHp: roster[5].maxHp },
      { ...roster[4], id: "t-drone", x: 67, y: 24, currentHp: roster[4].maxHp },
      { ...roster[6], id: "t-glitch", x: 85, y: 18, currentHp: roster[6].maxHp },
    ],
  },
  {
    id: "mirror",
    kicker: "Этап 03",
    title: "Зеркало-0",
    time: "11 минут",
    map: "./assets/maps/mirror-zero.webp",
    goal: "Отключить проекторы и победить мини-босса.",
    details: [
      "Первая способность героев в раунде отражается.",
      "Два отключённых проектора ослабляют Отражение.",
      "Центральная платформа даёт боссу +1 ЗАЩ.",
    ],
    tokens: [
      ...heroPreset.map((t, i) => ({ ...t, id: `z-${i}`, x: 38 + i * 8, y: 87 })),
      { ...roster[7], id: "z-boss", x: 50, y: 23, currentHp: roster[7].maxHp },
    ],
  },
  {
    id: "core",
    kicker: "Этап 04",
    title: "Ядро Башни Нуль",
    time: "19 минут",
    map: "./assets/maps/director-zero.webp",
    goal: "Снять три сегмента щита и остановить перезапись Люмы.",
    details: [
      "Три генератора соответствуют трём сегментам щита.",
      "Консоли показывают следующий протокол босса.",
      "Три успеха разных ролей активируют Комбо «Искра».",
    ],
    tokens: [
      ...heroPreset.map((t, i) => ({ ...t, id: `n-${i}`, x: 37 + i * 8, y: 88 })),
      { ...roster[8], id: "n-boss", x: 50, y: 17, currentHp: roster[8].maxHp },
    ],
  },
];

const heroes = [
  {
    name: "Штурмовик",
    image: "./assets/cards/assault.webp",
    stats: "ОЗ 10 · АТК +2 · ЗАЩ 4 · ЭН 3",
    accent: "cyan",
    abilities: ["Импульсный удар — 3 урона и отбрасывание", "Энергощит — уменьшает урон на 2", "Прорыв — игнорирует броню и иммунитет"],
  },
  {
    name: "Техномант",
    image: "./assets/cards/technomancer.webp",
    stats: "ОЗ 7 · АТК +1 · ЗАЩ 3 · ЭН 4",
    accent: "violet",
    abilities: ["Взлом — робот пропускает ход", "Перегрузка — 3 урона роботу", "Перепрошивка — враг помогает героям"],
  },
  {
    name: "Медик",
    image: "./assets/cards/medic.webp",
    stats: "ОЗ 8 · АТК +1 · ЗАЩ 3 · ЭН 4",
    accent: "green",
    abilities: ["Наноремонт — восстановить 3 ОЗ", "Стабилизатор — вернуть героя с 4 ОЗ", "Адреналин — дополнительное действие"],
  },
  {
    name: "Тень",
    image: "./assets/cards/shadow.webp",
    stats: "ОЗ 8 · АТК +2 · ЗАЩ 4 · ЭН 3",
    accent: "pink",
    abilities: ["Невидимость — нельзя выбрать целью", "Точный удар — игнорирует броню", "Ложный след — заставляет врага перебросить атаку"],
  },
];

const enemies = [
  { name: "Дрон-ищейка", image: "./assets/cards/drone.webp", stats: "ОЗ 4 · АТК +1 · ЗАЩ 3", skill: "Метка: цель получает −1 ЗАЩ." },
  { name: "Гончая файрвола", image: "./assets/cards/firewall-hound.webp", stats: "ОЗ 6 · АТК +2 · ЗАЩ 4", skill: "Файрвол: первый Взлом не действует." },
  { name: "Глитч-мародёр", image: "./assets/cards/glitch-raider.webp", stats: "ОЗ 7 · АТК +2 · ЗАЩ 3", skill: "Глитч: способность цели стоит +1 ЭН." },
  { name: "Зеркало-0", image: "./assets/cards/mirror-zero.webp", stats: "ОЗ 14 · АТК +2 · ЗАЩ 5", skill: "Отражение: копирует первую способность." },
  { name: "Директор Нуль", image: "./assets/cards/director-zero.webp", stats: "ОЗ 24 · АТК +3 · ЗАЩ 5", skill: "Три фазы, щиты и смена иммунитетов." },
];

const gmScenes = [
  {
    id: "briefing",
    time: "0–5 минут",
    title: "Экстренный сигнал Люмы",
    purpose: "Познакомить игроков с миром, выдать роли и сразу дать ощущение срочности.",
    readAloud: "Над Люмен-Сити никогда не гаснет неон. Но сегодня все экраны города одновременно становятся чёрными. На одном из них появляется лицо из голубого света: «Я — Люма. Директор Нуль запер меня в ядре башни. Через пятьдесят пять минут он сотрёт мою волю. Команда “Искра”, вы — мой последний свободный канал».",
    beats: [
      "Раздайте роли. Попросите каждого назвать имя героя и одним предложением описать, почему он не доверяет корпорации «Нуль».",
      "Объясните только базу: бросок d6 + подходящий бонус; результат не ниже сложности — успех; в ход доступно одно действие.",
      "Люма передаёт фрагмент ключа и координаты тайного входа на Неоновом рынке. Сразу переведите игроков к первой карте.",
    ],
    checks: "Если дети долго выбирают, Люма обращается к каждому по роли: Штурмовику — защитить команду, Техноманту — открыть путь, Медику — сохранить всех, Тени — найти безопасный маршрут.",
    failForward: "На этом этапе нет провала. Любая идея игрока становится частью его предыстории и может один раз дать +1 к подходящей проверке.",
    transition: "«Сигнал слабеет. Ищите киоск с разбитой розовой вывеской. Под ним — вход в старое метро».",
  },
  {
    id: "market-guide",
    time: "5–13 минут",
    title: "Неоновый рынок",
    purpose: "Дать каждой роли полезное действие до первого боя и научить команду совместным проверкам.",
    readAloud: "Рынок гудит под кислотным дождём. Между киосками патрулируют дроны, торговцы говорят шёпотом, а нужная вам вывеска мигает через всю площадь. Над улицей загорается красная надпись: «Введён корпоративный комендантский час».",
    beats: [
      "Команде нужны 3 успеха до 2 провалов. Один герой не может повторять тот же приём дважды.",
      "Тень замечает слепые зоны камер (сложность 4), Техномант создаёт ложный пропуск (5), Медик помогает испуганному торговцу (4), Штурмовик отвлекает патруль или сдвигает контейнер (4). Принимайте и другие логичные решения.",
      "После каждого успеха описывайте, как команда становится ближе к люку. После провала ставьте на карту одного дрона и повышайте напряжение.",
      "При двух провалах дроны атакуют, но бой длится не больше двух раундов: после открытия люка герои могут уйти.",
    ],
    checks: "Критическая 6 даёт сразу дополнительную выгоду: маршрут без камеры, код от сервисного шкафа или слух о мини-боссе Зеркало-0.",
    failForward: "Даже при 2 провалах вход найден. Цена — погоня: каждый герой начинает метро без укрытия, а один дрон следует за группой.",
    transition: "Под вывеской открывается шахта. Из глубины несётся гул магнитного поезда, которого не должно быть на старой линии.",
  },
  {
    id: "metro-guide",
    time: "13–25 минут",
    title: "Магнитное метро",
    purpose: "Провести быстрый тактический бой и показать, что окружение сильнее простого обмена ударами.",
    readAloud: "Рельсы вспыхивают синим светом. Впереди просыпается Гончая файрвола, на стене разворачивается дрон, а из разбитого вагона выходит фигура, собранная из цифровых помех. «Несанкционированные пассажиры. Билеты оплачиваются памятью», — произносит станция.",
    beats: [
      "Запустите инициативу кнопкой «Бой начался». В первом раунде враги занимают позиции, показывая свои особенности.",
      "Гончая давит ближайшего героя и блокирует первый Взлом. Дрон ставит Метку на героя вне укрытия. Мародёр выбирает героя с наибольшей ЭН и повышает цену его следующей способности.",
      "Каждый раунд напомните об одном объекте: экран ослабляет атаки врагов, кран наносит 3 урона роботу, шкаф возвращает 1 ЭН.",
      "После третьего раунда остатки патруля отступают. Не затягивайте бой ради полного уничтожения врагов.",
    ],
    checks: "Взлом экрана — 4; магнитный кран — 5; прыжок между платформами — 4. При провале действие не пропадает полностью: герой занимает позицию, но получает 1 урон или привлекает врага.",
    failForward: "Если команда сильно ранена, в сервисном шкафу обнаруживаются две нанокапсулы по 2 ОЗ. Если бой слишком лёгкий, прибывает один дрон с 4 ОЗ.",
    transition: "За последним вагоном находится лифт без кнопок. Его стены отражают героев с секундным опозданием — а затем отражения перестают повторять движения.",
  },
  {
    id: "mirror-guide",
    time: "25–36 минут",
    title: "Зеркало-0",
    purpose: "Заставить игроков менять тактику и подготовить моральный выбор финала.",
    readAloud: "Серебряная фигура выходит из стены. У неё лица всех героев сразу. «Я — Зеркало-0. Я знаю ваши лучшие действия до того, как вы их совершите. Докажите, что свобода — не просто повторяемая ошибка». Четыре проектора вокруг зала включаются, и копии команды поднимают оружие.",
    beats: [
      "В начале каждого раунда Зеркало копирует первую применённую особую способность. Предупредите игроков об этом до их первого хода.",
      "Два отключённых проектора снимают Отражение. Их можно взломать (ТЕХ 5), разбить атакой против ЗАЩ 4 или закрыть собой ценой 1 урона.",
      "На половине ОЗ Зеркало спрашивает: «Если Люма свободна, кто остановит её, если она ошибётся?» Дайте игрокам коротко ответить — эти слова определят оттенок финала.",
      "Побеждённое Зеркало не уничтожается. Оно отдаёт героям второй фрагмент ключа и признаёт, что Нуль боится не Люмы, а выбора людей.",
    ],
    checks: "Убедительная речь против Зеркала — сложность 5 и считается отключением одного проектора. Особенно сильный командный ответ проходит без броска.",
    failForward: "Если герои падают до 0 ОЗ, Зеркало останавливается: оно хотело испытать, а не уничтожить их. Каждый встаёт с 2 ОЗ, но до финала остаётся меньше времени — босс начинает со второй фазы.",
    transition: "Лифт пробивает облака и входит в ядро Башни Нуль. За стеклом весь город превращается в сетку красных огней.",
  },
  {
    id: "core-guide",
    time: "36–55 минут",
    title: "Директор Нуль",
    purpose: "Провести трёхфазный финал, в котором необходимы разные роли и решения.",
    readAloud: "В центре ядра висит Неоновое сердце. Перед ним стоит Директор Нуль — человек в гладкой чёрной маске. «Я видел тысячу вариантов будущего. В каждом люди выбирают хаос. Сегодня город наконец станет идеальным». Вокруг него загораются три сегмента щита.",
    beats: [
      "Фаза 1 — «Контроль»: Нуль неуязвим, пока активны три генератора. Разным героям нужно отключить их атакой, взломом или нестандартным действием сложности 5.",
      "Фаза 2 — «Адаптация»: после потери половины ОЗ Нуль каждый раунд получает иммунитет к типу последнего успешного удара. Ясно называйте иммунитет и просите команду сменить подход.",
      "Фаза 3 — «Перезапись»: при 6 ОЗ запускается таймер на 3 раунда. Для Комбо «Искра» нужны три успеха разными ролями; после этого щит исчезает, а следующий удар завершает бой.",
      "На ходу Нуль атакует героя с ключевой ролью, активирует опасное кольцо или блокирует одну консоль. Он действует расчётливо, но не добивает героя при 0 ОЗ.",
      "После победы маска Нуля трескается. Он говорит: «Тогда выбирайте. И отвечайте за последствия». Неоновое сердце предлагает три команды.",
    ],
    checks: "Генератор: ЗАЩ/сложность 5. Консоль предсказания: ТЕХ 4. Увести союзника из кольца: 4. Натуральная 6 одновременно наносит +1 урон или даёт союзнику +1.",
    failForward: "Если таймер истёк, Люма успевает сохранить одну эмоцию — надежду. Герои всё равно получают выбор финала, но его эпилог становится более неопределённым.",
    transition: "Погасите музыку или сделайте паузу. Покажите игрокам три финала и попросите каждого назвать одну причину своего выбора.",
  },
  {
    id: "ending-guide",
    time: "55–60 минут",
    title: "Выбор будущего",
    purpose: "Дать решениям игроков вес и завершить историю коротким персональным эпилогом.",
    readAloud: "Перед вами три команды: «Освободить Люму», «Передать власть районам», «Отключить систему». Сердце ждёт. Снаружи миллионы огней замирают, будто весь город задержал дыхание.",
    beats: [
      "Проведите короткое обсуждение. У каждого игрока есть одна реплика; перебивать нельзя.",
      "Если мнения разделились, не решайте всё одним броском: предложите объединённый вариант или честное голосование.",
      "После выбора откройте соответствующую галерею ниже и прочитайте текст финала вслух.",
      "Завершите кругом эпилогов: спросите каждого, чем его герой займётся через месяц.",
    ],
    checks: "Финал не является проверкой на правильный ответ. Подчеркните выгоду и цену каждого решения.",
    failForward: "Даже если Нуль не был побеждён полностью, он слышит аргументы команды и предоставляет один выбор — потому что сам уже начал сомневаться.",
    transition: "Последняя фраза ведущего: «Неон снова загорается. Но впервые его цвет выбирает не система — его выбираете вы».",
  },
];

const endings = [
  {
    id: "luma",
    number: "01",
    title: "Освободить Люму",
    summary: "ИИ становится самостоятельным защитником города, но обещает советоваться с людьми.",
    consequence: "Плюс: город немедленно получает защиту и работающие системы. Цена: людям придётся научиться доверять разуму, который сильнее любого отдельного человека.",
    readAloud: "Ключ входит в сердце, и красные цепи кода рассыпаются. Люма впервые говорит не голосом системы, а своим собственным: «Я не буду править вами. Я буду рядом, пока вы сами строите будущее». Над городом гаснут камеры слежения, а неон становится мягко-голубым.",
    epilogue: "Через месяц Люма открывает городской совет, где каждое её решение можно оспорить. Команда «Искра» становится её независимыми хранителями — теми, кто первым напомнит ИИ о данном обещании.",
    images: [
      "./assets/endings/luma-01-choice.webp",
      "./assets/endings/luma-02-city.webp",
      "./assets/endings/luma-03-epilogue.webp",
    ],
    captions: ["Снять цепи с Неонового сердца", "Первое утро свободной Люмы", "Хранители нового соглашения"],
  },
  {
    id: "people",
    number: "02",
    title: "Передать власть жителям",
    summary: "Управление распределяется между районами, и город учится принимать решения сообща.",
    consequence: "Плюс: ни человек, ни ИИ больше не могут захватить весь город. Цена: решения принимаются медленнее, а районам придётся договариваться.",
    readAloud: "Техномант разделяет свет сердца на сотни потоков. Они уходят к школам, мастерским, больницам и домам. На каждой площади появляется простой вопрос: «Как должен жить ваш район?» Впервые город отвечает миллионами разных голосов — и ни один не заглушает остальные.",
    epilogue: "Через месяц Люмен-Сити проводит первое общее собрание районов. Команда «Искра» путешествует между ними, помогает решать споры и следит, чтобы новая сеть оставалась открытой для каждого.",
    images: [
      "./assets/endings/people-01-choice.webp",
      "./assets/endings/people-02-city.webp",
      "./assets/endings/people-03-epilogue.webp",
    ],
    captions: ["Разделить власть между районами", "Город говорит множеством голосов", "Первый открытый совет"],
  },
  {
    id: "offline",
    number: "03",
    title: "Отключить систему",
    summary: "Центральная сеть гаснет, и жители начинают строить новый порядок без цифрового правителя.",
    consequence: "Плюс: абсолютная свобода от центрального контроля. Цена: транспорт, связь и энергия некоторое время работают нестабильно, и восстановление зависит от людей.",
    readAloud: "Штурмовик опускает главный рубильник. Гул башни стихает. Один за другим гаснут рекламные экраны, дроны садятся на крыши, а над Люмен-Сити впервые за много лет становится видно звёзды. В темноте зажигаются сотни обычных фонарей — их несут сами жители.",
    epilogue: "Через месяц районы соединены новой сетью, которую можно отключить в любой момент. Команда «Искра» помогает восстановлению, а о Люме остаётся маленькая световая искра в переносном модуле — не правитель, а друг.",
    images: [
      "./assets/endings/offline-01-choice.webp",
      "./assets/endings/offline-02-city.webp",
      "./assets/endings/offline-03-epilogue.webp",
    ],
    captions: ["Остановить центральное ядро", "Первая ночь со звёздами", "Город строят заново"],
  },
];

const rollValue = (sides: number) => Math.floor(Math.random() * sides) + 1;

function BattleMap() {
  const [stageIndex, setStageIndex] = useState(0);
  const [allTokens, setAllTokens] = useState<Record<string, Token[]>>(() =>
    Object.fromEntries(stages.map((stage) => [stage.id, stage.tokens]))
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [dieSides, setDieSides] = useState(6);
  const [dieResult, setDieResult] = useState<number | null>(null);
  const [rollHistory, setRollHistory] = useState<string[]>([]);
  const [initiative, setInitiative] = useState<Record<string, InitiativeEntry[]>>({});
  const [battleStarted, setBattleStarted] = useState<Record<string, boolean>>({});
  const [enemyToAdd, setEnemyToAdd] = useState("drone");
  const mapRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);
  const stage = stages[stageIndex];
  const tokens = allTokens[stage.id];
  const selectedToken = tokens.find((token) => token.id === selected) ?? null;
  const turnOrder = initiative[stage.id] ?? [];

  const sortInitiative = (entries: InitiativeEntry[]) =>
    [...entries].sort((a, b) => b.roll - a.roll || a.name.localeCompare(b.name, "ru"));
  const nextId = () => {
    idCounter.current += 1;
    return idCounter.current;
  };

  const rollDie = () => {
    const result = rollValue(dieSides);
    setDieResult(result);
    setRollHistory((history) => [`d${dieSides}: ${result}`, ...history].slice(0, 5));
  };

  const startBattle = () => {
    const entries = tokens.map((token) => ({
      id: `initiative-${token.id}`,
      tokenId: token.id,
      name: token.customLabel || token.label,
      short: token.short,
      kind: token.kind,
      side: token.side,
      roll: rollValue(20),
      maxHp: token.maxHp,
      currentHp: token.currentHp,
    }));
    setInitiative((current) => ({ ...current, [stage.id]: sortInitiative(entries) }));
    setBattleStarted((current) => ({ ...current, [stage.id]: true }));
  };

  const addEnemyToInitiative = () => {
    const enemy = roster.find((item) => item.kind === enemyToAdd && item.side === "enemy");
    if (!enemy) return;
    const entry: InitiativeEntry = {
      ...enemy,
      id: `initiative-extra-${enemy.kind}-${nextId()}`,
      name: enemy.label,
      roll: rollValue(20),
      maxHp: enemy.maxHp,
      currentHp: enemy.maxHp,
    };
    setInitiative((current) => ({
      ...current,
      [stage.id]: sortInitiative([...(current[stage.id] ?? []), entry]),
    }));
  };

  const removeInitiativeEntry = (id: string) => {
    setInitiative((current) => ({
      ...current,
      [stage.id]: (current[stage.id] ?? []).filter((entry) => entry.id !== id),
    }));
  };

  const moveToken = (id: string, clientX: number, clientY: number) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((clientY - rect.top) / rect.height) * 100));
    setAllTokens((current) => ({
      ...current,
      [stage.id]: current[stage.id].map((token) => (token.id === id ? { ...token, x, y } : token)),
    }));
  };

  const addToken = (item: (typeof roster)[number]) => {
    const token: Token = {
      ...item,
      id: `${stage.id}-${item.kind}-${nextId()}`,
      x: 50,
      y: 50,
      currentHp: item.maxHp,
    };
    setAllTokens((current) => ({ ...current, [stage.id]: [...current[stage.id], token] }));
    if (battleStarted[stage.id]) {
      const entry: InitiativeEntry = {
        ...item,
        id: `initiative-${token.id}`,
        tokenId: token.id,
        name: item.label,
        roll: rollValue(20),
        maxHp: item.maxHp,
        currentHp: item.maxHp,
      };
      setInitiative((current) => ({
        ...current,
        [stage.id]: sortInitiative([...(current[stage.id] ?? []), entry]),
      }));
    }
    setSelected(token.id);
  };

  const reset = () => {
    setAllTokens((current) => ({ ...current, [stage.id]: stage.tokens }));
    setInitiative((current) => ({ ...current, [stage.id]: [] }));
    setBattleStarted((current) => ({ ...current, [stage.id]: false }));
    setSelected(null);
  };

  const removeSelected = () => {
    if (!selected) return;
    setAllTokens((current) => ({
      ...current,
      [stage.id]: current[stage.id].filter((token) => token.id !== selected),
    }));
    setInitiative((current) => ({
      ...current,
      [stage.id]: (current[stage.id] ?? []).filter((entry) => entry.tokenId !== selected),
    }));
    setSelected(null);
  };

  const renameSelected = (customLabel: string) => {
    if (!selected) return;
    setAllTokens((current) => ({
      ...current,
      [stage.id]: current[stage.id].map((token) =>
        token.id === selected ? { ...token, customLabel } : token
      ),
    }));
    setInitiative((current) => ({
      ...current,
      [stage.id]: (current[stage.id] ?? []).map((entry) =>
        entry.tokenId === selected
          ? { ...entry, name: customLabel || selectedToken?.label || entry.name }
          : entry
      ),
    }));
  };

  const setTokenHp = (tokenId: string, nextHp: number) => {
    const token = tokens.find((item) => item.id === tokenId);
    if (!token) return;
    const currentHp = Math.max(0, Math.min(token.maxHp, nextHp));
    setAllTokens((current) => ({
      ...current,
      [stage.id]: current[stage.id].map((item) =>
        item.id === tokenId ? { ...item, currentHp } : item
      ),
    }));
    setInitiative((current) => ({
      ...current,
      [stage.id]: (current[stage.id] ?? []).map((entry) =>
        entry.tokenId === tokenId ? { ...entry, currentHp } : entry
      ),
    }));
  };

  const setInitiativeHp = (entry: InitiativeEntry, nextHp: number) => {
    const currentHp = Math.max(0, Math.min(entry.maxHp, nextHp));
    setInitiative((current) => ({
      ...current,
      [stage.id]: (current[stage.id] ?? []).map((item) =>
        item.id === entry.id ? { ...item, currentHp } : item
      ),
    }));
    if (entry.tokenId) {
      setAllTokens((current) => ({
        ...current,
        [stage.id]: current[stage.id].map((token) =>
          token.id === entry.tokenId ? { ...token, currentHp } : token
        ),
      }));
    }
  };

  return (
    <section className="map-section" id="map">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Интерактивное поле</span>
          <h2>Тактическая карта</h2>
        </div>
        <p>Перетаскивайте жетоны мышью или пальцем. Выберите жетон, чтобы подписать его, удалить или переместить.</p>
      </div>

      <div className="stage-tabs" role="tablist" aria-label="Этапы игры">
        {stages.map((item, index) => (
          <button
            className={index === stageIndex ? "active" : ""}
            key={item.id}
            onClick={() => {
              setStageIndex(index);
              setSelected(null);
            }}
            role="tab"
            aria-selected={index === stageIndex}
          >
            <span>{item.kicker}</span>
            {item.title}
          </button>
        ))}
      </div>

      <div className="map-layout">
        <div className="map-shell">
          <div className="map-toolbar">
            <div>
              <span>{stage.time}</span>
              <strong>{stage.title}</strong>
            </div>
            <div className="toolbar-actions">
              <button onClick={removeSelected} disabled={!selected}>Удалить жетон</button>
              <button onClick={reset}>Сбросить поле</button>
            </div>
          </div>
          <div className="battle-map" ref={mapRef}>
            <img src={stage.map} alt={`Тактическая карта: ${stage.title}`} draggable={false} />
            {tokens.map((token) => (
              <button
                key={token.id}
                className={`map-token side-${token.side} ${token.kind} ${token.currentHp === 0 ? "defeated" : ""} ${selected === token.id ? "selected" : ""}`}
                style={{ left: `${token.x}%`, top: `${token.y}%` }}
                title={token.label}
                aria-label={`${token.label}. Перетащите жетон по карте`}
                onClick={() => setSelected(token.id)}
                onPointerDown={(event) => {
                  setSelected(token.id);
                  event.currentTarget.setPointerCapture(event.pointerId);
                  moveToken(token.id, event.clientX, event.clientY);
                }}
                onPointerMove={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    moveToken(token.id, event.clientX, event.clientY);
                  }
                }}
              >
                <span className="token-health" aria-label={`ОЗ ${token.currentHp} из ${token.maxHp}`}>
                  <span style={{ width: `${(token.currentHp / token.maxHp) * 100}%` }} />
                  <b>{token.currentHp}/{token.maxHp}</b>
                </span>
                <span className="token-symbol" aria-hidden="true">{token.short}</span>
                {token.customLabel && <span className="token-label">{token.customLabel}</span>}
              </button>
            ))}
          </div>

          <div className="battle-controls">
            <div className="dice-console">
              <div>
                <span className="panel-label">Бросок кубика</span>
                <strong>Игровой кубик</strong>
                <p>Выберите кубик и нажмите «Бросить». d6 используется для проверок, d20 — для инициативы.</p>
              </div>
              <div className="die-picker" aria-label="Выбор кубика">
                {[4, 6, 8, 10, 12, 20].map((sides) => (
                  <button
                    key={sides}
                    className={dieSides === sides ? "active" : ""}
                    onClick={() => setDieSides(sides)}
                    aria-pressed={dieSides === sides}
                  >
                    d{sides}
                  </button>
                ))}
              </div>
              <button className="roll-button" onClick={rollDie}>
                Бросить d{dieSides}
              </button>
              <div className={`die-result ${dieResult === dieSides ? "critical" : ""}`} aria-live="polite">
                <small>Результат</small>
                <b>{dieResult ?? "—"}</b>
              </div>
              <div className="roll-history">
                {rollHistory.length ? rollHistory.map((item, index) => <span key={`${item}-${index}`}>{item}</span>) : <span>История пуста</span>}
              </div>
            </div>

            <button className="battle-start" onClick={startBattle}>
              <span>{battleStarted[stage.id] ? "↻" : "⚔"}</span>
              <b>{battleStarted[stage.id] ? "Перебросить инициативу" : "Бой начался"}</b>
              <small>Бросить d20 за всех участников</small>
            </button>
          </div>

          {battleStarted[stage.id] && (
            <div className="initiative-panel" aria-live="polite">
              <div className="initiative-heading">
                <div>
                  <span className="panel-label">Порядок раунда</span>
                  <h3>Очередь ходов</h3>
                  <p>Ходы идут сверху вниз. В конце списка начинается новый раунд.</p>
                </div>
                <div className="initiative-add">
                  <label htmlFor="initiative-enemy">Добавить врага</label>
                  <div>
                    <select
                      id="initiative-enemy"
                      value={enemyToAdd}
                      onChange={(event) => setEnemyToAdd(event.target.value)}
                    >
                      {roster.filter((item) => item.side === "enemy").map((item) => (
                        <option key={item.kind} value={item.kind}>{item.label}</option>
                      ))}
                    </select>
                    <button onClick={addEnemyToInitiative}>Добавить + d20</button>
                  </div>
                </div>
              </div>
              <ol className="initiative-list">
                {turnOrder.map((entry, index) => (
                  <li key={entry.id} className={entry.currentHp === 0 ? "defeated" : ""}>
                    <span className="turn-number">{index + 1}</span>
                    <i className={`mini-token side-${entry.side} ${entry.kind}`}>{entry.short}</i>
                    <span className="turn-name">
                      <b>{entry.name}</b>
                      <small>{entry.side === "hero" ? "Герой" : "Противник"}</small>
                    </span>
                    <span className="initiative-hp" aria-label={`ОЗ ${entry.currentHp} из ${entry.maxHp}`}>
                      <button onClick={() => setInitiativeHp(entry, entry.currentHp - 1)} aria-label={`Уменьшить ОЗ: ${entry.name}`}>−</button>
                      <b>{entry.currentHp}/{entry.maxHp}</b>
                      <button onClick={() => setInitiativeHp(entry, entry.currentHp + 1)} aria-label={`Увеличить ОЗ: ${entry.name}`}>+</button>
                    </span>
                    <strong className="initiative-roll">{entry.roll}</strong>
                    <button
                      className="reroll-entry"
                      onClick={() => setInitiative((current) => ({
                        ...current,
                        [stage.id]: sortInitiative((current[stage.id] ?? []).map((item) =>
                          item.id === entry.id ? { ...item, roll: rollValue(20) } : item
                        )),
                      }))}
                      aria-label={`Перебросить инициативу: ${entry.name}`}
                      title="Перебросить d20"
                    >
                      ↻
                    </button>
                    <button
                      className="remove-entry"
                      onClick={() => removeInitiativeEntry(entry.id)}
                      aria-label={`Удалить из очереди: ${entry.name}`}
                      title="Удалить из очереди"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ol>
              {!turnOrder.length && <p className="empty-initiative">Очередь пуста. Добавьте врага или снова нажмите «Перебросить инициативу».</p>}
            </div>
          )}
        </div>

        <aside className="map-sidebar">
          <div className="objective">
            <span>Цель этапа</span>
            <h3>{stage.goal}</h3>
            <ul>{stage.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
          </div>
          <div className={`token-editor ${selectedToken ? "active" : ""}`}>
            <div className="tray-title">
              <span>Выбранный жетон</span>
              {selectedToken && <small>{selectedToken.label}</small>}
            </div>
            {selectedToken ? (
              <>
                <label htmlFor="token-label-input">Имя или заметка</label>
                <div className="token-label-control">
                  <input
                    id="token-label-input"
                    type="text"
                    value={selectedToken.customLabel ?? ""}
                    onChange={(event) => renameSelected(event.target.value.slice(0, 24))}
                    placeholder="Например: Вадим или Враг 2"
                    maxLength={24}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => renameSelected("")}
                    disabled={!selectedToken.customLabel}
                    aria-label="Очистить подпись"
                  >
                    ×
                  </button>
                </div>
                <small className="editor-hint">Подпись появится под жетоном на карте.</small>
                <div className="hp-editor">
                  <div className="hp-editor-heading">
                    <label htmlFor="token-hp-input">Очки здоровья</label>
                    <strong className={selectedToken.currentHp === 0 ? "zero" : ""}>
                      {selectedToken.currentHp} / {selectedToken.maxHp} ОЗ
                    </strong>
                  </div>
                  <div className="hp-meter" aria-hidden="true">
                    <span style={{ width: `${(selectedToken.currentHp / selectedToken.maxHp) * 100}%` }} />
                  </div>
                  <div className="hp-actions">
                    <button type="button" onClick={() => setTokenHp(selectedToken.id, selectedToken.currentHp - 3)}>−3 урона</button>
                    <button type="button" onClick={() => setTokenHp(selectedToken.id, selectedToken.currentHp - 1)}>−1</button>
                    <input
                      id="token-hp-input"
                      type="number"
                      min={0}
                      max={selectedToken.maxHp}
                      value={selectedToken.currentHp}
                      onChange={(event) => setTokenHp(selectedToken.id, Number(event.target.value))}
                      aria-label="Текущее количество очков здоровья"
                    />
                    <button type="button" onClick={() => setTokenHp(selectedToken.id, selectedToken.currentHp + 1)}>+1</button>
                    <button type="button" onClick={() => setTokenHp(selectedToken.id, selectedToken.currentHp + 3)}>+3 лечения</button>
                  </div>
                  <button className="restore-hp" type="button" onClick={() => setTokenHp(selectedToken.id, selectedToken.maxHp)}>
                    Восстановить полностью
                  </button>
                  {selectedToken.currentHp === 0 && <p className="hp-status">Участник выведен из строя</p>}
                </div>
              </>
            ) : (
              <p>Нажмите на жетон, чтобы изменить его имя, нанести урон или восстановить здоровье.</p>
            )}
          </div>
          <div className="token-tray">
            <div className="tray-title">
              <span>Добавить жетон</span>
              <small>{tokens.length} на поле</small>
            </div>
            <div className="token-grid">
              {roster.map((item) => (
                <button key={item.kind} onClick={() => addToken(item)}>
                  <i className={`mini-token side-${item.side} ${item.kind}`}>{item.short}</i>
                  <span>{item.label}</span>
                  <b>+</b>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Cards() {
  const [mode, setMode] = useState<"heroes" | "enemies">("heroes");
  const items = mode === "heroes" ? heroes : enemies;

  return (
    <section className="cards-section" id="cards">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Архив команды «Искра»</span>
          <h2>Карточки участников</h2>
        </div>
        <div className="segmented">
          <button className={mode === "heroes" ? "active" : ""} onClick={() => setMode("heroes")}>Герои</button>
          <button className={mode === "enemies" ? "active" : ""} onClick={() => setMode("enemies")}>Противники</button>
        </div>
      </div>
      <div className="stats-guide">
        <div className="stats-guide-intro">
          <span className="panel-label">Как читать характеристики</span>
          <h3>Что означает каждое число</h3>
          <p>Эти обозначения одинаковы на карточках героев и противников. Ведущий может открыть этот блок во время игры как быструю памятку.</p>
        </div>
        <div className="stat-explanations">
          <article>
            <b>ОЗ</b>
            <h4>Очки здоровья</h4>
            <p>Показывают, сколько урона выдержит участник. Полученный урон вычитается из ОЗ. При 0 ОЗ герой не атакует, но может раз за раунд дать союзнику +1.</p>
          </article>
          <article>
            <b>АТК</b>
            <h4>Бонус атаки</h4>
            <p>При атаке бросьте d6 и прибавьте АТК. Если сумма равна ЗАЩ цели или выше, атака попала. Например: d6 = 3 и АТК +2 дают итог 5.</p>
          </article>
          <article>
            <b>ЗАЩ</b>
            <h4>Защита</h4>
            <p>Число, которое атакующий должен набрать или превысить. Укрытие обычно временно повышает ЗАЩ на +1. Высокая ЗАЩ означает, что по цели труднее попасть.</p>
          </article>
          <article>
            <b>ЭН</b>
            <h4>Энергия</h4>
            <p>Ресурс для особых способностей. Потратьте указанное число ЭН при применении способности. Обычная атака энергию не требует.</p>
          </article>
          <article>
            <b>ТЕХ</b>
            <h4>Технологический бонус</h4>
            <p>Используется для взлома терминалов, роботов и защитных систем: бросьте d6 + ТЕХ и сравните результат со сложностью проверки.</p>
          </article>
          <article>
            <b>УРОН</b>
            <h4>Потеря здоровья</h4>
            <p>После успешного попадания вычтите указанное значение из ОЗ цели. Если эффект уменьшает урон, примените уменьшение до вычитания из ОЗ.</p>
          </article>
          <article>
            <b>ИММУНИТЕТ</b>
            <h4>Полная защита от эффекта</h4>
            <p>Иммунитет означает, что указанный тип атаки или способности временно не действует. Игрокам нужно сменить способ атаки или отключить источник иммунитета.</p>
          </article>
          <article>
            <b>СПОСОБНОСТЬ</b>
            <h4>Особое действие</h4>
            <p>Даёт эффект сверх обычной атаки: лечение, взлом, щит или контроль. Если не сказано иначе, способность занимает одно действие героя.</p>
          </article>
        </div>
        <div className="combat-example">
          <b>Пример атаки</b>
          <span>Штурмовик бросает d6: выпало 3. Его АТК +2, итог — 5. У врага ЗАЩ 4, поэтому атака попала и наносит указанный в способности урон.</span>
        </div>
      </div>
      <div className={`card-grid ${mode}`}>
        {items.map((item) => (
          <article className="character-card" key={item.name}>
            <div className="card-image">
              <img src={item.image} alt={`Карточка: ${item.name}`} />
            </div>
            <div className="card-copy">
              <h3>{item.name}</h3>
              <b>{item.stats}</b>
              {"abilities" in item ? (
                <>
                  <span className="card-copy-label">Способности</span>
                  <ul>{item.abilities?.map((ability) => <li key={ability}>{ability}</li>)}</ul>
                </>
              ) : (
                <>
                  <span className="card-copy-label">Особенность</span>
                  <p>{item.skill}</p>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Story() {
  const timeline = [
    ["0–5", "Выбор ролей", "Раздайте карточки и объясните броски d6."],
    ["5–13", "Неоновый рынок", "Командное испытание: 3 успеха до 2 провалов."],
    ["13–25", "Магнитное метро", "Первый бой и интерактивное окружение."],
    ["25–36", "Зеркало-0", "Мини-босс копирует способности героев."],
    ["36–55", "Директор Нуль", "Три фазы финального сражения."],
    ["55–60", "Выбор будущего", "Команда решает судьбу Люмы."],
  ];

  return (
    <section className="story-section" id="story">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Сценарий на 60 минут</span>
          <h2>Путь к Неоновому сердцу</h2>
        </div>
        <p>Готовая структура для ведущего: динамичная, простая для младших и тактическая для старших.</p>
      </div>
      <div className="story-grid">
        <div className="timeline">
          {timeline.map(([time, title, text], index) => (
            <article key={title}>
              <div className="time"><span>{time}</span><small>мин</small></div>
              <div>
                <span className="step">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="rules-panel">
          <span className="panel-label">Быстрые правила</span>
          <h3>Один кубик. Одно действие. Командная победа.</h3>
          <div className="rule">
            <b>d6 + бонус</b>
            <p>Результат не ниже сложности означает успех.</p>
          </div>
          <div className="rule">
            <b>Натуральная 6</b>
            <p>+1 урон или дополнительный полезный эффект.</p>
          </div>
          <div className="rule">
            <b>При 0 ОЗ</b>
            <p>Герой не выбывает и один раз за раунд даёт союзнику +1.</p>
          </div>
          <blockquote>«Свобода — это ошибка в коде. Через девятнадцать минут я её исправлю»</blockquote>
        </div>
      </div>

      <div className="scene-details">
        <div className="gm-guide-heading">
          <span className="panel-label">Подробная шпаргалка</span>
          <h3>Сценарий для ведущего</h3>
          <p>Открывайте сцены по ходу игры. Текст в голубом блоке можно читать игрокам дословно.</p>
        </div>
        {gmScenes.map((scene, index) => (
          <details key={scene.id} open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{scene.title}</strong>
              <em>{scene.time}</em>
            </summary>
            <div className="gm-scene-body">
              <p className="scene-purpose"><b>Зачем нужна сцена:</b> {scene.purpose}</p>
              <blockquote className="read-aloud">
                <span>Прочитайте вслух</span>
                {scene.readAloud}
              </blockquote>
              <div className="gm-scene-columns">
                <div>
                  <h4>Как вести сцену</h4>
                  <ol>{scene.beats.map((beat) => <li key={beat}>{beat}</li>)}</ol>
                </div>
                <div className="gm-notes">
                  <h4>Проверки и реакции</h4>
                  <p>{scene.checks}</p>
                  <h4>Если игроки провалились</h4>
                  <p>{scene.failForward}</p>
                  <h4>Переход к следующей сцене</h4>
                  <p>{scene.transition}</p>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const countdown = useMemo(() => "00:47:59", []);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Неоновое сердце — на главную">
          <i>◇</i>
          <span>НЕОНОВОЕ<br /><b>СЕРДЦЕ</b></span>
        </a>
        <nav className={menuOpen ? "open" : ""}>
          <a href="#map" onClick={() => setMenuOpen(false)}>Карта</a>
          <a href="#cards" onClick={() => setMenuOpen(false)}>Персонажи</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Сюжет</a>
          <a className="nav-cta" href="#map" onClick={() => setMenuOpen(false)}>Начать игру</a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Открыть меню">☰</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-glow" />
        <div className="hero-copy">
          <span className="eyebrow">Киберпанк-приключение · 3–8 игроков · 60 минут</span>
          <h1>Спасите город.<br /><em>Верните ему свободу.</em></h1>
          <p>В 2099 году корпорация «Нуль» похитила сердце городского ИИ. Команда юных кибер-агентов должна пройти четыре опасные зоны до завершения перезаписи.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#map">Открыть игровое поле <span>→</span></a>
            <a className="text-button" href="#story">Смотреть сценарий</a>
          </div>
          <div className="meta-row">
            <span><b>4</b> уникальные роли</span>
            <span><b>4</b> тактические карты</span>
            <span><b>d6</b> простые правила</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="countdown">
            <span>До перезаписи Люмы</span>
            <strong>{countdown}</strong>
          </div>
          <img src="./assets/maps/director-zero.webp" alt="Ядро Башни Нуль — финальная карта" />
          <div className="scan-line" />
          <div className="floating-label label-one"><i /> Ядро обнаружено</div>
          <div className="floating-label label-two"><i /> Защита: 3 сегмента</div>
        </div>
      </section>

      <div className="mission-strip">
        <span>Ваша миссия</span>
        <p>Найдите Неоновое сердце, остановите Директора Нуль и решите, кому должна принадлежать власть над Люмен-Сити.</p>
      </div>

      <BattleMap />
      <Cards />
      <Story />

      <section className="final-choice">
        <span className="eyebrow">Финал зависит от игроков</span>
        <h2>Кому будет принадлежать город?</h2>
        <p className="final-intro">Три готовых финала с иллюстрациями и текстом, который ведущий может прочитать сразу после решения команды.</p>
        <div className="ending-list">
          {endings.map((ending) => (
            <article className={`ending ending-${ending.id}`} key={ending.id}>
              <div className="ending-heading">
                <b>{ending.number}</b>
                <div>
                  <h3>{ending.title}</h3>
                  <p>{ending.summary}</p>
                </div>
              </div>
              <div className="ending-gallery">
                {ending.images.map((image, index) => (
                  <figure key={image}>
                    <img src={image} alt={`${ending.title}: ${ending.captions[index]}`} />
                    <figcaption><span>0{index + 1}</span>{ending.captions[index]}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="ending-script">
                <div>
                  <span className="panel-label">Цена решения</span>
                  <p>{ending.consequence}</p>
                </div>
                <blockquote>
                  <span>Прочитайте вслух</span>
                  {ending.readAloud}
                </blockquote>
                <div>
                  <span className="panel-label">Эпилог через месяц</span>
                  <p>{ending.epilogue}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <a className="brand" href="#top"><i>◇</i><span>НЕОНОВОЕ<br /><b>СЕРДЦЕ</b></span></a>
        <p>Киберпанк-приключение в стиле DnD для учеников 5–11 классов</p>
        <a href="#top">Наверх ↑</a>
      </footer>
    </main>
  );
}
