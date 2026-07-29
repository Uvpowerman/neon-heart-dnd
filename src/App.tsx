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
    map: "./assets/maps/Этап_1_Неоновый_рынок.png",
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
    map: "./assets/maps/Этап_2_Магнитное_метро.png",
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
    map: "./assets/maps/Этап_3_Зеркало-0.png",
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
    map: "./assets/maps/Этап_4_Директор_Нуль.png",
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
    image: "./assets/cards/Штурмовик.png",
    stats: "ОЗ 10 · АТК +2 · ЗАЩ 4 · ЭН 3",
    accent: "cyan",
    abilities: ["Импульсный удар — 3 урона и отбрасывание", "Энергощит — уменьшает урон на 2", "Прорыв — игнорирует броню и иммунитет"],
  },
  {
    name: "Техномант",
    image: "./assets/cards/Техномант.png",
    stats: "ОЗ 7 · АТК +1 · ЗАЩ 3 · ЭН 4",
    accent: "violet",
    abilities: ["Взлом — робот пропускает ход", "Перегрузка — 3 урона роботу", "Перепрошивка — враг помогает героям"],
  },
  {
    name: "Медик",
    image: "./assets/cards/Медик.png",
    stats: "ОЗ 8 · АТК +1 · ЗАЩ 3 · ЭН 4",
    accent: "green",
    abilities: ["Наноремонт — восстановить 3 ОЗ", "Стабилизатор — вернуть героя с 4 ОЗ", "Адреналин — дополнительное действие"],
  },
  {
    name: "Тень",
    image: "./assets/cards/Тень.png",
    stats: "ОЗ 8 · АТК +2 · ЗАЩ 4 · ЭН 3",
    accent: "pink",
    abilities: ["Невидимость — нельзя выбрать целью", "Точный удар — игнорирует броню", "Ложный след — заставляет врага перебросить атаку"],
  },
];

const enemies = [
  { name: "Дрон-ищейка", image: "./assets/cards/Дрон-ищейка.png", stats: "ОЗ 4 · АТК +1 · ЗАЩ 3", skill: "Метка: цель получает −1 ЗАЩ." },
  { name: "Гончая файрвола", image: "./assets/cards/Гончая_файрвола.png", stats: "ОЗ 6 · АТК +2 · ЗАЩ 4", skill: "Файрвол: первый Взлом не действует." },
  { name: "Глитч-мародёр", image: "./assets/cards/Глитч-мародёр.png", stats: "ОЗ 7 · АТК +2 · ЗАЩ 3", skill: "Глитч: способность цели стоит +1 ЭН." },
  { name: "Зеркало-0", image: "./assets/cards/Зеркало-0.png", stats: "ОЗ 14 · АТК +2 · ЗАЩ 5", skill: "Отражение: копирует первую способность." },
  { name: "Директор Нуль", image: "./assets/cards/Директор_Нуль.png", stats: "ОЗ 24 · АТК +3 · ЗАЩ 5", skill: "Три фазы, щиты и смена иммунитетов." },
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
        {stages.map((stage) => (
          <details key={stage.id}>
            <summary>
              <span>{stage.kicker}</span>
              <strong>{stage.title}</strong>
              <em>{stage.time}</em>
            </summary>
            <div>
              <p><b>Задача:</b> {stage.goal}</p>
              <ul>{stage.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
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
          <img src="./assets/maps/Этап_4_Директор_Нуль.png" alt="Ядро Башни Нуль — финальная карта" />
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
        <div>
          <article><b>01</b><h3>Освободить Люму</h3><p>ИИ становится защитником города и советуется с людьми.</p></article>
          <article><b>02</b><h3>Передать власть жителям</h3><p>Каждый район получает голос и участвует в решениях.</p></article>
          <article><b>03</b><h3>Отключить систему</h3><p>Город видит звёзды и начинает строить новый порядок.</p></article>
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
