export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'info';
}