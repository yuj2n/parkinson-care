import { useState } from "react";

const COLORS = {
  bg: "#0F1117",
  card: "#1A1D27",
  cardHover: "#1F2235",
  border: "#2A2D3E",
  accent: "#6C8EFF",
  accentSoft: "#1E2A50",
  green: "#4ECBA0",
  greenSoft: "#0F2D24",
  yellow: "#F5C842",
  yellowSoft: "#2D2610",
  red: "#FF6B6B",
  redSoft: "#2D1212",
  purple: "#B06FFF",
  purpleSoft: "#1E1035",
  text: "#E8EAF6",
  textMuted: "#8890B0",
  textDim: "#555A7A",
};

const tabs = [
  { id: "medication", label: "복약", icon: "💊" },
  { id: "bladder", label: "배뇨/배변", icon: "🌊" },
  { id: "exercise", label: "운동", icon: "🏃" },
  { id: "hydration", label: "수분섭취", icon: "💧" },
  { id: "sleep", label: "수면", icon: "🛏️" },
  { id: "symptoms", label: "증상", icon: "📊" },
];

const initialState = {
  medication: [],
  bladder: {
    urineCount: 0,
    nightUrineCount: 0,
    urgency: false,
    stoolDays: 1,
    stoolMed: false,
    stoolHardness: 3,
  },
  exercise: { type: "", duration: 0, balance: 3, falls: [] },
  hydration: { logs: [], goal: 1500 },
  sleep: {
    bedtime: "22:00",
    wakeTime: "07:00",
    sleepBehavior: [],
    napMinutes: 0,
    drowsiness: 3,
  },
  symptoms: { dyskinesia: 0, swallowing: false, orthostatic: false, mood: 3 },
};

function StatusBadge({ label, color }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1,
        color,
        border: `1px solid ${color}33`,
        background: `${color}15`,
        borderRadius: 4,
        padding: "2px 8px",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: "20px 24px",
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, color = COLORS.accent }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 18,
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 17, fontWeight: 700, color }}>{title}</span>
    </div>
  );
}

function Slider({ value, onChange, min = 1, max = 5, labels }) {
  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: COLORS.accent, cursor: "pointer" }}
      />
      {labels && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          {labels.map((l, i) => (
            <span key={i} style={{ fontSize: 11, color: COLORS.textDim }}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
      }}
    >
      <span style={{ color: COLORS.text, fontSize: 14 }}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          cursor: "pointer",
          transition: "background 0.2s",
          background: value ? COLORS.accent : COLORS.border,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: value ? 22 : 2,
            width: 20,
            height: 20,
            borderRadius: 10,
            background: "#fff",
            transition: "left 0.2s",
          }}
        />
      </div>
    </div>
  );
}

function Counter({ value, onChange, label, min = 0, max = 20 }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 0",
      }}
    >
      <span style={{ color: COLORS.text, fontSize: 14 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          style={btnStyle("#FF6B6B")}
        >
          −
        </button>
        <span
          style={{
            color: COLORS.text,
            fontWeight: 700,
            fontSize: 20,
            minWidth: 32,
            textAlign: "center",
          }}
        >
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          style={btnStyle(COLORS.accent)}
        >
          +
        </button>
      </div>
    </div>
  );
}

