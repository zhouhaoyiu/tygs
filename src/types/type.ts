export type adminInfoType = {
  adminId: number;
  adminRole: number;
  adminUUid: string;
  emailAddress: string;
  phoneNumber: string;
  userName: string;
};

export type adminLog = {
  adminLogid: number;
  adminLogUUid: string;
  adminUUid: string;
  logTime: string;
  info: string;
  remark: string;
};
