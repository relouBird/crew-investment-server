import { SupabaseClient } from "@supabase/supabase-js";
import SupabaseConfig from "../config/database.config";
import { ErrorHandler } from "../types/database.type";

export class Fetch {
  protected name: string = "";
  protected supabase: SupabaseClient;

  constructor(table_name: string) {
    this.supabase = SupabaseConfig;
    this.name = table_name;
  }

  async GetAll(errorHandler?: ErrorHandler): Promise<null | any[]> {
    const { data, error } = await this.supabase.from(this.name).select();

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data;
  }

  async GetAllByParameter(
    parameter: string,
    value: string,
    errorHandler?: ErrorHandler
  ): Promise<null | any[]> {
    const { data, error } = await this.supabase
      .from(this.name)
      .select()
      .eq(parameter, value);

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data;
  }

  async GetManyByParameter(
    parameter: string,
    value: string[],
    errorHandler?: ErrorHandler
  ): Promise<null | any[]> {
    const { data, error } = await this.supabase
      .from(this.name)
      .select()
      .in(parameter, value);

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data;
  }

  async GetById(id: string, errorHandler?: ErrorHandler): Promise<null | any> {
    const { data, error } = await this.supabase
      .from(this.name)
      .select()
      .eq("id", id)
      .single();

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data;
  }

  async GetByUid(id: string, errorHandler?: ErrorHandler): Promise<null | any> {
    const { data, error } = await this.supabase
      .from(this.name)
      .select()
      .eq("uid", id)
      .single();

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data;
  }
}
