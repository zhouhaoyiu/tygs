type elOption = {
  value: string | null;
  label: string;
};

type elOptionArray = elOption[];

type ObjectType = {
  [key: string]: string;
};

type objectArray = ObjectType[];

type repairInfoArray = {
  text: string;
  repairTime: string;
  remarks: string;
  time: string;
}[];

export { elOption, elOptionArray, ObjectType, objectArray, repairInfoArray };
