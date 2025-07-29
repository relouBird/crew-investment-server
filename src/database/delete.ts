import { SupabaseClient } from "@supabase/supabase-js";
import SupabaseConfig from "../config/database.config";
import { ErrorHandler } from "../types/database.type";

export class Delete {
  protected name: string = "";
  protected supabase: SupabaseClient;

  constructor(table_name: string) {
    this.supabase = SupabaseConfig;
    this.name = table_name;
  }

  async DeleteByParameter(
    parameter: string,
    value: string,
    errorHandler?: ErrorHandler
  ): Promise<null | any[]> {
    const { data, error } = await this.supabase
      .from(this.name)
      .delete()
      .eq(parameter, value)
      .select();

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data;
  }

  async DeleteByUid(uid: string, errorHandler?: ErrorHandler) {
    const { data, error } = await this.supabase
      .from(this.name)
      .delete()
      .eq("uid", uid)
      .select();

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data[0];
  }

  async DeleteById(
    id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | any> {
    const { data, error } = await this.supabase
      .from(this.name)
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data[0];
  }
}
