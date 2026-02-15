import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { useUIStore } from "@/stores/uiStore";
import { useServerStore } from "@/stores/serverStore";
import * as serversApi from "@/api/servers.api";

export function JoinServerModal() {
  const { showJoinServerModal, setShowJoinServerModal } = useUIStore();
  const { loadServers } = useServerStore();
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Extract code from URL or use as-is
    let code = inviteLink.trim();
    const match = code.match(/\/invite\/([a-zA-Z0-9]+)$/);
    if (match) code = match[1];

    try {
      await serversApi.joinByInvite(code);
      await loadServers();
      setShowJoinServerModal(false);
      setInviteLink("");
    } catch {
      setError("Invalid or expired invite link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={showJoinServerModal}
      onClose={() => setShowJoinServerModal(false)}
      title="Join a server"
    >
      {error && (
        <div className="bg-danger/20 text-danger text-sm rounded p-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-2">
            Invite Link or Code
          </label>
          <input
            type="text"
            value={inviteLink}
            onChange={(e) => setInviteLink(e.target.value)}
            placeholder="https://haven.local/invite/abc123"
            className="w-full px-3 py-2 rounded bg-bg-tertiary text-text-normal"
            required
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowJoinServerModal(false)}
            className="px-4 py-2 text-sm text-text-muted hover:text-text-normal"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !inviteLink.trim()}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Server"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
