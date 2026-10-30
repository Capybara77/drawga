export const getHistoryHotkey = (event: KeyboardEvent): "undo" | "redo" | undefined => {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === "KeyZ") {
    return "redo";
  } else if ((event.ctrlKey || event.metaKey) && event.code === "KeyZ") {
    return "undo";
  } else if (event.ctrlKey && event.code === "KeyY") {
    return "redo";
  }

  return;
};

export const isTyping = (event: KeyboardEvent): boolean => {
  const el = event.target;

  if (el instanceof HTMLInputElement && el.type !== "range") {
    return true;
  } else if (el instanceof HTMLTextAreaElement) {
    return true;
  }

  return false;
};
