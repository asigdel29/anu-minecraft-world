import { create } from "zustand";

export const useModalStore = create((set) => ({
  isModalOpen: false,
  modalTitle: "",
  modalContent: null,
  modalType: "",

  openModal: (title, content, type) =>
    set({
      isModalOpen: true,
      modalTitle: title,
      modalContent: content,
      modalType: type,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      modalTitle: "",
      modalContent: null,
      modalType: "",
    }),
}));
