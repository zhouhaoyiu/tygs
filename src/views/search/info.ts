import { elOption, elOptionArray } from "./types";

const calibers: elOptionArray = [
  {
    value: "DN15",
    label: "DN15",
  },
  {
    value: "DN20",
    label: "DN20",
  },
  {
    value: "DN25",
    label: "DN25",
  },
  {
    value: "DN40",
    label: "DN40",
  },
  {
    value: "DN50",
    label: "DN50",
  },
  {
    value: "DN80",
    label: "DN80",
  },
  {
    value: "DN100",
    label: "DN100",
  },
  {
    value: "DN150",
    label: "DN150",
  },
  {
    value: "DN200",
    label: "DN200",
  },
  {
    value: "DN300",
    label: "DN300",
  },
  {
    value: "DN400",
    label: "DN400",
  },
  {
    value: "DN800",
    label: "DN800",
  },
  {
    value: "DN900",
    label: "DN900",
  }
];

const wellChamberTypes: elOptionArray = [
  {
    value: "主线阀门",
    label: "主线阀门",
  },
  {
    value: "用户阀门",
    label: "用户阀门",
  },
  {
    value: "排气",
    label: "排气",
  },
  {
    value: "泄水",
    label: "泄水",
  },
  {
    value: "甩头",
    label: "甩头",
  },
  {
    value: "空头",
    label: "空头",
  },
  {
    value: "连接",
    label: "连接",
  },
];
export { calibers, wellChamberTypes };
