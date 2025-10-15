import { toast as sonnerToast, ExternalToast } from "sonner";

/**
 * Configuration améliorée des toasts avec animations et icônes
 */

const defaultOptions: ExternalToast = {
  duration: 4000,
  className: "animate-slide-in-bottom",
};

export const toast = {
  success: (message: string, options?: ExternalToast) => {
    return sonnerToast.success(message, {
      ...defaultOptions,
      ...options,
      className: "animate-bounce-success",
      icon: "✅",
    });
  },

  error: (message: string, options?: ExternalToast) => {
    return sonnerToast.error(message, {
      ...defaultOptions,
      duration: 6000, // Erreurs restent plus longtemps
      ...options,
      className: "animate-shake",
      icon: "❌",
    });
  },

  loading: (message: string, options?: ExternalToast) => {
    return sonnerToast.loading(message, {
      ...defaultOptions,
      ...options,
      icon: "⏳",
    });
  },

  info: (message: string, options?: ExternalToast) => {
    return sonnerToast.info(message, {
      ...defaultOptions,
      ...options,
      icon: "ℹ️",
    });
  },

  warning: (message: string, options?: ExternalToast) => {
    return sonnerToast.warning(message, {
      ...defaultOptions,
      ...options,
      icon: "⚠️",
    });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...defaultOptions,
    });
  },
};
