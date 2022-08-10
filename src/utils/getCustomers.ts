import store from "@/store";
import axios from "axios";

export default async function getCustomers(): Promise<any> {
  const res = await axios.get("/user/allUsers");
  store.commit("setCustomersList", res.data.data);
}