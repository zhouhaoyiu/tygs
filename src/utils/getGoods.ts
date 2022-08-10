import store from "@/store";
import axios from "axios";

export default async function getGoods(): Promise<any> {
  const res = await axios.get("/goods/getAllGoods");
  store.commit("setGoodsList", res.data.data);
}
