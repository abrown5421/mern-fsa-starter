export interface ModalProps {
  open: boolean;
  modalContent: string;
  title?: string;
  message?: string;
  confirmAction?: () => void;
  cancelAction?: () => void;
  confirmText?: string;
  cancelText?: string;
}
