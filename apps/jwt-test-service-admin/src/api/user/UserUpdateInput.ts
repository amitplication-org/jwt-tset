import { InputJsonValue } from "../../types";

export type UserUpdateInput = {
  firstName?: string | null;
  lastName?: string | null;
  roles?: InputJsonValue;
  username?: string | null;
  password?: string | null;
};
