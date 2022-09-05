type elOption = {
  value: string | null;
  label: string;
};

type elOptionArray = elOption[];

type objectArray = {
  [key: string]: string;
}[];

export { elOption, elOptionArray, objectArray };
