import toast from "react-hot-toast";

export const showToast = {
  success: (message) => toast.success(message, { id: "success" }),
  error: (message) => toast.error(message, { id: "error" }),
};
