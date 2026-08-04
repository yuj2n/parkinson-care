import { useState, useEffect, useCallback, useRef } from "react";

// ─── 디자인 토큰 ──────────────────────────────────────────────────────────────
const C = {
  bg: "#F7F4EF",
  bgDeep: "#EDE9E2",
  card: "#FFFFFF",
  border: "#E2DDD6",
  accent: "#5B8A6B",
  accentSoft: "#EAF2ED",
  accentDark: "#3D6B4F",
  warm: "#E8855A",
  warmSoft: "#FDF0EA",
  purple: "#7B6FA0",
  purpleSoft: "#F0EEF6",
  red: "#D94F4F",
  redSoft: "#FDF0F0",
  blue: "#4A7FB5",
  blueSoft: "#EEF4FB",
  yellow: "#C9952A",
  yellowSoft: "#FDF6E8",
  text: "#2C2A27",
  textMuted: "#7A7570",
  textDim: "#B0AAA3",
  white: "#FFFFFF",
};

// ─── 스토리지 헬퍼 ────────────────────────────────────────────────────────────
const K = {
  store: "parcatson_v2",
  cat: "parcatson_cat_v2",
  schedule: "parcatson_schedule_v2",
  points: "parcatson_points_v2",
  streak: "parcatson_streak_v2",
  onboard: "parcatson_onboard",
  posts: "parcatson_posts_v2",
  user: "parcatson_user_v2",
};
const load = (key, fb) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fb;
  } catch {
    return fb;
  }
};
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

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
    sleepBehavior: [],
  },
  sleep: {
    bedtime: "",
    wakeTime: "",
    wakePeriods: [],
    napMinutes: 0,
    drowsiness: 3,
  },
  diary: "",
});

// 포인트: 하루 카테고리당 최초 1회만
const POINT_VALUES = {
  medication: 3,
  bladder: 2,
  exercise: 4,
  hydration: 2,
  status: 5,
  symptoms: 3,
  sleep: 3,
};
const tryAwardPoint = (category) => {
  const today = todayStr();
  const awarded = load(K.points, {});
  if (!awarded[today]) awarded[today] = {};
  if (awarded[today][category]) return 0; // 이미 받음
  awarded[today][category] = true;
  save(K.points, awarded);
  return POINT_VALUES[category] || 1;
};

// 연속 기록 streak
const updateStreak = () => {
  const today = todayStr();
  const st = load(K.streak, { lastDate: "", streak: 0, totalPoints: 0 });
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  if (st.lastDate === today) return st;
  const newStreak = st.lastDate === yStr ? st.streak + 1 : 1;
  const bonus = newStreak >= 2 ? 2 : 1;
  const next = {
    lastDate: today,
    streak: newStreak,
    totalPoints: (st.totalPoints || 0) + bonus,
  };
  save(K.streak, next);
  return next;
};

// ─── 공통 UI ──────────────────────────────────────────────────────────────────
const Card = ({ children, style, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 20,
      padding: "18px 20px",
      marginBottom: 14,
      boxShadow: "0 1px 4px #0000000a",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}
  >
    {children}
  </div>
);
const STitle = ({ icon, title, color = C.accent, right }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color }}>{title}</span>
    </div>
    {right}
  </div>
);
const Toggle = ({ value, onChange, label, sub }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "11px 0",
      borderBottom: `1px solid ${C.border}`,
    }}
  >
    <div>
      <div style={{ color: C.text, fontSize: 14 }}>{label}</div>
      {sub && (
        <div style={{ color: C.textDim, fontSize: 11, marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        cursor: "pointer",
        background: value ? C.accent : C.border,
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: value ? 23 : 3,
          width: 20,
          height: 20,
          borderRadius: 10,
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px #0003",
        }}
      />
    </div>
  </div>
);
const Btn = ({
  children,
  onClick,
  style,
  color = C.accent,
  outline,
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: outline ? "transparent" : color,
      color: outline ? color : "#fff",
      border: `1.5px solid ${color}`,
      borderRadius: 12,
      padding: "11px 18px",
      fontWeight: 700,
      fontSize: 14,
      cursor: disabled ? "default" : "pointer",
      fontFamily: "inherit",
      opacity: disabled ? 0.5 : 1,
      ...style,
    }}
  >
    {children}
  </button>
);
const IBtn = ({ onClick, color = C.accent, children, style }) => (
  <button
    onClick={onClick}
    style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      border: "none",
      background: `${color}18`,
      color,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      fontFamily: "inherit",
      ...style,
    }}
  >
    {children}
  </button>
);
const iSt = {
  background: C.bg,
  border: `1.5px solid ${C.border}`,
  borderRadius: 12,
  color: C.text,
  padding: "11px 14px",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
};

