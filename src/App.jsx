import { useState, useEffect, useCallback } from "react";

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#0F1117",
  card: "#1A1D27",
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
  cyan: "#38BDF8",
  cyanSoft: "#0C2A3A",
  text: "#E8EAF6",
  textMuted: "#8890B0",
  textDim: "#555A7A",
};

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "parkinson_care_v2";
const loadStore = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};
const saveStore = (store) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const emptyDay = () => ({
  medication: [],
  bladder: { logs: [], stoolLogs: [] },
  exercise: { items: [] },
  hydration: { logs: [], goal: 2000 },
  status: { entries: [] },
  symptoms: {
    freezing: false,
    swallowing: false,
    orthostatic: false,
    falls: [],
    gait: 3,
  },
  sleep: {
    bedtime: "",
    wakeTime: "",
    wakePeriods: [],
    sleepBehavior: [],
    napMinutes: 0,
    drowsiness: 3,
  },
  diary: "",
});

// ─── SHARED UI ───────────────────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div
    style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: "20px 24px",
      marginBottom: 16,
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionTitle = ({ icon, title, color = C.accent }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}
  >
    <span style={{ fontSize: 20 }}>{icon}</span>
    <span style={{ fontSize: 16, fontWeight: 700, color }}>{title}</span>
  </div>
);

const Badge = ({ label, color }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 700,
      color,
      border: `1px solid ${color}33`,
      background: `${color}15`,
      borderRadius: 4,
      padding: "2px 8px",
    }}
  >
    {label}
  </span>
);

const Toggle = ({ value, onChange, label }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 0",
    }}
  >
    <span style={{ color: C.text, fontSize: 14 }}>{label}</span>
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        cursor: "pointer",
        background: value ? C.accent : C.border,
        position: "relative",
        transition: "background 0.2s",
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

const Slider = ({ value, onChange, min = 0, max = 10, labels }) => (
  <div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: C.accent, cursor: "pointer" }}
    />
    {labels && (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 2,
        }}
      >
        {labels.map((l, i) => (
          <span key={i} style={{ fontSize: 10, color: C.textDim }}>
            {l}
          </span>
        ))}
      </div>
    )}
  </div>
);

const inputStyle = {
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  padding: "10px 12px",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};
const btnPrimary = {
  background: C.accent,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "11px 18px",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};
