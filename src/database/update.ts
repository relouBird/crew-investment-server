import { SupabaseClient } from "@supabase/supabase-js";
import SupabaseConfig from "../config/database.config";
import { ErrorHandler } from "../types/database.type";

export class Update {
  protected name: string = "";
  protected supabase: SupabaseClient;

  constructor(table_name: string) {
    this.supabase = SupabaseConfig;
    this.name = table_name;
  }

  async UpdateByParameter(
    parameter: string,
    value: string,
    dataToUpdate: Object,
    errorHandler?: ErrorHandler
  ): Promise<null | any[]> {
    const { data, error } = await this.supabase
      .from(this.name)
      .update(dataToUpdate)
      .eq(parameter, value)
      .select()
      .single();

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data;
  }

  async UpdateById(
    id: string,
    dataToUpdate: Object,
    errorHandler?: ErrorHandler
  ): Promise<null | any> {
    const { data, error } = await this.supabase
      .from(this.name)
      .update(dataToUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data;
  }

  async UpdateByUid(
    id: string,
    dataToUpdate: Object,
    errorHandler?: ErrorHandler
  ): Promise<null | any> {
    const { data, error } = await this.supabase
      .from(this.name)
      .update(dataToUpdate)
      .eq("uid", id)
      .select()
      .single();

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data;
  }
}
