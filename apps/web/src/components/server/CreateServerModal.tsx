import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { useUIStore } from "@/stores/uiStore";
import { useServerStore } from "@/stores/serverStore";
import * as serversApi from "@/api/servers.api";

export function CreateServerModal() {
  const { showCreateServerModal, setShowCreateServerModal } = useUIStore();
  const { loadServers, setActiveServer } = useServerStore();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      const server = await serversApi.createServer(name.trim());
      await loadServers();
      setActiveServer(server.id);
      setShowCreateServerModal(false);
      setName("");
    } catch {
      setError("Failed to create server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={showCreateServerModal}
      onClose={() => setShowCreateServerModal(false)}
      title="Create a server"
    >
      {error && (
        <div className="bg-danger/20 text-danger text-sm rounded p-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase mb-2">
            Server Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Server"
            className="w-full px-3 py-2 rounded bg-bg-tertiary text-text-normal"
            required
            maxLength={100}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowCreateServerModal(false)}
            className="px-4 py-2 text-sm text-text-muted hover:text-text-normal"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
