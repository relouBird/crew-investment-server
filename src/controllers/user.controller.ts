import { UserModel } from "../models/user.model";
import { Request, Response } from "express";
import {
  changeUserPasswordType,
  UserRegisterCredentials,
} from "../types/user.type";
import { generateOTP } from "../helpers/utils.helper";
import { OTPModel } from "../models/otp.model";
import { UserVerificationCredentials } from "../types";
import { User, UserMetadata } from "@supabase/supabase-js";
import { WalletModel } from "../models/wallet.model";

// fonction qui est appelé lors de la requete et permettant de recuperer tout les users
export const getAllUsers = async (req: Request, res: Response) => {
  const user = new UserModel();
  let response: boolean = false;

  const data = await user.getAll((error) => {
    res.status(500).send({
      message: "Erreur lors de la récupération des Users",
      error: error?.message,
    });
    response = true;
  });

  if (!response) {
    res.status(200).json(data);
  }
};

// fonction qui est appelé lors de la requete et permettant de creer un nouvel utilisateur
export const createUser = async (req: Request, res: Response) => {
  const user = new UserModel();
  const otp_class = new OTPModel();
  const wallet_model = new WalletModel();
  const data = req.body as UserRegisterCredentials;
  let isError = false;
  let errorMessage = "";

  console.log(`user-to-create =>`, data);

  const userCreated = await user.create(data, (error) => {
    isError = true;
    console.log(
      "user-register-error =>",
      error?.message,
      " on email :",
      data.email
    );
    errorMessage = error?.message ?? "";
  });

  if (!isError) {
    const otp = generateOTP();

    // Cree un OTP...
    const datas = await otp_class.create(
      { email: data.email, otp: otp, state: "register" },
      (error) => {
        console.log(
          "otp-create-error =>",
          error?.message,
          " on email : ",
          data.email
        );
        errorMessage = error?.message ?? "";
        isError = true;
      }
    );

    const wallet_datas = await wallet_model.create(
      { uid: userCreated?.user.id },
      (error) => {
        isError = true;
        console.log(
          "wallet-create-error =>",
          error?.message,
          " on email :",
          userCreated?.user.email
        );
        errorMessage = error?.message ?? "";
      }
    );

    // Envoyer l'otp via Email...
    await otp_class.sendOTPViaMail(otp, data.email);

    setTimeout(async () => {
      res.status(201).json({
        message: "Compte créé. Vérifiez votre email pour entrer le code OTP.",
        data: data,
        verify: datas?.state == "register",
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(500).json({
        message: "Erreur lors de la creation...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui est appelé lors de la requete et permettant de creer un nouvel utilisateur
export const createParrainedUser = async (req: Request, res: Response) => {
  const user = new UserModel();
  const otp_class = new OTPModel();
  const wallet_model = new WalletModel();
  const data = req.body as UserRegisterCredentials;
  let isError = false;
  let errorMessage = "";

  console.log(`user-to-create =>`, data);

  const userCreated = await user.create(data, (error) => {
    isError = true;
    console.log(
      "user-register-error =>",
      error?.message,
      " on email :",
      data.email
    );
    errorMessage = error?.message ?? "";
  });

  if (!isError) {
    const otp = generateOTP();

    // Cree un OTP...
    const datas = await otp_class.create(
      { email: data.email, otp: otp, state: "register" },
      (error) => {
        console.log(
          "otp-create-error =>",
          error?.message,
          " on email : ",
          data.email
        );
        errorMessage = error?.message ?? "";
        isError = true;
      }
    );

    const wallet_datas = await wallet_model.create(
      { uid: userCreated?.user.id },
      (error) => {
        isError = true;
        console.log(
          "wallet-create-error =>",
          error?.message,
          " on email :",
          userCreated?.user.email
        );
        errorMessage = error?.message ?? "";
      }
    );

    // Envoyer l'otp via Email...
    await otp_class.sendOTPViaMail(otp, data.email);

    setTimeout(async () => {
      res.status(201).json({
        message: "Compte créé. Vérifiez votre email pour entrer le code OTP.",
        data: data,
        verify: datas?.state == "register",
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(500).json({
        message: "Erreur lors de la creation...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui est appelé lors de la requete et permettant de creer un nouvel utilisateur
export const changePassword = async (req: Request, res: Response) => {
  const user = new UserModel();
  const otp_class = new OTPModel();
  const data = req.body as UserRegisterCredentials;
  let isError = false;
  let errorMessage = "";

  console.log(`user-to-change-password =>`, data);

  const dataUser = await user.changePassword(data, (error) => {
    isError = true;
    console.log(
      "user-register-error =>",
      error?.message,
      " on email :",
      data.email
    );
    errorMessage = error?.message ?? "";
  });

  if (!isError && dataUser) {
    const userData = await user.signIn(
      { email: data.email, password: data.password },
      (error) => {
        console.log(
          "user-signin-error =>",
          error?.message,
          "on email :",
          data.email
        );
        errorMessage = error?.message ?? "";
        isError = true;
      }
    );

    setTimeout(async () => {
      res.status(201).json({
        message: "Compte modifié.",
        data: userData,
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(500).json({
        message: "Erreur lors de la creation...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui permet de verifier un OTP... lors de la creation de compte
export const verifyOTPUser = async (req: Request, res: Response) => {
  const otp_class = new OTPModel();
  const user = new UserModel();
  const data = req.body as UserVerificationCredentials;
  let isError = false;
  let errorMessage = "";

  console.log(`user-to-verify =>`, data);

  const datas = await otp_class.verify(data, (error) => {
    console.log(
      "otp-verify-error =>",
      error?.message,
      " on email : ",
      data.email
    );
    isError = true;
    errorMessage = error?.message ?? "";
  });

  if (!isError && datas) {
    const userData = await user.signIn(
      { email: data.email, password: data.password },
      (error) => {
        console.log(
          "user-signin-error =>",
          error?.message,
          "on email :",
          data.email
        );
        errorMessage = error?.message ?? "";
        isError = true;
      }
    );

    // Cree un OTP...
    const datas = await otp_class.update(
      { email: data.email, state: "login", otp: "1" },
      (error) => {
        console.log(
          "otp-update-error =>",
          error?.message,
          " on email : ",
          data.email
        );
        errorMessage = error?.message ?? "";
        isError = true;
      }
    );
    setTimeout(async () => {
      res.status(200).json({
        message: "Compte Verifié. Bienvenue sur InvestIA.",
        data: userData,
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(500).json({
        message: "Erreur lors de la Verification...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui permet de verifier un OTP... lors du reset du Mot de Passe
export const resetPassword = async (req: Request, res: Response) => {
  const otp_class = new OTPModel();
  const user = new UserModel();
  const data = req.body as UserVerificationCredentials;
  let isError = false;
  let errorMessage = "";

  console.log(`user-to-reset =>`, data);

  const datas = await otp_class.verify(data, (error) => {
    console.log(
      "otp-verify-error =>",
      error?.message,
      " on email : ",
      data.email
    );
    isError = true;
    errorMessage = error?.message ?? "";
  });

  if (!isError && datas) {
    // Cree un OTP...
    const datas = await otp_class.update(
      { email: data.email, state: "login", otp: "1" },
      (error) => {
        console.log(
          "otp-update-error =>",
          error?.message,
          " on email : ",
          data.email
        );
        errorMessage = error?.message ?? "";
        isError = true;
      }
    );
    setTimeout(async () => {
      res.status(200).json({
        message: "Compte Verifié. changer votre mot de passe sur InvestIA.",
        data: true,
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(500).json({
        message: "Erreur lors de la Verification...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui permet de renvoyer un autre OTP
export const sendOTP = async (req: Request, res: Response) => {
  const otp_class = new OTPModel();
  const user = new UserModel();
  const data = req.body as UserRegisterCredentials;
  let isError = false;
  let errorMessage = "";

  console.log("otp-reset-password =>", data);
  let dataUser: User | null = null;
  if (data) {
    dataUser = await user.getByEmail(data.email, (error) => {
      console.log(
        "user-get-error =>",
        error?.message,
        " on email : ",
        data.email
      );
      errorMessage = error?.message ?? "";
      isError = true;
    });
  }

  if (!isError && dataUser) {
    const otp = generateOTP();
    // Cree un OTP...
    const datas = await otp_class.update(
      { email: data.email, otp: otp, state: "reset" },
      (error) => {
        console.log(
          "otp-create-error =>",
          error?.message,
          " on email : ",
          data
        );
        errorMessage = error?.message ?? "";
        isError = true;
      }
    );
    // Envoyer l'otp via Email...
    await otp_class.sendOTPViaMail(otp, data.email, true);
    console.log("Email envoyé avec succès...");

    setTimeout(async () => {
      res.status(201).json({
        message: "Compte créé. Vérifiez votre email pour entrer le code OTP.",
        data: data,
        verify: datas?.state == "register",
      });
    }, 1000);
  } else if (!isError && !dataUser) {
    setTimeout(async () => {
      res.status(404).json({
        message: "Erreur lors de la recuperation de l'user...",
        details: "This user do not exists... Retry",
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(500).json({
        message: "Erreur lors du Renvoie d'OTP...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui permet de renvoyer un autre OTP
export const resendOTP = async (req: Request, res: Response) => {
  const otp_class = new OTPModel();
  const data = req.body as UserRegisterCredentials;
  let isError = false;
  let errorMessage = "";

  console.log("email-to-resend-otp =>", req.body);

  // Renvoyer un autre  OTP...
  const dataOTP = await otp_class.getByEmail(data.email, (error) => {
    console.log("otp-create-error =>", error?.message, " on email : ", data);
    errorMessage = error?.message ?? "";
    isError = true;
  });

  const otp = generateOTP();

  if (!isError) {
    // Renvoyer un autre  OTP...
    const datas = await otp_class.update(
      { email: data.email, otp: otp, state: dataOTP?.state },
      (error) => {
        console.log(
          "otp-create-error =>",
          error?.message,
          " on email : ",
          data
        );
        errorMessage = error?.message ?? "";
        isError = true;
      }
    );

    // Envoyer l'otp via Email...
    await otp_class.sendOTPViaMail(otp, data.email);

    setTimeout(async () => {
      res.status(201).json({
        message: "Compte créé. Vérifiez votre email pour entrer le code OTP.",
        data: data,
        verify: datas?.state == "register",
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(500).json({
        message: "Erreur lors du Renvoie d'OTP...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui permet de connecter un utilisateurs
export const loginUser = async (req: Request, res: Response) => {
  const user = new UserModel();
  const otp_class = new OTPModel();
  const data = req.body as UserRegisterCredentials;
  let isError = false;
  let errorMessage = "";

  const datas = await user.signIn(data, (error) => {
    console.log(
      "user-signin-error =>",
      error?.message,
      "on email :",
      data.email
    );
    errorMessage = error?.message ?? "";
    isError = true;
  });

  if (!isError) {
    // Cree un OTP...
    const datasOTP = await otp_class.getByEmail(data.email, (error) => {
      console.log(
        "otp-get-error =>",
        error?.message,
        " on email : ",
        data.email
      );
      errorMessage = error?.message ?? "";
      isError = true;
    });
    if (datasOTP && datasOTP.state == "register") {
      setTimeout(async () => {
        console.log("user-go-to-verify ==>", data.email);
        res.status(201).json({
          message: "user has Connected but verify...",
          verify: true,
        });
      }, 1000);
    } else {
      setTimeout(async () => {
        console.log("user-signin ==>", data.email);
        res.status(201).json({
          message: "user has Connected...",
          data: datas,
        });
      }, 1000);
    }
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "Erreur lors de la connexion de l'utilisateur...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui permet de recuperer un utilisateur en fonction de son acces token
export const getUserByAccessToken = async (req: Request, res: Response) => {
  const user = new UserModel();
  const data = req.body as UserRegisterCredentials;
  let isError = false;
  let errorMessage = "";

  const datas = await user.signIn(data, (error) => {
    console.log(
      "user-signin-error =>",
      error?.message,
      "on email :",
      data.email
    );
    errorMessage = error?.message ?? "";
    isError = true;
  });

  if (!isError) {
    setTimeout(async () => {
      // res.status(201).json({ message: "user has Connected...", data: datas });
    }, 1000);
  } else {
    res.status(500).json({
      message: "Erreur lors de la connexion de l'utilisateur...",
      details: errorMessage,
    });
  }
};

/*
  Cette partie concerne la partie connecté de l'utilisateur
*/

// fonction qui permet de recuperer l'utilisateur...
export const getUser = async (req: Request, res: Response) => {
  const user = (req as any).user as User;

  if (!user) {
    res.status(500).send({
      message: "Erreur lors de la récupération de l'user...",
      error: "Something Where Wrong...",
    });
  } else {
    res.status(200).json({
      message: "Account Infos getted...",
      email: user.email,
      data: user.user_metadata,
    });
  }
};

// fonction qui permet de mettre à jour les infos des utilisateurs...
export const updateUserInfos = async (req: Request, res: Response) => {
  const model_user = new UserModel();
  const user = (req as any).user as User;
  const reqBody = req.body as UserMetadata;

  console.log("user-data-to-update =>", reqBody);

  if (!user) {
    setTimeout(async () => {
      res.status(404).send({
        message: "Erreur lors de la récupération de l'user...",
        error: "Something Where Wrong...",
      });
    }, 1000);
  } else if (user.email != reqBody.email) {
    setTimeout(async () => {
      res.status(404).send({
        message: "Erreur lors de la modification d'email...",
        error: "Not Now wait for it soon.",
      });
    }, 1000);
  } else {
    let isError: boolean = false;
    let errorMessage: string = "";
    const datas = await model_user.update(reqBody, (error) => {
      console.log("error-update-user =>", error?.message);
      isError = true;
      errorMessage = error?.message ?? "";
    });

    if (!isError && datas) {
      setTimeout(() => {
        res.status(201).json({
          message: "Account Infos getted...",
          email: datas.email,
          data: datas.user_metadata,
        });
      }, 1000);
    } else {
      setTimeout(async () => {
        res.status(404).send({
          message: "Erreur lors de la modification d'email...",
          error: errorMessage,
        });
      }, 1000);
    }
  }
};

// fonction qui permet de changer le mot de passe d'un utilisateur...
export const changeUserPassword = async (req: Request, res: Response) => {
  const model_user = new UserModel();
  const user = (req as any).user as User;
  const reqBody = req.body as changeUserPasswordType;
  // gestion des erreurs
  let isError: boolean = false;
  let errorMessage: string = "";

  // On va d'abord connecter l'utilisateur pour voir s'il a mit le bon mot de passe...
  const datas = await model_user.signIn(
    { email: user.email ?? "", password: reqBody.password },
    (error) => {
      console.log(
        "user-signin-error =>",
        error?.message,
        "on email :",
        user.email
      );
      errorMessage = error?.message ?? "";
      isError = true;
    }
  );

  console.log("password-to-change =>", { email: user.email, ...reqBody });

  if (!user) {
    setTimeout(async () => {
      res.status(404).send({
        message: "Erreur lors de la récupération de l'user...",
        error: "Something Where Wrong...",
      });
    }, 1000);
  } else if (user && isError) {
    setTimeout(async () => {
      res.status(404).send({
        message: "Erreur lors de la récupération de l'user...",
        error: "You didn't enter the correct password",
      });
    }, 1000);
  } else {
    if (reqBody.new_password === reqBody.confirm_new_password) {
      const user_getted = await model_user.changePassword(
        {
          email: user.email ?? "",
          password: reqBody.new_password,
          password_confirmation: "",
        },
        (error) => {
          console.log(
            "user-change-password-error =>",
            error?.message,
            "on email :",
            user.email
          );
          errorMessage = error?.message ?? "";
          isError = true;
        }
      );
      setTimeout(async () => {
        console.log("Password have been changed...");
        res.status(200).json({
          message: "Account Infos change password updated...",
          data: user_getted?.user_metadata,
        });
      }, 2000);
    } else {
      setTimeout(async () => {
        res.status(403).json({
          message: "Not corresponding...",
          error: "Not corresponding.",
        });
      }, 3000);
    }
  }
};

// fonction qui permet de supprimer le compte d'un utilisateur...
export const deleteAccount = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const model_user = new UserModel();

  if (!user) {
    setTimeout(() => {
      res.status(500).send({
        message: "Erreur lors de la récupération de l'user...",
        error: "Something Where Wrong...",
      });
    }, 1000);
  } else {
    let isError: boolean = false;
    let errorMessage = "";
    const datas = await model_user.delete(user.email ?? "", (error) => {
      isError = true;
      errorMessage = error?.message ?? "";
      console.log("delete-user-error =>", error?.message);
    });

    if (!isError && datas) {
      setTimeout(() => {
        res.status(200).json({
          message: "Account Infos getted...",
          email: datas.email,
          data: datas.user_metadata,
        });
      }, 3000);
    } else {
      setTimeout(() => {
        res.status(404).json({
          message: "Error when delete user...",
          error: errorMessage,
        });
      }, 3000);
    }
  }
};
