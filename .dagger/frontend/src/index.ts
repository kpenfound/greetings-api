/**
 * A generated module for Frontend functions
 */
import { dag, Directory, object, func, Service } from "@dagger.io/dagger";

@object()
export class Frontend {
  @func()
  source: Directory;

  constructor(source: Directory) {
    this.source = source;
  }

  @func()
  async lint(): Promise<string> {
    return "PASS";
  }

  @func()
  async unitTest(): Promise<string> {
    return "PASS";
  }

  @func()
  async check(source: Directory): Promise<string> {
    this.source = source;
    return (await this.lint()) + "\n" + (await this.unitTest());
  }

  @func()
  build(): Directory {
    return this.source;
  }

  @func()
  serve(): Service {
    return dag
      .container()
      .from("nginx")
      .withDirectory("/usr/share/nginx/html", this.source)
      .asService({ useEntrypoint: true });
  }
}
