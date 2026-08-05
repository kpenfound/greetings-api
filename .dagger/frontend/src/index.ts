/**
 * A generated module for Frontend functions
 */
import {
  dag,
  Directory,
  object,
  func,
  up,
  argument,
  Service,
} from "@dagger.io/dagger";

@object()
export class Frontend {
  @func()
  source: Directory;

  constructor(@argument({ defaultPath: "/website" }) source: Directory) {
    this.source = source;
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
  build(): Directory {
    return this.source;
  }

  @func()
  @up()
  serve(): Service {
    return dag
      .container()
      .from("nginx")
      .withExec([
        "sed",
        "-i",
        "s/listen  *80;/listen 8081;/",
        "/etc/nginx/conf.d/default.conf",
      ])
      .withDirectory("/usr/share/nginx/html", this.source)
      .withExposedPort(8081)
      .asService({ useEntrypoint: true });
  }

  @func()
  async checkDirectory(source: Directory): Promise<string> {
    this.source = source;
    return await dag
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
  formatDirectory(source: Directory): Directory {
    this.source = source;
    return this.format();
  }

  @func()
  formatFile(source: Directory, path: string): Directory {
    if (
      !(path.endsWith(".ts") || path.endsWith(".html") || path.endsWith(".js"))
    ) {
      return source;
    }

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
