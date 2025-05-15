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
    return dag
      .container()
      .from("node")
      .withMountedCache("/root/.npm", dag.cacheVolume("npm-cache"))
      .withWorkdir("/app")
      .withDirectory("/app", this.source)
      .withExec(["npm", "ci"])
      .withExec(["npm", "run", "lint"])
      .stdout();
  }

  @func()
  format(): Directory {
    return dag
      .container()
      .from("node")
      .withMountedCache("/root/.npm", dag.cacheVolume("npm-cache"))
      .withWorkdir("/app")
      .withDirectory("/app", this.source)
      .withExec(["npm", "ci"])
      .withExec(["npm", "run", "lint"])
      .directory("/app");
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

  @func()
  formatDirectory(source: Directory): Directory {
    this.source = source;
    return this.format();
  }

  @func()
  formatFile(source: Directory, path: string): Directory {
    return dag
      .container()
      .from("node:23")
      .withExec(["npm", "install", "--global", "prettier"])
      .withWorkdir("/src")
      .withDirectory("/src", source)
      .withExec(["prettier", "--write", path])
      .directory("/src");
  }
}
