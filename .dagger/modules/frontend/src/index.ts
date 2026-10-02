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
}
