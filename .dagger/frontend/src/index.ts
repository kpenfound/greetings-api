/**
 * A generated module for Frontend functions
 *
 * This module has been generated via dagger init and serves as a reference to
 * basic module structure as you get started with Dagger.
 *
 * Two functions have been pre-created. You can modify, delete, or add to them,
 * as needed. They demonstrate usage of arguments and return types using simple
 * echo and grep commands. The functions can be called from the dagger CLI or
 * from one of the SDKs.
 *
 * The first line in this comment block is a short description line and the
 * rest is a long description with more detail on the module's purpose or usage,
 * if appropriate. All modules should have a short description.
 */
import {
  dag,
  Container,
  Directory,
  object,
  func,
  Service,
} from "@dagger.io/dagger";

@object()
export class Frontend {
  source: Directory;

  constructor(source: Directory) {
    this.source = source;
  }

  @func()
  lint(): string {
    return "PASS";
  }

  @func()
  test(): string {
    return "PASS";
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
      .asService();
  }
}
