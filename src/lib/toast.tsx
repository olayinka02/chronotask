'use client';
import { toast, ToastOptions } from 'react-toastify';

const defaults: ToastOptions = {
  position: 'bottom-right',
  autoClose: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showToast = {
  success: (msg: string, o?: ToastOptions) => toast.success(msg, { ...defaults, ...o }),
  error: (msg: string, o?: ToastOptions) => toast.error(msg, { ...defaults, ...o }),
  warning: (msg: string, o?: ToastOptions) => toast.warning(msg, { ...defaults, ...o }),
  info: (msg: string, o?: ToastOptions) => toast.info(msg, { ...defaults, ...o }),
  undo: (msg: string, onUndo: () => void) =>
    toast.info(
      <div className="flex items-center justify-between gap-4">
        <span>{msg}</span>
        <button
          onClick={() => {
            onUndo();
            toast.dismiss();
          }}
          className="px-3 py-1 bg-primary-600 hover:bg-primary-700 rounded text-sm font-medium transition-colors text-white"
        >
          Undo
        </button>
      </div>,
      { ...defaults, autoClose: 5000 }
    ),
  dismiss: (id?: string | number) => (id ? toast.dismiss(id) : toast.dismiss()),
};
