import { getAdminInfo } from "./../store/getters";
import store from "@/store";
import axios from "axios";
import dayjs from "dayjs";

export async function addAdminLog(info: string, remark?: string): Promise<any> {
  const result = await axios.post("/adminLog/addAdminLog", {
    adminUUid: store.getters.getAdminInfo.adminUUid,
    logTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    info: info,
    remark: remark ?? "",
  });
  return result;
}
