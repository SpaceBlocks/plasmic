import { ApiUser } from "@/wab/shared/ApiSchema";
import { SharedApi } from "@/wab/shared/SharedApi";
import { APIRequestContext } from "playwright";

export class ApiTester extends SharedApi {
  constructor(
    private readonly api: APIRequestContext,
    private readonly baseURL: string,
    private readonly extraHeaders: { [name: string]: string } = {}
  ) {
    super();
  }

  protected setUser(_user: ApiUser): void {}
  protected clearUser(): void {}
  protected async req(
    method: "get" | "post" | "put" | "delete" | "patch",
    url: string,
    data?: {} | undefined,
    opts?: { headers: { [name: string]: string } },
    _hideDataOnError?: boolean | undefined,
    _noErrorTransform?: boolean | undefined
  ): Promise<any> {
    const headers = { ...opts?.headers, ...this.extraHeaders };
    console.info("HTTP request", method, url, headers, data);
    const res = await this.api.fetch(`${this.baseURL}${url}`, {
      method,
      headers,
      data,
    });
    try {
      const json = await res.json();
      console.info("HTTP response", method, url, res.status(), json);
      return json;
    } catch {
      // TODO: make a common HTTP error shared across the codebase
      const text = await res.text();
      console.info("HTTP response", method, url, res.status(), text);
      throw new Error(`${res.status()}: ${text}`);
    }
  }
}
