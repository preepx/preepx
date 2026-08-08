import { createElement } from "react";
import { toast } from "react-toastify";
import PremiumNotification from "../components/PremiumNotification";

const BASE_OPTS = {
  className: "px-notify-wrap",
  icon: false,
  closeButton: false,
  hideProgressBar: true,
  autoClose: 2800,
};

function show(message, type) {
  toast.dismiss();
  toast(
    ({ closeToast }) =>
      createElement(PremiumNotification, { message, type, closeToast }),
    { ...BASE_OPTS, type }
  );
}

export const notify = {
  success: (msg) => show(msg, "success"),
  error: (msg) => show(msg, "error"),
  warning: (msg) => show(msg, "warning"),
  info: (msg) => show(msg, "info"),
  dismiss: () => toast.dismiss(),
};

export default notify;
