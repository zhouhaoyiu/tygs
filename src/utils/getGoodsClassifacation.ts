import axios from "axios";
import store from "@/store";
/***
 * 获取商品分类
 *
 * @author zhouhaoyu
 * @date 2022-03
 * @@returns {Array<object>} 商品分类
 *
 */
export default async function getGoodsClassification(): Promise<any> {
  const goodsClassificationTree: any = [];
  const goodsClassificationTreeMap: any = {};
  const res = await axios.get("/goodsClassification/getAllClassfication");

  res.data.data.forEach((item: any) => {
    goodsClassificationTreeMap[
      item.classificationId as keyof typeof goodsClassificationTreeMap
    ] = item;
  });
  res.data.data.forEach((item: any) => {
    const parent =
      goodsClassificationTreeMap[
        item.parentId as keyof typeof goodsClassificationTreeMap
      ];
    if (parent) {
      (parent.children || (parent.children = [])).push(item);
    } else {
      goodsClassificationTree.push(item);
    }
  });
  store.commit("setGoodsClassificationList", res.data.data);
  store.commit("setGoodsClassificationTree", goodsClassificationTree);
}
