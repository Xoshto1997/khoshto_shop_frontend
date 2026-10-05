export type ToastMessage =
  | {
      id: number;
      message: string;
      type: 'success' | 'danger' | 'info';
    }
  | {
      id: number;
      message: string;
      type: 'confirmation';
      onConfirm: () => void;
    };