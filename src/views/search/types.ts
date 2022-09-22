type elOption = {
  value: string | null;
  label: string;
};

type elOptionArray = elOption[];

type objectType = {
  [key: string]: string;
};

type anyObject = {
  [key: string]: any;
};

type objectArray = objectType[];

type repairInfoArray = {
  text: string;
  repairTime: string;
  remarks: string;
  time: string;
}[];

export { elOption, anyObject, elOptionArray, objectType, objectArray, repairInfoArray };
