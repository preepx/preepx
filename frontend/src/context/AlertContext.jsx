import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import StatusModal from "@/components/StatusModal";
import { setAlertHandler } from "@/utils/appAlert";

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);

  const closeAlert = useCallback(() => setAlert(null), []);

  const showAlert = useCallback(({ type = "error", title, message, action }) => {
    setAlert({ type, title, message, action });
  }, []);

  useEffect(() => {
    setAlertHandler(showAlert);
    return () => setAlertHandler(null);
  }, [showAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
      <StatusModal
        open={!!alert}
        type={alert?.type}
        title={alert?.title}
        message={alert?.message}
        action={alert?.action}
        onClose={closeAlert}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within AlertProvider");
  return ctx;
}
