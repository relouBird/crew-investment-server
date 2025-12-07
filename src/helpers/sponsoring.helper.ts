import { User } from "@supabase/supabase-js";
import {
  SponsoringInterfaceModel,
  SponsoringReturnedInterfaceModel,
} from "../types/sponsoring.type";

export const filterSponsoringData = (
  sponsoringList: SponsoringInterfaceModel[],
  usersList: User[]
): SponsoringReturnedInterfaceModel[] => {
  let returnedList: SponsoringReturnedInterfaceModel[] = [];
  sponsoringList.forEach((sponsoring) => {
    const gettedUser = usersList.find((u) => u.id == sponsoring.sponsored_id);
    const name =
      gettedUser?.user_metadata.firstName +
      " " +
      gettedUser?.user_metadata.lastName;
    const initials = name
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase();
    returnedList.push({
      id: sponsoring.id,
      sponsor_id: sponsoring.sponsor_id,
      initials,
      name,
      email: gettedUser?.email ?? "",
      firstDeposit: sponsoring.firstDeposit,
    });
  });
  return returnedList;
};
