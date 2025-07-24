import { UserModel } from "../models/user.model";
import { Request, Response } from "express";
import { UserRegisterCredentials } from "../types/user.type";
import { generateOTP } from "../helpers/utils.helper";
import { OTPModel } from "../models/otp.model";
import { UserVerificationCredentials } from "../types";

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
  const data = req.body as UserRegisterCredentials;
  let isError = false;
  let errorMessage = "";

  console.log(`user-to-create =>`, data);

  await user.create(data, (error) => {
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
      { email: data.email, otp: otp },
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

  const dataUser = await user.getByEmail(data.email, (error) => {
    console.log(
      "user-get-error =>",
      error?.message,
      " on email : ",
      data.email
    );
    errorMessage = error?.message ?? "";
    isError = true;
  });

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

    setTimeout(async () => {
      res.status(201).json({
        message: "Compte créé. Vérifiez votre email pour entrer le code OTP.",
        data: data,
        verify: datas?.state == "register",
      });
    }, 1000);
  } else if (!isError && !dataUser) {
    setTimeout(async () => {
      res.status(500).json({
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
    res.status(500).json({
      message: "Erreur lors de la connexion de l'utilisateur...",
      details: errorMessage,
    });
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