const btnSecondary = {
  background: "transparent",
  color: C.textMuted,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "11px 18px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};
const btnIcon = (color = C.accent) => ({
  width: 30,
  height: 30,
  borderRadius: 7,
  border: "none",
  background: `${color}22`,
  color,
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

// ─── EDIT TIME MODAL ─────────────────────────────────────────────────────────
function EditTimeModal({ time, onSave, onClose }) {
  const [val, setVal] = useState(time);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000a",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 24,
          width: 280,
        }}
      >
        <div style={{ color: C.text, fontWeight: 700, marginBottom: 16 }}>
          시간 편집
        </div>
        <input
          type="time"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          style={{ ...inputStyle, marginBottom: 16 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => onSave(val)}
            style={{ ...btnPrimary, flex: 1 }}
          >
            저장
          </button>
          <button onClick={onClose} style={{ ...btnSecondary, flex: 1 }}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: MEDICATION ─────────────────────────────────────────────────────────
function MedicationTab({ day, setDay }) {
  const [form, setForm] = useState({ name: "", planned: "", actual: "" });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const addMed = () => {
    if (!form.actual) return;
    setDay((d) => ({
      ...d,
      medication: [...d.medication, { ...form, id: Date.now() }],
    }));
    setShowForm(false);
    setForm({ name: "", planned: "", actual: "" });
  };

  const removeMed = (id) =>
    setDay((d) => ({
      ...d,
      medication: d.medication.filter((m) => m.id !== id),
    }));

  const saveTime = (id, time) => {
    setDay((d) => ({
      ...d,
      medication: d.medication.map((m) =>
        m.id === id ? { ...m, actual: time } : m,
      ),
    }));
    setEditId(null);
  };

  return (
    <div>
      {editId && (
        <EditTimeModal
          time={day.medication.find((m) => m.id === editId)?.actual || ""}
          onSave={(t) => saveTime(editId, t)}
          onClose={() => setEditId(null)}
        />
      )}
      <Card>
        <SectionTitle icon="💊" title="복약 기록" color={C.green} />
        {day.medication.length === 0 && (
          <div
            style={{
              color: C.textDim,
              textAlign: "center",
              padding: "20px 0",
              fontSize: 14,
            }}
          >
            오늘 기록된 복약이 없습니다
          </div>
        )}
        {day.medication.map((m) => (
          <div
            key={m.id}
            style={{
              background: C.bg,
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 10,
              border: `1px solid ${C.green}33`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ color: C.accent, fontWeight: 800, fontSize: 15 }}>
                  💊 {m.name || "약 이름 미입력"}
                </div>
                <div style={{ color: C.text, fontSize: 13, marginTop: 4 }}>
                  🕐 {m.actual}
                  {m.planned && (
                    <span style={{ color: C.textDim, fontSize: 12 }}>
                      {" "}
                      (예정: {m.planned})
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setEditId(m.id)}
                  style={{ ...btnIcon(C.accent), fontSize: 13 }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => removeMed(m.id)}
                  style={{ ...btnIcon(C.red), fontSize: 13 }}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}

        {showForm ? (
          <div
            style={{
              background: C.bg,
              borderRadius: 12,
              padding: 16,
              border: `1px solid ${C.border}`,
              marginTop: 8,
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <label
                style={{
                  color: C.textMuted,
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
                marginBottom: 14,
              }}
            >
              <div>
                <label
                  style={{
                    color: C.textMuted,
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
                    color: C.textMuted,
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
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addMed} style={btnPrimary}>
                저장
              </button>
              <button onClick={() => setShowForm(false)} style={btnSecondary}>
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{ ...btnPrimary, width: "100%", marginTop: 8 }}
          >
            + 복약 기록 추가
          </button>
        )}
      </Card>

      {/* 복약 현황 차트 */}
      {day.medication.length > 0 && (
        <Card>
          <SectionTitle icon="📋" title="오늘 복약 타임라인" color={C.yellow} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...day.medication]
              .sort((a, b) => a.actual.localeCompare(b.actual))
              .map((m) => (
                <div
                  key={m.id}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <span
                    style={{ color: C.textDim, fontSize: 12, minWidth: 40 }}
                  >
                    {m.actual}
                  </span>
                  <div
                    style={{ flex: 1, height: 2, background: C.accent + "44" }}
                  />
                  <span style={{ color: C.text, fontSize: 13 }}>
                    {m.name || "미입력"}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── TAB: BLADDER/STOOL ──────────────────────────────────────────────────────
function BladderTab({ day, setDay }) {
  const [bladderSection, setBladderSection] = useState("first"); // "first" = 배뇨 먼저
  const [logForm, setLogForm] = useState({
    normal: false,
    isNight: false,
    urgency: false,
    incontinence: false,
  });
  const [stoolForm, setStoolForm] = useState({ had: false, urgency: false });
  const [editLogId, setEditLogId] = useState(null);
  const [editStoolId, setEditStoolId] = useState(null);

  const logs = day.bladder.logs || [];
  const stoolLogs = day.bladder.stoolLogs || [];

  const setB = (patch) =>
    setDay((d) => ({ ...d, bladder: { ...d.bladder, ...patch } }));

  const addUrineLog = () => {
    const entry = { id: Date.now(), time: nowTime(), ...logForm };
    setB({ logs: [...logs, entry] });
    setLogForm({
      normal: false,
      isNight: false,
      urgency: false,
      incontinence: false,
    });
  };

  const addStoolLog = () => {
    const entry = { id: Date.now(), time: nowTime(), ...stoolForm };
    setB({ stoolLogs: [...stoolLogs, entry] });
    setStoolForm({ had: false, urgency: false });
  };

  const CheckBox = ({ checked, onChange, label, color = C.accent }) => (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        cursor: "pointer",
        background: checked ? `${color}15` : C.bg,
        border: `1px solid ${checked ? color : C.border}`,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          border: `2px solid ${checked ? color : C.textDim}`,
          background: checked ? color : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
      </div>
      <span
        style={{
          color: checked ? color : C.textMuted,
          fontSize: 14,
          fontWeight: checked ? 600 : 400,
        }}
      >
        {label}
      </span>
    </div>
  );

  const daytime = logs.filter((l) => !l.isNight);
  const nighttime = logs.filter((l) => l.isNight);

  const BladderSection = () => (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {[
          {
            label: "정상뇨",
            value: logs.filter((l) => l.normal).length,
            color: C.green,
          },
          { label: "주간", value: daytime.length, color: C.accent },
          { label: "야간뇨", value: nighttime.length, color: C.purple },
          {
            label: "긴박/실금",
            value: logs.filter((l) => l.urgency || l.incontinence).length,
            color: C.red,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "8px 4px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>
              {s.value}
            </div>
            <div style={{ color: C.textDim, fontSize: 10, marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <Card>
        <SectionTitle icon="🚿" title="배뇨 기록" color={C.accent} />
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
            label="✅ 정상뇨"
            color={C.green}
          />
          <CheckBox
            checked={logForm.isNight}
            onChange={(v) => setLogForm((f) => ({ ...f, isNight: v }))}
            label="🌙 야간뇨"
            color={C.purple}
          />
          <CheckBox
            checked={logForm.urgency}
            onChange={(v) => setLogForm((f) => ({ ...f, urgency: v }))}
            label="⚡ 긴박뇨"
            color={C.yellow}
          />
          <CheckBox
            checked={logForm.incontinence}
            onChange={(v) => setLogForm((f) => ({ ...f, incontinence: v }))}
            label="⚠️ 요실금"
            color={C.red}
          />
        </div>
        <button
          onClick={addUrineLog}
          style={{
            ...btnPrimary,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span>+ 지금 시각으로 기록</span>
          <span style={{ opacity: 0.7, fontSize: 12 }}>({nowTime()})</span>
        </button>
      </Card>

      {logs.length > 0 && (
        <Card>
          <SectionTitle icon="📋" title="오늘 배뇨 기록" color={C.accent} />
          {editLogId && (
            <EditTimeModal
              time={logs.find((l) => l.id === editLogId)?.time || ""}
              onSave={(t) => {
                setB({
                  logs: logs.map((l) =>
                    l.id === editLogId ? { ...l, time: t } : l,
                  ),
                });
                setEditLogId(null);
              }}
              onClose={() => setEditLogId(null)}
            />
          )}
          {[...logs].reverse().map((log) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: C.bg,
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 8,
                border: `1px solid ${log.incontinence ? C.red + "55" : log.urgency ? C.yellow + "55" : log.isNight ? C.purple + "55" : C.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>
                  {log.isNight ? "🌙" : "🚿"}
                </span>
                <div>
                  <div style={{ color: C.text, fontWeight: 700 }}>
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
                    {log.normal && <Badge label="정상뇨" color={C.green} />}
                    {log.isNight && <Badge label="야간뇨" color={C.purple} />}
                    {log.urgency && <Badge label="긴박뇨" color={C.yellow} />}
                    {log.incontinence && <Badge label="요실금" color={C.red} />}
                    {!log.normal &&
                      !log.isNight &&
                      !log.urgency &&
                      !log.incontinence && (
                        <Badge label="기록" color={C.textDim} />
                      )}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setEditLogId(log.id)}
                  style={{ ...btnIcon(C.accent), fontSize: 12 }}
                >
                  ✏️
                </button>
                <button
                  onClick={() =>
                    setB({ logs: logs.filter((l) => l.id !== log.id) })
                  }
                  style={{ ...btnIcon(C.red), fontSize: 14 }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );

  const StoolSection = () => (
    <Card>
      {editStoolId && (
        <EditTimeModal
          time={stoolLogs.find((l) => l.id === editStoolId)?.time || ""}
          onSave={(t) => {
            setB({
              stoolLogs: stoolLogs.map((l) =>
                l.id === editStoolId ? { ...l, time: t } : l,
              ),
            });
            setEditStoolId(null);
          }}
          onClose={() => setEditStoolId(null)}
        />
      )}
      <SectionTitle icon="🍂" title="배변 기록" color={C.yellow} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <CheckBox
          checked={stoolForm.had}
          onChange={(v) => setStoolForm((f) => ({ ...f, had: v }))}
          label="✅ 배변 성공"
          color={C.green}
        />
        <CheckBox
          checked={stoolForm.urgency}
          onChange={(v) => setStoolForm((f) => ({ ...f, urgency: v }))}
          label="⚡ 잔변감 있음"
          color={C.yellow}
        />
      </div>
      <button
        onClick={addStoolLog}
        style={{
          ...btnPrimary,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          background: C.yellow,
          color: "#1A1400",
        }}
      >
        <span>+ 지금 시각으로 기록</span>
        <span style={{ opacity: 0.7, fontSize: 12 }}>({nowTime()})</span>
      </button>

      {stoolLogs.length > 0 && (
        <div style={{ marginTop: 14 }}>
          {[...stoolLogs].reverse().map((log) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: C.bg,
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 8,
                border: `1px solid ${C.yellow}33`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🍂</span>
                <div>
                  <div style={{ color: C.text, fontWeight: 700 }}>
                    {log.time}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                    {log.had && <Badge label="배변 성공" color={C.green} />}
                    {log.urgency && <Badge label="잔변감" color={C.yellow} />}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setEditStoolId(log.id)}
                  style={{ ...btnIcon(C.accent), fontSize: 12 }}
                >
                  ✏️
                </button>
                <button
                  onClick={() =>
                    setB({
                      stoolLogs: stoolLogs.filter((l) => l.id !== log.id),
                    })
                  }
                  style={{ ...btnIcon(C.red), fontSize: 14 }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button
          onClick={() =>
            setBladderSection(
              bladderSection === "first" ? "stoolFirst" : "first",
            )
          }
          style={{ ...btnSecondary, fontSize: 12, padding: "8px 14px" }}
        >
          🔄 배뇨/배변 순서 바꾸기
        </button>
      </div>
      {bladderSection === "first" ? (
        <>
          <BladderSection />
          <StoolSection />
        </>
      ) : (
        <>
          <StoolSection />
          <BladderSection />
        </>
      )}
    </div>
  );
}

// ─── TAB: EXERCISE ───────────────────────────────────────────────────────────
function ExerciseTab({ day, setDay }) {
  const [form, setForm] = useState({ name: "", reps: "", duration: "" });
  const items = day.exercise.items || [];

  const addItem = () => {
    if (!form.name) return;
    setDay((d) => ({
      ...d,
      exercise: {
        ...d.exercise,
        items: [
          ...d.exercise.items,
          { ...form, id: Date.now(), time: nowTime() },
        ],
      },
    }));
    setForm({ name: "", reps: "", duration: "" });
  };

  const removeItem = (id) =>
    setDay((d) => ({
      ...d,
      exercise: { ...d.exercise, items: items.filter((i) => i.id !== id) },
    }));

  return (
    <div>
      <Card>
        <SectionTitle icon="🏃" title="운동 기록" color={C.green} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <div>
            <label
              style={{
                color: C.textMuted,
                fontSize: 12,
                display: "block",
                marginBottom: 4,
              }}
            >
              운동 종류 *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="예: 스쿼트, 걷기, 스트레칭..."
              style={inputStyle}
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <div>
              <label
                style={{
                  color: C.textMuted,
                  fontSize: 12,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                횟수 / 세트
              </label>
              <input
                value={form.reps}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reps: e.target.value }))
                }
                placeholder="예: 10회 3세트"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{
                  color: C.textMuted,
                  fontSize: 12,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                시간 (분)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: e.target.value }))
                }
                placeholder="20"
                style={inputStyle}
                min="0"
              />
            </div>
          </div>
        </div>
        <button onClick={addItem} style={{ ...btnPrimary, width: "100%" }}>
          + 운동 추가
        </button>
      </Card>

      {items.length > 0 && (
        <Card>
          <SectionTitle icon="📋" title="오늘 운동 목록" color={C.green} />
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: C.bg,
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 8,
                border: `1px solid ${C.green}33`,
              }}
            >
              <div>
                <div style={{ color: C.green, fontWeight: 700, fontSize: 15 }}>
                  🏋️ {item.name}
                </div>
                <div style={{ color: C.textMuted, fontSize: 12, marginTop: 3 }}>
                  {item.reps && <span>{item.reps}</span>}
                  {item.reps && item.duration && (
                    <span style={{ margin: "0 6px" }}>·</span>
                  )}
                  {item.duration && <span>{item.duration}분</span>}
                  <span style={{ color: C.textDim, marginLeft: 8 }}>
                    {item.time}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                style={{ ...btnIcon(C.red), fontSize: 14 }}
              >
                ×
              </button>
            </div>
          ))}
          <div
            style={{
              marginTop: 8,
              paddingTop: 12,
              borderTop: `1px solid ${C.border}`,
              color: C.textMuted,
              fontSize: 13,
            }}
          >
            총 {items.reduce((s, i) => s + (Number(i.duration) || 0), 0)}분 운동
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── TAB: HYDRATION ──────────────────────────────────────────────────────────
function HydrationTab({ day, setDay }) {
  const hy = day.hydration;
  const [customMl, setCustomMl] = useState(200);
  const [editGoal, setEditGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(hy.goal);
  const [editLogId, setEditLogId] = useState(null);

  const logs = hy.logs || [];
  const totalMl = logs.reduce((s, l) => s + l.ml, 0);
  const goalPercent = Math.min(100, Math.round((totalMl / hy.goal) * 100));

  const setH = (patch) =>
    setDay((d) => ({ ...d, hydration: { ...d.hydration, ...patch } }));

  const addLog = () => {
    setH({
      logs: [...logs, { id: Date.now(), ml: customMl, time: nowTime() }],
    });
  };

  const removeLog = (id) => setH({ logs: logs.filter((l) => l.id !== id) });

  const saveTime = (id, time) => {
    setH({ logs: logs.map((l) => (l.id === id ? { ...l, time } : l)) });
    setEditLogId(null);
  };

  return (
    <div>
      {editLogId && (
        <EditTimeModal
          time={logs.find((l) => l.id === editLogId)?.time || ""}
          onSave={(t) => saveTime(editLogId, t)}
          onClose={() => setEditLogId(null)}
        />
      )}

      <Card style={{ border: `1px solid ${C.cyan}33` }}>
        <SectionTitle icon="💧" title="오늘의 수분 섭취" color={C.cyan} />
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.cyan }}>
            {totalMl}
            <span style={{ fontSize: 18, fontWeight: 400, color: C.textMuted }}>
              ml
            </span>
          </div>
          <div style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>
            목표 {hy.goal}ml 중 {goalPercent}% 달성
          </div>
        </div>
        <div
          style={{
            background: C.bg,
            borderRadius: 99,
            height: 12,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              width: `${goalPercent}%`,
              transition: "width 0.4s",
              background:
                goalPercent >= 100
                  ? `linear-gradient(90deg, ${C.cyan}, ${C.green})`
                  : C.cyan,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: C.textDim,
          }}
        >
          <span>0ml</span>
          <span style={{ color: goalPercent >= 100 ? C.green : C.textDim }}>
            {goalPercent >= 100
              ? "✅ 목표 달성!"
              : `${hy.goal - totalMl}ml 남음`}
          </span>
          <span>{hy.goal}ml</span>
        </div>

        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: C.textMuted, fontSize: 13 }}>
            일일 목표: <strong style={{ color: C.cyan }}>{hy.goal}ml</strong>
          </span>
          <button
            onClick={() => {
              setEditGoal(true);
              setGoalInput(hy.goal);
            }}
            style={{ ...btnSecondary, fontSize: 12, padding: "6px 12px" }}
          >
            변경
          </button>
        </div>
        {editGoal && (
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(Number(e.target.value))}
              style={{ ...inputStyle, flex: 1 }}
              min="500"
              max="5000"
              step="100"
            />
            <button
              onClick={() => {
                setH({ goal: goalInput });
                setEditGoal(false);
              }}
              style={btnPrimary}
            >
              저장
            </button>
            <button onClick={() => setEditGoal(false)} style={btnSecondary}>
              취소
            </button>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon="➕" title="물 기록" color={C.cyan} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <button
            onClick={() => setCustomMl((m) => Math.max(25, m - 25))}
            style={btnIcon(C.red)}
          >
            −
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: C.cyan, fontWeight: 900, fontSize: 32 }}>
              {customMl}
            </div>
            <div style={{ color: C.textDim, fontSize: 12 }}>ml</div>
          </div>
          <button
            onClick={() => setCustomMl((m) => Math.min(2000, m + 25))}
            style={btnIcon(C.cyan)}
          >
            +
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 6,
            marginBottom: 14,
          }}
        >
          {[100, 150, 200, 250, 300, 350, 400, 500].map((v) => (
            <button
              key={v}
              onClick={() => setCustomMl(v)}
              style={{
                padding: "7px 0",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
                border: `1px solid ${customMl === v ? C.cyan : C.border}`,
                background: customMl === v ? `${C.cyan}22` : "transparent",
                color: customMl === v ? C.cyan : C.textDim,
                fontWeight: customMl === v ? 700 : 400,
              }}
            >
              {v}ml
            </button>
          ))}
        </div>
        <button
          onClick={addLog}
          style={{
            ...btnPrimary,
            width: "100%",
            background: C.cyan,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span>💧 {customMl}ml 기록</span>
          <span style={{ opacity: 0.7, fontSize: 12 }}>({nowTime()})</span>
        </button>
      </Card>

      {logs.length > 0 && (
        <Card>
          <SectionTitle icon="📋" title="오늘 섭취 기록" color={C.cyan} />
          {[...logs].reverse().map((log) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: C.bg,
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 8,
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>💧</span>
                <div>
                  <div style={{ color: C.text, fontWeight: 600 }}>
                    {log.ml}ml
                  </div>
                  <div style={{ color: C.textDim, fontSize: 12 }}>
                    {log.time}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setEditLogId(log.id)}
                  style={{ ...btnIcon(C.accent), fontSize: 12 }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => removeLog(log.id)}
                  style={{ ...btnIcon(C.red), fontSize: 14 }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 8,
              paddingTop: 12,
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: C.textMuted, fontSize: 13 }}>
              총 {logs.length}회
            </span>
            <span style={{ color: C.cyan, fontWeight: 800, fontSize: 16 }}>
              {totalMl}ml
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── TAB: STATUS (약 복용 전후) ───────────────────────────────────────────────
function StatusTab({ day, setDay }) {
  const entries = day.status.entries || [];
  const [form, setForm] = useState({
    label: "복용 전",
    pain: 0,
    stiffness: 0,
    posture: 0,
    gait: 0,
  });
  const [showForm, setShowForm] = useState(false);

  const addEntry = () => {
    setDay((d) => ({
      ...d,
      status: {
        ...d.status,
        entries: [...entries, { ...form, id: Date.now(), time: nowTime() }],
      },
    }));
    setShowForm(false);
    setForm({ label: "복용 전", pain: 0, stiffness: 0, posture: 0, gait: 0 });
  };

  const removeEntry = (id) =>
    setDay((d) => ({
      ...d,
      status: { ...d.status, entries: entries.filter((e) => e.id !== id) },
    }));

  const metrics = [
    { key: "pain", label: "통증", icon: "😣", color: C.red },
    { key: "stiffness", label: "경직", icon: "🦾", color: C.yellow },
    { key: "posture", label: "자세 불안정", icon: "⚖️", color: C.purple },
    { key: "gait", label: "보행", icon: "🚶", color: C.green },
  ];

  const ScoreBar = ({ value, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: C.border,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value * 10}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.3s",
          }}
        />
      </div>
      <span style={{ color, fontWeight: 700, fontSize: 13, minWidth: 20 }}>
        {value}
      </span>
    </div>
  );

  return (
    <div>
      <div
        style={{
          background: C.accentSoft,
          borderRadius: 12,
          padding: 12,
          marginBottom: 14,
          border: `1px solid ${C.accent}44`,
        }}
      >
        <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 4 }}>
          💊 이 탭의 목적
        </div>
        <div style={{ color: C.text, fontSize: 13 }}>
          약 복용 전·후로 상태를 기록해 호전 여부를 추적합니다
        </div>
      </div>

      <Card>
        <SectionTitle icon="📊" title="상태 기록" color={C.accent} />
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{ ...btnPrimary, width: "100%" }}
          >
            + 상태 기록 추가
          </button>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                "복용 전",
                "복용 후 30분",
                "복용 후 1시간",
                "복용 후 2시간",
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setForm((f) => ({ ...f, label: opt }))}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    borderRadius: 8,
                    fontSize: 11,
                    cursor: "pointer",
                    border: `1px solid ${form.label === opt ? C.accent : C.border}`,
                    background:
                      form.label === opt ? C.accentSoft : "transparent",
                    color: form.label === opt ? C.accent : C.textMuted,
                    fontWeight: form.label === opt ? 700 : 400,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            {metrics.map((m) => (
              <div key={m.key} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: C.text, fontSize: 14 }}>
                    {m.icon} {m.label}
                  </span>
                  <span style={{ color: m.color, fontWeight: 700 }}>
                    {form[m.key]} / 10
                  </span>
                </div>
                <Slider
                  value={form[m.key]}
                  onChange={(v) => setForm((f) => ({ ...f, [m.key]: v }))}
                  min={0}
                  max={10}
                  labels={["0", "", "", "", "", "5", "", "", "", "", "10"]}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addEntry} style={btnPrimary}>
                저장
              </button>
              <button onClick={() => setShowForm(false)} style={btnSecondary}>
                취소
              </button>
            </div>
          </div>
        )}
      </Card>

      {entries.length > 0 && (
        <Card>
          <SectionTitle icon="📈" title="오늘 상태 기록" color={C.accent} />
          {entries.map((e) => (
            <div
              key={e.id}
              style={{
                background: C.bg,
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 10,
                border: `1px solid ${C.accent}33`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div>
                  <span
                    style={{ color: C.accent, fontWeight: 700, fontSize: 14 }}
                  >
                    {e.label}
                  </span>
                  <span
                    style={{ color: C.textDim, fontSize: 12, marginLeft: 8 }}
                  >
                    {e.time}
                  </span>
                </div>
                <button
                  onClick={() => removeEntry(e.id)}
                  style={{ ...btnIcon(C.red), fontSize: 14 }}
                >
                  ×
                </button>
              </div>
              {metrics.map((m) => (
                <div key={m.key} style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      color: C.textMuted,
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    {m.icon} {m.label}
                  </div>
                  <ScoreBar value={e[m.key]} color={m.color} />
                </div>
              ))}
            </div>
          ))}

          {/* 비교 차트: before vs after */}
          {entries.length >= 2 &&
            (() => {
              const before = entries.find((e) => e.label === "복용 전");
              const after = entries.filter((e) => e.label !== "복용 전").pop();
              if (!before || !after) return null;
              return (
                <div
                  style={{
                    marginTop: 8,
                    padding: 14,
                    background: C.greenSoft,
                    borderRadius: 12,
                    border: `1px solid ${C.green}44`,
                  }}
                >
                  <div
                    style={{
                      color: C.green,
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    📊 복용 전 → {after.label} 비교
                  </div>
                  {metrics.map((m) => {
                    const diff = before[m.key] - after[m.key];
                    return (
                      <div
                        key={m.key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ color: C.textMuted, fontSize: 13 }}>
                          {m.label}
                        </span>
                        <span
                          style={{
                            color:
                              diff > 0 ? C.green : diff < 0 ? C.red : C.textDim,
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {before[m.key]} → {after[m.key]}{" "}
                          {diff > 0
                            ? `(↓${diff})`
                            : diff < 0
                              ? `(↑${Math.abs(diff)})`
                              : "(변화 없음)"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
        </Card>
      )}
    </div>
  );
}

// ─── TAB: SYMPTOMS ───────────────────────────────────────────────────────────
function SymptomsTab({ day, setDay }) {
  const sy = day.symptoms;
  const setSy = (patch) =>
    setDay((d) => ({ ...d, symptoms: { ...d.symptoms, ...patch } }));
  const falls = sy.falls || [];
  const [fallForm, setFallForm] = useState({ time: "", detail: "" });
  const [editFallId, setEditFallId] = useState(null);

  const addFall = () => {
    if (!fallForm.detail) return;
    setSy({
      falls: [
        ...falls,
        { ...fallForm, time: fallForm.time || nowTime(), id: Date.now() },
      ],
    });
    setFallForm({ time: "", detail: "" });
  };
  const removeFall = (id) => setSy({ falls: falls.filter((f) => f.id !== id) });
  const saveFall = (id, data) => {
    setSy({ falls: falls.map((f) => (f.id === id ? { ...f, ...data } : f)) });
    setEditFallId(null);
  };

  const behaviorList = ["잠꼬대", "심한 뒤척임", "헛손질", "수면 중 소리 지름"];
  const sleepBehavior = sy.sleepBehavior || [];

  return (
    <div>
      <div
        style={{
          background: C.yellowSoft,
          borderRadius: 12,
          padding: 12,
          marginBottom: 14,
          border: `1px solid ${C.yellow}44`,
        }}
      >
        <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 4 }}>
          📝 하루 한 번 작성
        </div>
        <div style={{ color: C.text, fontSize: 13 }}>
          하루를 마무리하며 오늘의 증상을 기록하세요
        </div>
      </div>

      <Card>
        <SectionTitle icon="🔍" title="오늘의 증상" color={C.yellow} />
        <Toggle
          value={sy.freezing || false}
          onChange={(v) => setSy({ freezing: v })}
          label="🧊 동결 현상 (발이 땅에 붙는 느낌)"
        />
        <Toggle
          value={sy.swallowing || false}
          onChange={(v) => setSy({ swallowing: v })}
          label="🥤 삼킴 곤란 (사레 들림)"
        />
        <Toggle
          value={sy.orthostatic || false}
          onChange={(v) => setSy({ orthostatic: v })}
          label="🔻 기립성 저혈압 (일어설 때 어지러움)"
        />
      </Card>

      <Card>
        <SectionTitle icon="⚖️" title="균형 및 보행 상태" color={C.purple} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span style={{ color: C.text, fontSize: 14 }}>오늘의 보행 상태</span>
          <span style={{ color: C.purple, fontWeight: 700 }}>
            {
              ["매우 불안정", "불안정", "보통", "양호", "매우 양호"][
                (sy.gait || 3) - 1
              ]
            }
          </span>
        </div>
        <Slider
          value={sy.gait || 3}
          onChange={(v) => setSy({ gait: v })}
          min={1}
          max={5}
          labels={["매우 불안정", "", "보통", "", "매우 양호"]}
        />
      </Card>

      <Card>
        <SectionTitle icon="🚨" title="낙상 사고 기록" color={C.red} />
        {falls.length === 0 && (
          <div
            style={{
              color: C.green,
              fontSize: 13,
              textAlign: "center",
              padding: "8px 0",
            }}
          >
            ✅ 오늘 낙상 없음
          </div>
        )}
        {editFallId &&
          (() => {
            const f = falls.find((f) => f.id === editFallId);
            const [tmpTime, setTmpTime] = useState(f?.time || "");
            const [tmpDetail, setTmpDetail] = useState(f?.detail || "");
            return (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "#000a",
                  zIndex: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 16,
                    padding: 24,
                    width: 300,
                  }}
                >
                  <div
                    style={{ color: C.text, fontWeight: 700, marginBottom: 16 }}
                  >
                    낙상 기록 편집
                  </div>
                  <input
                    type="time"
                    value={tmpTime}
                    onChange={(e) => setTmpTime(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 10 }}
                  />
                  <input
                    value={tmpDetail}
                    onChange={(e) => setTmpDetail(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 16 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() =>
                        saveFall(editFallId, {
                          time: tmpTime,
                          detail: tmpDetail,
                        })
                      }
                      style={{ ...btnPrimary, flex: 1 }}
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditFallId(null)}
                      style={{ ...btnSecondary, flex: 1 }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        {falls.map((f) => (
          <div
            key={f.id}
            style={{
              background: C.redSoft,
              borderRadius: 10,
              padding: 12,
              marginBottom: 8,
              border: `1px solid ${C.red}33`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: C.red, fontWeight: 700 }}>
                  {f.time || "시간 미기록"}
                </div>
                <div style={{ color: C.text, fontSize: 13, marginTop: 4 }}>
                  {f.detail}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setEditFallId(f.id)}
                  style={{ ...btnIcon(C.accent), fontSize: 12 }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => removeFall(f.id)}
                  style={{ ...btnIcon(C.red), fontSize: 14 }}
                >
                  ×
                </button>
              </div>
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
            style={inputStyle}
          />
          <input
            value={fallForm.detail}
            onChange={(e) =>
              setFallForm((f) => ({ ...f, detail: e.target.value }))
            }
            placeholder="상황 설명"
            style={inputStyle}
          />
        </div>
        <button
          onClick={addFall}
          style={{
            ...btnSecondary,
            width: "100%",
            marginTop: 8,
            borderColor: C.red,
            color: C.red,
          }}
        >
          + 낙상 사고 기록
        </button>
      </Card>

      <Card>
        <SectionTitle icon="😴" title="수면 중 이상 행동" color={C.purple} />
        {behaviorList.map((b) => (
          <Toggle
            key={b}
            value={sleepBehavior.includes(b)}
            onChange={(v) =>
              setSy({
                sleepBehavior: v
                  ? [...sleepBehavior, b]
                  : sleepBehavior.filter((x) => x !== b),
              })
            }
            label={b}
          />
        ))}
      </Card>
    </div>
  );
}

// ─── TAB: SLEEP ──────────────────────────────────────────────────────────────
function SleepTab({ day, setDay }) {
  const sl = day.sleep;
  const set = (key, val) =>
    setDay((d) => ({ ...d, sleep: { ...d.sleep, [key]: val } }));
  const wakePeriods = sl.wakePeriods || [];
  const [wakeForm, setWakeForm] = useState({ from: "", to: "" });

  const toMins = (t) => {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const fmtMins = (total) => {
    if (total == null || total < 0) return "--";
    const h = Math.floor(total / 60),
      m = total % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  const bedMins = (() => {
    try {
      const bm = toMins(sl.bedtime),
        wm = toMins(sl.wakeTime);
      if (bm == null || wm == null) return null;
      let diff = wm - bm;
      if (diff < 0) diff += 1440;
      return diff;
    } catch {
      return null;
    }
  })();

  const wakeMins = wakePeriods.reduce((sum, p) => {
    const fm = toMins(p.from),
      tm = toMins(p.to);
    if (fm == null || tm == null) return sum;
    let diff = tm - fm;
    if (diff < 0) diff += 1440;
    return sum + diff;
  }, 0);

  const actualMins = bedMins != null ? Math.max(0, bedMins - wakeMins) : null;

  return (
    <div>
      <Card>
        <SectionTitle icon="🌙" title="수면 시간" color={C.purple} />
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
                color: C.textMuted,
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
                color: C.textMuted,
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
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: 14,
            marginBottom: 14,
          }}
        >
          <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 10 }}>
            ⏰ 깸 구간 (깬 시각 → 다시 잠든 시각)
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: 8,
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  color: C.textDim,
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
                  color: C.textDim,
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
              onClick={() => {
                if (!wakeForm.from || !wakeForm.to) return;
                set("wakePeriods", [
                  ...wakePeriods,
                  { id: Date.now(), ...wakeForm },
                ]);
                setWakeForm({ from: "", to: "" });
              }}
              style={{ ...btnPrimary, padding: "10px 14px" }}
            >
              추가
            </button>
          </div>
          {wakePeriods.map((p) => {
            const fm = toMins(p.from),
              tm = toMins(p.to);
            let dur = tm - fm;
            if (dur < 0) dur += 1440;
            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: C.bg,
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginTop: 8,
                  border: `1px solid ${C.red}33`,
                }}
              >
                <span style={{ color: C.text, fontSize: 14 }}>
                  👁️ {p.from} → {p.to}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: C.red, fontSize: 13, fontWeight: 700 }}>
                    −{fmtMins(dur)}
                  </span>
                  <button
                    onClick={() =>
                      set(
                        "wakePeriods",
                        wakePeriods.filter((x) => x.id !== p.id),
                      )
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: C.textDim,
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
          }}
        >
          {[
            { label: "침대 시간", value: fmtMins(bedMins), color: C.textMuted },
            {
              label: "총 깸 시간",
              value: `−${fmtMins(wakeMins)}`,
              color: C.red,
            },
            { label: "실제 수면", value: fmtMins(actualMins), color: C.purple },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: C.bg,
                borderRadius: 10,
                padding: 12,
                textAlign: "center",
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ color: C.textDim, fontSize: 10, marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ color: s.color, fontWeight: 700, fontSize: 13 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle icon="😪" title="낮잠 및 주간 졸림증" color={C.yellow} />
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ color: C.text, fontSize: 14 }}>낮잠 시간</span>
            <span style={{ color: C.yellow, fontWeight: 700 }}>
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
            <span style={{ color: C.text, fontSize: 14 }}>주간 졸림증</span>
            <span style={{ color: C.yellow, fontWeight: 700 }}>
              {
                ["거의 없음", "약간", "보통", "심함", "매우 심함"][
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

// ─── CALENDAR ────────────────────────────────────────────────────────────────
function CalendarView({ store, selectedDate, onSelectDate }) {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = todayStr();

  const hasData = (dateStr) => {
    const d = store[dateStr];
    if (!d) return false;
    return d.medication?.length > 0 || d.hydration?.logs?.length > 0 || d.diary;
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dateStr = (d) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "20px 24px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => {
            if (viewMonth === 0) {
              setViewYear((y) => y - 1);
              setViewMonth(11);
            } else setViewMonth((m) => m - 1);
          }}
          style={{ ...btnIcon(C.accent), width: 36, height: 36 }}
        >
          ‹
        </button>
        <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>
          {viewYear}년 {monthNames[viewMonth]}
        </span>
        <button
          onClick={() => {
            if (viewMonth === 11) {
              setViewYear((y) => y + 1);
              setViewMonth(0);
            } else setViewMonth((m) => m + 1);
          }}
          style={{ ...btnIcon(C.accent), width: 36, height: 36 }}
        >
          ›
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          marginBottom: 8,
        }}
      >
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              color: C.textDim,
              fontSize: 11,
              padding: "4px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}
      >
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const ds = dateStr(d);
          const isSelected = ds === selectedDate;
          const isToday = ds === today;
          const hasDot = hasData(ds);
          return (
            <button
              key={i}
              onClick={() => onSelectDate(ds)}
              style={{
                background: isSelected
                  ? C.accent
                  : isToday
                    ? C.accentSoft
                    : "transparent",
                border: `1px solid ${isSelected ? C.accent : isToday ? C.accent + "66" : C.border}`,
                borderRadius: 8,
                padding: "8px 4px",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span
                style={{
                  color: isSelected ? "#fff" : isToday ? C.accent : C.text,
                  fontSize: 13,
                  fontWeight: isToday || isSelected ? 700 : 400,
                }}
              >
                {d}
              </span>
              {hasDot && (
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    background: isSelected ? "#fff" : C.green,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── TREND CHARTS ────────────────────────────────────────────────────────────
function TrendView({ store }) {
  const dates = Object.keys(store).sort().slice(-14);
  if (dates.length < 2)
    return (
      <Card>
        <div style={{ color: C.textDim, textAlign: "center", padding: 20 }}>
          최소 2일 이상의 기록이 있으면 트렌드를 볼 수 있어요
        </div>
      </Card>
    );

  const hydrationData = dates.map((d) => ({
    date: d.slice(5),
    val: (store[d]?.hydration?.logs || []).reduce((s, l) => s + l.ml, 0),
  }));
  const medData = dates.map((d) => ({
    date: d.slice(5),
    val: (store[d]?.medication || []).length,
  }));
  const painData = dates.map((d) => {
    const entries = store[d]?.status?.entries || [];
    if (!entries.length) return { date: d.slice(5), val: null };
    return {
      date: d.slice(5),
      val:
        Math.round(
          (entries.reduce((s, e) => s + (e.pain || 0), 0) / entries.length) *
            10,
        ) / 10,
    };
  });

  const MiniChart = ({ data, color, label, unit = "", maxVal }) => {
    const vals = data.map((d) => d.val).filter((v) => v != null);
    const max = maxVal || Math.max(...vals, 1);
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 8 }}>
          {label}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 3,
            height: 60,
          }}
        >
          {data.map((d, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <div
                style={{
                  width: "100%",
                  borderRadius: "3px 3px 0 0",
                  height:
                    d.val != null ? `${Math.max(4, (d.val / max) * 56)}px` : 4,
                  background: d.val != null ? color : C.border,
                  transition: "height 0.3s",
                }}
              />
              <span
                style={{
                  color: C.textDim,
                  fontSize: 9,
                  transform: "rotate(-45deg)",
                  transformOrigin: "top right",
                  whiteSpace: "nowrap",
                }}
              >
                {d.date}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 18,
          }}
        >
          <span style={{ color: C.textDim, fontSize: 11 }}>
            최소: {Math.min(...vals)}
            {unit}
          </span>
          <span style={{ color: color, fontWeight: 700, fontSize: 11 }}>
            최대: {Math.max(...vals)}
            {unit}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <SectionTitle icon="📈" title="최근 2주 트렌드" color={C.accent} />
      <MiniChart
        data={hydrationData}
        color={C.cyan}
        label="💧 수분 섭취 (ml)"
        unit="ml"
      />
      <MiniChart
        data={medData}
        color={C.green}
        label="💊 복약 횟수"
        unit="회"
      />
      <MiniChart
        data={painData.filter((d) => d.val !== null)}
        color={C.red}
        label="😣 평균 통증 (0-10)"
        unit=""
        maxVal={10}
      />
    </Card>
  );
}

// ─── TAB ORDER SETTINGS ──────────────────────────────────────────────────────
const DEFAULT_TABS = [
  { id: "medication", label: "복약", icon: "💊" },
  { id: "bladder", label: "배뇨/배변", icon: "🌊" },
  { id: "exercise", label: "운동", icon: "🏃" },
  { id: "hydration", label: "수분", icon: "💧" },
  { id: "status", label: "상태", icon: "📊" },
  { id: "symptoms", label: "증상", icon: "🔍" },
  { id: "sleep", label: "수면", icon: "🛏️" },
];

function TabOrderSettings({ tabOrder, setTabOrder, onClose }) {
  const [order, setOrder] = useState(tabOrder);
  const move = (i, dir) => {
    const arr = [...order];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setOrder(arr);
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000a",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 24,
          width: 320,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            color: C.text,
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 16,
          }}
        >
          ⚙️ 탭 순서 설정
        </div>
        <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 16 }}>
          자주 사용하는 탭을 위로 올려 먼저 보이게 하세요
        </div>
        {order.map((tab, i) => (
          <div
            key={tab.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: C.bg,
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 8,
              border: `1px solid ${C.border}`,
            }}
          >
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            <span style={{ color: C.text, flex: 1, fontSize: 14 }}>
              {tab.label}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                style={{
                  ...btnIcon(C.accent),
                  opacity: i === 0 ? 0.3 : 1,
                  fontSize: 12,
                }}
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === order.length - 1}
                style={{
                  ...btnIcon(C.accent),
                  opacity: i === order.length - 1 ? 0.3 : 1,
                  fontSize: 12,
                }}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            onClick={() => {
              setTabOrder(order);
              onClose();
            }}
            style={{ ...btnPrimary, flex: 1 }}
          >
            저장
          </button>
          <button onClick={onClose} style={{ ...btnSecondary, flex: 1 }}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DIARY ───────────────────────────────────────────────────────────────────
function DiarySection({ day, setDay }) {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ border: `1px solid ${C.purple}33` }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <SectionTitle icon="📔" title="오늘의 일기" color={C.purple} />
        <button
          onClick={() => setOpen((o) => !o)}
          style={{ ...btnSecondary, fontSize: 12, padding: "6px 12px" }}
        >
          {open ? "닫기" : "작성"}
        </button>
      </div>
      {!open && day.diary && (
        <div
          style={{
            color: C.textMuted,
            fontSize: 13,
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
            maxHeight: 60,
            overflow: "hidden",
          }}
        >
          {day.diary}
        </div>
      )}
      {open && (
        <textarea
          value={day.diary || ""}
          onChange={(e) => setDay((d) => ({ ...d, diary: e.target.value }))}
          placeholder="오늘 기분, 특이사항, 하고 싶은 말을 자유롭게 적어보세요..."
          style={{
            ...inputStyle,
            minHeight: 140,
            resize: "vertical",
            lineHeight: 1.6,
          }}
        />
      )}
    </Card>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [store, setStore] = useState(() => loadStore());
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [activeTab, setActiveTab] = useState("medication");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const [showTabSettings, setShowTabSettings] = useState(false);
  const [tabOrder, setTabOrder] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("parkinson_tab_order")) || DEFAULT_TABS
      );
    } catch {
      return DEFAULT_TABS;
    }
  });

  // 선택된 날짜의 데이터
  const day = store[selectedDate] || emptyDay();
  const setDay = useCallback(
    (updater) => {
      setStore((prev) => {
        const cur = prev[selectedDate] || emptyDay();
        const next = typeof updater === "function" ? updater(cur) : updater;
        const newStore = { ...prev, [selectedDate]: next };
        saveStore(newStore);
        return newStore;
      });
    },
    [selectedDate],
  );

  const saveTabOrder = (order) => {
    setTabOrder(order);
    localStorage.setItem("parkinson_tab_order", JSON.stringify(order));
  };

  const tabComponents = {
    medication: <MedicationTab day={day} setDay={setDay} />,
    bladder: <BladderTab day={day} setDay={setDay} />,
    exercise: <ExerciseTab day={day} setDay={setDay} />,
    hydration: <HydrationTab day={day} setDay={setDay} />,
    status: <StatusTab day={day} setDay={setDay} />,
    symptoms: <SymptomsTab day={day} setDay={setDay} />,
    sleep: <SleepTab day={day} setDay={setDay} />,
  };

  const isToday = selectedDate === todayStr();
  const displayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString(
    "ko-KR",
    { month: "long", day: "numeric", weekday: "short" },
  );

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        fontFamily: "'Segoe UI', -apple-system, sans-serif",
        color: C.text,
      }}
    >
      {showTabSettings && (
        <TabOrderSettings
          tabOrder={tabOrder}
          setTabOrder={saveTabOrder}
          onClose={() => setShowTabSettings(false)}
        />
      )}

      {/* Header */}
      <div
        style={{
          background: C.card,
          borderBottom: `1px solid ${C.border}`,
          padding: "14px 20px 0",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 19, fontWeight: 800 }}>
                🧬 파킨슨 <span style={{ color: C.accent }}>케어</span>
              </div>
              <button
                onClick={() => setShowCalendar((c) => !c)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    color: isToday ? C.accent : C.yellow,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {isToday ? "📅 오늘 " : "📅 "}
                  {displayDate}
                </span>
                <span style={{ color: C.textDim, fontSize: 11 }}>
                  {showCalendar ? "▲" : "▼"}
                </span>
              </button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowTrend((t) => !t)}
                style={{ ...btnIcon(C.purple), width: 36, height: 36 }}
                title="트렌드"
              >
                📈
              </button>
              <button
                onClick={() => setShowTabSettings(true)}
                style={{ ...btnIcon(C.accent), width: 36, height: 36 }}
                title="탭 순서 설정"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Tab Bar */}
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              gap: 0,
              scrollbarWidth: "none",
            }}
          >
            {tabOrder.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: "0 0 auto",
                  minWidth: 56,
                  padding: "8px 4px 10px",
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  borderBottom:
                    activeTab === tab.id
                      ? `2px solid ${C.accent}`
                      : "2px solid transparent",
                }}
              >
                <span style={{ fontSize: 17 }}>{tab.icon}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: activeTab === tab.id ? C.accent : C.textDim,
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
        style={{ maxWidth: 520, margin: "0 auto", padding: "16px 16px 100px" }}
      >
        {showCalendar && (
          <CalendarView
            store={store}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setShowCalendar(false);
            }}
          />
        )}
        {showTrend && <TrendView store={store} />}

        {/* 날짜 표시 배너 (오늘이 아닌 경우) */}
        {!isToday && (
          <div
            style={{
              background: C.yellowSoft,
              border: `1px solid ${C.yellow}44`,
              borderRadius: 12,
              padding: "10px 16px",
              marginBottom: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: C.yellow, fontSize: 13, fontWeight: 600 }}>
              ✏️ {displayDate} 기록 편집 중
            </span>
            <button
              onClick={() => setSelectedDate(todayStr())}
              style={{ ...btnSecondary, fontSize: 12, padding: "6px 10px" }}
            >
              오늘로
            </button>
          </div>
        )}

        {tabComponents[activeTab]}
        <DiarySection day={day} setDay={setDay} />
      </div>
    </div>
  );
}
