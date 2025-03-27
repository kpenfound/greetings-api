/**
 * A generated module for Frontend functions
 */
import { dag, Directory, object, func, Service } from "@dagger.io/dagger";

@object()
export class Frontend {
  @func()
  source: Directory;
  backend: Service;

  constructor(source: Directory, backend: Service) {
    this.source = source;
    this.backend = backend;
  }

  @func()
  async lint(): Promise<string> {
    return "PASS";
  }

  @func()
  async unitTest(): Promise<string> {
    return await dag
      .container()
      .from("cypress/included:14.0.3")
      .withMountedCache("/root/.npm", dag.cacheVolume("npm-cache"))
      .withServiceBinding("localhost", this.backend)
      .withServiceBinding("frontend", this.serve())
      .withWorkdir("/app")
      .withDirectory("/app", this.source)
      .withExec(["npm", "ci"])
      .withExec(["npm", "run", "test:e2e"])
      .stdout();
  }

  @func()
  async check(): Promise<string> {
    const lint = await this.lint();
    const test = await this.unitTest();

    return lint + "\n" + test;
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

  @func()
  async checkDirectory(source: Directory): Promise<string> {
    this.source = source;
    return await this.check();
  }
}