// 30분 간격 시간 선택기
function TimeSlotPicker({ value, onChange, label }) {
  const slots = [];
  for (let h = 0; h < 24; h++)
    for (let m = 0; m < 60; m += 30)
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  return (
    <div>
      {label && (
        <label
          style={{
            fontSize: 12,
            color: C.textMuted,
            display: "block",
            marginBottom: 4,
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...iSt, appearance: "none" }}
      >
        {slots.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

// 시간 편집 모달
function TimeModal({ time, title = "시간 편집", onSave, onClose }) {
  const [val, setVal] = useState(time || nowTime());
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0007",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: C.card,
          borderRadius: 24,
          padding: 28,
          width: 300,
          boxShadow: "0 8px 32px #0003",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: C.text,
            marginBottom: 18,
          }}
        >
          {title}
        </div>
        <input
          type="time"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          style={{
            ...iSt,
            marginBottom: 18,
            fontSize: 20,
            textAlign: "center",
          }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={() => onSave(val)} style={{ flex: 1 }}>
            저장
          </Btn>
          <Btn onClick={onClose} outline style={{ flex: 1 }}>
            취소
          </Btn>
        </div>
      </div>
    </div>
  );
}

// CheckBox
function CBox({ checked, onChange, label, color = C.accent }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 14px",
        borderRadius: 12,
        cursor: "pointer",
        background: checked ? `${color}12` : C.bg,
        border: `1.5px solid ${checked ? color : C.border}`,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          border: `2px solid ${checked ? color : C.textDim}`,
          background: checked ? color : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
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
}

// ─── 고양이 SVG (5단계) ───────────────────────────────────────────────────────
function CatSVG({ level, mood, size = 110 }) {
  const stage =
    level < 5 ? 0 : level < 20 ? 1 : level < 40 ? 2 : level < 70 ? 3 : 4;
  const bodyColors = ["#F4C08A", "#F0A875", "#E8855A", "#D4704A", "#B05030"];
  const bc = bodyColors[stage];
  const eyeHappy = mood === "happy";
  const eyeSleep = mood === "sleepy";
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <style>{`@keyframes catFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes tail{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}`}</style>
      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 100 115"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: "catFloat 3s ease-in-out infinite" }}
      >
        <path
          d="M68 88 Q88 72 83 56 Q79 46 74 52 Q78 66 66 80"
          fill={bc}
          style={{
            animation: "tail 1.8s ease-in-out infinite",
            transformOrigin: "68px 88px",
          }}
        />
        <ellipse cx="50" cy="80" rx="27" ry="23" fill={bc} />
        <ellipse cx="50" cy="82" rx="16" ry="14" fill="#FDE8D4" />
        <ellipse cx="34" cy="100" rx="8" ry="5" fill={bc} />
        <ellipse cx="66" cy="100" rx="8" ry="5" fill={bc} />
        <ellipse cx="50" cy="46" rx="23" ry="21" fill={bc} />
        <polygon points="30,30 24,12 40,26" fill={bc} />
        <polygon points="70,30 76,12 60,26" fill={bc} />
        <polygon points="31,29 27,16 38,26" fill="#F9C4A8" />
        <polygon points="69,29 73,16 62,26" fill="#F9C4A8" />
        {eyeSleep ? (
          <>
            <path
              d="M40 45 Q44 41 48 45"
              stroke="#3D3028"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M52 45 Q56 41 60 45"
              stroke="#3D3028"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : eyeHappy ? (
          <>
            <path
              d="M40 46 Q44 42 48 46"
              stroke="#3D3028"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M52 46 Q56 42 60 46"
              stroke="#3D3028"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <ellipse cx="44" cy="45" rx="4" ry="4.5" fill="#3D3028" />
            <ellipse cx="56" cy="45" rx="4" ry="4.5" fill="#3D3028" />
            <ellipse cx="45.2" cy="44" rx="1.3" ry="1.3" fill="#fff" />
            <ellipse cx="57.2" cy="44" rx="1.3" ry="1.3" fill="#fff" />
          </>
        )}
        <polygon points="50,52 47,55 53,55" fill={C.warm} />
        <path
          d="M47 55 Q50 59 53 55"
          stroke="#C05030"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <line
          x1="27"
          y1="53"
          x2="42"
          y2="54"
          stroke="#C8A898"
          strokeWidth="1"
          opacity="0.7"
        />
        <line
          x1="27"
          y1="56"
          x2="42"
          y2="56"
          stroke="#C8A898"
          strokeWidth="1"
          opacity="0.7"
        />
        <line
          x1="73"
          y1="53"
          x2="58"
          y2="54"
          stroke="#C8A898"
          strokeWidth="1"
          opacity="0.7"
        />
        <line
          x1="73"
          y1="56"
          x2="58"
          y2="56"
          stroke="#C8A898"
          strokeWidth="1"
          opacity="0.7"
        />
        {stage >= 2 && (
          <circle cx="50" cy="74" r="2.5" fill={C.accentSoft} opacity="0.8" />
        )}
        {stage >= 4 && (
          <>
            <circle cx="42" cy="74" r="2" fill={C.accentSoft} opacity="0.6" />
            <circle cx="58" cy="74" r="2" fill={C.accentSoft} opacity="0.6" />
          </>
        )}
      </svg>
    </div>
  );
}

// ─── 온보딩 ───────────────────────────────────────────────────────────────────
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const slides = [
    {
      icon: "🐱",
      title: "파캣슨에 오신 걸 환영해요",
      desc: "파킨슨 환자와 가족이 함께 기록하고, 고양이와 함께 성장하는 케어 앱이에요. 꾸준한 기록이 건강을 만들고 냥이도 자라요 🌱",
      color: C.accent,
    },
    {
      icon: "💊",
      title: "약 복용부터 증상까지",
      desc: "복약 체크, 배뇨/배변, 운동, 수분, 수면, 상태, 증상까지 — 모든 기록은 약효추적과 독립적으로 남길 수 있어요. 하루 어느 때든 기록하세요.",
      color: C.warm,
    },
    {
      icon: "👨‍👩‍👧",
      title: "가족이 함께하는 앱",
      desc: "6개월치 복약 기록과 그래프를 담당 의사에게 드리면 약 조절에 도움이 돼요. 가족 일기로 서로의 하루를 확인하고 응원하세요.",
      color: C.purple,
    },
  ];
  const s = slides[step];
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "60px 32px 40px",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <button
        onClick={onDone}
        style={{
          alignSelf: "flex-end",
          background: "none",
          border: "none",
          color: C.textMuted,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        건너뛰기
      </button>
      <div
        style={{
          textAlign: "center",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div style={{ fontSize: 72 }}>{s.icon}</div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: C.text,
            lineHeight: 1.3,
          }}
        >
          {s.title}
        </div>
        <div
          style={{
            fontSize: 15,
            color: C.textMuted,
            lineHeight: 1.7,
            maxWidth: 320,
          }}
        >
          {s.desc}
        </div>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === step ? s.color : C.border,
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
        <Btn
          onClick={() =>
            step < slides.length - 1 ? setStep((s) => s + 1) : onDone()
          }
          color={s.color}
          style={{ width: "100%", padding: "16px", fontSize: 16 }}
        >
          {step < slides.length - 1 ? "다음" : "시작하기 🐾"}
        </Btn>
      </div>
    </div>
  );
}

// ─── OAuth 설정 ───────────────────────────────────────────────────────────────
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_BASE = "https://parkinson-care-three.vercel.app";

// 카카오 SDK 동적 로드
const loadKakaoSDK = () =>
  new Promise((resolve, reject) => {
    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);
      resolve(window.Kakao);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    s.crossOrigin = "anonymous";
    s.onload = () => {
      window.Kakao.init(KAKAO_JS_KEY);
      resolve(window.Kakao);
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });

// 구글 GSI SDK 동적 로드
const loadGoogleSDK = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve(window.google.accounts);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.onload = () => resolve(window.google.accounts);
    s.onerror = reject;
    document.head.appendChild(s);
  });

// JWT payload 파싱 (서명 검증 없이 표시용)
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

// ─── 로그인 화면 ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("main");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const googleBtnRef = useRef(null);

  // 카카오/구글 리다이렉트 콜백 처리
  useEffect(() => {
    const path = window.location.pathname;

    // ── 카카오 콜백 ──
    if (path === "/kakao") {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) return;
      setLoading("kakao");
      loadKakaoSDK()
        .then((Kakao) => {
          // redirect 방식에서 authorization code → access token은 서버 필요
          // 대신 JS SDK의 authorize 후 자동 팝업 완료 처리
          // 여기서는 code를 받은 뒤 사용자 정보 API 직접 호출 (PKCE flow)
          fetch("https://kauth.kakao.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: KAKAO_JS_KEY,
              redirect_uri: `${REDIRECT_BASE}/kakao`,
              code,
            }),
          })
            .then((r) => r.json())
            .then((tokenData) => {
              if (!tokenData.access_token) throw new Error("token_fail");
              Kakao.Auth.setAccessToken(tokenData.access_token);
              return Kakao.API.request({ url: "/v2/user/me" });
            })
            .then((res) => {
              const user = {
                id: `kakao_${res.id}`,
                name: res.kakao_account?.profile?.nickname || "카카오 사용자",
                avatar: res.kakao_account?.profile?.thumbnail_image_url || "🐱",
                type: "kakao",
                email: res.kakao_account?.email || "",
              };
              save(K.user, user);
              window.history.replaceState({}, "", "/");
              onLogin(user);
            })
            .catch(() => {
              setError(
                "카카오 로그인 중 오류가 발생했어요. 다시 시도해주세요.",
              );
              setLoading("");
              window.history.replaceState({}, "", "/");
            });
        })
        .catch(() => {
          setError("카카오 SDK를 불러오지 못했어요.");
          setLoading("");
        });
    }

    // ── 구글 콜백 (hash fragment) ──
    if (path === "/google") {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const idToken =
        hash.get("id_token") ||
        new URLSearchParams(window.location.search).get("credential");
      if (!idToken) return;
      const payload = parseJwt(idToken);
      if (payload) {
        const user = {
          id: `google_${payload.sub}`,
          name: payload.name || "구글 사용자",
          avatar: payload.picture || "🐱",
          type: "google",
          email: payload.email || "",
        };
        save(K.user, user);
        window.history.replaceState({}, "", "/");
        onLogin(user);
      } else {
        setError("구글 로그인 처리 중 오류가 발생했어요.");
        window.history.replaceState({}, "", "/");
      }
    }
  }, []);

  // 구글 GSI 버튼 렌더링
  useEffect(() => {
    if (mode !== "main" || !googleBtnRef.current) return;
    let cancelled = false;
    loadGoogleSDK()
      .then((accounts) => {
        if (cancelled || !googleBtnRef.current) return;
        accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            const payload = parseJwt(response.credential);
            if (!payload) {
              setError("구글 로그인 처리 중 오류가 발생했어요.");
              return;
            }
            const user = {
              id: `google_${payload.sub}`,
              name: payload.name || "구글 사용자",
              avatar: payload.picture || "🐱",
              type: "google",
              email: payload.email || "",
            };
            save(K.user, user);
            onLogin(user);
          },
          ux_mode: "popup",
        });
        accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          shape: "rectangular",
          theme: "outline",
          text: "signin_with",
          size: "large",
          logo_alignment: "left",
          width: Math.min(320, window.innerWidth - 56),
          locale: "ko",
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const handleKakao = async () => {
    setError("");
    setLoading("kakao");
    try {
      const Kakao = await loadKakaoSDK();
      Kakao.Auth.authorize({
        redirectUri: `${REDIRECT_BASE}/kakao`,
        scope: "profile_nickname,profile_image,account_email",
      });
    } catch {
      setError("카카오 SDK를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      setLoading("");
    }
  };

  const handleGuest = () => {
    const name = guestName.trim() || "파캣슨 사용자";
    const user = {
      id: `guest_${Date.now()}`,
      name,
      type: "guest",
      avatar: "🐱",
    };
    save(K.user, user);
    onLogin(user);
  };

  // 카카오 로딩 중 스플래시
  if (loading === "kakao")
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#FEE500",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          fontFamily: "inherit",
        }}
      >
        <div style={{ fontSize: 56 }}>🐱</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#3C1E1E" }}>
          카카오로 이동 중...
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 28px",
        maxWidth: 480,
        margin: "0 auto",
        fontFamily:
          "'Pretendard','Apple SD Gothic Neo','Noto Sans KR',sans-serif",
      }}
    >
      {/* 로고 */}
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🐱</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.text }}>
          파<span style={{ color: C.accent }}>캣</span>슨
        </div>
        <div style={{ fontSize: 14, color: C.textMuted, marginTop: 8 }}>
          파킨슨 환자와 가족을 위한 케어 앱
        </div>
      </div>

      {error && (
        <div
          style={{
            background: C.redSoft,
            border: `1px solid ${C.red}44`,
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13,
            color: C.red,
            width: "100%",
            textAlign: "center",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {mode === "main" && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* 카카오 */}
          <button
            onClick={handleKakao}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              background: "#FEE500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 15,
              color: "#3C1E1E",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20 4C11.163 4 4 10.044 4 17.5c0 4.784 2.983 8.985 7.5 11.39L9.6 36l8.1-5.4c.76.1 1.53.15 2.3.15 8.837 0 16-6.044 16-13.5S28.837 4 20 4z"
                fill="#3C1E1E"
              />
            </svg>
            카카오로 시작하기
          </button>

          {/* 구글 (GSI 버튼이 렌더링됨) */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              minHeight: 50,
            }}
          >
            <div ref={googleBtnRef} style={{ width: "100%" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 12, color: C.textDim }}>또는</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* 게스트 */}
          <button
            onClick={() => setMode("guest")}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: 14,
              border: `1.5px solid ${C.border}`,
              cursor: "pointer",
              background: "transparent",
              fontFamily: "inherit",
              fontWeight: 600,
              fontSize: 14,
              color: C.textMuted,
            }}
          >
            로그인 없이 시작하기
          </button>

          <div
            style={{
              textAlign: "center",
              fontSize: 11,
              color: C.textDim,
              lineHeight: 1.7,
            }}
          >
            로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다
          </div>
        </div>
      )}

      {mode === "guest" && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <button
            onClick={() => setMode("main")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.accent,
              fontSize: 14,
              fontWeight: 700,
              alignSelf: "flex-start",
            }}
          >
            ← 뒤로
          </button>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
              닉네임을 정해주세요
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 6 }}>
              나중에 내 정보에서 변경할 수 있어요
            </div>
          </div>
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGuest()}
            placeholder="예: 홍길동, 냥이보호자..."
            style={{ ...iSt, fontSize: 16, textAlign: "center" }}
            autoFocus
          />
          <Btn
            onClick={handleGuest}
            style={{ width: "100%", padding: "16px", fontSize: 16 }}
          >
            🐱 시작하기
          </Btn>
          <div style={{ textAlign: "center", fontSize: 12, color: C.textDim }}>
            기기에만 저장돼요 · 나중에 소셜 계정 연동 가능해요
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 전역 달력 모달 ────────────────────────────────────────────────────────────
function CalendarModal({ store, selectedDate, onSelect, onClose }) {
  const [yr, setYr] = useState(() => {
    try {
      return new Date(selectedDate).getFullYear();
    } catch {
      return new Date().getFullYear();
    }
  });
  const [mo, setMo] = useState(() => {
    try {
      return new Date(selectedDate).getMonth();
    } catch {
      return new Date().getMonth();
    }
  });

  const first = new Date(yr, mo, 1).getDay();
  const days = new Date(yr, mo + 1, 0).getDate();
  const cells = [
    ...Array(first).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const ds = (d) =>
    `${yr}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const today = todayStr();
  const months = [
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

  const hasData = (d) => {
    const x = store[ds(d)];
    return (
      x &&
      (x.medication?.length > 0 ||
        x.hydration?.logs?.length > 0 ||
        x.exercise?.items?.length > 0 ||
        x.diary)
    );
  };

  const prevMonth = () => {
    if (mo === 0) {
      setYr((y) => y - 1);
      setMo(11);
    } else setMo((m) => m - 1);
  };
  const nextMonth = () => {
    if (mo === 11) {
      setYr((y) => y + 1);
      setMo(0);
    } else setMo((m) => m + 1);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0006",
        zIndex: 500,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card,
          borderRadius: "24px 24px 0 0",
          padding: "20px 20px 40px",
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 -8px 32px #0002",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: C.border,
            margin: "0 auto 20px",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <button
            onClick={prevMonth}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 24,
              color: C.accent,
              padding: "4px 10px",
            }}
          >
            ‹
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: C.text }}>
              {yr}년 {months[mo]}
            </div>
            <button
              onClick={() => {
                onSelect(today);
                onClose();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                color: C.accent,
                fontWeight: 600,
              }}
            >
              오늘로 이동
            </button>
          </div>
          <button
            onClick={nextMonth}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 24,
              color: C.accent,
              padding: "4px 10px",
            }}
          >
            ›
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 4,
            marginBottom: 6,
          }}
        >
          {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: 12,
                fontWeight: 600,
                color: i === 0 ? C.red : i === 6 ? C.blue : C.textDim,
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
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 4,
          }}
        >
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const dateStr = ds(d);
            const isSel = dateStr === selectedDate;
            const isToday2 = dateStr === today;
            const hasDot = hasData(d);
            const dow = (first + d - 1) % 7;
            return (
              <button
                key={i}
                onClick={() => {
                  onSelect(dateStr);
                  onClose();
                }}
                style={{
                  background: isSel
                    ? C.accent
                    : isToday2
                      ? C.accentSoft
                      : "transparent",
                  border: `1.5px solid ${isSel ? C.accent : isToday2 ? C.accent + "66" : C.border}`,
                  borderRadius: 10,
                  padding: "9px 2px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: isToday2 || isSel ? 700 : 400,
                    color: isSel
                      ? "#fff"
                      : isToday2
                        ? C.accent
                        : dow === 0
                          ? C.red
                          : dow === 6
                            ? C.blue
                            : C.text,
                  }}
                >
                  {d}
                </span>
                {hasDot && (
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: isSel ? "#ffffffcc" : C.accent,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
        {selectedDate !== today && (
          <div
            style={{
              marginTop: 14,
              background: C.yellowSoft,
              borderRadius: 12,
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: `1px solid ${C.yellow}44`,
            }}
          >
            <span style={{ fontSize: 13, color: C.yellow, fontWeight: 600 }}>
              ✏️ {selectedDate} 기록 편집 중
            </span>
            <button
              onClick={() => {
                onSelect(today);
                onClose();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.yellow,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              오늘로 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 홈 탭 ────────────────────────────────────────────────────────────────────
function HomeTab({ store, day, selectedDate }) {
  const [cat, setCat] = useState(() =>
    load(K.cat, { name: "냥이", level: 1, totalPoints: 0 }),
  );
  const [catMsg, setCatMsg] = useState("");
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [nameInput, setNameInput] = useState(cat.name);
  const streakInfo = load(K.streak, { streak: 0, totalPoints: 0 });
  const schedules = load(K.schedule, []);

  useEffect(() => {
    const pts = load(K.points, {});
    const total =
      Object.values(pts).reduce((s, day) => s + Object.keys(day).length, 0) *
        3 +
      (streakInfo.totalPoints || 0);
    const level = Math.min(100, Math.floor(total / 5) + 1);
    const next = { ...cat, level, totalPoints: total };
    setCat(next);
    save(K.cat, next);
  }, [store]);

  const hour = new Date().getHours();
  const mood =
    hour < 10
      ? "normal"
      : hour < 15
        ? "happy"
        : hour < 20
          ? "playful"
          : "sleepy";
  const catMsgs = [
    `${cat.name}가 골골송을 불러요~ 💕`,
    "약 드셨나요? 저도 밥 주세요! 😺",
    "오늘 기록 잘 하고 있어요! 🐾",
    "꾸준한 기록이 건강을 만들어요 ✨",
    "쓰다듬어줘서 고마워요 ~(=^‥^)/ 🐱",
  ];

  const todayMeds = day.medication || [];
  const scheduleSummary = schedules.map((s) => ({
    ...s,
    taken: !!todayMeds.find((m) => m.scheduleId === s.id && m.taken),
  }));
  const takenCount = scheduleSummary.filter((s) => s.taken).length;

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const ds = d.toISOString().slice(0, 10);
    return { date: ds.slice(5), count: store[ds]?.medication?.length || 0, ds };
  });

  const stageNames = [
    "갓 태어난 냥이",
    "아기 냥이",
    "새끼 고양이",
    "청년 고양이",
    "어른 고양이",
  ];
  const stage =
    cat.level < 5
      ? 0
      : cat.level < 20
        ? 1
        : cat.level < 40
          ? 2
          : cat.level < 70
            ? 3
            : 4;

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>
          {new Date().toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </div>
        {streakInfo.streak >= 2 && (
          <div
            style={{
              fontSize: 12,
              color: C.warm,
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            🔥 {streakInfo.streak}일 연속 기록 중!
          </div>
        )}
      </div>

      {/* 고양이 카드 */}
      <Card
        style={{
          background: `linear-gradient(150deg, ${C.warmSoft}, #FFFBF8)`,
          border: `1.5px solid ${C.warm}33`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: C.warm, fontWeight: 700 }}>
              {stageNames[stage]}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              Lv.{cat.level} · {cat.totalPoints}pts
            </div>
          </div>
          <button
            onClick={() => setShowNameEdit(true)}
            style={{
              background: "none",
              border: "none",
              fontSize: 12,
              color: C.textMuted,
              cursor: "pointer",
            }}
          >
            이름 바꾸기 ✏️
          </button>
        </div>
        {showNameEdit && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              style={{ ...iSt, flex: 1 }}
            />
            <Btn
              onClick={() => {
                const next = { ...cat, name: nameInput };
                setCat(next);
                save(K.cat, next);
                setShowNameEdit(false);
              }}
              style={{ padding: "11px 14px" }}
            >
              저장
            </Btn>
          </div>
        )}
        <div
          onClick={() =>
            setCatMsg(catMsgs[Math.floor(Math.random() * catMsgs.length)])
          }
          style={{ cursor: "pointer" }}
        >
          <CatSVG level={cat.level} mood={mood} />
        </div>
        {catMsg ? (
          <div
            style={{
              textAlign: "center",
              marginTop: 8,
              background: C.white,
              borderRadius: 16,
              padding: "8px 16px",
              fontSize: 13,
              color: C.text,
              display: "inline-block",
              boxShadow: "0 2px 8px #0001",
            }}
          >
            {catMsg}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              marginTop: 8,
              color: C.textDim,
              fontSize: 12,
            }}
          >
            탭해서 쓰다듬어 주세요 🐾
          </div>
        )}
        {/* 레벨 바 */}
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 11, color: C.textMuted }}>
              다음 레벨까지
            </span>
            <span style={{ fontSize: 11, color: C.warm, fontWeight: 700 }}>
              Lv.{Math.min(100, cat.level + 1)}
            </span>
          </div>
          <div
            style={{
              background: C.bgDeep,
              borderRadius: 99,
              height: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(cat.level % 10) * 10}%`,
                background: `linear-gradient(90deg, ${C.warm}, #F4A96A)`,
                borderRadius: 99,
                transition: "width 0.6s",
              }}
            />
          </div>
        </div>
      </Card>

      {/* 오늘 복약 현황 */}
      {scheduleSummary.length > 0 && (
        <Card>
          <STitle
            icon="💊"
            title="오늘 복약 현황"
            color={C.accent}
            right={
              <span style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>
                {takenCount}/{schedules.length}
              </span>
            }
          />
          {scheduleSummary.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: s.taken ? C.accentSoft : C.bg,
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: 8,
                border: `1px solid ${s.taken ? C.accent + "44" : C.border}`,
              }}
            >
              <span style={{ fontSize: 16 }}>{s.taken ? "✅" : "⏰"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>
                  {s.time} · {s.label}
                </div>
                {s.medicines?.length > 0 && (
                  <div style={{ fontSize: 11, color: C.textDim }}>
                    {s.medicines.join(", ")}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: s.taken ? C.accent : C.textMuted,
                }}
              >
                {s.taken ? "완료" : "미완료"}
              </span>
            </div>
          ))}
        </Card>
      )}

      {/* 오늘 요약 */}
      <Card>
        <STitle icon="📊" title="오늘 요약" color={C.accent} />
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {[
            {
              icon: "💊",
              label: "복약",
              value: `${todayMeds.length}회`,
              color: C.accent,
            },
            {
              icon: "💧",
              label: "수분",
              value: `${(day.hydration?.logs || []).reduce((s, l) => s + l.ml, 0)}ml`,
              color: C.blue,
            },
            {
              icon: "🏃",
              label: "운동",
              value: `${(day.exercise?.items || []).length}종`,
              color: C.warm,
            },
            {
              icon: "🚿",
              label: "배뇨",
              value: `${(day.bladder?.logs || []).length}회`,
              color: C.purple,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: C.bg,
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 11, color: C.textDim }}>{item.label}</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: item.color,
                  marginTop: 2,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 14일 복약 차트 */}
      <Card>
        <STitle icon="📈" title="최근 2주 복약" color={C.accent} />
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 3,
            height: 60,
          }}
        >
          {last14.map((d, i) => (
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
                  borderRadius: "4px 4px 0 0",
                  height:
                    d.count > 0 ? `${Math.min(52, d.count * 14)}px` : "4px",
                  background:
                    d.ds === todayStr()
                      ? C.warm
                      : d.count > 0
                        ? C.accent
                        : C.border,
                  transition: "height 0.3s",
                }}
              />
              <span
                style={{
                  fontSize: 7,
                  color: C.textDim,
                  transform: "rotate(-40deg)",
                  transformOrigin: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {d.date}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 약 복용 탭 ───────────────────────────────────────────────────────────────
function MedicationTab({ day, setDay }) {
  const [schedules, setSchedules] = useState(() => load(K.schedule, []));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    time: "08:00",
    label: "아침",
    medicines: "",
  });
  const [editTimeId, setEditTimeId] = useState(null);

  const saveSchedules = (arr) => {
    setSchedules(arr);
    save(K.schedule, arr);
  };
  const LABELS = ["아침", "점심", "저녁", "취침 전", "기타"];

  const addSchedule = () => {
    if (!form.time) return;
    const newS = {
      id: Date.now(),
      time: form.time,
      label: form.label || form.time,
      medicines: form.medicines
        ? form.medicines
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };
    saveSchedules(
      [...schedules, newS].sort((a, b) => a.time.localeCompare(b.time)),
    );
    setShowForm(false);
    setForm({ time: "08:00", label: "아침", medicines: "" });
  };

  const toggleTaken = (scheduleId) => {
    const pts = tryAwardPoint("medication");
    const existing = day.medication.find((m) => m.scheduleId === scheduleId);
    if (existing)
      setDay((d) => ({
        ...d,
        medication: d.medication.filter((m) => m.scheduleId !== scheduleId),
      }));
    else {
      setDay((d) => ({
        ...d,
        medication: [
          ...d.medication,
          {
            id: Date.now(),
            scheduleId,
            taken: true,
            takenAt: nowTime(),
            time: nowTime(),
          },
        ],
      }));
      if (pts > 0) updateStreak();
    }
  };

  const editTakenTime = (scheduleId, time) => {
    setDay((d) => ({
      ...d,
      medication: d.medication.map((m) =>
        m.scheduleId === scheduleId ? { ...m, takenAt: time, time } : m,
      ),
    }));
    setEditTimeId(null);
  };

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      {editTimeId && (
        <TimeModal
          time={
            day.medication.find((m) => m.scheduleId === editTimeId)?.takenAt
          }
          title="복용 시간 수정"
          onSave={(t) => editTakenTime(editTimeId, t)}
          onClose={() => setEditTimeId(null)}
        />
      )}

      {/* 복용 스케줄 설정 */}
      <Card>
        <STitle
          icon="⏰"
          title="복용 시간대 설정"
          color={C.accent}
          right={
            <Btn
              onClick={() => setShowForm(true)}
              style={{ fontSize: 12, padding: "6px 12px" }}
            >
              + 추가
            </Btn>
          }
        />
        {schedules.length === 0 && (
          <div
            style={{
              color: C.textDim,
              textAlign: "center",
              padding: "16px 0",
              fontSize: 13,
            }}
          >
            복용 시간대를 먼저 등록하세요
          </div>
        )}
        {schedules.map((s) => (
          <div
            key={s.id}
            style={{
              background: C.bg,
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 8,
              border: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>
                {s.time} · {s.label}
              </div>
              {s.medicines?.length > 0 && (
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
                  💊 {s.medicines.join(", ")}
                </div>
              )}
            </div>
            <IBtn
              onClick={() =>
                saveSchedules(schedules.filter((x) => x.id !== s.id))
              }
              color={C.red}
            >
              ×
            </IBtn>
          </div>
        ))}
        {showForm && (
          <div
            style={{
              background: C.bg,
              borderRadius: 16,
              padding: 16,
              marginTop: 8,
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <TimeSlotPicker
                value={form.time}
                onChange={(t) => setForm((f) => ({ ...f, time: t }))}
                label="시간 *"
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label
                style={{
                  fontSize: 12,
                  color: C.textMuted,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                시간대 이름
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                {LABELS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setForm((f) => ({ ...f, label: opt }))}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      background:
                        form.label === opt ? C.accentSoft : "transparent",
                      color: form.label === opt ? C.accent : C.textMuted,
                      border: `1px solid ${form.label === opt ? C.accent : C.border}`,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <input
                value={form.label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, label: e.target.value }))
                }
                placeholder="직접 입력"
                style={iSt}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: 12,
                  color: C.textMuted,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                복용약 (쉼표로 구분)
              </label>
              <input
                value={form.medicines}
                onChange={(e) =>
                  setForm((f) => ({ ...f, medicines: e.target.value }))
                }
                placeholder="예: 마도파, 시네메트"
                style={iSt}
              />
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>
                * 식약처 연동은 추후 추가 예정
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={addSchedule} style={{ flex: 1 }}>
                저장
              </Btn>
              <Btn
                onClick={() => setShowForm(false)}
                outline
                style={{ flex: 1 }}
              >
                취소
              </Btn>
            </div>
          </div>
        )}
      </Card>

      {/* 오늘 복약 체크 */}
      <Card>
        <STitle icon="✅" title="오늘 복약 체크" color={C.accent} />
        {schedules.length === 0 ? (
          <div
            style={{
              color: C.textDim,
              textAlign: "center",
              padding: "16px 0",
              fontSize: 13,
            }}
          >
            위에서 복용 시간대를 먼저 등록해주세요
          </div>
        ) : (
          <>
            {schedules.map((s) => {
              const rec = day.medication.find((m) => m.scheduleId === s.id);
              const taken = !!rec;
              return (
                <div
                  key={s.id}
                  onClick={() => toggleTaken(s.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: taken ? C.accentSoft : C.bg,
                    borderRadius: 14,
                    padding: "14px 16px",
                    marginBottom: 10,
                    border: `1.5px solid ${taken ? C.accent : C.border}`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        background: taken ? C.accent : C.white,
                        border: `2px solid ${taken ? C.accent : C.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.2s",
                      }}
                    >
                      {taken && (
                        <span
                          style={{
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <div
                        style={{ fontWeight: 700, color: C.text, fontSize: 15 }}
                      >
                        {s.time} · {s.label}
                      </div>
                      {s.medicines?.length > 0 && (
                        <div
                          style={{
                            fontSize: 12,
                            color: C.textMuted,
                            marginTop: 2,
                          }}
                        >
                          {s.medicines.join(", ")}
                        </div>
                      )}
                      {taken && rec?.takenAt && (
                        <div
                          style={{
                            fontSize: 12,
                            color: C.accent,
                            marginTop: 2,
                          }}
                        >
                          복용 {rec.takenAt}
                        </div>
                      )}
                    </div>
                  </div>
                  {taken && (
                    <IBtn
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTimeId(s.id);
                      }}
                      color={C.accent}
                    >
                      ✏️
                    </IBtn>
                  )}
                </div>
              );
            })}
            <div
              style={{
                paddingTop: 10,
                borderTop: `1px solid ${C.border}`,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: C.textMuted, fontSize: 13 }}>
                오늘 복용
              </span>
              <span style={{ color: C.accent, fontWeight: 800 }}>
                {day.medication.filter((m) => m.taken).length} /{" "}
                {schedules.length}
              </span>
            </div>
          </>
        )}
      </Card>

      {/* 타임라인 */}
      {day.medication.length > 0 && (
        <Card>
          <STitle icon="🕐" title="복약 타임라인" color={C.yellow} />
          {[...day.medication]
            .sort((a, b) =>
              (a.takenAt || a.time || "").localeCompare(
                b.takenAt || b.time || "",
              ),
            )
            .map((m) => {
              const s = schedules.find((x) => x.id === m.scheduleId);
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{ color: C.textDim, fontSize: 12, minWidth: 40 }}
                  >
                    {m.takenAt || m.time}
                  </span>
                  <div
                    style={{ flex: 1, height: 2, background: C.accent + "33" }}
                  />
                  <span style={{ color: C.text, fontSize: 13 }}>
                    {s?.medicines?.join(", ") || s?.label || "복용"}
                  </span>
                </div>
              );
            })}
        </Card>
      )}
    </div>
  );
}

// ─── 기록 탭 (서브탭) ─────────────────────────────────────────────────────────
const SUBTABS = [
  { id: "bladder", label: "배뇨/배변", icon: "🚿" },
  { id: "exercise", label: "운동", icon: "🏃" },
  { id: "hydration", label: "수분", icon: "💧" },
  { id: "status", label: "상태", icon: "📊" },
  { id: "symptoms", label: "증상", icon: "🔍" },
  { id: "sleep", label: "수면", icon: "🛏️" },
];

function RecordTab({ day, setDay }) {
  const [sub, setSub] = useState("bladder");
  return (
    <div>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          background: C.card,
          borderBottom: `1px solid ${C.border}`,
          padding: "0 8px",
          scrollbarWidth: "none",
          position: "sticky",
          top: 62,
          zIndex: 50,
        }}
      >
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            style={{
              flex: "0 0 auto",
              padding: "9px 12px",
              border: "none",
              cursor: "pointer",
              background: "transparent",
              fontFamily: "inherit",
              borderBottom:
                sub === t.id
                  ? `2.5px solid ${C.accent}`
                  : "2.5px solid transparent",
              color: sub === t.id ? C.accent : C.textDim,
              fontSize: 11,
              fontWeight: sub === t.id ? 700 : 400,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              minWidth: 52,
            }}
          >
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: "16px 16px 100px" }}>
        {sub === "bladder" && <BladderSec day={day} setDay={setDay} />}
        {sub === "exercise" && <ExerciseSec day={day} setDay={setDay} />}
        {sub === "hydration" && <HydrationSec day={day} setDay={setDay} />}
        {sub === "status" && <StatusSec day={day} setDay={setDay} />}
        {sub === "symptoms" && <SymptomsSec day={day} setDay={setDay} />}
        {sub === "sleep" && <SleepSec day={day} setDay={setDay} />}
      </div>
    </div>
  );
}

// 배뇨/배변
function BladderSec({ day, setDay }) {
  const [order, setOrder] = useState("bladder");
  const [lf, setLf] = useState({
    normal: false,
    isNight: false,
    urgency: false,
    incontinence: false,
  });
  const [sf, setSf] = useState({ had: false, urgency: false });
  const [editId, setEditId] = useState(null);
  const [editSId, setEditSId] = useState(null);
  const logs = day.bladder?.logs || [];
  const sLogs = day.bladder?.stoolLogs || [];
  const setB = (p) =>
    setDay((d) => ({ ...d, bladder: { ...d.bladder, ...p } }));

  const BBlock = () => (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 6,
          marginBottom: 12,
        }}
      >
        {[
          { l: "정상뇨", v: logs.filter((l) => l.normal).length, c: C.accent },
          { l: "주간", v: logs.filter((l) => !l.isNight).length, c: C.blue },
          { l: "야간뇨", v: logs.filter((l) => l.isNight).length, c: C.purple },
          {
            l: "긴박/실금",
            v: logs.filter((l) => l.urgency || l.incontinence).length,
            c: C.red,
          },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "8px 4px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, color: s.c }}>
              {s.v}
            </div>
            <div style={{ color: C.textDim, fontSize: 9, marginTop: 2 }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>
      <Card>
        {editId && (
          <TimeModal
            time={logs.find((l) => l.id === editId)?.time}
            onSave={(t) => {
              setB({
                logs: logs.map((l) =>
                  l.id === editId ? { ...l, time: t } : l,
                ),
              });
              setEditId(null);
            }}
            onClose={() => setEditId(null)}
          />
        )}
        <STitle icon="🚿" title="배뇨 기록" color={C.blue} />
        <CBox
          checked={lf.normal}
          onChange={(v) => setLf((f) => ({ ...f, normal: v }))}
          label="✅ 정상뇨"
          color={C.accent}
        />
        <CBox
          checked={lf.isNight}
          onChange={(v) => setLf((f) => ({ ...f, isNight: v }))}
          label="🌙 야간뇨"
          color={C.purple}
        />
        <CBox
          checked={lf.urgency}
          onChange={(v) => setLf((f) => ({ ...f, urgency: v }))}
          label="⚡ 긴박뇨"
          color={C.yellow}
        />
        <CBox
          checked={lf.incontinence}
          onChange={(v) => setLf((f) => ({ ...f, incontinence: v }))}
          label="⚠️ 요실금"
          color={C.red}
        />
        <div style={{ marginTop: 4 }}>
          <Btn
            onClick={() => {
              setB({
                logs: [...logs, { id: Date.now(), time: nowTime(), ...lf }],
              });
              setLf({
                normal: false,
                isNight: false,
                urgency: false,
                incontinence: false,
              });
              tryAwardPoint("bladder");
              updateStreak();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span>+ 지금 시각으로 기록</span>
            <span style={{ opacity: 0.7, fontSize: 12 }}>({nowTime()})</span>
          </Btn>
        </div>
        {logs.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {[...logs].reverse().map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: C.bg,
                  borderRadius: 10,
                  padding: "9px 12px",
                  marginBottom: 6,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>
                    {log.isNight ? "🌙" : "🚿"}
                  </span>
                  <div>
                    <div
                      style={{ fontWeight: 700, color: C.text, fontSize: 13 }}
                    >
                      {log.time}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        marginTop: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      {log.normal && (
                        <span
                          style={{
                            fontSize: 10,
                            color: C.accent,
                            fontWeight: 700,
                          }}
                        >
                          정상뇨
                        </span>
                      )}
                      {log.isNight && (
                        <span
                          style={{
                            fontSize: 10,
                            color: C.purple,
                            fontWeight: 700,
                          }}
                        >
                          야간뇨
                        </span>
                      )}
                      {log.urgency && (
                        <span
                          style={{
                            fontSize: 10,
                            color: C.yellow,
                            fontWeight: 700,
                          }}
                        >
                          긴박뇨
                        </span>
                      )}
                      {log.incontinence && (
                        <span
                          style={{
                            fontSize: 10,
                            color: C.red,
                            fontWeight: 700,
                          }}
                        >
                          요실금
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <IBtn onClick={() => setEditId(log.id)} color={C.accent}>
                    ✏️
                  </IBtn>
                  <IBtn
                    onClick={() =>
                      setB({ logs: logs.filter((l) => l.id !== log.id) })
                    }
                    color={C.red}
                  >
                    ×
                  </IBtn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const SBlock = () => (
    <Card>
      {editSId && (
        <TimeModal
          time={sLogs.find((l) => l.id === editSId)?.time}
          onSave={(t) => {
            setB({
              stoolLogs: sLogs.map((l) =>
                l.id === editSId ? { ...l, time: t } : l,
              ),
            });
            setEditSId(null);
          }}
          onClose={() => setEditSId(null)}
        />
      )}
      <STitle icon="🍂" title="배변 기록" color={C.yellow} />
      <CBox
        checked={sf.had}
        onChange={(v) => setSf((f) => ({ ...f, had: v }))}
        label="✅ 배변 성공"
        color={C.accent}
      />
      <CBox
        checked={sf.urgency}
        onChange={(v) => setSf((f) => ({ ...f, urgency: v }))}
        label="⚡ 잔변감 있음"
        color={C.yellow}
      />
      <div style={{ marginTop: 4 }}>
        <Btn
          onClick={() => {
            setB({
              stoolLogs: [...sLogs, { id: Date.now(), time: nowTime(), ...sf }],
            });
            setSf({ had: false, urgency: false });
          }}
          color={C.yellow}
          style={{
            width: "100%",
            color: "#2A1A00",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span>+ 지금 시각으로 기록</span>
          <span style={{ opacity: 0.7, fontSize: 12 }}>({nowTime()})</span>
        </Btn>
      </div>
      {sLogs.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {[...sLogs].reverse().map((log) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: C.bg,
                borderRadius: 10,
                padding: "9px 12px",
                marginBottom: 6,
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🍂</span>
                <div>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>
                    {log.time}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                    {log.had && (
                      <span
                        style={{
                          fontSize: 10,
                          color: C.accent,
                          fontWeight: 700,
                        }}
                      >
                        배변 성공
                      </span>
                    )}
                    {log.urgency && (
                      <span
                        style={{
                          fontSize: 10,
                          color: C.yellow,
                          fontWeight: 700,
                        }}
                      >
                        잔변감
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <IBtn onClick={() => setEditSId(log.id)} color={C.accent}>
                  ✏️
                </IBtn>
                <IBtn
                  onClick={() =>
                    setB({ stoolLogs: sLogs.filter((l) => l.id !== log.id) })
                  }
                  color={C.red}
                >
                  ×
                </IBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      >
        <Btn
          outline
          color={C.textMuted}
          onClick={() =>
            setOrder((o) => (o === "bladder" ? "stool" : "bladder"))
          }
          style={{ fontSize: 12, padding: "7px 14px" }}
        >
          🔄 순서 바꾸기
        </Btn>
      </div>
      {order === "bladder" ? (
        <>
          <BBlock />
          <SBlock />
        </>
      ) : (
        <>
          <SBlock />
          <BBlock />
        </>
      )}
    </div>
  );
}

// 운동
function ExerciseSec({ day, setDay }) {
  const [form, setForm] = useState({ name: "", reps: "", duration: "" });
  const items = day.exercise?.items || [];
  const PRESETS = [
    ["걷기", "🚶"],
    ["스쿼트", "🏋️"],
    ["스트레칭", "🤸"],
    ["한발서기", "🦩"],
    ["팔굽혀펴기", "💪"],
    ["자전거", "🚴"],
    ["수영", "🏊"],
    ["요가", "🧘"],
  ];
  const DURS = [10, 20, 30, 40, 60, 90];

  return (
    <div>
      <Card>
        <STitle icon="🏃" title="운동 기록" color={C.warm} />
        <div style={{ marginBottom: 10 }}>
          <label
            style={{
              fontSize: 12,
              color: C.textMuted,
              display: "block",
              marginBottom: 6,
            }}
          >
            빠른 선택
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PRESETS.map(([name, icon]) => (
              <button
                key={name}
                onClick={() => setForm((f) => ({ ...f, name }))}
                style={{
                  padding: "7px 12px",
                  borderRadius: 20,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: form.name === name ? C.warmSoft : C.bg,
                  color: form.name === name ? C.warm : C.textMuted,
                  border: `1px solid ${form.name === name ? C.warm : C.border}`,
                  fontWeight: form.name === name ? 700 : 400,
                }}
              >
                {icon} {name}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label
            style={{
              fontSize: 12,
              color: C.textMuted,
              display: "block",
              marginBottom: 4,
            }}
          >
            직접 입력
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="예: 댄스, 복싱..."
            style={iSt}
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
                fontSize: 12,
                color: C.textMuted,
                display: "block",
                marginBottom: 4,
              }}
            >
              횟수/세트
            </label>
            <input
              value={form.reps}
              onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))}
              placeholder="예: 10회 3세트"
              style={iSt}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                color: C.textMuted,
                display: "block",
                marginBottom: 4,
              }}
            >
              시간
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginBottom: 6,
              }}
            >
              {DURS.map((v) => (
                <button
                  key={v}
                  onClick={() =>
                    setForm((f) => ({ ...f, duration: String(v) }))
                  }
                  style={{
                    padding: "4px 8px",
                    borderRadius: 8,
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    border: `1px solid ${form.duration === String(v) ? C.warm : C.border}`,
                    background: form.duration === String(v) ? C.warmSoft : C.bg,
                    color: form.duration === String(v) ? C.warm : C.textMuted,
                  }}
                >
                  {v}분
                </button>
              ))}
            </div>
            <input
              value={form.duration}
              onChange={(e) =>
                setForm((f) => ({ ...f, duration: e.target.value }))
              }
              placeholder="직접 입력(분)"
              style={iSt}
            />
          </div>
        </div>
        <Btn
          onClick={() => {
            if (!form.name) return;
            setDay((d) => ({
              ...d,
              exercise: {
                ...d.exercise,
                items: [
                  ...(d.exercise?.items || []),
                  { ...form, id: Date.now(), time: nowTime() },
                ],
              },
            }));
            setForm({ name: "", reps: "", duration: "" });
            tryAwardPoint("exercise");
            updateStreak();
          }}
          color={C.warm}
          style={{ width: "100%" }}
        >
          + 운동 추가
        </Btn>
      </Card>
      {items.length > 0 && (
        <Card>
          <STitle
            icon="📋"
            title={`오늘 운동 목록`}
            color={C.warm}
            right={
              <span style={{ fontSize: 12, color: C.textMuted }}>
                총 {items.reduce((s, i) => s + (Number(i.duration) || 0), 0)}분
              </span>
            }
          />
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: C.bg,
                borderRadius: 12,
                padding: "11px 14px",
                marginBottom: 8,
                border: `1px solid ${C.border}`,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: C.warm, fontSize: 14 }}>
                  🏋️ {item.name}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                  {item.reps && <span>{item.reps}</span>}
                  {item.reps && item.duration && " · "}
                  {item.duration && <span>{item.duration}분</span>}
                  <span style={{ color: C.textDim, marginLeft: 8 }}>
                    {item.time}
                  </span>
                </div>
              </div>
              <IBtn
                onClick={() =>
                  setDay((d) => ({
                    ...d,
                    exercise: {
                      ...d.exercise,
                      items: items.filter((i) => i.id !== item.id),
                    },
                  }))
                }
                color={C.red}
              >
                ×
              </IBtn>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// 수분
function HydrationSec({ day, setDay }) {
  const hy = day.hydration || { logs: [], goal: 2000 };
  const [ml, setMl] = useState(200);
  const [editGoal, setEditGoal] = useState(false);
  const [gi, setGi] = useState(hy.goal);
  const [editId, setEditId] = useState(null);
  const logs = hy.logs || [];
  const total = logs.reduce((s, l) => s + l.ml, 0);
  const pct = Math.min(100, Math.round((total / hy.goal) * 100));
  const setH = (p) =>
    setDay((d) => ({ ...d, hydration: { ...d.hydration, ...p } }));
  const PRESETS = [100, 150, 200, 250, 300, 350, 400, 500];

  return (
    <div>
      {editId && (
        <TimeModal
          time={logs.find((l) => l.id === editId)?.time}
          onSave={(t) => {
            setH({
              logs: logs.map((l) => (l.id === editId ? { ...l, time: t } : l)),
            });
            setEditId(null);
          }}
          onClose={() => setEditId(null)}
        />
      )}
      <Card style={{ border: `1.5px solid ${C.blue}33` }}>
        <STitle icon="💧" title="오늘의 수분 섭취" color={C.blue} />
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.blue }}>
            {total}
            <span style={{ fontSize: 16, fontWeight: 400, color: C.textMuted }}>
              ml
            </span>
          </div>
          <div style={{ color: C.textMuted, fontSize: 12 }}>
            목표 {hy.goal}ml 중 {pct}%
          </div>
        </div>
        <div
          style={{
            background: C.bgDeep,
            borderRadius: 99,
            height: 12,
            overflow: "hidden",
            marginBottom: 6,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background:
                pct >= 100
                  ? `linear-gradient(90deg,${C.blue},${C.accent})`
                  : C.blue,
              borderRadius: 99,
              transition: "width 0.4s",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: C.textDim,
            marginBottom: 12,
          }}
        >
          <span>0ml</span>
          <span style={{ color: pct >= 100 ? C.accent : C.textDim }}>
            {pct >= 100 ? "✅ 목표 달성!" : `${hy.goal - total}ml 남음`}
          </span>
          <span>{hy.goal}ml</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, color: C.textMuted }}>
            일일 목표 <strong style={{ color: C.blue }}>{hy.goal}ml</strong>
          </span>
          <Btn
            outline
            color={C.blue}
            onClick={() => {
              setEditGoal(true);
              setGi(hy.goal);
            }}
            style={{ fontSize: 12, padding: "6px 12px" }}
          >
            변경
          </Btn>
        </div>
        {editGoal && (
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <input
              type="number"
              value={gi}
              onChange={(e) => setGi(Number(e.target.value))}
              style={{ ...iSt, flex: 1 }}
              min="500"
              max="5000"
              step="100"
            />
            <Btn
              onClick={() => {
                setH({ goal: gi });
                setEditGoal(false);
              }}
            >
              저장
            </Btn>
            <Btn outline onClick={() => setEditGoal(false)}>
              취소
            </Btn>
          </div>
        )}
      </Card>
      <Card>
        <STitle icon="➕" title="물 기록" color={C.blue} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <IBtn
            onClick={() => setMl((m) => Math.max(25, m - 25))}
            color={C.red}
            style={{ width: 40, height: 40, fontSize: 20 }}
          >
            −
          </IBtn>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.blue }}>
              {ml}
            </div>
            <div style={{ fontSize: 11, color: C.textDim }}>ml</div>
          </div>
          <IBtn
            onClick={() => setMl((m) => Math.min(2000, m + 25))}
            color={C.blue}
            style={{ width: 40, height: 40, fontSize: 20 }}
          >
            +
          </IBtn>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 6,
            marginBottom: 14,
          }}
        >
          {PRESETS.map((v) => (
            <button
              key={v}
              onClick={() => setMl(v)}
              style={{
                padding: "7px 0",
                borderRadius: 8,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                border: `1px solid ${ml === v ? C.blue : C.border}`,
                background: ml === v ? C.blueSoft : C.bg,
                color: ml === v ? C.blue : C.textDim,
                fontWeight: ml === v ? 700 : 400,
              }}
            >
              {v}ml
            </button>
          ))}
        </div>
        <Btn
          onClick={() => {
            setH({ logs: [...logs, { id: Date.now(), ml, time: nowTime() }] });
            tryAwardPoint("hydration");
            updateStreak();
          }}
          color={C.blue}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span>💧 {ml}ml 기록</span>
          <span style={{ opacity: 0.7, fontSize: 12 }}>({nowTime()})</span>
        </Btn>
      </Card>
      {logs.length > 0 && (
        <Card>
          <STitle
            icon="📋"
            title={`오늘 섭취 기록`}
            color={C.blue}
            right={
              <span style={{ color: C.blue, fontWeight: 800 }}>{total}ml</span>
            }
          />
          {[...logs].reverse().map((log) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: C.bg,
                borderRadius: 10,
                padding: "9px 12px",
                marginBottom: 6,
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>💧</span>
                <div>
                  <div style={{ fontWeight: 600, color: C.blue }}>
                    {log.ml}ml
                  </div>
                  <div style={{ fontSize: 11, color: C.textDim }}>
                    {log.time}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <IBtn onClick={() => setEditId(log.id)} color={C.accent}>
                  ✏️
                </IBtn>
                <IBtn
                  onClick={() =>
                    setH({ logs: logs.filter((l) => l.id !== log.id) })
                  }
                  color={C.red}
                >
                  ×
                </IBtn>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// 상태 (약 전후)
function StatusSec({ day, setDay }) {
  const entries = day.status?.entries || [];
  const [form, setForm] = useState({
    label: "복용 전",
    pain: 0,
    stiffness: 0,
    posture: 0,
    gait: 0,
  });
  const [show, setShow] = useState(false);
  const metrics = [
    { key: "pain", label: "통증", icon: "😣", color: C.red },
    { key: "stiffness", label: "경직", icon: "🦾", color: C.yellow },
    { key: "posture", label: "자세 불안정", icon: "⚖️", color: C.purple },
    { key: "gait", label: "보행", icon: "🚶", color: C.accent },
  ];

  const Bar = ({ v, c }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: C.bgDeep,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${v * 10}%`,
            background: c,
            borderRadius: 3,
          }}
        />
      </div>
      <span style={{ color: c, fontWeight: 700, fontSize: 13, minWidth: 18 }}>
        {v}
      </span>
    </div>
  );

  return (
    <div>
      <div
        style={{
          background: C.accentSoft,
          borderRadius: 14,
          padding: 12,
          marginBottom: 14,
          border: `1px solid ${C.accent}44`,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: C.accent,
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          💊 이 탭의 목적
        </div>
        <div style={{ fontSize: 13, color: C.text }}>
          약 복용 전·후 상태 기록 → 호전 여부 추적 (FDA 권장: 복용직후 / 30분 /
          1시간 / 2시간)
        </div>
      </div>
      <Card>
        <STitle icon="📊" title="상태 기록" color={C.accent} />
        {!show ? (
          <Btn onClick={() => setShow(true)} style={{ width: "100%" }}>
            + 상태 기록 추가
          </Btn>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 14,
              }}
            >
              {["복용 전", "복용 직후", "30분 후", "1시간 후", "2시간 후"].map(
                (opt) => (
                  <button
                    key={opt}
                    onClick={() => setForm((f) => ({ ...f, label: opt }))}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      border: `1px solid ${form.label === opt ? C.accent : C.border}`,
                      background: form.label === opt ? C.accentSoft : C.bg,
                      color: form.label === opt ? C.accent : C.textMuted,
                      fontWeight: form.label === opt ? 700 : 400,
                    }}
                  >
                    {opt}
                  </button>
                ),
              )}
            </div>
            {metrics.map((m) => (
              <div key={m.key} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: C.text, fontSize: 14 }}>
                    {m.icon} {m.label}
                  </span>
                  <span style={{ color: m.color, fontWeight: 700 }}>
                    {form[m.key]} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={form[m.key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [m.key]: Number(e.target.value) }))
                  }
                  style={{ width: "100%", accentColor: m.color }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 10,
                    color: C.textDim,
                  }}
                >
                  <span>0 없음</span>
                  <span>5 중간</span>
                  <span>10 심함</span>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn
                onClick={() => {
                  setDay((d) => ({
                    ...d,
                    status: {
                      ...d.status,
                      entries: [
                        ...entries,
                        { ...form, id: Date.now(), time: nowTime() },
                      ],
                    },
                  }));
                  setShow(false);
                  setForm({
                    label: "복용 전",
                    pain: 0,
                    stiffness: 0,
                    posture: 0,
                    gait: 0,
                  });
                  tryAwardPoint("status");
                  updateStreak();
                }}
                style={{ flex: 1 }}
              >
                저장
              </Btn>
              <Btn outline onClick={() => setShow(false)} style={{ flex: 1 }}>
                취소
              </Btn>
            </div>
          </div>
        )}
      </Card>
      {entries.length > 0 && (
        <Card>
          <STitle icon="📈" title="오늘 상태 기록" color={C.accent} />
          {entries.map((e) => (
            <div
              key={e.id}
              style={{
                background: C.bg,
                borderRadius: 14,
                padding: 14,
                marginBottom: 12,
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span style={{ color: C.accent, fontWeight: 700 }}>
                  {e.label}{" "}
                  <span
                    style={{ color: C.textDim, fontSize: 12, fontWeight: 400 }}
                  >
                    {e.time}
                  </span>
                </span>
                <IBtn
                  onClick={() =>
                    setDay((d) => ({
                      ...d,
                      status: {
                        ...d.status,
                        entries: entries.filter((x) => x.id !== e.id),
                      },
                    }))
                  }
                  color={C.red}
                >
                  ×
                </IBtn>
              </div>
              {metrics.map((m) => (
                <div key={m.key} style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textMuted,
                      marginBottom: 3,
                    }}
                  >
                    {m.icon} {m.label}
                  </div>
                  <Bar v={e[m.key]} c={m.color} />
                </div>
              ))}
            </div>
          ))}
          {(() => {
            const before = entries.find((e) => e.label === "복용 전");
            const after = entries.filter((e) => e.label !== "복용 전").pop();
            if (!before || !after) return null;
            return (
              <div
                style={{
                  background: C.accentSoft,
                  borderRadius: 12,
                  padding: 14,
                  border: `1px solid ${C.accent}44`,
                }}
              >
                <div
                  style={{ color: C.accent, fontWeight: 700, marginBottom: 10 }}
                >
                  📊 복용 전 → {after.label}
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
                      <span style={{ fontSize: 13, color: C.textMuted }}>
                        {m.label}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color:
                            diff > 0 ? C.accent : diff < 0 ? C.red : C.textDim,
                        }}
                      >
                        {before[m.key]} → {after[m.key]}{" "}
                        {diff > 0
                          ? `(↓${diff} 개선)`
                          : diff < 0
                            ? `(↑${Math.abs(diff)} 악화)`
                            : ""}
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

// 증상
function SymptomsSec({ day, setDay }) {
  const sy = day.symptoms || {};
  const set = (p) =>
    setDay((d) => ({ ...d, symptoms: { ...d.symptoms, ...p } }));
  const falls = sy.falls || [];
  const [ff, setFf] = useState({ time: "", detail: "" });
  const [editFid, setEditFid] = useState(null);
  const sb = sy.sleepBehavior || [];
  const behaviors = ["잠꼬대", "심한 뒤척임", "헛손질", "수면 중 소리 지름"];

  return (
    <div>
      <div
        style={{
          background: C.yellowSoft,
          borderRadius: 14,
          padding: 12,
          marginBottom: 14,
          border: `1px solid ${C.yellow}44`,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: C.yellow,
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          📝 하루 한 번 작성 권장
        </div>
        <div style={{ fontSize: 13, color: C.text }}>
          하루를 마무리하며 오늘의 증상을 기록하세요
        </div>
      </div>
      <Card>
        <STitle icon="🔍" title="오늘의 증상" color={C.yellow} />
        <Toggle
          value={sy.freezing || false}
          onChange={(v) => {
            set({ freezing: v });
            tryAwardPoint("symptoms");
            updateStreak();
          }}
          label="🧊 동결 현상"
          sub="발이 땅에 붙는 느낌, 종종걸음"
        />
        <Toggle
          value={sy.swallowing || false}
          onChange={(v) => set({ swallowing: v })}
          label="🥤 삼킴 곤란"
          sub="사레 들림, 음식 넘기기 어려움"
        />
        <Toggle
          value={sy.orthostatic || false}
          onChange={(v) => set({ orthostatic: v })}
          label="🔻 기립성 저혈압"
          sub="일어설 때 어지러움"
        />
      </Card>
      <Card>
        <STitle icon="⚖️" title="균형 및 보행" color={C.purple} />
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
        <input
          type="range"
          min={1}
          max={5}
          value={sy.gait || 3}
          onChange={(e) => set({ gait: Number(e.target.value) })}
          style={{ width: "100%", accentColor: C.purple }}
        />
      </Card>
      <Card>
        <STitle icon="🚨" title="낙상 기록" color={C.red} />
        {falls.length === 0 && (
          <div
            style={{
              color: C.accent,
              textAlign: "center",
              padding: "8px 0",
              fontSize: 13,
            }}
          >
            ✅ 오늘 낙상 없음
          </div>
        )}
        {editFid &&
          (() => {
            const f = falls.find((x) => x.id === editFid);
            if (!f) return null;
            return (
              <TimeModal
                time={f.time}
                onSave={(t) => {
                  set({
                    falls: falls.map((x) =>
                      x.id === editFid ? { ...x, time: t } : x,
                    ),
                  });
                  setEditFid(null);
                }}
                onClose={() => setEditFid(null)}
              />
            );
          })()}
        {falls.map((f) => (
          <div
            key={f.id}
            style={{
              background: C.redSoft,
              borderRadius: 12,
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
                <div style={{ color: C.text, fontSize: 13, marginTop: 3 }}>
                  {f.detail}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <IBtn onClick={() => setEditFid(f.id)} color={C.accent}>
                  ✏️
                </IBtn>
                <IBtn
                  onClick={() =>
                    set({ falls: falls.filter((x) => x.id !== f.id) })
                  }
                  color={C.red}
                >
                  ×
                </IBtn>
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
            value={ff.time}
            onChange={(e) => setFf((f) => ({ ...f, time: e.target.value }))}
            style={iSt}
          />
          <input
            value={ff.detail}
            onChange={(e) => setFf((f) => ({ ...f, detail: e.target.value }))}
            placeholder="상황 설명"
            style={iSt}
          />
        </div>
        <Btn
          outline
          color={C.red}
          onClick={() => {
            if (!ff.detail) return;
            set({
              falls: [
                ...falls,
                { ...ff, time: ff.time || nowTime(), id: Date.now() },
              ],
            });
            setFf({ time: "", detail: "" });
          }}
          style={{ width: "100%", marginTop: 8 }}
        >
          + 낙상 기록
        </Btn>
      </Card>
      <Card>
        <STitle icon="😴" title="수면 중 이상 행동" color={C.purple} />
        {behaviors.map((b) => (
          <Toggle
            key={b}
            value={sb.includes(b)}
            onChange={(v) =>
              set({ sleepBehavior: v ? [...sb, b] : sb.filter((x) => x !== b) })
            }
            label={b}
          />
        ))}
      </Card>
    </div>
  );
}

// 수면
function SleepSec({ day, setDay }) {
  const sl = day.sleep || {};
  const set = (k, v) =>
    setDay((d) => ({ ...d, sleep: { ...d.sleep, [k]: v } }));
  const wp = sl.wakePeriods || [];
  const [wf, setWf] = useState({ from: "", to: "" });
  const toM = (t) => {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const fmt = (total) => {
    if (total == null || total < 0) return "--";
    const h = Math.floor(total / 60),
      m = total % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };
  const bedM = (() => {
    try {
      const b = toM(sl.bedtime),
        w = toM(sl.wakeTime);
      if (!b || !w) return null;
      let d = w - b;
      if (d < 0) d += 1440;
      return d;
    } catch {
      return null;
    }
  })();
  const wakeM = wp.reduce((s, p) => {
    const f = toM(p.from),
      t = toM(p.to);
    if (!f || !t) return s;
    let d = t - f;
    if (d < 0) d += 1440;
    return s + d;
  }, 0);
  const actualM = bedM != null ? Math.max(0, bedM - wakeM) : null;

  return (
    <div>
      <Card>
        <STitle icon="🌙" title="수면 시간" color={C.purple} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {[
            ["bedtime", "취침 시간"],
            ["wakeTime", "기상 시간"],
          ].map(([k, label]) => (
            <div key={k}>
              <label
                style={{
                  fontSize: 12,
                  color: C.textMuted,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {label}
              </label>
              <input
                type="time"
                value={sl[k] || ""}
                onChange={(e) => {
                  set(k, e.target.value);
                  tryAwardPoint("sleep");
                  updateStreak();
                }}
                style={iSt}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: 14,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>
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
            {[
              ["from", "깬 시각"],
              ["to", "다시 잠든"],
            ].map(([k, label]) => (
              <div key={k}>
                <label
                  style={{
                    fontSize: 11,
                    color: C.textDim,
                    display: "block",
                    marginBottom: 3,
                  }}
                >
                  {label}
                </label>
                <input
                  type="time"
                  value={wf[k]}
                  onChange={(e) =>
                    setWf((f) => ({ ...f, [k]: e.target.value }))
                  }
                  style={iSt}
                />
              </div>
            ))}
            <Btn
              onClick={() => {
                if (!wf.from || !wf.to) return;
                set("wakePeriods", [...wp, { id: Date.now(), ...wf }]);
                setWf({ from: "", to: "" });
              }}
              style={{ padding: "11px 14px" }}
            >
              추가
            </Btn>
          </div>
          {wp.map((p) => {
            const f = toM(p.from),
              t = toM(p.to);
            let d = (t - f + 1440) % 1440;
            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: C.bg,
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginTop: 8,
                  border: `1px solid ${C.red}33`,
                }}
              >
                <span style={{ color: C.text, fontSize: 13 }}>
                  👁️ {p.from} → {p.to}{" "}
                  <span style={{ color: C.red, fontWeight: 700 }}>
                    −{fmt(d)}
                  </span>
                </span>
                <button
                  onClick={() =>
                    set(
                      "wakePeriods",
                      wp.filter((x) => x.id !== p.id),
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
            { l: "침대 시간", v: fmt(bedM), c: C.textMuted },
            { l: "총 깸 시간", v: `−${fmt(wakeM)}`, c: C.red },
            { l: "실제 수면", v: fmt(actualM), c: C.purple },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                background: C.bg,
                borderRadius: 12,
                padding: 12,
                textAlign: "center",
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ fontSize: 10, color: C.textDim, marginBottom: 4 }}>
                {s.l}
              </div>
              <div style={{ color: s.c, fontWeight: 700, fontSize: 14 }}>
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <STitle icon="😪" title="낮잠 및 졸림증" color={C.yellow} />
        {[
          [
            "napMinutes",
            "낮잠 시간",
            sl.napMinutes || 0,
            0,
            180,
            (v) => `${v}분`,
          ],
          [
            "drowsiness",
            "주간 졸림증",
            sl.drowsiness || 3,
            1,
            5,
            (v) => ["거의 없음", "약간", "보통", "심함", "매우 심함"][v - 1],
          ],
        ].map(([k, label, val, min, max, fmt2]) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ color: C.text, fontSize: 14 }}>{label}</span>
              <span style={{ color: C.yellow, fontWeight: 700 }}>
                {fmt2(val)}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={val}
              onChange={(e) => set(k, Number(e.target.value))}
              style={{ width: "100%", accentColor: C.yellow }}
            />
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── 커뮤니티 탭 ──────────────────────────────────────────────────────────────
const POST_TYPES = [
  { id: "info", label: "정보", icon: "📚", color: C.blue },
  { id: "question", label: "질문", icon: "❓", color: C.yellow },
  { id: "diary", label: "일기", icon: "📔", color: C.purple },
  { id: "cheer", label: "응원", icon: "🎉", color: C.warm },
  { id: "dev", label: "개발자에게", icon: "💬", color: C.accent },
];

function CommunityTab() {
  const [posts, setPosts] = useState(() =>
    load(K.posts, [
      {
        id: 1,
        type: "cheer",
        author: "운영자",
        date: "07-31",
        title: "파캣슨에 오신 걸 환영해요! 🐱",
        content:
          "함께 기록하면서 건강한 하루를 만들어가요. 고양이가 기다리고 있어요 🐾",
        likes: 7,
      },
      {
        id: 2,
        type: "info",
        author: "냥이집사",
        date: "07-31",
        title: "마도파 복용 팁 공유",
        content:
          "빈속에 드시면 흡수가 더 빨라요. 단백질 식사와 같이 드시면 흡수가 늦어질 수 있다고 해요.",
        likes: 4,
      },
      {
        id: 3,
        type: "cheer",
        author: "응원단장",
        date: "08-01",
        title: "오늘도 화이팅!",
        content:
          "기록 하나하나가 쌓여 의사 선생님께 드릴 소중한 데이터가 돼요. 포기하지 마세요 💪",
        likes: 12,
      },
    ]),
  );
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "info", title: "", content: "" });

  const addPost = () => {
    if (!form.title || !form.content) return;
    const t = POST_TYPES.find((x) => x.id === form.type);
    const next = [
      {
        id: Date.now(),
        type: form.type,
        author: "나",
        date: new Date()
          .toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })
          .replace(". ", "-")
          .replace(".", ""),
        title: form.title,
        content: form.content,
        likes: 0,
      },
      ...posts,
    ];
    setPosts(next);
    save(K.posts, next);
    setShowForm(false);
    setForm({ type: "info", title: "", content: "" });
  };

  const likePost = (id) => {
    const next = posts.map((p) =>
      p.id === id ? { ...p, likes: p.likes + 1 } : p,
    );
    setPosts(next);
    save(K.posts, next);
  };
  const filtered =
    filter === "all" ? posts : posts.filter((p) => p.type === filter);

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          marginBottom: 14,
          paddingBottom: 2,
          scrollbarWidth: "none",
        }}
      >
        {[
          { id: "all", label: "전체", icon: "📋", color: C.accent },
          ...POST_TYPES,
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            style={{
              padding: "7px 14px",
              borderRadius: 20,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              border: `1px solid ${filter === t.id ? t.color : C.border}`,
              background: filter === t.id ? `${t.color}18` : C.card,
              color: filter === t.id ? t.color : C.textMuted,
              fontWeight: filter === t.id ? 700 : 400,
              flexShrink: 0,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <Btn
        onClick={() => setShowForm(true)}
        style={{ width: "100%", marginBottom: 14 }}
      >
        ✏️ 글 작성하기
      </Btn>
      {showForm && (
        <Card style={{ border: `1.5px solid ${C.accent}` }}>
          <STitle icon="✏️" title="글 작성" color={C.accent} />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 14,
            }}
          >
            {POST_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setForm((f) => ({ ...f, type: t.id }))}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  border: `1px solid ${form.type === t.id ? t.color : C.border}`,
                  background: form.type === t.id ? `${t.color}15` : C.bg,
                  color: form.type === t.id ? t.color : C.textMuted,
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="제목"
            style={{ ...iSt, marginBottom: 10 }}
          />
          <textarea
            value={form.content}
            onChange={(e) =>
              setForm((f) => ({ ...f, content: e.target.value }))
            }
            placeholder="내용..."
            style={{ ...iSt, minHeight: 100, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Btn onClick={addPost} style={{ flex: 1 }}>
              게시하기
            </Btn>
            <Btn outline onClick={() => setShowForm(false)} style={{ flex: 1 }}>
              취소
            </Btn>
          </div>
        </Card>
      )}
      {filtered.map((post) => {
        const t = POST_TYPES.find((x) => x.id === post.type) || POST_TYPES[0];
        return (
          <Card key={post.id}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.color,
                  background: `${t.color}15`,
                  padding: "2px 8px",
                  borderRadius: 10,
                }}
              >
                {t.icon} {t.label}
              </span>
              <span style={{ fontSize: 11, color: C.textDim }}>
                {post.author} · {post.date}
              </span>
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: C.text,
                marginBottom: 6,
              }}
            >
              {post.title}
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
              {post.content}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 12,
                paddingTop: 10,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <button
                onClick={() => likePost(post.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.textMuted,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ❤️ {post.likes}
              </button>
            </div>
          </Card>
        );
      })}
      {filtered.length === 0 && (
        <div
          style={{ textAlign: "center", color: C.textDim, padding: "40px 0" }}
        >
          아직 글이 없어요. 첫 번째 글을 남겨보세요 🐾
        </div>
      )}
    </div>
  );
}

// ─── 내 정보 탭 ───────────────────────────────────────────────────────────────
function MyInfoTab({
  store,
  day,
  setDay,
  selectedDate,
  setSelectedDate,
  user,
  onLogout,
}) {
  const [view, setView] = useState("main");
  const [calOpen, setCalOpen] = useState(false);
  const [yr, setYr] = useState(new Date().getFullYear());
  const [mo, setMo] = useState(new Date().getMonth());
  const streakInfo = load(K.streak, { streak: 0, totalPoints: 0 });

  const CalComp = () => {
    const first = new Date(yr, mo, 1).getDay();
    const days = new Date(yr, mo + 1, 0).getDate();
    const cells = [
      ...Array(first).fill(null),
      ...Array.from({ length: days }, (_, i) => i + 1),
    ];
    const ds = (d) =>
      `${yr}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const hasData = (d) => {
      const x = store[ds(d)];
      return x && (x.medication?.length > 0 || x.diary);
    };
    const months = [
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
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <button
            onClick={() => {
              if (mo === 0) {
                setYr((y) => y - 1);
                setMo(11);
              } else setMo((m) => m - 1);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: C.accent,
            }}
          >
            ‹
          </button>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>
            {yr}년 {months[mo]}
          </span>
          <button
            onClick={() => {
              if (mo === 11) {
                setYr((y) => y + 1);
                setMo(0);
              } else setMo((m) => m + 1);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: C.accent,
            }}
          >
            ›
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 3,
            marginBottom: 6,
          }}
        >
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: 11,
                color: C.textDim,
                padding: "3px 0",
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 3,
          }}
        >
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const dateStr = ds(d);
            const isSel = dateStr === selectedDate;
            const isToday = dateStr === todayStr();
            return (
              <button
                key={i}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setCalOpen(false);
                }}
                style={{
                  background: isSel
                    ? C.accent
                    : isToday
                      ? C.accentSoft
                      : "transparent",
                  border: `1px solid ${isSel ? C.accent : isToday ? C.accent + "55" : C.border}`,
                  borderRadius: 8,
                  padding: "7px 2px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: isSel ? "#fff" : isToday ? C.accent : C.text,
                    fontWeight: isToday || isSel ? 700 : 400,
                  }}
                >
                  {d}
                </span>
                {hasData(d) && (
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      background: isSel ? "#fff" : C.accent,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const TrendComp = () => {
    const dates = Object.keys(store).sort().slice(-14);
    if (dates.length < 2)
      return (
        <div style={{ color: C.textDim, textAlign: "center", padding: 24 }}>
          기록이 2일 이상이면 트렌드를 볼 수 있어요
        </div>
      );
    const datasets = [
      {
        label: "💧 수분(ml)",
        data: dates.map((d) => ({
          date: d.slice(5),
          val: (store[d]?.hydration?.logs || []).reduce((s, l) => s + l.ml, 0),
        })),
        color: C.blue,
      },
      {
        label: "💊 복약(회)",
        data: dates.map((d) => ({
          date: d.slice(5),
          val: store[d]?.medication?.length || 0,
        })),
        color: C.accent,
      },
      {
        label: "🏃 운동(종)",
        data: dates.map((d) => ({
          date: d.slice(5),
          val: store[d]?.exercise?.items?.length || 0,
        })),
        color: C.warm,
      },
    ];
    return (
      <div>
        {datasets.map((ds) => {
          const vals = ds.data.map((d) => d.val);
          const max = Math.max(...vals, 1);
          return (
            <Card key={ds.label}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.textMuted,
                  marginBottom: 10,
                }}
              >
                {ds.label} 최근 2주
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 3,
                  height: 56,
                }}
              >
                {ds.data.map((d, i) => (
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
                        height: `${Math.max(4, (d.val / max) * 52)}px`,
                        background: d.val > 0 ? ds.color : C.border,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 7,
                        color: C.textDim,
                        transform: "rotate(-40deg)",
                        transformOrigin: "right",
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
                  fontSize: 11,
                }}
              >
                <span style={{ color: C.textDim }}>
                  최소 {Math.min(...vals)}
                </span>
                <span style={{ color: ds.color, fontWeight: 700 }}>
                  최대 {Math.max(...vals)}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  if (view === "diary")
    return (
      <div style={{ padding: "16px 16px 100px" }}>
        <button
          onClick={() => setView("main")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.accent,
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          ← 뒤로
        </button>
        <div
          style={{
            fontWeight: 700,
            fontSize: 18,
            color: C.text,
            marginBottom: 16,
          }}
        >
          📔 가족 일기
        </div>
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 600, color: C.text }}>
              {selectedDate}
            </span>
            <Btn
              onClick={() => setCalOpen((c) => !c)}
              outline
              style={{ fontSize: 12, padding: "6px 12px" }}
            >
              📅 날짜 선택
            </Btn>
          </div>
          {calOpen && (
            <div style={{ marginTop: 14 }}>
              <CalComp />
            </div>
          )}
        </Card>
        <Card style={{ background: "#FDFAF5" }}>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 10 }}>
            · 오늘의 기록 요약 ·
          </div>
          {[
            {
              icon: "💊",
              label: "복약",
              value: `${day.medication?.length || 0}회`,
            },
            {
              icon: "💧",
              label: "수분",
              value: `${(day.hydration?.logs || []).reduce((s, l) => s + l.ml, 0)}ml`,
            },
            {
              icon: "🏃",
              label: "운동",
              value: `${(day.exercise?.items || []).length}종`,
            },
            {
              icon: "🛏️",
              label: "수면",
              value: day.sleep?.wakeTime
                ? `기상 ${day.sleep.wakeTime}`
                : "미기록",
            },
            {
              icon: "🚿",
              label: "배뇨",
              value: `${(day.bladder?.logs || []).length}회`,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "7px 0",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <span style={{ fontSize: 13, color: C.textMuted }}>
                {item.icon} {item.label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                {item.value}
              </span>
            </div>
          ))}
        </Card>
        <Card>
          <STitle icon="✍️" title="일기 작성" color={C.purple} />
          <textarea
            value={day.diary || ""}
            onChange={(e) => setDay((d) => ({ ...d, diary: e.target.value }))}
            placeholder="오늘 기분, 특이사항, 하고 싶은 말을 자유롭게 적어보세요..."
            style={{
              ...iSt,
              minHeight: 160,
              resize: "vertical",
              lineHeight: 1.7,
            }}
          />
          <div style={{ color: C.textDim, fontSize: 11, marginTop: 4 }}>
            * 자동 저장됩니다
          </div>
        </Card>
      </div>
    );

  if (view === "trend")
    return (
      <div style={{ padding: "16px 16px 100px" }}>
        <button
          onClick={() => setView("main")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.accent,
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          ← 뒤로
        </button>
        <div
          style={{
            fontWeight: 700,
            fontSize: 18,
            color: C.text,
            marginBottom: 16,
          }}
        >
          📈 작성 기록 보기
        </div>
        <TrendComp />
      </div>
    );

  const menuSections = [
    {
      title: "기록",
      items: [
        {
          icon: "📔",
          label: "가족 일기",
          sub: "날짜별 기록 & 일기",
          action: () => setView("diary"),
        },
        {
          icon: "📈",
          label: "작성 기록 보기",
          sub: "수분·복약·운동 트렌드",
          action: () => setView("trend"),
        },
      ],
    },
    {
      title: "설정",
      items: [
        {
          icon: "📅",
          label: "날짜 선택 / 달력",
          sub: selectedDate,
          action: () => setCalOpen((c) => !c),
        },
      ],
    },
  ];

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <Card style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            background: C.accentSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            flexShrink: 0,
          }}
        >
          🐱
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>
            {user?.name || "파캣슨 사용자"}
          </div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
            {user?.type === "guest" ? "게스트 모드" : user?.type} ·{" "}
            {streakInfo.streak >= 2
              ? `🔥 ${streakInfo.streak}일 연속`
              : "오늘도 기록하세요"}
          </div>
        </div>
      </Card>

      {calOpen && (
        <Card>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: C.text,
              marginBottom: 14,
            }}
          >
            📅 날짜 선택
          </div>
          <CalComp />
        </Card>
      )}
      {selectedDate !== todayStr() && (
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
          <span style={{ fontSize: 13, color: C.yellow, fontWeight: 600 }}>
            ✏️ {selectedDate} 편집 중
          </span>
          <Btn
            onClick={() => setSelectedDate(todayStr())}
            outline
            color={C.yellow}
            style={{ fontSize: 12, padding: "5px 10px" }}
          >
            오늘로
          </Btn>
        </div>
      )}

      {menuSections.map((section) => (
        <Card key={section.title}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>
            {section.title}
          </div>
          {section.items.map((item) => (
            <div
              key={item.label}
              onClick={item.action}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 0",
                borderBottom: `1px solid ${C.border}`,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: C.accentSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 1 }}>
                    {item.sub}
                  </div>
                </div>
              </div>
              <span style={{ color: C.textDim, fontSize: 18 }}>›</span>
            </div>
          ))}
        </Card>
      ))}

      <Card
        style={{ background: C.accentSoft, border: `1px solid ${C.accent}33` }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 24 }}>🐱</span>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: C.accent,
                marginBottom: 6,
              }}
            >
              파캣슨 (ParCatson)
            </div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
              파킨슨(Parkinson) + 냥(고양이). 파킨슨 환자와 가족이 함께
              기록하고, 고양이와 성장하는 케어 앱. 6개월치 기록을 담당 의사께
              드려 약 조절에 도움이 되길 바랍니다 🐾
            </div>
          </div>
        </div>
      </Card>
      <Card style={{ border: `1px solid ${C.border}` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>
              계정
            </div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
              {user?.type === "guest"
                ? "게스트 모드 · 로컬 저장"
                : user?.type + " 로그인"}
            </div>
          </div>
          <Btn
            onClick={onLogout}
            outline
            color={C.red}
            style={{ fontSize: 13, padding: "8px 16px" }}
          >
            로그아웃
          </Btn>
        </div>
      </Card>
      <div
        style={{
          textAlign: "center",
          color: C.textDim,
          fontSize: 11,
          marginTop: 4,
        }}
      >
        v2.0 · 기기 로컬 저장 · 추후 카카오·구글 로그인 연동 예정
      </div>
    </div>
  );
}

// ─── 메인 탭 구성 ─────────────────────────────────────────────────────────────
const MAIN_TABS = [
  { id: "home", label: "홈", icon: "🏠" },
  { id: "medication", label: "약 복용", icon: "💊" },
  { id: "record", label: "기록", icon: "📝" },
  { id: "community", label: "커뮤니티", icon: "💬" },
  { id: "myinfo", label: "내 정보", icon: "👤" },
];

// ─── 메인 앱 ──────────────────────────────────────────────────────────────────
export default function App() {
  const [onboarded, setOnboarded] = useState(
    () => !!localStorage.getItem(K.onboard),
  );
  const [user, setUser] = useState(() => load(K.user, null));
  const [store, setStore] = useState(() => load(K.store, {}));
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [activeTab, setActiveTab] = useState("home");
  const [showCal, setShowCal] = useState(false);

  const day = store[selectedDate] || emptyDay();
  const setDay = useCallback(
    (updater) => {
      setStore((prev) => {
        const cur = prev[selectedDate] || emptyDay();
        const next =
          typeof updater === "function" ? updater(cur) : { ...cur, ...updater };
        const newStore = { ...prev, [selectedDate]: next };
        save(K.store, newStore);
        return newStore;
      });
    },
    [selectedDate],
  );

  const handleOnboardDone = () => {
    localStorage.setItem(K.onboard, "1");
    setOnboarded(true);
  };

  const handleLogin = (u) => setUser(u);

  const handleLogout = () => {
    localStorage.removeItem(K.user);
    setUser(null);
  };

  // 온보딩 먼저
  if (!onboarded) return <Onboarding onDone={handleOnboardDone} />;
  // 로그인 화면
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const isToday = selectedDate === todayStr();
  const displayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString(
    "ko-KR",
    { month: "long", day: "numeric", weekday: "short" },
  );

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        fontFamily:
          "'Pretendard','Apple SD Gothic Neo','Noto Sans KR',sans-serif",
        color: C.text,
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* 달력 모달 */}
      {showCal && (
        <CalendarModal
          store={store}
          selectedDate={selectedDate}
          onSelect={(date) => setSelectedDate(date)}
          onClose={() => setShowCal(false)}
        />
      )}

      {/* 헤더 */}
      <div
        style={{
          background: C.card,
          borderBottom: `1px solid ${C.border}`,
          padding: "12px 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🐱</span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>
              파<span style={{ color: C.accent }}>캣</span>슨
            </div>
          </div>
        </div>

        {/* 날짜 클릭 → 달력 */}
        <button
          onClick={() => setShowCal(true)}
          style={{
            background: isToday ? C.accentSoft : C.yellowSoft,
            border: `1px solid ${isToday ? C.accent + "55" : C.yellow + "55"}`,
            borderRadius: 20,
            padding: "6px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "inherit",
          }}
        >
          <span style={{ fontSize: 14 }}>📅</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: isToday ? C.accent : C.yellow,
            }}
          >
            {isToday ? "오늘" : displayDate}
          </span>
          <span style={{ fontSize: 10, color: isToday ? C.accent : C.yellow }}>
            ▼
          </span>
        </button>
      </div>

      {/* 날짜 편집 배너 */}
      {!isToday && (
        <div
          style={{
            background: C.yellowSoft,
            borderBottom: `1px solid ${C.yellow}44`,
            padding: "8px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: C.yellow, fontWeight: 600 }}>
            ✏️ {displayDate} 기록 편집 중
          </span>
          <button
            onClick={() => setSelectedDate(todayStr())}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.yellow,
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            오늘로 →
          </button>
        </div>
      )}

      {/* 컨텐츠 */}
      <div style={{ paddingBottom: 70 }}>
        {activeTab === "home" && (
          <HomeTab store={store} day={day} selectedDate={selectedDate} />
        )}
        {activeTab === "medication" && (
          <MedicationTab day={day} setDay={setDay} />
        )}
        {activeTab === "record" && <RecordTab day={day} setDay={setDay} />}
        {activeTab === "community" && <CommunityTab />}
        {activeTab === "myinfo" && (
          <MyInfoTab
            store={store}
            day={day}
            setDay={setDay}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            user={user}
            onLogout={handleLogout}
          />
        )}
      </div>

      {/* 하단 탭바 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          background: C.card,
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          zIndex: 200,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "10px 4px 12px",
              border: "none",
              cursor: "pointer",
              background: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              fontFamily: "inherit",
              borderTop:
                activeTab === tab.id
                  ? `2.5px solid ${C.accent}`
                  : "2.5px solid transparent",
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
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
  );
}
