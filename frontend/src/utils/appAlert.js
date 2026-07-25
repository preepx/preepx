let alertHandler = null;

export function setAlertHandler(handler) {
  alertHandler = handler;
}

export function showAppError(message, title = "Oops! Something went wrong", action = null) {
  alertHandler?.({ type: "error", title, message, action });
}

export function showAppSuccess(message, title = "Success") {
  alertHandler?.({ type: "success", title, message });
}

export function showAppInfo(message, title = "Notice") {
  alertHandler?.({ type: "info", title, message });
}
