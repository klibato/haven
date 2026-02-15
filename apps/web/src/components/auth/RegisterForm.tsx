import { useState, type FormEvent } from "react";
import { useAuthStore } from "@/stores/authStore";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(username, email, password);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setError(msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-bg-secondary rounded-lg p-8">
      <h1 className="text-2xl font-bold text-text-normal text-center mb-2">Create an account</h1>

      {error && (
        <div className="bg-danger/20 text-danger text-sm rounded p-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 rounded bg-bg-tertiary text-text-normal"
            required
            minLength={2}
            maxLength={32}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded bg-bg-tertiary text-text-normal"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-bg-tertiary text-text-normal"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Continue"}
        </button>
      </form>

      <p className="text-sm text-text-muted mt-4">
        Already have an account?{" "}
        <button onClick={onSwitchToLogin} className="text-text-link hover:underline">
          Log In
        </button>
      </p>
    </div>
  );
}
