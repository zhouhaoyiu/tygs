type elOption = {
  value: string | null;
  label: string;
};

type elOptionArray = elOption[];

type objectArray = {
  [key: string]: string;
}[];

type repairInfoArray = {
  text: string;
  repairTime: string;
  remarks: string;
  time: string;
}[];

export { elOption, elOptionArray, objectArray, repairInfoArray };
