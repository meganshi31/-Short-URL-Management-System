import { useState } from "react";

function AuthForm({ error, loading, mode, onSubmit }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(formData);
  }

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Email</span>
        <input
          autoComplete="email"
          name="email"
          onChange={handleChange}
          placeholder="you@example.com"
          required
          type="email"
          value={formData.email}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={6}
          name="password"
          onChange={handleChange}
          placeholder="At least 6 characters"
          required
          type="password"
          value={formData.password}
        />
      </label>

      {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

      <button className="button button--primary" disabled={loading} type="submit">
        {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
      </button>
    </form>
  );
}

export default AuthForm;
