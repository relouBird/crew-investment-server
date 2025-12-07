import { transporter, gmail_transporter } from "../config/email.config";
import { Create } from "../database/create";
import { Fetch } from "../database/fetch";
import { GenerateEmail } from "../helpers/utils.helper";
import { OtpType, OtpFormType, UserVerificationCredentials } from "../types";
import { ErrorHandler } from "../types/database.type";

export class OTPModel {
  protected name: string = "email_otps";
  protected fetch: Fetch;
  protected createClass: Create;

  constructor() {
    this.fetch = new Fetch(this.name);
    this.createClass = new Create(this.name);
  }

  async getAll(errorHandler?: ErrorHandler): Promise<null | any[]> {
    let isError: boolean = false;
    const data = await this.fetch.GetAll((error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    });

    if (isError) {
      return null;
    }
    return data;
  }

  async create(
    otpForm: OtpFormType,
    errorHandler?: ErrorHandler
  ): Promise<OtpType | null> {
    let isError: boolean = false;
    const data = (await this.createClass.upsert(otpForm, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as OtpType;

    if (isError) {
      return null;
    }
    return data;
  }

  async update(
    otpForm: Partial<OtpFormType>,
    errorHandler?: ErrorHandler
  ): Promise<OtpType | null> {
    let isError: boolean = false;
    const data = (await this.createClass.upsert(otpForm, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as OtpType;

    if (isError) {
      return null;
    }
    return data;
  }

  async verify(
    payload: UserVerificationCredentials,
    errorHandler?: ErrorHandler
  ): Promise<boolean> {
    let isError: boolean = false;
    const data = (await this.fetch.GetAllByParameter(
      "email",
      payload.email,
      (error) => {
        errorHandler && errorHandler(error);
        isError = true;
        console.log(`${this.name}-error => ${error}`);
      }
    )) as OtpType[];

    if (isError) {
      return false;
    }
    const otp = data[0].otp;
    if (otp !== payload.otp) {
      return false;
    }

    return true;
  }

  async sendOTPViaMail(otp: string, email: string, reset?: boolean) {
    try {
      // // Envoyer l’email OTP EN DEVVVVV
      // await transporter.sendMail({
      //  from: "noreply@investia.com",
      //  to: email,
      //  subject: "Code de vérification",
      //  html: GenerateEmail(otp, reset ?? false),
      // });

      // Envoyer l’email OTP EN DEVVVVV
      const data = await gmail_transporter.sendMail({
        from: "noreply@investia.com",
        to: email,
        subject: "Code de vérification",
        html: GenerateEmail(otp, reset ?? false, true),
      });

      // // Envoyer l’email OTP EN PRODDDDDDD
      // const data = await resend.emails.send({
      //   from: "onboarding@resend.dev", // ou ton domaine validé ?? investia.org.com
      //   to: [email],
      //   subject: "Code de vérification",
      //   html: GenerateEmail(otp, reset ?? false, true),
      // });
      // console.log("Email envoyé:", data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  async getById(
    id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | OtpType> {
    let isError: boolean = false;
    const data = (await this.fetch.GetById(id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as OtpType;

    if (isError) {
      return null;
    }
    return data;
  }

  async getByEmail(email: string, errorHandler: ErrorHandler) {
    let isError: boolean = false;
    const data = (await this.fetch.GetAllByParameter(
      "email",
      email,
      (error) => {
        errorHandler && errorHandler(error);
        isError = true;
        console.log(`${this.name}-error => ${error}`);
      }
    )) as OtpType[];

    if (isError) {
      return null;
    }

    return data[0];
  }
}
