
import Swal from "sweetalert2";

const sweetAlert = {
  success: (title, text) => {
    return Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonText: "OK",
      confirmButtonColor: "#4f46e5",
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        confirmButton: "custom-swal-button"
      }
    });
  },

  error: (title, text) => {
    return Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonText: "Try Again",
      confirmButtonColor: "#dc2626",
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        confirmButton: "custom-swal-button"
      }
    });
  },

  warning: (title, text) => {
    return Swal.fire({
      icon: "warning",
      title,
      text,
      confirmButtonText: "OK",
      confirmButtonColor: "#f59e0b",
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        confirmButton: "custom-swal-button"
      }
    });
  },

  confirm: (title, text) => {
    return Swal.fire({
      icon: "question",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Yes, Continue",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        confirmButton: "custom-swal-button",
        cancelButton: "custom-swal-button"
      }
    });
  },

  delete: (title, text) => {
    return Swal.fire({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        confirmButton: "custom-swal-button",
        cancelButton: "custom-swal-button"
      }
    });
  }
};

export default sweetAlert;
