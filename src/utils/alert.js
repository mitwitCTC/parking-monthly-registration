import Swal from "sweetalert2";

/** 主題色（與 :root --color-main 一致） */
const THEME = {
  main: "#0d5c63",
  mainLight: "#0e6b73",
};

/** 共用 SweetAlert（套上專案主題色） */
const themed = Swal.mixin({
  confirmButtonColor: THEME.main,
  cancelButtonColor: "#888",
  buttonsStyling: true,
  customClass: {
    popup: "app-swal__popup",
    title: "app-swal__title",
    confirmButton: "app-swal__btn",
  },
});

export function alertError(message, title = "發生錯誤") {
  return themed.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonText: "確定",
  });
}

export function alertWarning(message, title = "提醒") {
  return themed.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonText: "確定",
  });
}

export function alertSuccess(message, title = "成功") {
  return themed.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonText: "確定",
  });
}
