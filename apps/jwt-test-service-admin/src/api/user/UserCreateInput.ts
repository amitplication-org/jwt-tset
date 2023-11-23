import { InputJsonValue } from "../../types";

export type UserCreateInput = {
  firstName?: string | null;
  lastName?: string | null;
  roles: InputJsonValue;
  username?: string | null;
  password?: string | null;
};
