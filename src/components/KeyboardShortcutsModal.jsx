const KeyboardShortcutsModal = ({ open, onClose }) => {
  if (!open) return null;

  const items = [
    { key: "/", action: "Focus search bar" },
    { key: "Escape", action: "Close modal / clear search" },
    { key: "G then H", action: "Go to Home" },
    { key: "G then E", action: "Go to Events" },
    { key: "G then S", action: "Go to Saved" },
    { key: "← / →", action: "Navigate pagination" },
  ];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-[rgba(255,45,120,0.45)] bg-[#1A0025] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-xl font-bold text-white">
          Keyboard Shortcuts
        </h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg bg-[#12001E] px-4 py-2"
            >
              <span className="text-[#E0AEFF]">{item.action}</span>
              <kbd className="rounded border border-[rgba(255,45,120,0.35)] px-2 py-1 text-sm text-[#FF6EB4]">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
