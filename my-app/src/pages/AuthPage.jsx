import AuthForm from "../components/AuthForm";

function AuthPage({ authError, authLoading, authMode, onModeChange, onSubmit }) {
  return (
    <section className="auth-layout">
      <div className="panel auth-intro">
        <h1>User-based short URL management system</h1>
        <p className="lead-text">
          Register, log in, create short links, control active windows, and manage
          everything from one dashboard.
        </p>

     
      </div>

      <div className="panel auth-panel">
        <div className="auth-tabs" role="tablist">
          <button
            className={`auth-tab ${authMode === "login" ? "auth-tab--active" : ""}`}
            onClick={() => onModeChange("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab ${authMode === "register" ? "auth-tab--active" : ""}`}
            onClick={() => onModeChange("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <div className="auth-panel__copy">
          <p className="eyebrow">{authMode === "login" ? "Welcome back" : "New account"}</p>
          <h2>{authMode === "login" ? "Access your dashboard" : "Create your account"}</h2>
          <p className="muted-text">
            {authMode === "login"
              ? "Use your email and password to manage your short URLs."
              : "Registration signs you in immediately so you can start creating links."}
          </p>
        </div>

        <AuthForm
          error={authError}
          loading={authLoading}
          mode={authMode}
          onSubmit={onSubmit}
        />
      </div>
    </section>
  );
}

export default AuthPage;
