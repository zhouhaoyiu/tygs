import { adminInfoType } from "@/types/type";

export const setAdminInfo = function (state: any, info: adminInfoType): void {
  state.adminInfo = info;
};

export const setInfo = function (state: any, info: any): void {
  console.log(123);
  state.info = info;
}

