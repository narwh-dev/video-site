import { AlertCircle, Loader2, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, redirect, useNavigate } from "react-router";
import type { Route } from "./+types/login";
import {
  buildLoggedInHref,
  nextAuthStateAfterSubmit,
  parseLoginQuery,
  resolveAuthState,
  type AuthState,
} from "../lib/auth";
import { pageTitle } from "../lib/meta";
import { getPrototypeState } from "../lib/prototype";
import { PageState } from "../components/states";

const COOLDOWN_SECONDS = 5;

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function meta() {
  return [{ title: pageTitle("登录") }];
}

export function loader({ request }: Route.LoaderArgs) {
  const state = getPrototypeState(request);
  const url = new URL(request.url);
  const query = parseLoginQuery(url.search);
  if (state.persona !== "guest") {
    throw redirect(buildLoggedInHref(query.returnTo, query.intent));
  }
  const authState = resolveAuthState(state.scenario, query.authState);
  return {
    ...state,
    authState,
    returnTo: query.returnTo,
    intent: query.intent,
  };
}

export default function Login({ loaderData }: Route.ComponentProps) {
  const { scenario, authState: initialAuthState, returnTo, intent } = loaderData;
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [email, setEmail] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(COOLDOWN_SECONDS);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const submitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setAuthState(initialAuthState);
  }, [initialAuthState]);

  useEffect(() => {
    if (authState !== "invalid-email") return;
    emailInputRef.current?.focus();
  }, [authState]);

  useEffect(() => {
    if (authState !== "cooldown") {
      setCooldownLeft(COOLDOWN_SECONDS);
      return;
    }
    setCooldownLeft(COOLDOWN_SECONDS);
    const timer = window.setInterval(() => {
      setCooldownLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setAuthState("default");
          return COOLDOWN_SECONDS;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [authState]);

  useEffect(() => () => {
    if (submitTimerRef.current != null) window.clearTimeout(submitTimerRef.current);
  }, []);

  if (scenario === "error") return <PageState state="error" onClearHref="/login" />;

  const backHref = returnTo ?? "/";
  const loggedInHref = buildLoggedInHref(returnTo, intent);

  function completeGitHubLogin() {
    navigate(loggedInHref);
  }

  function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = nextAuthStateAfterSubmit(email);
    setAuthState(next);
    if (next !== "submitting") return;
    if (submitTimerRef.current != null) window.clearTimeout(submitTimerRef.current);
    submitTimerRef.current = window.setTimeout(() => {
      setAuthState("sent");
      submitTimerRef.current = null;
    }, 600);
  }

  function handleResend() {
    setAuthState("cooldown");
  }

  function handleRetrySend() {
    setAuthState("default");
  }

  const showForm = authState === "default" || authState === "invalid-email" || authState === "submitting" || authState === "cooldown";
  const formDisabled = authState === "submitting" || authState === "cooldown";

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <strong>Star Trek China</strong>
          <span>星际迷航中国</span>
        </div>
        <p className="auth-lead">登录以同步收藏、历史和弹幕投稿</p>

        {authState === "sent" ? (
          <div className="sent-state">
            <Mail aria-hidden="true" size={28} />
            <h1>登录链接已发送</h1>
            <p>请查收邮箱并完成登录。演示环境可直接确认已登录状态。</p>
            <div className="button-row">
              <button className="button primary" type="button" onClick={() => navigate(loggedInHref)}>
                我已登录
              </button>
              <button className="button secondary" type="button" onClick={handleResend}>
                重新发送
              </button>
            </div>
          </div>
        ) : null}

        {authState === "send-error" ? (
          <div className="send-error-state">
            <AlertCircle aria-hidden="true" size={28} />
            <h1>登录链接发送失败</h1>
            <p>暂时无法发送邮件。请稍后重试，或改用 GitHub 登录。</p>
            <div className="button-row">
              <button className="button primary" type="button" onClick={handleRetrySend}>
                重试
              </button>
              <button className="button secondary" type="button" onClick={completeGitHubLogin}>
                <GithubIcon size={18} />
                使用 GitHub 登录
              </button>
            </div>
          </div>
        ) : null}

        {showForm ? (
          <>
            <button
              className="button primary auth-github"
              type="button"
              onClick={completeGitHubLogin}
              disabled={formDisabled}
            >
              <GithubIcon size={18} />
              使用 GitHub 登录
            </button>

            <div className="auth-separator" role="separator">
              <span>或使用邮箱</span>
            </div>

            {authState === "submitting" ? (
              <div className="submitting-state" aria-live="polite">
                <Loader2 aria-hidden="true" size={22} className="auth-spinner" />
                <p>正在发送登录链接…</p>
              </div>
            ) : null}

            {authState === "cooldown" ? (
              <div className="cooldown-state" aria-live="polite">
                <p>请等待 {cooldownLeft} 秒后重新发送</p>
              </div>
            ) : null}

            {authState !== "submitting" ? (
              <form className="auth-form" onSubmit={handleEmailSubmit} noValidate>
                <label className="auth-field" htmlFor="login-email">
                  <span className="sr-only">电子邮箱</span>
                  <input
                    ref={emailInputRef}
                    id="login-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    disabled={formDisabled}
                    aria-invalid={authState === "invalid-email"}
                    aria-describedby={authState === "invalid-email" ? "login-email-error" : undefined}
                    aria-label="电子邮箱"
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (authState === "invalid-email") setAuthState("default");
                    }}
                  />
                </label>
                {authState === "invalid-email" ? (
                  <p id="login-email-error" className="field-error" role="alert">
                    请输入有效的邮箱地址
                  </p>
                ) : null}
                <button className="button primary" type="submit" disabled={formDisabled}>
                  <Mail aria-hidden="true" size={18} />
                  发送登录链接
                </button>
              </form>
            ) : null}
          </>
        ) : null}

        <Link className="auth-back-link" to={backHref}>
          返回来源页或首页
        </Link>
      </div>
    </div>
  );
}
