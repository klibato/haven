import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useUIStore } from "@/stores/uiStore";
import { useServerStore } from "@/stores/serverStore";
import * as serversApi from "@/api/servers.api";

export function InviteModal() {
  const { showInviteModal, setShowInviteModal } = useUIStore();
  const { activeServerId } = useServerStore();
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showInviteModal && activeServerId) {
      setLoading(true);
      serversApi
        .createInvite(activeServerId)
        .then((invite) => setInviteCode(invite.code))
        .catch(() => setInviteCode("Error generating invite"))
        .finally(() => setLoading(false));
    }
  }, [showInviteModal, activeServerId]);

  const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={showInviteModal}
      onClose={() => setShowInviteModal(false)}
      title="Invite friends"
    >
      <p className="text-text-muted text-sm mb-4">
        Share this link with your friends to invite them to your server.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={loading ? "Generating..." : inviteUrl}
          readOnly
          className="flex-1 px-3 py-2 rounded bg-bg-tertiary text-text-normal text-sm"
        />
        <button
          onClick={copyToClipboard}
          disabled={loading}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </Modal>
  );
}
