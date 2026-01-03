import { Request, Response } from "express";
import { SponsoringModel } from "../models/sponsoring.model";
import { User } from "@supabase/supabase-js";
import { USER_TYPE } from "../types/user.type";
import { SponsoringInterfaceModel } from "../types/sponsoring.type";
import { UserModel } from "../models/user.model";
import { filterSponsoringData } from "../helpers/sponsoring.helper";

// fonction qui est appelé afin de recuperer tous les paris des utilisateurs...
export const all = async (req: Request, res: Response) => {
  const sponsoringModel = new SponsoringModel();
  const userModel = new UserModel();
  const user = (req as any).user as User;
  let data: SponsoringInterfaceModel[] = [];
  let usersData: User[] = [];
  let sponsor_List: string[] = [];
  let isError = false;
  let errorMessage = "";

  // Quand il est admin... on load tout. Contrairement à quand c'est un simple user
  if (user.user_metadata.type == USER_TYPE.ADMIN) {
    data = (await sponsoringModel.getAll((error) => {
      isError = true;
      console.log("sponsoring-getting-error =>", error?.message);
      errorMessage = error?.message ?? "";
    })) as SponsoringInterfaceModel[];
  } else {
    data = (await sponsoringModel.getBySponsorId(user.id, (error) => {
      isError = true;
      console.log("sponsoring-getting-error =>", error?.message);
      errorMessage = error?.message ?? "";
    })) as SponsoringInterfaceModel[];
  }

  // On filtre la liste de tout ceux sponsorisé...
  sponsor_List = !isError
    ? [...new Set(data.map((sponsor) => sponsor.sponsored_id))]
    : [];

  // On recupere la liste de tout les sponsorisés
  if (sponsor_List.length) {
    usersData = (await userModel.getAllByList(sponsor_List)) as User[];
  }

  if (!isError && data) {
    // setTimeout(async () => {
    //   res.status(200).json({
    //     message: "Sponsoring Checked...",
    //     data: filterSponsoringData(data, usersData),
    //   });
    // }, 1000);
    res.status(200).json({
      message: "Sponsoring Checked...",
      data: filterSponsoringData(data, usersData),
    });
  } else {
    // setTimeout(async () => {
    //   res.status(404).json({
    //     message: "No Bets To Check Found...",
    //     details: errorMessage,
    //   });
    // }, 1000);
    res.status(404).json({
      message: "No Bets To Check Found...",
      details: errorMessage,
    });
  }
};

// fonction qui est appelé afin de creer un pari...
export const create = async (req: Request, res: Response) => {
  const sponsoringModel = new SponsoringModel();
  const reqBody = req.body as SponsoringInterfaceModel; // Ce type...
  let isError = false;
  let errorMessage = "";

  const data = await sponsoringModel.create(reqBody, (error) => {
    isError = true;
    console.log("sponsoring-create-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  if (!isError && data) {
    // setTimeout(async () => {
    //   res.status(200).json({
    //     message: "Sponsoring Data Created...",
    //     data,
    //   });
    // }, 2000);
    res.status(200).json({
      message: "Sponsoring Data Created...",
      data,
    });
  } else {
    // setTimeout(async () => {
    //   res.status(404).json({
    //     message: "Something where wrong when creating sponsor-data...",
    //     details: errorMessage,
    //   });
    // }, 1000);
    res.status(404).json({
      message: "Something where wrong when creating sponsor-data...",
      details: errorMessage,
    });
  }
};

// fonction qui est appelé afin de recuperer un pari...
export const get = async (req: Request, res: Response) => {
  const sponsoringModel = new SponsoringModel();
  const userModel = new UserModel();
  let isError = false;
  const sponsoring_id = req.params.id ?? ""; // Ce type...
  let errorMessage = "";

  console.log("sponsoring-id ===>", sponsoring_id);

  const data = await sponsoringModel.getById(sponsoring_id, (error) => {
    isError = true;
    console.log("sponsoring-getting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  const user =
    data &&
    (await userModel.getById(String(data.sponsored_id), (error) => {
      isError = true;
      console.log("matches-getting-error =>", error?.message);
      errorMessage = error?.message ?? "";
    }));

  if (!isError && data && user) {
    // setTimeout(async () => {
    //   res.status(200).json({
    //     message: "Bets getted successfully...",
    //     data: {
    //       ...data,
    //       user,
    //     },
    //   });
    // }, 2000);
    res.status(200).json({
      message: "Bets getted successfully...",
      data: {
        ...data,
        user,
      },
    });
  } else {
    // setTimeout(async () => {
    //   res.status(404).json({
    //     message: "Error when deleting bet...",
    //     details: errorMessage,
    //   });
    // }, 1000);
    res.status(404).json({
      message: "Error when deleting bet...",
      details: errorMessage,
    });
  }
};

// fonction qui est appelé afin de supprimer un pari...
export const DeleteSponsoring = async (req: Request, res: Response) => {
  const sponsoringModel = new SponsoringModel();
  let isError = false;
  const sponsor_id = req.params.id ?? ""; // Ce type...
  let errorMessage = "";

  console.log("sponsoring-id ===>", sponsor_id);

  const data = await sponsoringModel.delete(sponsor_id, (error) => {
    isError = true;
    console.log("bets-deleting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  if (!isError && data) {
    // setTimeout(async () => {
    //   res.status(200).json({
    //     message: "Sponsoring deleted successfully...",
    //     data,
    //   });
    // }, 2000);
    res.status(200).json({
      message: "Sponsoring deleted successfully...",
      data,
    });
  } else {
    // setTimeout(async () => {
    //   res.status(404).json({
    //     message: "Error when deleting sponsoring...",
    //     details: errorMessage,
    //   });
    // }, 1000);
    res.status(404).json({
      message: "Error when deleting sponsoring...",
      details: errorMessage,
    });
  }
};

// fonction qui est appelé afin de supprimer un pari...
export const update = async (req: Request, res: Response) => {
  const sponsoringModel = new SponsoringModel();
  let isError = false;
  const sponsoring_id = req.params.id ?? ""; // Ce type...
  const reqBody = req.body as SponsoringInterfaceModel; // Ce type...
  let errorMessage = "";

  console.log("sponsoring-id ===>", sponsoring_id);

  const data = await sponsoringModel.update(
    { id: sponsoring_id, ...reqBody },
    (error) => {
      isError = true;
      console.log("bets-deleting-error =>", error?.message);
      errorMessage = error?.message ?? "";
    }
  );

  if (!isError && data) {
    // setTimeout(async () => {
    //   res.status(200).json({
    //     message: "Sponsoring Updated successfully...",
    //     data,
    //   });
    // }, 2000);
    res.status(200).json({
      message: "Sponsoring Updated successfully...",
      data,
    });
  } else {
    // setTimeout(async () => {
    //   res.status(404).json({
    //     message: "Error when updating sponsoring...",
    //     details: errorMessage,
    //   });
    // }, 1000);
    res.status(404).json({
      message: "Error when updating sponsoring...",
      details: errorMessage,
    });
  }
};