function btnStyle(color) {
  return {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "none",
    background: `${color}22`,
    color,
    fontWeight: 700,
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

// ─── TABS ────────────────────────────────────────────────────────────────────

function MedicationTab({ data, setData }) {
  const [form, setForm] = useState({
    name: "",
    planned: "",
    actual: "",
    food: "식사 전",
    protein: false,
    onStatus: "ON",
    offDuration: 0,
  });
  const [showForm, setShowForm] = useState(false);

  const addMed = () => {
    if (!form.actual) return;
    setData((d) => ({
      ...d,
      medication: [...d.medication, { ...form, id: Date.now() }],
    }));
    setShowForm(false);
    setForm({
      name: "",
      planned: "",
      actual: "",
      food: "식사 전",
      protein: false,
      onStatus: "ON",
      offDuration: 0,
    });
  };

  return (
    <div>
      <Card>
        <SectionTitle icon="💊" title="복약 기록" color={COLORS.green} />
        {data.medication.length === 0 && (
          <div
            style={{
              color: COLORS.textDim,
              textAlign: "center",
              padding: "20px 0",
              fontSize: 14,
            }}
          >
            오늘 기록된 복약이 없습니다
          </div>
        )}
        {data.medication.map((m) => (
          <div
            key={m.id}
            style={{
              background: COLORS.bg,
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 10,
              border: `1px solid ${m.onStatus === "OFF" ? COLORS.red + "44" : COLORS.green + "44"}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    color: COLORS.accent,
                    fontWeight: 800,
                    fontSize: 15,
                    marginBottom: 2,
                  }}
                >
                  💊 {m.name || "약 이름 미입력"}
                </div>
                <div
                  style={{ color: COLORS.text, fontWeight: 600, fontSize: 14 }}
                >
                  🕐 {m.actual}
                  {m.planned && (
                    <span
                      style={{
                        color: COLORS.textDim,
                        fontWeight: 400,
                        fontSize: 12,
                      }}
                    >
                      {" "}
                      (예정: {m.planned})
                    </span>
                  )}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <StatusBadge label={m.food} color={COLORS.yellow} />
                  {m.protein && (
                    <StatusBadge label="단백질 섭취" color={COLORS.red} />
                  )}
                  <StatusBadge
                    label={m.onStatus}
                    color={m.onStatus === "ON" ? COLORS.green : COLORS.red}
                  />
                  {m.onStatus === "OFF" && m.offDuration > 0 && (
                    <StatusBadge
                      label={`${m.offDuration}분 지속`}
                      color={COLORS.textMuted}
                    />
                  )}
                </div>
              </div>
              <button
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    medication: d.medication.filter((x) => x.id !== m.id),
                  }))
                }
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.textDim,
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {showForm ? (
          <div
            style={{
              background: COLORS.bg,
              borderRadius: 12,
              padding: 16,
              border: `1px solid ${COLORS.border}`,
              marginTop: 8,
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <label
                style={{
                  color: COLORS.textMuted,
                  fontSize: 12,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                약 이름 *
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="예: 마도파, 시네메트, 미라펙스..."
                style={inputStyle}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div>
                <label
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 12,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  예정 시간
                </label>
                <input
                  type="time"
                  value={form.planned}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, planned: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 12,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  실제 복용 시간 *
                </label>
                <input
                  type="time"
                  value={form.actual}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, actual: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label
                style={{
                  color: COLORS.textMuted,
                  fontSize: 12,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                식사 관계
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {["식사 전", "식사 후", "공복"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setForm((f) => ({ ...f, food: opt }))}
                    style={{
                      ...chipStyle,
                      background:
                        form.food === opt ? COLORS.accentSoft : "transparent",
                      color:
                        form.food === opt ? COLORS.accent : COLORS.textMuted,
                      border: `1px solid ${form.food === opt ? COLORS.accent : COLORS.border}`,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label
                style={{
                  color: COLORS.textMuted,
                  fontSize: 12,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                약효 상태
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {["ON", "OFF", "불명확"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setForm((f) => ({ ...f, onStatus: opt }))}
                    style={{
                      ...chipStyle,
                      background:
                        form.onStatus === opt
                          ? opt === "ON"
                            ? COLORS.greenSoft
                            : COLORS.redSoft
                          : "transparent",
                      color:
                        form.onStatus === opt
                          ? opt === "ON"
                            ? COLORS.green
                            : COLORS.red
                          : COLORS.textMuted,
                      border: `1px solid ${form.onStatus === opt ? (opt === "ON" ? COLORS.green : COLORS.red) : COLORS.border}`,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            {form.onStatus === "OFF" && (
              <Counter
                value={form.offDuration}
                onChange={(v) => setForm((f) => ({ ...f, offDuration: v }))}
                label="OFF 지속 시간 (분)"
                max={300}
              />
            )}
            <Toggle
              value={form.protein}
              onChange={(v) => setForm((f) => ({ ...f, protein: v }))}
              label="단백질 섭취와 함께"
            />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={addMed} style={primaryBtn}>
                기록 저장
              </button>
              <button onClick={() => setShowForm(false)} style={secondaryBtn}>
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{ ...primaryBtn, width: "100%", marginTop: 8 }}
          >
            + 복약 기록 추가
          </button>
        )}
      </Card>

      {/* ON/OFF Summary */}
      {data.medication.length > 0 && (
        <Card>
          <SectionTitle
            icon="⚡"
            title="오늘의 약효 현황"
            color={COLORS.yellow}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div
              style={{
                background: COLORS.greenSoft,
                borderRadius: 12,
                padding: 16,
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: 28, fontWeight: 800, color: COLORS.green }}
              >
                {data.medication.filter((m) => m.onStatus === "ON").length}
              </div>
              <div
                style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}
              >
                ON 시간대
              </div>
            </div>
            <div
              style={{
                background: COLORS.redSoft,
                borderRadius: 12,
                padding: 16,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.red }}>
                {data.medication.filter((m) => m.onStatus === "OFF").length}
              </div>
              <div
                style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}
              >
                OFF 시간대
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function BladderTab({ data, setData }) {
  const b = data.bladder;
  const setB = (key, val) =>
    setData((d) => ({ ...d, bladder: { ...d.bladder, [key]: val } }));

  const hardnessLabels = ["매우 딱딱", "딱딱", "보통", "부드러움", "묽음"];

  // urineLogs: [{ id, time, isNight, urgency, incontinence }]
  const logs = b.urineLogs || [];

  const [logForm, setLogForm] = useState({
    normal: false,
    isNight: false,
    urgency: false,
    incontinence: false,
  });

  const addUrineLog = () => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const entry = { id: Date.now(), time, ...logForm };
    setB("urineLogs", [...logs, entry]);
    setLogForm({
      normal: false,
      isNight: false,
      urgency: false,
      incontinence: false,
    });
  };

  const removeLog = (id) =>
    setB(
      "urineLogs",
      logs.filter((l) => l.id !== id),
    );

  const daytime = logs.filter((l) => !l.isNight);
  const nighttime = logs.filter((l) => l.isNight);

  const CheckBox = ({ checked, onChange, label, color = COLORS.accent }) => (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        cursor: "pointer",
        background: checked ? `${color}15` : COLORS.bg,
        border: `1px solid ${checked ? color : COLORS.border}`,
        transition: "all 0.15s",
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          border: `2px solid ${checked ? color : COLORS.textDim}`,
          background: checked ? color : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          flexShrink: 0,
        }}
      >
        {checked && (
          <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>
        )}
      </div>
      <span
        style={{
          color: checked ? color : COLORS.textMuted,
          fontSize: 14,
          fontWeight: checked ? 600 : 400,
        }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div>
      {/* 통계 요약 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {[
          {
            label: "정상뇨",
            value: logs.filter((l) => l.normal).length,
            color: COLORS.green,
          },
          { label: "주간 배뇨", value: daytime.length, color: COLORS.accent },
          { label: "야간뇨", value: nighttime.length, color: COLORS.purple },
          {
            label: "긴박/요실금",
            value: logs.filter((l) => l.urgency || l.incontinence).length,
            color: COLORS.red,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: "10px 6px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>
              {s.value}
            </div>
            <div style={{ color: COLORS.textDim, fontSize: 10, marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* 새 배뇨 기록 */}
      <Card>
        <SectionTitle icon="💧" title="배뇨 기록 추가" color={COLORS.accent} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <CheckBox
            checked={logForm.normal}
            onChange={(v) => setLogForm((f) => ({ ...f, normal: v }))}
            label="✅ 정상뇨 (이상 없음)"
            color={COLORS.green}
          />
          <CheckBox
            checked={logForm.isNight}
            onChange={(v) => setLogForm((f) => ({ ...f, isNight: v }))}
            label="🌙 야간뇨 (수면 중 또는 취침 후)"
            color={COLORS.purple}
          />
          <CheckBox
            checked={logForm.urgency}
            onChange={(v) => setLogForm((f) => ({ ...f, urgency: v }))}
            label="⚡ 긴박뇨 (갑자기 참기 힘든 느낌)"
            color={COLORS.yellow}
          />
          <CheckBox
            checked={logForm.incontinence}
            onChange={(v) => setLogForm((f) => ({ ...f, incontinence: v }))}
            label="⚠️ 요실금 (소변이 새어 나옴)"
            color={COLORS.red}
          />
        </div>
        <button
          onClick={addUrineLog}
          style={{
            ...primaryBtn,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span>+ 지금 시각으로 기록</span>
          <span style={{ opacity: 0.75, fontSize: 12 }}>
            ({new Date().toTimeString().slice(0, 5)})
          </span>
        </button>
      </Card>

      {/* 기록 목록 */}
      {logs.length > 0 && (
        <Card>
          <SectionTitle
            icon="📋"
            title="오늘 배뇨 기록"
            color={COLORS.accent}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...logs].reverse().map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: COLORS.bg,
                  borderRadius: 10,
                  padding: "10px 14px",
                  border: `1px solid ${log.incontinence ? COLORS.red + "55" : log.urgency ? COLORS.yellow + "55" : log.isNight ? COLORS.purple + "55" : COLORS.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>
                    {log.isNight ? "🌙" : "🚿"}
                  </span>
                  <div>
                    <div
                      style={{
                        color: COLORS.text,
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {log.time}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        marginTop: 3,
                        flexWrap: "wrap",
                      }}
                    >
                      {log.normal && (
                        <StatusBadge label="정상뇨" color={COLORS.green} />
                      )}
                      {log.isNight && (
                        <StatusBadge label="야간뇨" color={COLORS.purple} />
                      )}
                      {log.urgency && (
                        <StatusBadge label="긴박뇨" color={COLORS.yellow} />
                      )}
                      {log.incontinence && (
                        <StatusBadge label="요실금" color={COLORS.red} />
                      )}
                      {!log.normal &&
                        !log.isNight &&
                        !log.urgency &&
                        !log.incontinence && (
                          <StatusBadge label="미분류" color={COLORS.textDim} />
                        )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeLog(log.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: COLORS.textDim,
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 배변 */}
      <Card>
        <SectionTitle icon="🍂" title="배변 (대변)" color={COLORS.yellow} />
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ color: COLORS.text, fontSize: 14 }}>배변 주기</span>
            <span style={{ color: COLORS.accent, fontWeight: 700 }}>
              {b.stoolDays === 1 ? "매일" : `${b.stoolDays}일마다 1회`}
            </span>
          </div>
          <Slider
            value={b.stoolDays}
            onChange={(v) => setB("stoolDays", v)}
            min={1}
            max={7}
            labels={["매일", "2일", "3일", "4일", "5일", "6일", "7일+"]}
          />
        </div>
        <Toggle
          value={b.stoolMed}
          onChange={(v) => setB("stoolMed", v)}
          label="변비약 복용 중"
        />
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ color: COLORS.text, fontSize: 14 }}>대변 굳기</span>
            <span style={{ color: COLORS.accent, fontWeight: 700 }}>
              {hardnessLabels[b.stoolHardness - 1]}
            </span>
          </div>
          <Slider
            value={b.stoolHardness}
            onChange={(v) => setB("stoolHardness", v)}
            min={1}
            max={5}
            labels={["매우 딱딱", "", "보통", "", "묽음"]}
          />
        </div>
      </Card>
    </div>
  );
}

function ExerciseTab({ data, setData }) {
  const ex = data.exercise;
  const set = (key, val) =>
    setData((d) => ({ ...d, exercise: { ...d.exercise, [key]: val } }));
  const [fallForm, setFallForm] = useState({ time: "", detail: "" });

  const addFall = () => {
    if (!fallForm.detail) return;
    setData((d) => ({
      ...d,
      exercise: {
        ...d.exercise,
        falls: [...d.exercise.falls, { ...fallForm, id: Date.now() }],
      },
    }));
    setFallForm({ time: "", detail: "" });
  };

  const exerciseTypes = [
    "걷기",
    "스트레칭",
    "실내 자전거",
    "수영",
    "요가",
    "근력운동",
    "기타",
  ];

  return (
    <div>
      <Card>
        <SectionTitle icon="🏋️" title="운동 기록" color={COLORS.green} />
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              color: COLORS.textMuted,
              fontSize: 12,
              display: "block",
              marginBottom: 8,
            }}
          >
            운동 종류
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {exerciseTypes.map((t) => (
              <button
                key={t}
                onClick={() => set("type", t)}
                style={{
                  ...chipStyle,
                  background: ex.type === t ? COLORS.greenSoft : "transparent",
                  color: ex.type === t ? COLORS.green : COLORS.textMuted,
                  border: `1px solid ${ex.type === t ? COLORS.green : COLORS.border}`,
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ color: COLORS.text, fontSize: 14 }}>운동 시간</span>
            <span style={{ color: COLORS.green, fontWeight: 700 }}>
              {ex.duration}분
            </span>
          </div>
          <Slider
            value={ex.duration}
            onChange={(v) => set("duration", v)}
            min={0}
            max={120}
            labels={["0분", "30분", "60분", "90분", "120분"]}
          />
        </div>
      </Card>

      <Card>
        <SectionTitle
          icon="⚖️"
          title="균형 및 보행 상태"
          color={COLORS.purple}
        />
        <div style={{ marginBottom: 6 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ color: COLORS.text, fontSize: 14 }}>
              오늘의 보행 상태
            </span>
            <span style={{ color: COLORS.purple, fontWeight: 700 }}>
              {
                ["매우 불안정", "불안정", "보통", "양호", "매우 양호"][
                  ex.balance - 1
                ]
              }
            </span>
          </div>
          <Slider
            value={ex.balance}
            onChange={(v) => set("balance", v)}
            min={1}
            max={5}
            labels={["매우 불안정", "", "보통", "", "매우 양호"]}
          />
        </div>
        <div
          style={{
            background: COLORS.purpleSoft,
            borderRadius: 10,
            padding: 12,
            marginTop: 12,
          }}
        >
          <div
            style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 4 }}
          >
            💡 동결 현상이란?
          </div>
          <div style={{ color: COLORS.text, fontSize: 13 }}>
            발이 땅에서 안 떨어지는 느낌, 종종걸음 현상
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon="🚨" title="낙상 사고 기록" color={COLORS.red} />
        {ex.falls.length === 0 && (
          <div
            style={{
              color: COLORS.green,
              fontSize: 13,
              padding: "8px 0",
              textAlign: "center",
            }}
          >
            ✅ 오늘 낙상 없음
          </div>
        )}
        {ex.falls.map((f) => (
          <div
            key={f.id}
            style={{
              background: COLORS.redSoft,
              borderRadius: 10,
              padding: 12,
              marginBottom: 8,
              border: `1px solid ${COLORS.red}33`,
            }}
          >
            <div style={{ color: COLORS.red, fontWeight: 700 }}>
              {f.time || "시간 미기록"}
            </div>
            <div style={{ color: COLORS.text, fontSize: 13, marginTop: 4 }}>
              {f.detail}
            </div>
          </div>
        ))}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: 8,
            marginTop: 8,
          }}
        >
          <input
            type="time"
            value={fallForm.time}
            onChange={(e) =>
              setFallForm((f) => ({ ...f, time: e.target.value }))
            }
            placeholder="시간"
            style={inputStyle}
          />
          <input
            value={fallForm.detail}
            onChange={(e) =>
              setFallForm((f) => ({ ...f, detail: e.target.value }))
            }
            placeholder="상황 설명 (넘어짐 / 아찔한 순간)"
            style={inputStyle}
          />
        </div>
        <button
          onClick={addFall}
          style={{
            ...secondaryBtn,
            width: "100%",
            marginTop: 8,
            borderColor: COLORS.red,
            color: COLORS.red,
          }}
        >
          + 낙상 사고 기록
        </button>
      </Card>
    </div>
  );
}

function HydrationTab({ data, setData }) {
  const hy = data.hydration;
  const set = (key, val) =>
    setData((d) => ({ ...d, hydration: { ...d.hydration, [key]: val } }));

  const DRINK_TYPES = [
    { label: "물", icon: "💧", ml: 200 },
    { label: "보리차", icon: "🫖", ml: 200 },
    { label: "이온음료", icon: "🥤", ml: 250 },
    { label: "우유", icon: "🥛", ml: 200 },
    { label: "주스", icon: "🧃", ml: 150 },
    { label: "기타", icon: "🫗", ml: 200 },
  ];

  const [selected, setSelected] = useState(null); // { label, icon, ml }
  const [customMl, setCustomMl] = useState(200);

  const totalMl = hy.logs.reduce((sum, l) => sum + l.ml, 0);
  const goalPercent = Math.min(100, Math.round((totalMl / hy.goal) * 100));

  const handleSelectDrink = (type) => {
    setSelected(type);
    setCustomMl(type.ml);
  };

  const confirmAdd = () => {
    if (!selected) return;
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    setData((d) => ({
      ...d,
      hydration: {
        ...d.hydration,
        logs: [
          ...d.hydration.logs,
          { ...selected, ml: customMl, time, id: Date.now() },
        ],
      },
    }));
    setSelected(null);
    setCustomMl(200);
  };

  const removeDrink = (id) => {
    setData((d) => ({
      ...d,
      hydration: {
        ...d.hydration,
        logs: d.hydration.logs.filter((l) => l.id !== id),
      },
    }));
  };

  const cyan = "#38BDF8";
  const cyanSoft = "#0C2A3A";

  return (
    <div>
      {/* Progress */}
      <Card style={{ border: `1px solid ${cyan}33` }}>
        <SectionTitle icon="💧" title="오늘의 수분 섭취" color={cyan} />
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: cyan,
              letterSpacing: -1,
            }}
          >
            {totalMl}{" "}
            <span
              style={{ fontSize: 20, fontWeight: 400, color: COLORS.textMuted }}
            >
              ml
            </span>
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 2 }}>
            목표 {hy.goal}ml 중 {goalPercent}% 달성
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            background: COLORS.bg,
            borderRadius: 99,
            height: 14,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              transition: "width 0.4s ease",
              width: `${goalPercent}%`,
              background:
                goalPercent >= 100
                  ? `linear-gradient(90deg, ${cyan}, #4ECBA0)`
                  : `linear-gradient(90deg, ${cyan}99, ${cyan})`,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: COLORS.textDim }}>0ml</span>
          <span
            style={{
              fontSize: 11,
              color: goalPercent >= 100 ? COLORS.green : COLORS.textDim,
            }}
          >
            {goalPercent >= 100
              ? "✅ 목표 달성!"
              : `${hy.goal - totalMl}ml 남음`}
          </span>
          <span style={{ fontSize: 11, color: COLORS.textDim }}>
            {hy.goal}ml
          </span>
        </div>

        {/* Goal adjustment */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span style={{ color: COLORS.textMuted, fontSize: 13 }}>
              일일 목표량
            </span>
            <span style={{ color: cyan, fontWeight: 700 }}>{hy.goal}ml</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1000, 1500, 2000, 2500].map((g) => (
              <button
                key={g}
                onClick={() => set("goal", g)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 8,
                  border: `1px solid ${hy.goal === g ? cyan : COLORS.border}`,
                  background: hy.goal === g ? cyanSoft : "transparent",
                  color: hy.goal === g ? cyan : COLORS.textMuted,
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: hy.goal === g ? 700 : 400,
                }}
              >
                {g}ml
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Step 1: 음료 선택 */}
      <Card>
        <SectionTitle icon="➕" title="수분 기록" color={cyan} />
        <div
          style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 10 }}
        >
          ① 음료 종류 선택
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {DRINK_TYPES.map((type) => (
            <button
              key={type.label}
              onClick={() => handleSelectDrink(type)}
              style={{
                background:
                  selected?.label === type.label ? cyanSoft : COLORS.bg,
                border: `1px solid ${selected?.label === type.label ? cyan : COLORS.border}`,
                borderRadius: 12,
                padding: "14px 8px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{type.icon}</div>
              <div
                style={{
                  color: selected?.label === type.label ? cyan : COLORS.text,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {type.label}
              </div>
              <div
                style={{
                  color: selected?.label === type.label ? cyan : COLORS.textDim,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {type.ml}ml
              </div>
            </button>
          ))}
        </div>

        {/* Step 2: ml 조절 및 확인 */}
        {selected && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              background: cyanSoft,
              borderRadius: 12,
              border: `1px solid ${cyan}44`,
            }}
          >
            <div
              style={{
                color: COLORS.textMuted,
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              ② 섭취량 조절 (25ml 단위)
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22 }}>{selected.icon}</span>
                <span style={{ color: COLORS.text, fontWeight: 600 }}>
                  {selected.label}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => setCustomMl((m) => Math.max(25, m - 25))}
                  style={btnStyle(COLORS.red)}
                >
                  −
                </button>
                <div style={{ textAlign: "center", minWidth: 70 }}>
                  <div style={{ color: cyan, fontWeight: 900, fontSize: 22 }}>
                    {customMl}
                  </div>
                  <div style={{ color: COLORS.textDim, fontSize: 11 }}>ml</div>
                </div>
                <button
                  onClick={() => setCustomMl((m) => Math.min(1000, m + 25))}
                  style={btnStyle(cyan)}
                >
                  +
                </button>
              </div>
            </div>
            {/* ml 프리셋 — 25ml 단위 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
                marginBottom: 14,
              }}
            >
              {[50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 500].map(
                (v) => (
                  <button
                    key={v}
                    onClick={() => setCustomMl(v)}
                    style={{
                      padding: "7px 0",
                      borderRadius: 6,
                      border: `1px solid ${customMl === v ? cyan : COLORS.border}`,
                      background: customMl === v ? `${cyan}22` : "transparent",
                      color: customMl === v ? cyan : COLORS.textDim,
                      fontSize: 12,
                      cursor: "pointer",
                      fontWeight: customMl === v ? 700 : 400,
                    }}
                  >
                    {v}ml
                  </button>
                ),
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={confirmAdd}
                style={{ ...primaryBtn, flex: 1, background: cyan }}
              >
                + {customMl}ml 기록
              </button>
              <button
                onClick={() => setSelected(null)}
                style={{ ...secondaryBtn, padding: "12px 14px" }}
              >
                취소
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            background: COLORS.bg,
            borderRadius: 10,
            padding: 12,
            marginTop: 14,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 2 }}
          >
            💡 파킨슨 환자 수분 섭취 안내
          </div>
          <div style={{ color: COLORS.text, fontSize: 13 }}>
            변비 예방과 기립성 저혈압 완화를 위해 하루 1.5~2L 꾸준한 수분 섭취를
            권장합니다.
          </div>
        </div>
      </Card>

      {/* Log list */}
      {hy.logs.length > 0 && (
        <Card>
          <SectionTitle icon="📋" title="오늘 섭취 기록" color={cyan} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...hy.logs].reverse().map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: COLORS.bg,
                  borderRadius: 10,
                  padding: "10px 14px",
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{log.icon}</span>
                  <div>
                    <div
                      style={{
                        color: COLORS.text,
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {log.label}
                    </div>
                    <div style={{ color: COLORS.textDim, fontSize: 12 }}>
                      {log.time}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: cyan, fontWeight: 700, fontSize: 15 }}>
                    {log.ml}ml
                  </span>
                  <button
                    onClick={() => removeDrink(log.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: COLORS.textDim,
                      fontSize: 18,
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: `1px solid ${COLORS.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: COLORS.textMuted, fontSize: 14 }}>
              총 {hy.logs.length}회 섭취
            </span>
            <span style={{ color: cyan, fontWeight: 800, fontSize: 18 }}>
              {totalMl}ml
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}

function SleepTab({ data, setData }) {
  const sl = data.sleep;
  const set = (key, val) =>
    setData((d) => ({ ...d, sleep: { ...d.sleep, [key]: val } }));

  const behaviors = ["잠꼬대", "심한 뒤척임", "헛손질", "수면 중 소리 지름"];

  // wakePeriods: [{ id, from, to }]
  const wakePeriods = sl.wakePeriods || [];
  const [wakeForm, setWakeForm] = useState({ from: "", to: "" });

  const toMins = (t) => {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const fmtMins = (total) => {
    if (total == null || total < 0) return "--";
    const h = Math.floor(total / 60);
    const m = total % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  const calcBedMins = () => {
    try {
      const bm = toMins(sl.bedtime);
      const wm = toMins(sl.wakeTime);
      let diff = wm - bm;
      if (diff < 0) diff += 1440;
      return diff;
    } catch {
      return null;
    }
  };

  const calcWakeMins = () => {
    return wakePeriods.reduce((sum, p) => {
      const fm = toMins(p.from);
      const tm = toMins(p.to);
      if (fm == null || tm == null) return sum;
      let diff = tm - fm;
      if (diff < 0) diff += 1440;
      return sum + diff;
    }, 0);
  };

  const bedMins = calcBedMins();
  const wakeMins = calcWakeMins();
  const actualMins = bedMins != null ? Math.max(0, bedMins - wakeMins) : null;

  const addWakePeriod = () => {
    if (!wakeForm.from || !wakeForm.to) return;
    set("wakePeriods", [...wakePeriods, { id: Date.now(), ...wakeForm }]);
    setWakeForm({ from: "", to: "" });
  };

  const removeWakePeriod = (id) =>
    set(
      "wakePeriods",
      wakePeriods.filter((p) => p.id !== id),
    );

  return (
    <div>
      <Card>
        <SectionTitle icon="🌙" title="수면 시간" color={COLORS.purple} />
        {/* 취침/기상 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <label
              style={{
                color: COLORS.textMuted,
                fontSize: 12,
                display: "block",
                marginBottom: 4,
              }}
            >
              취침 시간
            </label>
            <input
              type="time"
              value={sl.bedtime}
              onChange={(e) => set("bedtime", e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                color: COLORS.textMuted,
                fontSize: 12,
                display: "block",
                marginBottom: 4,
              }}
            >
              기상 시간
            </label>
            <input
              type="time"
              value={sl.wakeTime}
              onChange={(e) => set("wakeTime", e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* 깸 시간 구간 추가 */}
        <div
          style={{
            borderTop: `1px solid ${COLORS.border}`,
            paddingTop: 14,
            marginBottom: 14,
          }}
        >
          <div
            style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 10 }}
          >
            ⏰ 수면 중 깸 구간 기록 (깬 시각 → 다시 잠든 시각)
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: 8,
              alignItems: "center",
            }}
          >
            <div>
              <label
                style={{
                  color: COLORS.textDim,
                  fontSize: 11,
                  display: "block",
                  marginBottom: 3,
                }}
              >
                깬 시각
              </label>
              <input
                type="time"
                value={wakeForm.from}
                onChange={(e) =>
                  setWakeForm((f) => ({ ...f, from: e.target.value }))
                }
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  color: COLORS.textDim,
                  fontSize: 11,
                  display: "block",
                  marginBottom: 3,
                }}
              >
                다시 잠든 시각
              </label>
              <input
                type="time"
                value={wakeForm.to}
                onChange={(e) =>
                  setWakeForm((f) => ({ ...f, to: e.target.value }))
                }
                style={inputStyle}
              />
            </div>
            <button
              onClick={addWakePeriod}
              style={{
                ...primaryBtn,
                padding: "10px 14px",
                marginTop: 14,
                whiteSpace: "nowrap",
              }}
            >
              추가
            </button>
          </div>

          {/* 깸 구간 목록 */}
          {wakePeriods.length > 0 && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {wakePeriods.map((p) => {
                const fm = toMins(p.from);
                const tm = toMins(p.to);
                let dur = tm - fm;
                if (dur < 0) dur += 1440;
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: COLORS.bg,
                      borderRadius: 8,
                      padding: "8px 12px",
                      border: `1px solid ${COLORS.red}33`,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: 16 }}>👁️</span>
                      <span style={{ color: COLORS.text, fontSize: 14 }}>
                        {p.from} → {p.to}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span
                        style={{
                          color: COLORS.red,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        −{fmtMins(dur)}
                      </span>
                      <button
                        onClick={() => removeWakePeriod(p.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: COLORS.textDim,
                          fontSize: 18,
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 수면 시간 요약 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
          }}
        >
          <div
            style={{
              background: COLORS.bg,
              borderRadius: 10,
              padding: 12,
              textAlign: "center",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{ color: COLORS.textDim, fontSize: 10, marginBottom: 4 }}
            >
              침대 시간
            </div>
            <div
              style={{ color: COLORS.textMuted, fontWeight: 700, fontSize: 14 }}
            >
              {fmtMins(bedMins)}
            </div>
          </div>
          <div
            style={{
              background: COLORS.redSoft,
              borderRadius: 10,
              padding: 12,
              textAlign: "center",
              border: `1px solid ${COLORS.red}33`,
            }}
          >
            <div
              style={{ color: COLORS.textDim, fontSize: 10, marginBottom: 4 }}
            >
              총 깸 시간
            </div>
            <div style={{ color: COLORS.red, fontWeight: 700, fontSize: 14 }}>
              −{fmtMins(wakeMins)}
            </div>
          </div>
          <div
            style={{
              background: COLORS.purpleSoft,
              borderRadius: 10,
              padding: 12,
              textAlign: "center",
              border: `1px solid ${COLORS.purple}44`,
            }}
          >
            <div
              style={{ color: COLORS.textDim, fontSize: 10, marginBottom: 4 }}
            >
              실제 수면
            </div>
            <div
              style={{ color: COLORS.purple, fontWeight: 800, fontSize: 14 }}
            >
              {fmtMins(actualMins)}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon="😴" title="수면 중 이상 행동" color={COLORS.red} />
        {behaviors.map((b) => (
          <Toggle
            key={b}
            value={sl.sleepBehavior.includes(b)}
            onChange={(v) =>
              set(
                "sleepBehavior",
                v
                  ? [...sl.sleepBehavior, b]
                  : sl.sleepBehavior.filter((x) => x !== b),
              )
            }
            label={b}
          />
        ))}
      </Card>

      <Card>
        <SectionTitle
          icon="😪"
          title="낮잠 및 주간 졸림증"
          color={COLORS.yellow}
        />
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ color: COLORS.text, fontSize: 14 }}>낮잠 시간</span>
            <span style={{ color: COLORS.yellow, fontWeight: 700 }}>
              {sl.napMinutes}분
            </span>
          </div>
          <Slider
            value={sl.napMinutes}
            onChange={(v) => set("napMinutes", v)}
            min={0}
            max={180}
            labels={["0분", "45분", "90분", "135분", "180분"]}
          />
        </div>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ color: COLORS.text, fontSize: 14 }}>
              주간 졸림증 정도
            </span>
            <span style={{ color: COLORS.yellow, fontWeight: 700 }}>
              {
                ["거의 없음", "약간 있음", "보통", "심함", "매우 심함"][
                  sl.drowsiness - 1
                ]
              }
            </span>
          </div>
          <Slider
            value={sl.drowsiness}
            onChange={(v) => set("drowsiness", v)}
            min={1}
            max={5}
            labels={["거의 없음", "", "보통", "", "매우 심함"]}
          />
        </div>
      </Card>
    </div>
  );
}

function SymptomsTab({ data, setData }) {
  const sy = data.symptoms;
  const set = (key, val) =>
    setData((d) => ({ ...d, symptoms: { ...d.symptoms, [key]: val } }));

  const moodEmojis = ["😔", "😕", "😐", "🙂", "😊"];

  return (
    <div>
      <Card>
        <SectionTitle
          icon="🤸"
          title="이상운동증 (Dyskinesia)"
          color={COLORS.yellow}
        />
        <div
          style={{
            background: COLORS.yellowSoft,
            borderRadius: 10,
            padding: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 4 }}
          >
            💡 이상운동증이란?
          </div>
          <div style={{ color: COLORS.text, fontSize: 13 }}>
            약효가 과해서 몸이 본인 의지와 상관없이 흔들리는 현상
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span style={{ color: COLORS.text, fontSize: 14 }}>
            이상운동증 정도
          </span>
          <span style={{ color: COLORS.yellow, fontWeight: 700 }}>
            {["없음", "약간", "중간", "심함", "매우 심함"][sy.dyskinesia]}
          </span>
        </div>
        <Slider
          value={sy.dyskinesia + 1}
          onChange={(v) => set("dyskinesia", v - 1)}
          min={1}
          max={5}
          labels={["없음", "약간", "중간", "심함", "매우 심함"]}
        />
      </Card>

      <Card>
        <SectionTitle icon="🍽️" title="기타 신체 증상" color={COLORS.accent} />
        <Toggle
          value={sy.swallowing}
          onChange={(v) => set("swallowing", v)}
          label="🥤 삼킴 곤란 (사레 들림)"
        />
        <Toggle
          value={sy.orthostatic}
          onChange={(v) => set("orthostatic", v)}
          label="🔻 기립성 저혈압 (일어설 때 어지러움)"
        />
      </Card>

      <Card>
        <SectionTitle icon="🧠" title="심리 상태" color={COLORS.purple} />
        <div style={{ textAlign: "center", margin: "16px 0" }}>
          <div style={{ fontSize: 48 }}>{moodEmojis[sy.mood - 1]}</div>
          <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 8 }}>
            {["우울함", "다소 우울", "보통", "괜찮음", "좋음"][sy.mood - 1]}
          </div>
        </div>
        <Slider
          value={sy.mood}
          onChange={(v) => set("mood", v)}
          min={1}
          max={5}
          labels={["우울함", "", "보통", "", "좋음"]}
        />
        <div
          style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}
        >
          {["불안감", "무기력증", "정서 불안"].map((tag) => (
            <span
              key={tag}
              style={{
                background: COLORS.purpleSoft,
                color: COLORS.purple,
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 13,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </Card>

      {/* Daily Summary */}
      <Card style={{ border: `1px solid ${COLORS.accent}44` }}>
        <SectionTitle
          icon="📋"
          title="오늘의 건강 요약"
          color={COLORS.accent}
        />
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {[
            {
              label: "복약 횟수",
              value: `${data.medication.length}회`,
              color: COLORS.green,
            },
            {
              label: "약효 OFF",
              value: `${data.medication.filter((m) => m.onStatus === "OFF").length}회`,
              color: COLORS.red,
            },
            {
              label: "이상운동증",
              value: ["없음", "약간", "중간", "심함", "매우 심함"][
                sy.dyskinesia
              ],
              color: COLORS.yellow,
            },
            {
              label: "기분 상태",
              value: ["우울", "다소 우울", "보통", "괜찮음", "좋음"][
                sy.mood - 1
              ],
              color: COLORS.purple,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{ background: COLORS.bg, borderRadius: 10, padding: 14 }}
            >
              <div
                style={{ color: COLORS.textDim, fontSize: 11, marginBottom: 4 }}
              >
                {item.label}
              </div>
              <div style={{ color: item.color, fontWeight: 700, fontSize: 16 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── SHARED STYLES ───────────────────────────────────────────────────────────
const inputStyle = {
  background: "#0F1117",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  color: COLORS.text,
  padding: "10px 12px",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};
const chipStyle = {
  borderRadius: 20,
  padding: "6px 14px",
  fontSize: 13,
  cursor: "pointer",
  border: "1px solid",
};
const primaryBtn = {
  background: COLORS.accent,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 20px",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};
const secondaryBtn = {
  background: "transparent",
  color: COLORS.textMuted,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  padding: "12px 20px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("medication");
  const [data, setData] = useState(initialState);

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const tabContent = {
    medication: <MedicationTab data={data} setData={setData} />,
    bladder: <BladderTab data={data} setData={setData} />,
    exercise: <ExerciseTab data={data} setData={setData} />,
    hydration: <HydrationTab data={data} setData={setData} />,
    sleep: <SleepTab data={data} setData={setData} />,
    symptoms: <SymptomsTab data={data} setData={setData} />,
  };

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        fontFamily: "'Segoe UI', -apple-system, sans-serif",
        color: COLORS.text,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: COLORS.card,
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "16px 20px 0",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}
              >
                🧬 파킨슨 <span style={{ color: COLORS.accent }}>케어</span>
              </div>
              <div
                style={{ color: COLORS.textDim, fontSize: 12, marginTop: 2 }}
              >
                {today}
              </div>
            </div>
            <div
              style={{
                background: COLORS.accentSoft,
                borderRadius: 10,
                padding: "8px 14px",
                textAlign: "center",
              }}
            >
              <div style={{ color: COLORS.textMuted, fontSize: 10 }}>복약</div>
              <div
                style={{ color: COLORS.accent, fontWeight: 800, fontSize: 20 }}
              >
                {data.medication.length}
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 10 }}>회</div>
            </div>
          </div>

          {/* Tab Bar */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  minWidth: 60,
                  padding: "10px 4px 12px",
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  borderBottom:
                    activeTab === tab.id
                      ? `2px solid ${COLORS.accent}`
                      : "2px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                <span
                  style={{
                    fontSize: 11,
                    color:
                      activeTab === tab.id ? COLORS.accent : COLORS.textDim,
                    fontWeight: activeTab === tab.id ? 700 : 400,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 100px" }}
      >
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
