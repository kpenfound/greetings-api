import * as graphql_request from 'graphql-request';
import { GraphQLClient, ClientError } from 'graphql-request';
export { GraphQLClient } from 'graphql-request';
import * as opentelemetry from '@opentelemetry/api';
import { GraphQLErrorExtensions } from 'graphql';
import { Writable } from 'node:stream';

/**
 * Tracer encapsulates the OpenTelemetry Tracer.
 */
declare class Tracer {
    private tracer;
    constructor(name: string);
    startSpan(name: string, attributes?: opentelemetry.Attributes): opentelemetry.Span;
    /**
     * Execute the functions with a custom span with the given name using startActiveSpan.
     * The function executed will use the parent context of the function (it can be another span
     * or the main function).
     *
     * @param name The name of the span
     * @param fn The functions to execute
     *
     * startActiveSpan returns the result of the executed functions.
     *
     * The span is automatically ended when the function is done.
     * The span is automatically marked as an error if the function throws an error.
     *
     *
     * @example
     * ```
     * return getTracer().startActiveSpan(name, async () => {
     *   return this.containerEcho("test").stdout()
     * })
     * ```
     */
    startActiveSpan<T>(name: string, fn: (span: opentelemetry.Span) => Promise<T>, attributes?: opentelemetry.Attributes): Promise<T>;
}

/**
 * Return a tracer to use with Dagger.
 *
 * The tracer is automatically initialized if not already done.
 * As a conveniance function, you can use `withTracingSpan` that automatically close
 * the span at the end of the function.
 *
 * You can add a custom name to the tracer based on your application.
 */
declare function getTracer(name?: string): Tracer;

/**
 * Wraps the GraphQL client to allow lazy initialization and setting
 * the GQL client of the global Dagger client instance (`dag`).
 */
declare class Connection {
    private _gqlClient?;
    constructor(_gqlClient?: GraphQLClient | undefined);
    resetClient(): void;
    setGQLClient(gqlClient: GraphQLClient): void;
    getGQLClient(): GraphQLClient;
}

type QueryTree = {
    operation: string;
    args?: Record<string, unknown>;
    inlineType?: string;
};

declare class Context {
    private _queryTree;
    private _connection;
    constructor(_queryTree?: QueryTree[], _connection?: Connection);
    getGQLClient(): GraphQLClient;
    copy(): Context;
    select(operation: string, args?: Record<string, unknown>): Context;
    /**
     * Select via node(id:) with an inline fragment on the given type.
     * Produces: node(id: "...") { ... on TypeName { children } }
     */
    selectNode(id: string, typeName: string): Context;
    execute<T>(): Promise<T>;
}
/**
 * Common base class for every generated API class (Client, Container, and
 * dependency-contributed types).
 *
 * It lives here in the SDK runtime rather than in the generated client.gen.ts
 * so that per-dependency generated files (e.g. hello.gen.ts) can `extends
 * BaseClient` without importing a value from client.gen.ts — client.gen.ts
 * `export *`s those dep files, so a value import would create an ESM cycle.
 * client.gen.ts re-exports BaseClient to keep `import { BaseClient } from
 * "./client.gen.js"` working for existing consumers.
 */
declare class BaseClient {
    protected _ctx: Context;
    /**
     * @hidden
     */
    constructor(_ctx?: Context);
}

/**
 * Declare a number as float in the Dagger API.
 */
type float = number;

type AddressDirectoryOpts = {
    exclude?: string[];
    include?: string[];
    gitignore?: boolean;
    noCache?: boolean;
};
type AddressFileOpts = {
    exclude?: string[];
    include?: string[];
    gitignore?: boolean;
    noCache?: boolean;
};
type BuildArg = {
    /**
     * The build argument name.
     */
    name: string;
    /**
     * The build argument value.
     */
    value: string;
};
/**
 * Sharing mode of the cache volume.
 */
declare enum CacheSharingMode {
    /**
     * Shares the cache volume amongst many build pipelines, but will serialize the writes
     */
    Locked = "LOCKED",
    /**
     * Keeps a cache volume for a single build pipeline
     */
    Private = "PRIVATE",
    /**
     * Shares the cache volume amongst many build pipelines
     */
    Shared = "SHARED"
}
/**
 * Utility function to convert a CacheSharingMode value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function CacheSharingModeValueToName(value: CacheSharingMode): string;
/**
 * Utility function to convert a CacheSharingMode name to its value so
 * it can be properly used inside the module runtime.
 */
declare function CacheSharingModeNameToValue(name: string): CacheSharingMode;
type ChangesetWithChangesetOpts = {
    /**
     * What to do on a merge conflict
     */
    onConflict?: ChangesetMergeConflict;
};
type ChangesetWithChangesetsOpts = {
    /**
     * What to do on a merge conflict
     */
    onConflict?: ChangesetsMergeConflict;
};
/**
 * Strategy to use when merging changesets with conflicting changes.
 */
declare enum ChangesetMergeConflict {
    /**
     * Attempt the merge and fail if git merge fails due to conflicts
     */
    Fail = "FAIL",
    /**
     * Fail before attempting merge if file-level conflicts are detected
     */
    FailEarly = "FAIL_EARLY",
    /**
     * Let git create conflict markers in files. For modify/delete conflicts, keeps the modified version. Fails on binary conflicts.
     */
    LeaveConflictMarkers = "LEAVE_CONFLICT_MARKERS",
    /**
     * The conflict is resolved by applying the version of the calling changeset
     */
    PreferOurs = "PREFER_OURS",
    /**
     * The conflict is resolved by applying the version of the other changeset
     */
    PreferTheirs = "PREFER_THEIRS"
}
/**
 * Utility function to convert a ChangesetMergeConflict value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function ChangesetMergeConflictValueToName(value: ChangesetMergeConflict): string;
/**
 * Utility function to convert a ChangesetMergeConflict name to its value so
 * it can be properly used inside the module runtime.
 */
declare function ChangesetMergeConflictNameToValue(name: string): ChangesetMergeConflict;
/**
 * Strategy to use when merging multiple changesets with git octopus merge.
 */
declare enum ChangesetsMergeConflict {
    /**
     * Attempt the octopus merge and fail if git merge fails due to conflicts
     */
    Fail = "FAIL",
    /**
     * Fail before attempting merge if file-level conflicts are detected between any changesets
     */
    FailEarly = "FAIL_EARLY"
}
/**
 * Utility function to convert a ChangesetsMergeConflict value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function ChangesetsMergeConflictValueToName(value: ChangesetsMergeConflict): string;
/**
 * Utility function to convert a ChangesetsMergeConflict name to its value so
 * it can be properly used inside the module runtime.
 */
declare function ChangesetsMergeConflictNameToValue(name: string): ChangesetsMergeConflict;
type CheckGroupRunOpts = {
    /**
     * If true, stop running checks as soon as any check fails.
     */
    failFast?: boolean;
};
type ContainerAsServiceOpts = {
    /**
     * Command to run instead of the container's default command (e.g., ["go", "run", "main.go"]).
     *
     * If empty, the container's default command is used.
     */
    args?: string[];
    /**
     * If the container has an entrypoint, prepend it to the args.
     */
    useEntrypoint?: boolean;
    /**
     * Provides Dagger access to the executed command.
     */
    experimentalPrivilegedNesting?: boolean;
    /**
     * Execute the command with all root capabilities. This is similar to running a command with "sudo" or executing "docker run" with the "--privileged" flag. Containerization does not provide any security guarantees when using this option. It should only be used when absolutely necessary and only with trusted commands.
     */
    insecureRootCapabilities?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the args according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
    /**
     * If set, skip the automatic init process injected into containers by default.
     *
     * This should only be used if the user requires that their exec process be the pid 1 process in the container. Otherwise it may result in unexpected behavior.
     */
    noInit?: boolean;
};
type ContainerAsTarballOpts = {
    /**
     * Identifiers for other platform specific containers.
     *
     * Used for multi-platform images.
     */
    platformVariants?: Container[];
    /**
     * Force each layer of the image to use the specified compression algorithm.
     *
     * If this is unset, then if a layer already has a compressed blob in the engine's cache, that will be used (this can result in a mix of compression algorithms for different layers). If this is unset and a layer has no compressed blob in the engine's cache, then it will be compressed using Gzip.
     */
    forcedCompression?: ImageLayerCompression;
    /**
     * Use the specified media types for the image's layers.
     *
     * Defaults to OCI, which is largely compatible with most recent container runtimes, but Docker may be needed for older runtimes without OCI support.
     */
    mediaTypes?: ImageMediaTypes;
};
type ContainerDirectoryOpts = {
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type ContainerExistsOpts = {
    /**
     * If specified, also validate the type of file (e.g. "REGULAR_TYPE", "DIRECTORY_TYPE", or "SYMLINK_TYPE").
     */
    expectedType?: ExistsType;
    /**
     * If specified, do not follow symlinks.
     */
    doNotFollowSymlinks?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type ContainerExportOpts = {
    /**
     * Identifiers for other platform specific containers.
     *
     * Used for multi-platform image.
     */
    platformVariants?: Container[];
    /**
     * Force each layer of the exported image to use the specified compression algorithm.
     *
     * If this is unset, then if a layer already has a compressed blob in the engine's cache, that will be used (this can result in a mix of compression algorithms for different layers). If this is unset and a layer has no compressed blob in the engine's cache, then it will be compressed using Gzip.
     */
    forcedCompression?: ImageLayerCompression;
    /**
     * Use the specified media types for the exported image's layers.
     *
     * Defaults to OCI, which is largely compatible with most recent container runtimes, but Docker may be needed for older runtimes without OCI support.
     */
    mediaTypes?: ImageMediaTypes;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type ContainerExportImageOpts = {
    /**
     * Identifiers for other platform specific containers.
     *
     * Used for multi-platform image.
     */
    platformVariants?: Container[];
    /**
     * Force each layer of the exported image to use the specified compression algorithm.
     *
     * If this is unset, then if a layer already has a compressed blob in the engine's cache, that will be used (this can result in a mix of compression algorithms for different layers). If this is unset and a layer has no compressed blob in the engine's cache, then it will be compressed using Gzip.
     */
    forcedCompression?: ImageLayerCompression;
    /**
     * Use the specified media types for the exported image's layers.
     *
     * Defaults to OCI, which is largely compatible with most recent container runtimes, but Docker may be needed for older runtimes without OCI support.
     */
    mediaTypes?: ImageMediaTypes;
};
type ContainerFileOpts = {
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    expand?: boolean;
};
type ContainerFromOpts = {
    /**
     * Service to use as the registry endpoint for the image address.
     *
     * The service will be started only for this pull.
     */
    registryService?: Service;
    /**
     * Protocol to use for registry communication.
     *
     * Defaults to "HTTPS". Use "HTTP" only for plain HTTP registries.
     */
    protocol?: RegistryProtocol;
    /**
     * Allow HTTPS registry communication without verifying the server certificate.
     */
    insecureSkipTLSVerify?: boolean;
};
type ContainerImportOpts = {
    /**
     * Identifies the tag to import from the archive, if the archive bundles multiple tags.
     */
    tag?: string;
};
type ContainerLayerOpts = {
    /**
     * Force each layer of the image to use the specified compression algorithm.
     *
     * If this is unset, then if a layer already has a compressed blob in the engine's cache, that will be used (this can result in a mix of compression algorithms for different layers). If this is unset and a layer has no compressed blob in the engine's cache, then it will be compressed using Gzip.
     */
    forcedCompression?: ImageLayerCompression;
    /**
     * Media types to use for image layers. Defaults to OCI.
     */
    mediaTypes?: ImageMediaTypes;
};
type ContainerManifestOpts = {
    /**
     * Force each layer of the image to use the specified compression algorithm.
     *
     * If this is unset, then if a layer already has a compressed blob in the engine's cache, that will be used (this can result in a mix of compression algorithms for different layers). If this is unset and a layer has no compressed blob in the engine's cache, then it will be compressed using Gzip.
     */
    forcedCompression?: ImageLayerCompression;
    /**
     * Media types to use for image layers. Defaults to OCI.
     */
    mediaTypes?: ImageMediaTypes;
};
type ContainerPublishOpts = {
    /**
     * Identifiers for other platform specific containers.
     *
     * Used for multi-platform image.
     */
    platformVariants?: Container[];
    /**
     * Force each layer of the published image to use the specified compression algorithm.
     *
     * If this is unset, then if a layer already has a compressed blob in the engine's cache, that will be used (this can result in a mix of compression algorithms for different layers). If this is unset and a layer has no compressed blob in the engine's cache, then it will be compressed using Gzip.
     */
    forcedCompression?: ImageLayerCompression;
    /**
     * Use the specified media types for the published image's layers.
     *
     * Defaults to "OCI", which is compatible with most recent registries, but "Docker" may be needed for older registries without OCI support.
     */
    mediaTypes?: ImageMediaTypes;
    /**
     * Service to use as the registry endpoint for the image address.
     *
     * The service will be started only for this push.
     */
    registryService?: Service;
    /**
     * Protocol to use for registry communication.
     *
     * Defaults to "HTTPS". Use "HTTP" only for plain HTTP registries.
     */
    protocol?: RegistryProtocol;
    /**
     * Allow HTTPS registry communication without verifying the server certificate.
     */
    insecureSkipTLSVerify?: boolean;
};
type ContainerStatOpts = {
    /**
     * If specified, do not follow symlinks.
     */
    doNotFollowSymlinks?: boolean;
};
type ContainerTerminalOpts = {
    /**
     * If set, override the container's default terminal command and invoke these command arguments instead.
     */
    cmd?: string[];
    /**
     * Provides Dagger access to the executed command.
     */
    experimentalPrivilegedNesting?: boolean;
    /**
     * Execute the command with all root capabilities. This is similar to running a command with "sudo" or executing "docker run" with the "--privileged" flag. Containerization does not provide any security guarantees when using this option. It should only be used when absolutely necessary and only with trusted commands.
     */
    insecureRootCapabilities?: boolean;
};
type ContainerUpOpts = {
    /**
     * Bind each tunnel port to a random port on the host.
     */
    random?: boolean;
    /**
     * List of frontend/backend port mappings to forward.
     *
     * Frontend is the port accepting traffic on the host, backend is the service port.
     */
    ports?: PortForward[];
    /**
     * Command to run instead of the container's default command (e.g., ["go", "run", "main.go"]).
     *
     * If empty, the container's default command is used.
     */
    args?: string[];
    /**
     * If the container has an entrypoint, prepend it to the args.
     */
    useEntrypoint?: boolean;
    /**
     * Provides Dagger access to the executed command.
     */
    experimentalPrivilegedNesting?: boolean;
    /**
     * Execute the command with all root capabilities. This is similar to running a command with "sudo" or executing "docker run" with the "--privileged" flag. Containerization does not provide any security guarantees when using this option. It should only be used when absolutely necessary and only with trusted commands.
     */
    insecureRootCapabilities?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the args according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
    /**
     * If set, skip the automatic init process injected into containers by default.
     *
     * This should only be used if the user requires that their exec process be the pid 1 process in the container. Otherwise it may result in unexpected behavior.
     */
    noInit?: boolean;
};
type ContainerWithDefaultTerminalCmdOpts = {
    /**
     * Provides Dagger access to the executed command.
     */
    experimentalPrivilegedNesting?: boolean;
    /**
     * Execute the command with all root capabilities. This is similar to running a command with "sudo" or executing "docker run" with the "--privileged" flag. Containerization does not provide any security guarantees when using this option. It should only be used when absolutely necessary and only with trusted commands.
     */
    insecureRootCapabilities?: boolean;
};
type ContainerWithDirectoryOpts = {
    /**
     * Patterns to exclude in the written directory (e.g. ["node_modules/**", ".gitignore", ".git/"]).
     */
    exclude?: string[];
    /**
     * Patterns to include in the written directory (e.g. ["*.go", "go.mod", "go.sum"]).
     */
    include?: string[];
    /**
     * Apply .gitignore rules when writing the directory.
     */
    gitignore?: boolean;
    /**
     * A user:group to set for the directory and its contents.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    owner?: string;
    /**
     * Set the owner to the container's current user.
     */
    inheritOwner?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
    permissions?: number;
};
type ContainerWithDockerHealthcheckOpts = {
    /**
     * When true, command must be a single element, which is run using the container's shell
     */
    shell?: boolean;
    /**
     * Interval between running healthcheck. Example: "30s"
     */
    interval?: string;
    /**
     * Healthcheck timeout. Example: "3s"
     */
    timeout?: string;
    /**
     * StartPeriod allows for failures during this initial startup period which do not count towards maximum number of retries. Example: "0s"
     */
    startPeriod?: string;
    /**
     * StartInterval configures the duration between checks during the startup phase. Example: "5s"
     */
    startInterval?: string;
    /**
     * The maximum number of consecutive failures before the container is marked as unhealthy. Example: "3"
     */
    retries?: number;
};
type ContainerWithEntrypointOpts = {
    /**
     * Don't reset the default arguments when setting the entrypoint. By default it is reset, since entrypoint and default args are often tightly coupled.
     */
    keepDefaultArgs?: boolean;
};
type ContainerWithEnvVariableOpts = {
    /**
     * Replace "${VAR}" or "$VAR" in the value according to the current environment variables defined in the container (e.g. "/opt/bin:$PATH").
     */
    expand?: boolean;
};
type ContainerWithExecOpts = {
    /**
     * Apply the OCI entrypoint, if present, by prepending it to the args. Ignored by default.
     */
    useEntrypoint?: boolean;
    /**
     * Content to write to the command's standard input. Example: "Hello world")
     */
    stdin?: string;
    /**
     * Redirect the command's standard input from a file in the container. Example: "./stdin.txt"
     */
    redirectStdin?: string;
    /**
     * Redirect the command's standard output to a file in the container. Example: "./stdout.txt"
     */
    redirectStdout?: string;
    /**
     * Redirect the command's standard error to a file in the container. Example: "./stderr.txt"
     */
    redirectStderr?: string;
    /**
     * Exit codes this command is allowed to exit with without error
     */
    expect?: ReturnType;
    /**
     * Provides Dagger access to the executed command.
     */
    experimentalPrivilegedNesting?: boolean;
    /**
     * Execute the command with all root capabilities. Like --privileged in Docker
     *
     * DANGER: this grants the command full access to the host system. Only use when 1) you trust the command being executed and 2) you specifically need this level of access.
     */
    insecureRootCapabilities?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the args according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
    /**
     * Skip the automatic init process injected into containers by default.
     *
     * Only use this if you specifically need the command to be pid 1 in the container. Otherwise it may result in unexpected behavior. If you're not sure, you don't need this.
     */
    noInit?: boolean;
};
type ContainerWithExposedPortOpts = {
    /**
     * Network protocol. Example: "tcp"
     */
    protocol?: NetworkProtocol;
    /**
     * Port description. Example: "payment API endpoint"
     */
    description?: string;
    /**
     * Skip the health check when run as a service.
     */
    experimentalSkipHealthcheck?: boolean;
};
type ContainerWithFileOpts = {
    /**
     * Permissions of the new file. Example: 0600
     */
    permissions?: number;
    /**
     * A user:group to set for the file.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    owner?: string;
    /**
     * Set the owner to the container's current user.
     */
    inheritOwner?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    expand?: boolean;
};
type ContainerWithFilesOpts = {
    /**
     * Permission given to the copied files (e.g., 0600).
     */
    permissions?: number;
    /**
     * A user:group to set for the files.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    owner?: string;
    /**
     * Set the owner to the container's current user.
     */
    inheritOwner?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    expand?: boolean;
};
type ContainerWithMountedCacheOpts = {
    /**
     * Identifier of the directory to use as the cache volume's root.
     */
    source?: Directory;
    /**
     * Sharing mode of the cache volume.
     */
    sharing?: CacheSharingMode;
    /**
     * A user:group to set for the mounted cache directory.
     *
     * Note that this changes the ownership of the specified mount along with the initial filesystem provided by source (if any). It does not have any effect if/when the cache has already been created.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    owner?: string;
    /**
     * Set the owner to the container's current user.
     */
    inheritOwner?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type ContainerWithMountedDirectoryOpts = {
    /**
     * A user:group to set for the mounted directory and its contents.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    owner?: string;
    /**
     * Set the owner to the container's current user.
     */
    inheritOwner?: boolean;
    /**
     * Mount the directory read-only.
     */
    readOnly?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type ContainerWithMountedFileOpts = {
    /**
     * A user or user:group to set for the mounted file.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    owner?: string;
    /**
     * Set the owner to the container's current user.
     */
    inheritOwner?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    expand?: boolean;
};
type ContainerWithMountedSecretOpts = {
    /**
     * A user:group to set for the mounted secret.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    owner?: string;
    /**
     * Set the owner to the container's current user.
     */
    inheritOwner?: boolean;
    /**
     * Permission given to the mounted secret (e.g., 0600).
     *
     * This option requires an owner to be set to be active.
     */
    mode?: number;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type ContainerWithMountedTempOpts = {
    /**
     * Size of the temporary directory in bytes.
     */
    size?: number;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type ContainerWithMountedVolumeOpts = {
    /**
     * Mount the volume read-only.
     */
    readOnly?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type ContainerWithNewFileOpts = {
    /**
     * Permissions of the new file. Example: 0600
     */
    permissions?: number;
    /**
     * A user:group to set for the file.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    owner?: string;
    /**
     * Set the owner to the container's current user.
     */
    inheritOwner?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    expand?: boolean;
};
type ContainerWithSymlinkOpts = {
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    expand?: boolean;
};
type ContainerWithUnixSocketOpts = {
    /**
     * A user:group to set for the mounted socket.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    owner?: string;
    /**
     * Set the owner to the container's current user.
     */
    inheritOwner?: boolean;
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type ContainerWithWorkdirOpts = {
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type ContainerWithoutDirectoryOpts = {
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type ContainerWithoutEntrypointOpts = {
    /**
     * Don't remove the default arguments when unsetting the entrypoint.
     */
    keepDefaultArgs?: boolean;
};
type ContainerWithoutExposedPortOpts = {
    /**
     * Port protocol to unexpose
     */
    protocol?: NetworkProtocol;
};
type ContainerWithoutFileOpts = {
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    expand?: boolean;
};
type ContainerWithoutFilesOpts = {
    /**
     * Replace "${VAR}" or "$VAR" in the value of paths according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    expand?: boolean;
};
type ContainerWithoutMountOpts = {
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type ContainerWithoutUnixSocketOpts = {
    /**
     * Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    expand?: boolean;
};
type CurrentModuleAsSdkOpts = {
    /**
     * The workspace to resolve SDK-role data against. Defaults to the current workspace.
     */
    workspace?: Workspace;
};
type CurrentModuleGeneratorsOpts = {
    /**
     * Only include generators matching the specified patterns
     */
    include?: string[];
};
type CurrentModuleWorkdirOpts = {
    /**
     * Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
     */
    exclude?: string[];
    /**
     * Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
     */
    include?: string[];
    /**
     * Apply .gitignore filter rules inside the directory
     */
    gitignore?: boolean;
};
/**
 * The type of change for a diff stat entry.
 */
declare enum DiffStatKind {
    /**
     * A file or directory was added.
     */
    Added = "ADDED",
    /**
     * A file was modified.
     */
    Modified = "MODIFIED",
    /**
     * A file or directory was removed.
     */
    Removed = "REMOVED",
    /**
     * A file was renamed.
     */
    Renamed = "RENAMED"
}
/**
 * Utility function to convert a DiffStatKind value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function DiffStatKindValueToName(value: DiffStatKind): string;
/**
 * Utility function to convert a DiffStatKind name to its value so
 * it can be properly used inside the module runtime.
 */
declare function DiffStatKindNameToValue(name: string): DiffStatKind;
type DirectoryAsModuleOpts = {
    /**
     * An optional subpath of the directory which contains the module's configuration file.
     *
     * If not set, the module source code is loaded from the root of the directory.
     */
    sourceRootPath?: string;
};
type DirectoryAsModuleSourceOpts = {
    /**
     * An optional subpath of the directory which contains the module's configuration file.
     *
     * If not set, the module source code is loaded from the root of the directory.
     */
    sourceRootPath?: string;
};
type DirectoryAsWorkspaceOpts = {
    /**
     * Current working directory inside the workspace root. Defaults to the workspace root.
     */
    cwd?: string;
};
type DirectoryDockerBuildOpts = {
    /**
     * Path to the Dockerfile to use (e.g., "frontend.Dockerfile").
     */
    dockerfile?: string;
    /**
     * The platform to build.
     */
    platform?: Platform;
    /**
     * Build arguments to use in the build.
     */
    buildArgs?: BuildArg[];
    /**
     * Target build stage to build.
     */
    target?: string;
    /**
     * Secrets to pass to the build.
     *
     * They will be mounted at /run/secrets/[secret-name].
     */
    secrets?: Secret[];
    /**
     * If set, skip the automatic init process injected into containers created by RUN statements.
     *
     * This should only be used if the user requires that their exec processes be the pid 1 process in the container. Otherwise it may result in unexpected behavior.
     */
    noInit?: boolean;
    /**
     * A socket to use for SSH authentication during the build
     *
     * (e.g., for Dockerfile RUN --mount=type=ssh instructions).
     *
     * Typically obtained via host.unixSocket() pointing to the SSH_AUTH_SOCK.
     */
    ssh?: Socket;
};
type DirectoryEntriesOpts = {
    /**
     * Location of the directory to look at (e.g., "/src").
     */
    path?: string;
};
type DirectoryExistsOpts = {
    /**
     * If specified, also validate the type of file (e.g. "REGULAR_TYPE", "DIRECTORY_TYPE", or "SYMLINK_TYPE").
     */
    expectedType?: ExistsType;
    /**
     * If specified, do not follow symlinks.
     */
    doNotFollowSymlinks?: boolean;
};
type DirectoryExportOpts = {
    /**
     * If true, then the host directory will be wiped clean before exporting so that it exactly matches the directory being exported; this means it will delete any files on the host that aren't in the exported dir. If false (the default), the contents of the directory will be merged with any existing contents of the host directory, leaving any existing files on the host that aren't in the exported directory alone.
     */
    wipe?: boolean;
};
type DirectoryFilterOpts = {
    /**
     * If set, paths matching one of these glob patterns is excluded from the new snapshot. Example: ["node_modules/", ".git*", ".env"]
     */
    exclude?: string[];
    /**
     * If set, only paths matching one of these glob patterns is included in the new snapshot. Example: (e.g., ["app/", "package.*"]).
     */
    include?: string[];
    /**
     * If set, apply .gitignore rules when filtering the directory.
     */
    gitignore?: boolean;
};
type DirectorySearchOpts = {
    /**
     * Directory or file paths to search
     */
    paths?: string[];
    /**
     * Glob patterns to match (e.g., "*.md")
     */
    globs?: string[];
    /**
     * The text to match.
     */
    pattern: string;
    /**
     * Interpret the pattern as a literal string instead of a regular expression.
     */
    literal?: boolean;
    /**
     * Enable searching across multiple lines.
     */
    multiline?: boolean;
    /**
     * Allow the . pattern to match newlines in multiline mode.
     */
    dotall?: boolean;
    /**
     * Enable case-insensitive matching.
     */
    insensitive?: boolean;
    /**
     * Honor .gitignore, .ignore, and .rgignore files.
     */
    skipIgnored?: boolean;
    /**
     * Skip hidden files (files starting with .).
     */
    skipHidden?: boolean;
    /**
     * Only return matching files, not lines and content
     */
    filesOnly?: boolean;
    /**
     * Limit the number of results to return
     */
    limit?: number;
};
type DirectoryStatOpts = {
    /**
     * If specified, do not follow symlinks.
     */
    doNotFollowSymlinks?: boolean;
};
type DirectoryTerminalOpts = {
    /**
     * If set, override the default container used for the terminal.
     */
    container?: Container;
    /**
     * If set, override the container's default terminal command and invoke these command arguments instead.
     */
    cmd?: string[];
    /**
     * Provides Dagger access to the executed command.
     */
    experimentalPrivilegedNesting?: boolean;
    /**
     * Execute the command with all root capabilities. This is similar to running a command with "sudo" or executing "docker run" with the "--privileged" flag. Containerization does not provide any security guarantees when using this option. It should only be used when absolutely necessary and only with trusted commands.
     */
    insecureRootCapabilities?: boolean;
};
type DirectoryWithDirectoryOpts = {
    /**
     * Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
     */
    exclude?: string[];
    /**
     * Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
     */
    include?: string[];
    /**
     * Apply .gitignore filter rules inside the directory
     */
    gitignore?: boolean;
    /**
     * A user:group to set for the copied directory and its contents.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    owner?: string;
    /**
     * Permission given to the copied directory and contents (e.g., 0755).
     */
    permissions?: number;
};
type DirectoryWithFileOpts = {
    /**
     * Permission given to the copied file (e.g., 0600).
     */
    permissions?: number;
    /**
     * A user:group to set for the copied directory and its contents.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    owner?: string;
};
type DirectoryWithFilesOpts = {
    /**
     * Permission given to the copied files (e.g., 0600).
     */
    permissions?: number;
};
type DirectoryWithNewDirectoryOpts = {
    /**
     * Permission granted to the created directory (e.g., 0777).
     */
    permissions?: number;
};
type DirectoryWithNewFileOpts = {
    /**
     * Permissions of the new file. Example: 0600
     */
    permissions?: number;
};
type EngineCacheEntrySetOpts = {
    key?: string;
};
type EngineCachePruneOpts = {
    /**
     * Use the engine-wide default pruning policy if true, otherwise prune the whole cache of any releasable entries.
     */
    useDefaultPolicy?: boolean;
    /**
     * Override the maximum disk space to keep before pruning (e.g. "200GB" or "80%").
     */
    maxUsedSpace?: string;
    /**
     * Override the minimum disk space to retain during pruning (e.g. "500GB" or "10%").
     */
    reservedSpace?: string;
    /**
     * Override the minimum free disk space target during pruning (e.g. "20GB" or "20%").
     */
    minFreeSpace?: string;
    /**
     * Override the target disk space to keep after pruning (e.g. "200GB" or "50%").
     */
    targetSpace?: string;
};
type EnvChecksOpts = {
    /**
     * Only include checks matching the specified patterns
     */
    include?: string[];
    /**
     * When true, only return annotated check functions; exclude generate-as-checks
     */
    noGenerate?: boolean;
};
type EnvServicesOpts = {
    /**
     * Only include services matching the specified patterns
     */
    include?: string[];
};
type EnvFileGetOpts = {
    /**
     * Return the value exactly as written to the file. No quote removal or variable expansion
     */
    raw?: boolean;
};
type EnvFileVariablesOpts = {
    /**
     * Return values exactly as written to the file. No quote removal or variable expansion
     */
    raw?: boolean;
};
/**
 * File type.
 */
declare enum ExistsType {
    /**
     * Tests path is a directory
     */
    DirectoryType = "DIRECTORY_TYPE",
    /**
     * Tests path is a regular file
     */
    RegularType = "REGULAR_TYPE",
    /**
     * Tests path is a symlink
     */
    SymlinkType = "SYMLINK_TYPE"
}
/**
 * Utility function to convert a ExistsType value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function ExistsTypeValueToName(value: ExistsType): string;
/**
 * Utility function to convert a ExistsType name to its value so
 * it can be properly used inside the module runtime.
 */
declare function ExistsTypeNameToValue(name: string): ExistsType;
type FileAsEnvFileOpts = {
    /**
     * Replace "${VAR}" or "$VAR" with the value of other vars
     *
     * @deprecated Variable expansion is now enabled by default
     */
    expand?: boolean;
};
type FileContentsOpts = {
    /**
     * Start reading after this line
     */
    offsetLines?: number;
    /**
     * Maximum number of lines to read
     */
    limitLines?: number;
};
type FileDigestOpts = {
    /**
     * If true, exclude metadata from the digest.
     */
    excludeMetadata?: boolean;
};
type FileExportOpts = {
    /**
     * If allowParentDirPath is true, the path argument can be a directory path, in which case the file will be created in that directory.
     */
    allowParentDirPath?: boolean;
};
type FileSearchOpts = {
    /**
     * Interpret the pattern as a literal string instead of a regular expression.
     */
    literal?: boolean;
    /**
     * Enable searching across multiple lines.
     */
    multiline?: boolean;
    /**
     * Allow the . pattern to match newlines in multiline mode.
     */
    dotall?: boolean;
    /**
     * Enable case-insensitive matching.
     */
    insensitive?: boolean;
    /**
     * Honor .gitignore, .ignore, and .rgignore files.
     */
    skipIgnored?: boolean;
    /**
     * Skip hidden files (files starting with .).
     */
    skipHidden?: boolean;
    /**
     * Only return matching files, not lines and content
     */
    filesOnly?: boolean;
    /**
     * Limit the number of results to return
     */
    limit?: number;
    paths?: string[];
    globs?: string[];
};
type FileWithReplacedOpts = {
    /**
     * Replace all occurrences of the pattern.
     */
    all?: boolean;
    /**
     * Replace the first match starting from the specified line.
     */
    firstFrom?: number;
};
/**
 * File type.
 */
declare enum FileType {
    /**
     * directory file type
     */
    Directory = "DIRECTORY",
    /**
     * directory file type
     */
    DirectoryType = "DIRECTORY",
    /**
     * regular file type
     */
    Regular = "REGULAR",
    /**
     * regular file type
     */
    RegularType = "REGULAR",
    /**
     * symlink file type
     */
    Symlink = "SYMLINK",
    /**
     * symlink file type
     */
    SymlinkType = "SYMLINK",
    /**
     * unknown file type
     */
    Unknown = "UNKNOWN"
}
/**
 * Utility function to convert a FileType value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function FileTypeValueToName(value: FileType): string;
/**
 * Utility function to convert a FileType name to its value so
 * it can be properly used inside the module runtime.
 */
declare function FileTypeNameToValue(name: string): FileType;
type FunctionWithArgOpts = {
    /**
     * A doc string for the argument, if any
     */
    description?: string;
    /**
     * A default value to use for this argument if not explicitly set by the caller, if any
     */
    defaultValue?: JSON;
    /**
     * If the argument is a Directory or File type, default to load path from context directory, relative to root directory.
     */
    defaultPath?: string;
    /**
     * Patterns to ignore when loading the contextual argument value.
     */
    ignore?: string[];
    /**
     * The source map for the argument definition.
     */
    sourceMap?: SourceMap;
    /**
     * If deprecated, the reason or migration path.
     */
    deprecated?: string;
    defaultAddress?: string;
};
type FunctionWithCachePolicyOpts = {
    /**
     * The TTL for the cache policy, if applicable. Provided as a duration string, e.g. "5m", "1h30s".
     */
    timeToLive?: string;
};
type FunctionWithDeprecatedOpts = {
    /**
     * Reason or migration path describing the deprecation.
     */
    reason?: string;
};
/**
 * The behavior configured for function result caching.
 */
declare enum FunctionCachePolicy {
    Default = "Default",
    Never = "Never",
    PerSession = "PerSession"
}
/**
 * Utility function to convert a FunctionCachePolicy value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function FunctionCachePolicyValueToName(value: FunctionCachePolicy): string;
/**
 * Utility function to convert a FunctionCachePolicy name to its value so
 * it can be properly used inside the module runtime.
 */
declare function FunctionCachePolicyNameToValue(name: string): FunctionCachePolicy;
type GeneratorGroupChangesOpts = {
    /**
     * Strategy to apply on conflicts between generators
     */
    onConflict?: ChangesetsMergeConflict;
};
type GitRefAsWorkspaceOpts = {
    /**
     * Current working directory inside the workspace root. Defaults to the workspace root.
     */
    cwd?: string;
};
type GitRefTreeOpts = {
    /**
     * Set to true to discard .git directory.
     */
    discardGitDir?: boolean;
    /**
     * The depth of the tree to fetch.
     */
    depth?: number;
    /**
     * Set to true to populate tag refs in the local checkout .git.
     */
    includeTags?: boolean;
};
type GitRepositoryAsWorkspaceOpts = {
    /**
     * Current working directory inside the workspace root. Defaults to the workspace root.
     */
    cwd?: string;
};
type GitRepositoryBranchesOpts = {
    /**
     * Glob patterns (e.g., "refs/tags/v*").
     */
    patterns?: string[];
};
type GitRepositoryTagsOpts = {
    /**
     * Glob patterns (e.g., "refs/tags/v*").
     */
    patterns?: string[];
};
type HostDirectoryOpts = {
    /**
     * Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
     */
    exclude?: string[];
    /**
     * Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
     */
    include?: string[];
    /**
     * If true, the directory will always be reloaded from the host.
     */
    noCache?: boolean;
    /**
     * Apply .gitignore filter rules inside the directory
     */
    gitignore?: boolean;
};
type HostFileOpts = {
    /**
     * If true, the file will always be reloaded from the host.
     */
    noCache?: boolean;
};
type HostFindUpOpts = {
    noCache?: boolean;
};
type HostServiceOpts = {
    /**
     * Upstream host to forward traffic to.
     */
    host?: string;
};
type HostTunnelOpts = {
    /**
     * Map each service port to the same port on the host, as if the service were running natively.
     *
     * Note: enabling may result in port conflicts.
     */
    native?: boolean;
    /**
     * Configure explicit port forwarding rules for the tunnel.
     *
     * If a port's frontend is unspecified or 0, a random port will be chosen by the host.
     *
     * If no ports are given, all of the service's ports are forwarded. If native is true, each port maps to the same port on the host. If native is false, each port maps to a random port chosen by the host.
     *
     * If ports are given and native is true, the ports are additive.
     */
    ports?: PortForward[];
};
/**
 * A unique identifier for an object.
 */
type ID = string & {
    __ID: never;
};
/**
 * Compression algorithm to use for image layers.
 */
declare enum ImageLayerCompression {
    EStarGz = "EStarGZ",
    Estargz = "EStarGZ",
    Gzip = "Gzip",
    Uncompressed = "Uncompressed",
    Zstd = "Zstd"
}
/**
 * Utility function to convert a ImageLayerCompression value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function ImageLayerCompressionValueToName(value: ImageLayerCompression): string;
/**
 * Utility function to convert a ImageLayerCompression name to its value so
 * it can be properly used inside the module runtime.
 */
declare function ImageLayerCompressionNameToValue(name: string): ImageLayerCompression;
/**
 * Mediatypes to use in published or exported image metadata.
 */
declare enum ImageMediaTypes {
    Docker = "DockerMediaTypes",
    DockerMediaTypes = "DockerMediaTypes",
    Oci = "OCIMediaTypes",
    OciMediaTypes = "OCIMediaTypes"
}
/**
 * Utility function to convert a ImageMediaTypes value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function ImageMediaTypesValueToName(value: ImageMediaTypes): string;
/**
 * Utility function to convert a ImageMediaTypes name to its value so
 * it can be properly used inside the module runtime.
 */
declare function ImageMediaTypesNameToValue(name: string): ImageMediaTypes;
/**
 * An arbitrary JSON-encoded value.
 */
type JSON = string & {
    __JSON: never;
};
type JSONValueContentsOpts = {
    /**
     * Pretty-print
     */
    pretty?: boolean;
    /**
     * Optional line prefix
     */
    indent?: string;
};
type LLMLoopOpts = {
    /**
     * Cap the number of steps. The loop fails if the cap is reached before the model ends its turn.
     */
    maxSteps?: number;
    /**
     * Cap the model's output tokens on each step. Defaults to the model's maximum.
     */
    maxTokens?: number;
};
type LLMStepOpts = {
    /**
     * Cap the model's output tokens for this step. Defaults to the model's maximum.
     */
    maxTokens?: number;
};
type LLMWithModelOpts = {
    /**
     * The provider serving the model, e.g. "openai". Overrides the provider otherwise inferred from the model name — useful when the name matches no known pattern (e.g. a fine-tune), or matches the wrong one.
     */
    provider?: string;
};
type LLMWithResponseOpts = {
    /**
     * Uncached input tokens sent
     */
    inputTokens?: number;
    /**
     * Tokens received from the model, including text and tool calls
     */
    outputTokens?: number;
    /**
     * Cached input tokens read
     */
    cachedTokenReads?: number;
    /**
     * Cached input tokens written
     */
    cachedTokenWrites?: number;
    /**
     * Total tokens consumed by this response
     */
    totalTokens?: number;
};
type LLMContentBlockInput = {
    /**
     * The arguments to pass to the tool (for TOOL_CALL kind).
     */
    arguments?: JSON;
    /**
     * The unique ID of a tool call (for TOOL_CALL or TOOL_RESULT kinds).
     */
    callId?: string;
    /**
     * Whether the tool call resulted in an error (for TOOL_RESULT kind).
     */
    errored?: boolean;
    /**
     * The kind of content block.
     */
    kind: LLMContentBlockKind;
    /**
     * Provider-specific opaque data (e.g. Anthropic thinking signature).
     */
    signature?: string;
    /**
     * Text content (for TEXT, THINKING, or TOOL_RESULT kinds).
     */
    text?: string;
    /**
     * The name of the tool to call (for TOOL_CALL kind).
     */
    toolName?: string;
};
/**
 * The kind of content in a message block.
 */
declare enum LLMContentBlockKind {
    /**
     * Plain text content.
     */
    Text = "TEXT",
    /**
     * Model thinking/reasoning content (e.g. Anthropic extended thinking).
     */
    Thinking = "THINKING",
    /**
     * A tool/function call from the model.
     */
    ToolCall = "TOOL_CALL",
    /**
     * A tool/function result.
     */
    ToolResult = "TOOL_RESULT"
}
/**
 * Utility function to convert a LLMContentBlockKind value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function LLMContentBlockKindValueToName(value: LLMContentBlockKind): string;
/**
 * Utility function to convert a LLMContentBlockKind name to its value so
 * it can be properly used inside the module runtime.
 */
declare function LLMContentBlockKindNameToValue(name: string): LLMContentBlockKind;
/**
 * The role that generated a message.
 */
declare enum LLMMessageRole {
    /**
     * A reply from the model.
     */
    Assistant = "ASSISTANT",
    /**
     * A system prompt.
     */
    System = "SYSTEM",
    /**
     * A user prompt or tool response.
     */
    User = "USER"
}
/**
 * Utility function to convert a LLMMessageRole value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function LLMMessageRoleValueToName(value: LLMMessageRole): string;
/**
 * Utility function to convert a LLMMessageRole name to its value so
 * it can be properly used inside the module runtime.
 */
declare function LLMMessageRoleNameToValue(name: string): LLMMessageRole;
type ModuleChecksOpts = {
    /**
     * Only include checks matching the specified patterns
     */
    include?: string[];
    /**
     * When true, only return annotated check functions; exclude generate-as-checks
     */
    noGenerate?: boolean;
};
type ModuleGeneratorsOpts = {
    /**
     * Only include generators matching the specified patterns
     */
    include?: string[];
};
type ModuleServeOpts = {
    /**
     * Expose the dependencies of this module to the client
     */
    includeDependencies?: boolean;
    /**
     * Install the module as the entrypoint, promoting its main-object methods onto the Query root
     */
    entrypoint?: boolean;
};
type ModuleServicesOpts = {
    /**
     * Only include services matching the specified patterns
     */
    include?: string[];
};
/**
 * Experimental features of a module
 */
declare enum ModuleSourceExperimentalFeature {
    /**
     * Self calls
     */
    SelfCalls = "SELF_CALLS"
}
/**
 * Utility function to convert a ModuleSourceExperimentalFeature value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function ModuleSourceExperimentalFeatureValueToName(value: ModuleSourceExperimentalFeature): string;
/**
 * Utility function to convert a ModuleSourceExperimentalFeature name to its value so
 * it can be properly used inside the module runtime.
 */
declare function ModuleSourceExperimentalFeatureNameToValue(name: string): ModuleSourceExperimentalFeature;
/**
 * The kind of module source.
 */
declare enum ModuleSourceKind {
    Dir = "DIR_SOURCE",
    DirSource = "DIR_SOURCE",
    Git = "GIT_SOURCE",
    GitSource = "GIT_SOURCE",
    Local = "LOCAL_SOURCE",
    LocalSource = "LOCAL_SOURCE"
}
/**
 * Utility function to convert a ModuleSourceKind value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function ModuleSourceKindValueToName(value: ModuleSourceKind): string;
/**
 * Utility function to convert a ModuleSourceKind name to its value so
 * it can be properly used inside the module runtime.
 */
declare function ModuleSourceKindNameToValue(name: string): ModuleSourceKind;
/**
 * Transport layer network protocol associated to a port.
 */
declare enum NetworkProtocol {
    Tcp = "TCP",
    Udp = "UDP"
}
/**
 * Utility function to convert a NetworkProtocol value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function NetworkProtocolValueToName(value: NetworkProtocol): string;
/**
 * Utility function to convert a NetworkProtocol name to its value so
 * it can be properly used inside the module runtime.
 */
declare function NetworkProtocolNameToValue(name: string): NetworkProtocol;
type PipelineLabel = {
    /**
     * Label name.
     */
    name: string;
    /**
     * Label value.
     */
    value: string;
};
/**
 * The platform config OS and architecture in a Container.
 *
 * The format is [os]/[platform]/[version] (e.g., "darwin/arm64/v7", "windows/amd64", "linux/arm64").
 */
type Platform = string & {
    __Platform: never;
};
type PortForward = {
    /**
     * Destination port for traffic.
     */
    backend: number;
    /**
     * Port to expose to clients. If unspecified, a default will be chosen.
     */
    frontend?: number;
    /**
     * Transport layer protocol to use for traffic.
     */
    protocol?: NetworkProtocol;
};
type ClientCacheVolumeOpts = {
    /**
     * Identifier of the directory to use as the cache volume's root.
     */
    source?: Directory;
    /**
     * Sharing mode of the cache volume.
     */
    sharing?: CacheSharingMode;
    /**
     * A user:group to set for the cache volume root.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    owner?: string;
};
type ClientContainerOpts = {
    /**
     * Platform to initialize the container with. Defaults to the native platform of the current engine
     */
    platform?: Platform;
};
type ClientCurrentTypeDefsOpts = {
    /**
     * Return the full referenced typedef closure instead of only top-level served typedefs.
     */
    returnAllTypes?: boolean;
    /**
     * Strip core API functions from the Query type, leaving only module-sourced functions (constructors, entrypoint proxies, etc.).
     *
     * Core types (Container, Directory, etc.) are kept so return types and method chaining still work.
     */
    hideCore?: boolean;
};
type ClientEnvOpts = {
    /**
     * Give the environment the same privileges as the caller: core API including host access, current module, and dependencies
     */
    privileged?: boolean;
    /**
     * Allow new outputs to be declared and saved in the environment
     */
    writable?: boolean;
};
type ClientEnvFileOpts = {
    /**
     * Replace "${VAR}" or "$VAR" with the value of other vars
     *
     * @deprecated Variable expansion is now enabled by default
     */
    expand?: boolean;
};
type ClientFileOpts = {
    /**
     * Permissions of the new file. Example: 0600
     */
    permissions?: number;
};
type ClientGitOpts = {
    /**
     * DEPRECATED: Set to true to keep .git directory.
     *
     * @deprecated Set to true to keep .git directory.
     */
    keepGitDir?: boolean;
    /**
     * Set SSH known hosts
     */
    sshKnownHosts?: string;
    /**
     * Set SSH auth socket
     */
    sshAuthSocket?: Socket;
    /**
     * Username used to populate the password during basic HTTP Authorization
     */
    httpAuthUsername?: string;
    /**
     * Secret used to populate the password during basic HTTP Authorization
     */
    httpAuthToken?: Secret;
    /**
     * Secret used to populate the Authorization HTTP header
     */
    httpAuthHeader?: Secret;
    /**
     * A service which must be started before the repo is fetched.
     */
    experimentalServiceHost?: Service;
};
type ClientHttpOpts = {
    /**
     * File name to use for the file. Defaults to the last part of the URL.
     */
    name?: string;
    /**
     * Permissions to set on the file.
     */
    permissions?: number;
    /**
     * Expected digest of the downloaded content (e.g., "sha256:...").
     */
    checksum?: string;
    /**
     * Secret used to populate the Authorization HTTP header
     */
    authHeader?: Secret;
    /**
     * A service which must be started before the URL is fetched.
     */
    experimentalServiceHost?: Service;
};
type ClientLLMOpts = {
    /**
     * The model to converse with, e.g. "claude-sonnet-4-5" or "gpt-5.4". Defaults to the configured default model.
     */
    model?: string;
    /**
     * The provider serving the model, e.g. "openai". Overrides the provider otherwise inferred from the model name — useful when the name matches no known pattern (e.g. a fine-tune), or matches the wrong one.
     */
    provider?: string;
};
type ClientModuleSourceOpts = {
    /**
     * The pinned version of the module source
     */
    refPin?: string;
    /**
     * If true, do not attempt to find a module config file in a parent directory of the provided path. Only relevant for local module sources.
     */
    disableFindUp?: boolean;
    /**
     * If true, do not error out if the provided ref string is a local path and does not exist yet. Useful when initializing new modules in directories that don't exist yet.
     */
    allowNotExists?: boolean;
    /**
     * If set, error out if the ref string is not of the provided requireKind.
     */
    requireKind?: ModuleSourceKind;
};
type ClientSecretOpts = {
    /**
     * If set, the given string will be used as the cache key for this secret. This means that any secrets with the same cache key will be considered equivalent in terms of cache lookups, even if they have different URIs or plaintext values.
     *
     * For example, two secrets with the same cache key provided as secret env vars to other wise equivalent containers will result in the container withExecs hitting the cache for each other.
     *
     * If not set, the cache key for the secret will be derived from its plaintext value as looked up when the secret is constructed.
     */
    cacheKey?: string;
};
type ClientSshfsVolumeOpts = {
    /**
     * known_hosts material used to verify the remote host key. Required unless insecureSkipHostKeyCheck is true.
     */
    knownHosts?: Secret;
    /**
     * Optional cache equivalence key. If set, volumes with the same cacheKey may be considered equivalent for cache lookups, still subject to their resource dependencies.
     */
    cacheKey?: string;
    /**
     * Disable SSH host key verification. This is insecure and must be explicitly opted into.
     */
    insecureSkipHostKeyCheck?: boolean;
    /**
     * Service to use as the SSHFS network endpoint while verifying the original host key.
     */
    experimentalServiceHost?: Service;
};
/**
 * Transport protocol to use for registry operations.
 */
declare enum RegistryProtocol {
    Http = "HTTP",
    Https = "HTTPS"
}
/**
 * Utility function to convert a RegistryProtocol value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function RegistryProtocolValueToName(value: RegistryProtocol): string;
/**
 * Utility function to convert a RegistryProtocol name to its value so
 * it can be properly used inside the module runtime.
 */
declare function RegistryProtocolNameToValue(name: string): RegistryProtocol;
/**
 * Expected return type of an execution
 */
declare enum ReturnType {
    /**
     * Any execution (exit codes 0-127 and 192-255)
     */
    Any = "ANY",
    /**
     * A failed execution (exit codes 1-127 and 192-255)
     */
    Failure = "FAILURE",
    /**
     * A successful execution (exit code 0)
     */
    Success = "SUCCESS"
}
/**
 * Utility function to convert a ReturnType value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function ReturnTypeValueToName(value: ReturnType): string;
/**
 * Utility function to convert a ReturnType name to its value so
 * it can be properly used inside the module runtime.
 */
declare function ReturnTypeNameToValue(name: string): ReturnType;
type ServiceEndpointOpts = {
    /**
     * The exposed port number for the endpoint
     */
    port?: number;
    /**
     * Return a URL with the given scheme, eg. http for http://
     */
    scheme?: string;
};
type ServiceStopOpts = {
    /**
     * Immediately kill the service without waiting for a graceful exit
     */
    kill?: boolean;
};
type ServiceTerminalOpts = {
    cmd?: string[];
};
type ServiceUpOpts = {
    /**
     * List of frontend/backend port mappings to forward.
     *
     * Frontend is the port accepting traffic on the host, backend is the service port.
     */
    ports?: PortForward[];
    /**
     * Bind each tunnel port to a random port on the host.
     */
    random?: boolean;
};
type TypeDefWithEnumOpts = {
    /**
     * A doc string for the enum, if any
     */
    description?: string;
    /**
     * The source map for the enum definition.
     */
    sourceMap?: SourceMap;
};
type TypeDefWithEnumMemberOpts = {
    /**
     * The value of the member in the enum
     */
    value?: string;
    /**
     * A doc string for the member, if any
     */
    description?: string;
    /**
     * The source map for the enum member definition.
     */
    sourceMap?: SourceMap;
    /**
     * If deprecated, the reason or migration path.
     */
    deprecated?: string;
};
type TypeDefWithEnumValueOpts = {
    /**
     * A doc string for the value, if any
     */
    description?: string;
    /**
     * The source map for the enum value definition.
     */
    sourceMap?: SourceMap;
    /**
     * If deprecated, the reason or migration path.
     */
    deprecated?: string;
};
type TypeDefWithFieldOpts = {
    /**
     * A doc string for the field, if any
     */
    description?: string;
    /**
     * The source map for the field definition.
     */
    sourceMap?: SourceMap;
    /**
     * If deprecated, the reason or migration path.
     */
    deprecated?: string;
};
type TypeDefWithInterfaceOpts = {
    description?: string;
    sourceMap?: SourceMap;
};
type TypeDefWithObjectOpts = {
    description?: string;
    sourceMap?: SourceMap;
    deprecated?: string;
};
type TypeDefWithScalarOpts = {
    description?: string;
};
/**
 * Distinguishes the different kinds of TypeDefs.
 */
declare enum TypeDefKind {
    /**
     * A boolean value.
     */
    Boolean = "BOOLEAN_KIND",
    /**
     * A boolean value.
     */
    BooleanKind = "BOOLEAN_KIND",
    /**
     * A GraphQL enum type and its values
     *
     * Always paired with an EnumTypeDef.
     */
    Enum = "ENUM_KIND",
    /**
     * A GraphQL enum type and its values
     *
     * Always paired with an EnumTypeDef.
     */
    EnumKind = "ENUM_KIND",
    /**
     * A float value.
     */
    Float = "FLOAT_KIND",
    /**
     * A float value.
     */
    FloatKind = "FLOAT_KIND",
    /**
     * A graphql input type, used only when representing the core API via TypeDefs.
     */
    Input = "INPUT_KIND",
    /**
     * A graphql input type, used only when representing the core API via TypeDefs.
     */
    InputKind = "INPUT_KIND",
    /**
     * An integer value.
     */
    Integer = "INTEGER_KIND",
    /**
     * An integer value.
     */
    IntegerKind = "INTEGER_KIND",
    /**
     * Always paired with an InterfaceTypeDef.
     *
     * A named type of functions that can be matched+implemented by other objects+interfaces.
     */
    Interface = "INTERFACE_KIND",
    /**
     * Always paired with an InterfaceTypeDef.
     *
     * A named type of functions that can be matched+implemented by other objects+interfaces.
     */
    InterfaceKind = "INTERFACE_KIND",
    /**
     * Always paired with a ListTypeDef.
     *
     * A list of values all having the same type.
     */
    List = "LIST_KIND",
    /**
     * Always paired with a ListTypeDef.
     *
     * A list of values all having the same type.
     */
    ListKind = "LIST_KIND",
    /**
     * Always paired with an ObjectTypeDef.
     *
     * A named type defined in the GraphQL schema, with fields and functions.
     */
    Object = "OBJECT_KIND",
    /**
     * Always paired with an ObjectTypeDef.
     *
     * A named type defined in the GraphQL schema, with fields and functions.
     */
    ObjectKind = "OBJECT_KIND",
    /**
     * A scalar value of any basic kind.
     */
    Scalar = "SCALAR_KIND",
    /**
     * A scalar value of any basic kind.
     */
    ScalarKind = "SCALAR_KIND",
    /**
     * A string value.
     */
    String = "STRING_KIND",
    /**
     * A string value.
     */
    StringKind = "STRING_KIND",
    /**
     * A special kind used to signify that no value is returned.
     *
     * This is used for functions that have no return value. The outer TypeDef specifying this Kind is always Optional, as the Void is never actually represented.
     */
    Void = "VOID_KIND",
    /**
     * A special kind used to signify that no value is returned.
     *
     * This is used for functions that have no return value. The outer TypeDef specifying this Kind is always Optional, as the Void is never actually represented.
     */
    VoidKind = "VOID_KIND"
}
/**
 * Utility function to convert a TypeDefKind value to its name so
 * it can be uses as argument to call a exposed function.
 */
declare function TypeDefKindValueToName(value: TypeDefKind): string;
/**
 * Utility function to convert a TypeDefKind name to its value so
 * it can be properly used inside the module runtime.
 */
declare function TypeDefKindNameToValue(name: string): TypeDefKind;
/**
 * The absence of a value.
 *
 * A Null Void is used as a placeholder for resolvers that do not return anything.
 */
type Void = string & {
    __Void: never;
};
type WorkspaceChecksOpts = {
    /**
     * Only include checks matching the specified patterns
     */
    include?: string[];
    /**
     * Skip checks matching the specified patterns
     */
    skip?: string[];
    /**
     * When true, only return annotated check functions; exclude generate-as-checks
     */
    noGenerate?: boolean;
    /**
     * When true, only return generate-as-checks; exclude annotated check functions
     */
    onlyGenerate?: boolean;
};
type WorkspaceConfigReadOpts = {
    /**
     * Dotted key path (e.g. modules.greeter.source). Empty for full config.
     */
    key?: string;
};
type WorkspaceDirectoryOpts = {
    /**
     * Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
     */
    exclude?: string[];
    /**
     * Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
     */
    include?: string[];
    /**
     * Apply .gitignore filter rules inside the directory.
     */
    gitignore?: boolean;
};
type WorkspaceFindUpOpts = {
    /**
     * Path to start the search from. Relative paths resolve from the workspace cwd; absolute paths resolve from the workspace root.
     */
    from?: string;
};
type WorkspaceGeneratorsOpts = {
    /**
     * Only include generators matching the specified patterns
     */
    include?: string[];
};
type WorkspaceSearchOpts = {
    /**
     * Directory or file paths to search
     */
    paths?: string[];
    /**
     * Glob patterns to match (e.g., "*.md")
     */
    globs?: string[];
    /**
     * The text to match.
     */
    pattern: string;
    /**
     * Interpret the pattern as a literal string instead of a regular expression.
     */
    literal?: boolean;
    /**
     * Enable searching across multiple lines.
     */
    multiline?: boolean;
    /**
     * Allow the . pattern to match newlines in multiline mode.
     */
    dotall?: boolean;
    /**
     * Enable case-insensitive matching.
     */
    insensitive?: boolean;
    /**
     * Honor .gitignore, .ignore, and .rgignore files.
     */
    skipIgnored?: boolean;
    /**
     * Skip hidden files (files starting with .).
     */
    skipHidden?: boolean;
    /**
     * Only return matching files, not lines and content
     */
    filesOnly?: boolean;
    /**
     * Limit the number of results to return
     */
    limit?: number;
};
type WorkspaceServicesOpts = {
    /**
     * Only include services matching the specified patterns
     */
    include?: string[];
};
type WorkspaceWithConfigEnvOpts = {
    /**
     * Write to the workspace config directory at the workspace cwd.
     */
    here?: boolean;
};
type WorkspaceWithConfigValueOpts = {
    /**
     * List value to set. Elements are stored verbatim, with no auto-detection. Mutually exclusive with value.
     */
    values?: string[];
    /**
     * Write to the workspace config directory at the workspace cwd.
     */
    here?: boolean;
};
type WorkspaceWithInitClientOpts = {
    /**
     * SDK-specific init arguments.
     */
    args?: JSON;
    /**
     * Write to the workspace config directory at the workspace cwd.
     */
    here?: boolean;
};
type WorkspaceWithInitModuleOpts = {
    /**
     * Workspace-relative path for the new module.
     */
    path?: string;
    /**
     * Source subpath within the new module.
     */
    source?: string;
    /**
     * Additional include patterns for the module.
     */
    include?: string[];
    /**
     * SDK-specific init arguments.
     */
    args?: JSON;
    /**
     * Write to the workspace config directory at the workspace cwd.
     */
    here?: boolean;
};
type WorkspaceWithModuleOpts = {
    /**
     * Override name for the installed module entry.
     */
    name?: string;
    /**
     * Write to the workspace config directory at the workspace cwd.
     */
    here?: boolean;
};
type WorkspaceWithNewFileOpts = {
    /**
     * Permissions of the new file.
     */
    permissions?: number;
};
type WorkspaceWithSdkOpts = {
    /**
     * Override name for the installed SDK entry.
     */
    name?: string;
    /**
     * Write to the workspace config directory at the workspace cwd.
     */
    here?: boolean;
    /**
     * User-facing SDK name to persist under `[modules.<name>.as-sdk] name = ...`.
     */
    asSdkName?: string;
};
type WorkspaceWithoutConfigEnvOpts = {
    /**
     * Write to the workspace config directory at the workspace cwd.
     */
    here?: boolean;
};
type WorkspaceWithoutConfigValueOpts = {
    /**
     * Write to the workspace config directory at the workspace cwd.
     */
    here?: boolean;
};
type WorkspaceWithoutModuleOpts = {
    /**
     * Write to the workspace config directory at the workspace cwd.
     */
    here?: boolean;
};
type WorkspaceWithoutSdkOpts = {
    /**
     * Write to the workspace config directory at the workspace cwd.
     */
    here?: boolean;
};
type __DirectiveArgsOpts = {
    includeDeprecated?: boolean;
};
type __FieldArgsOpts = {
    includeDeprecated?: boolean;
};
type __TypeEnumValuesOpts = {
    includeDeprecated?: boolean;
};
type __TypeFieldsOpts = {
    includeDeprecated?: boolean;
};
type __TypeInputFieldsOpts = {
    includeDeprecated?: boolean;
};
/**
 * A standardized address to load containers, directories, secrets, and other object types. Address format depends on the type, and is validated at type selection.
 */
declare class Address extends BaseClient {
    private readonly _id?;
    private readonly _value?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _value?: string);
    /**
     * A unique identifier for this Address.
     */
    id: () => Promise<ID>;
    /**
     * Load a container from the address.
     */
    container: () => Container;
    /**
     * Load a directory from the address.
     */
    directory: (opts?: AddressDirectoryOpts) => Directory;
    /**
     * Load a file from the address.
     */
    file: (opts?: AddressFileOpts) => File;
    /**
     * Load a git ref (branch, tag or commit) from the address.
     */
    gitRef: () => GitRef;
    /**
     * Load a git repository from the address.
     */
    gitRepository: () => GitRepository;
    /**
     * Load a secret from the address.
     */
    secret: () => Secret;
    /**
     * Load a service from the address.
     */
    service: () => Service;
    /**
     * Load a local socket from the address.
     */
    socket: () => Socket;
    /**
     * The address value
     */
    value: () => Promise<string>;
    /**
     * Load a volume from the address.
     */
    volume: () => Volume;
}
declare class Binding extends BaseClient {
    private readonly _id?;
    private readonly _asString?;
    private readonly _digest?;
    private readonly _isNull?;
    private readonly _name?;
    private readonly _typeName?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _asString?: string, _digest?: string, _isNull?: boolean, _name?: string, _typeName?: string);
    /**
     * A unique identifier for this Binding.
     */
    id: () => Promise<ID>;
    /**
     * Retrieve the binding value, as type Address
     */
    asAddress: () => Address;
    /**
     * Retrieve the binding value, as type CacheVolume
     */
    asCacheVolume: () => CacheVolume;
    /**
     * Retrieve the binding value, as type Changeset
     */
    asChangeset: () => Changeset;
    /**
     * Retrieve the binding value, as type Check
     */
    asCheck: () => Check;
    /**
     * Retrieve the binding value, as type CheckGroup
     */
    asCheckGroup: () => CheckGroup;
    /**
     * Retrieve the binding value, as type Cloud
     */
    asCloud: () => Cloud;
    /**
     * Retrieve the binding value, as type Container
     */
    asContainer: () => Container;
    /**
     * Retrieve the binding value, as type CurrentModuleAsSDK
     */
    asCurrentModuleAsSDK: () => CurrentModuleAsSDK;
    /**
     * Retrieve the binding value, as type CurrentModuleAsSDKClient
     */
    asCurrentModuleAsSDKClient: () => CurrentModuleAsSDKClient;
    /**
     * Retrieve the binding value, as type CurrentModuleAsSDKModule
     */
    asCurrentModuleAsSDKModule: () => CurrentModuleAsSDKModule;
    /**
     * Retrieve the binding value, as type DiffStat
     */
    asDiffStat: () => DiffStat;
    /**
     * Retrieve the binding value, as type Directory
     */
    asDirectory: () => Directory;
    /**
     * Retrieve the binding value, as type Env
     */
    asEnv: () => Env;
    /**
     * Retrieve the binding value, as type EnvFile
     */
    asEnvFile: () => EnvFile;
    /**
     * Retrieve the binding value, as type File
     */
    asFile: () => File;
    /**
     * Retrieve the binding value, as type Generator
     */
    asGenerator: () => Generator;
    /**
     * Retrieve the binding value, as type GeneratorGroup
     */
    asGeneratorGroup: () => GeneratorGroup;
    /**
     * Retrieve the binding value, as type GitRef
     */
    asGitRef: () => GitRef;
    /**
     * Retrieve the binding value, as type GitRepository
     */
    asGitRepository: () => GitRepository;
    /**
     * Retrieve the binding value, as type HTTPState
     */
    asHTTPState: () => HTTPState;
    /**
     * Retrieve the binding value, as type JSONValue
     */
    asJSONValue: () => JSONValue;
    /**
     * Retrieve the binding value, as type LLMContentBlock
     */
    asLLMContentBlock: () => LLMContentBlock;
    /**
     * Retrieve the binding value, as type LLMMessage
     */
    asLLMMessage: () => LLMMessage;
    /**
     * Retrieve the binding value, as type Module
     */
    asModule: () => Module_;
    /**
     * Retrieve the binding value, as type ModuleConfigClient
     */
    asModuleConfigClient: () => ModuleConfigClient;
    /**
     * Retrieve the binding value, as type ModuleSource
     */
    asModuleSource: () => ModuleSource;
    /**
     * Retrieve the binding value, as type Schema
     */
    asSchema: () => Schema;
    /**
     * Retrieve the binding value, as type SearchResult
     */
    asSearchResult: () => SearchResult;
    /**
     * Retrieve the binding value, as type SearchSubmatch
     */
    asSearchSubmatch: () => SearchSubmatch;
    /**
     * Retrieve the binding value, as type Secret
     */
    asSecret: () => Secret;
    /**
     * Retrieve the binding value, as type Service
     */
    asService: () => Service;
    /**
     * Retrieve the binding value, as type Socket
     */
    asSocket: () => Socket;
    /**
     * Retrieve the binding value, as type Stat
     */
    asStat: () => Stat;
    /**
     * Returns the binding's string value
     */
    asString: () => Promise<string>;
    /**
     * Retrieve the binding value, as type Up
     */
    asUp: () => Up;
    /**
     * Retrieve the binding value, as type UpGroup
     */
    asUpGroup: () => UpGroup;
    /**
     * Retrieve the binding value, as type Volume
     */
    asVolume: () => Volume;
    /**
     * Retrieve the binding value, as type Workspace
     */
    asWorkspace: () => Workspace;
    /**
     * Retrieve the binding value, as type WorkspaceGit
     */
    asWorkspaceGit: () => WorkspaceGit;
    /**
     * Retrieve the binding value, as type WorkspaceMigration
     */
    asWorkspaceMigration: () => WorkspaceMigration;
    /**
     * Retrieve the binding value, as type WorkspaceMigrationStep
     */
    asWorkspaceMigrationStep: () => WorkspaceMigrationStep;
    /**
     * Retrieve the binding value, as type WorkspaceModule
     */
    asWorkspaceModule: () => WorkspaceModule;
    /**
     * Retrieve the binding value, as type WorkspaceModuleSetting
     */
    asWorkspaceModuleSetting: () => WorkspaceModuleSetting;
    /**
     * Retrieve the binding value, as type WorkspaceSDK
     */
    asWorkspaceSDK: () => WorkspaceSDK;
    /**
     * Returns the digest of the binding value
     */
    digest: () => Promise<string>;
    /**
     * Returns true if the binding is null
     */
    isNull: () => Promise<boolean>;
    /**
     * Returns the binding name
     */
    name: () => Promise<string>;
    /**
     * Returns the binding type
     */
    typeName: () => Promise<string>;
}
/**
 * A directory whose contents persist across runs.
 */
declare class CacheVolume extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this CacheVolume.
     */
    id: () => Promise<ID>;
}
/**
 * A comparison between two directories representing changes that can be applied.
 */
declare class Changeset extends BaseClient {
    private readonly _id?;
    private readonly _export?;
    private readonly _isEmpty?;
    private readonly _sync?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _export?: string, _isEmpty?: boolean, _sync?: ID);
    /**
     * A unique identifier for this Changeset.
     */
    id: () => Promise<ID>;
    /**
     * Files and directories that were added in the newer directory.
     */
    addedPaths: () => Promise<string[]>;
    /**
     * The newer/upper snapshot.
     */
    after: () => Directory;
    /**
     * Return a Git-compatible patch of the changes
     */
    asPatch: () => File;
    /**
     * The older/lower snapshot to compare against.
     */
    before: () => Directory;
    /**
     * Structured per-path diff statistics (kind and line counts) for this changeset.
     */
    diffStats: () => Promise<DiffStat[]>;
    /**
     * Applies the diff represented by this changeset to a path on the host.
     * @param path Location of the copied directory (e.g., "logs/").
     */
    export: (path: string) => Promise<string>;
    /**
     * Returns true if the changeset is empty (i.e. there are no changes).
     */
    isEmpty: () => Promise<boolean>;
    /**
     * Return a snapshot containing only the created and modified files
     */
    layer: () => Directory;
    /**
     * Files and directories that existed before and were updated in the newer directory.
     */
    modifiedPaths: () => Promise<string[]>;
    /**
     * Files and directories that were removed. Directories are indicated by a trailing slash, and their child paths are not included.
     */
    removedPaths: () => Promise<string[]>;
    /**
     * Force evaluation in the engine.
     */
    sync: () => Promise<Changeset>;
    /**
     * Add changes to an existing changeset
     *
     * By default the operation will fail in case of conflicts, for instance a file modified in both changesets. The behavior can be adjusted using onConflict argument
     * @param changes Changes to merge into the actual changeset
     * @param opts.onConflict What to do on a merge conflict
     */
    withChangeset: (changes: Changeset, opts?: ChangesetWithChangesetOpts) => Changeset;
    /**
     * Add changes from multiple changesets using git octopus merge strategy
     *
     * This is more efficient than chaining multiple withChangeset calls when merging many changesets.
     *
     * Only FAIL and FAIL_EARLY conflict strategies are supported (octopus merge cannot use -X ours/theirs).
     * @param changes List of changesets to merge into the actual changeset
     * @param opts.onConflict What to do on a merge conflict
     */
    withChangesets: (changes: Changeset[], opts?: ChangesetWithChangesetsOpts) => Changeset;
    /**
     * Call the provided function with current Changeset.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Changeset) => Changeset) => Changeset;
}
declare class Check extends BaseClient {
    private readonly _id?;
    private readonly _checkType?;
    private readonly _completed?;
    private readonly _description?;
    private readonly _name?;
    private readonly _passed?;
    private readonly _resultEmoji?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _checkType?: string, _completed?: boolean, _description?: string, _name?: string, _passed?: boolean, _resultEmoji?: string);
    /**
     * A unique identifier for this Check.
     */
    id: () => Promise<ID>;
    /**
     * The type of check: 'check' for annotated checks, 'generate' for generate-as-checks
     */
    checkType: () => Promise<string>;
    /**
     * Whether the check completed
     */
    completed: () => Promise<boolean>;
    /**
     * The description of the check
     */
    description: () => Promise<string>;
    /**
     * If the check failed, this is the error
     */
    error: () => Error$1;
    /**
     * Return the fully qualified name of the check
     */
    name: () => Promise<string>;
    /**
     * The original module in which the check has been defined
     */
    originalModule: () => Module_;
    /**
     * Whether the check passed
     */
    passed: () => Promise<boolean>;
    /**
     * The path of the check within its module
     */
    path: () => Promise<string[]>;
    /**
     * An emoji representing the result of the check
     */
    resultEmoji: () => Promise<string>;
    /**
     * Execute the check
     */
    run: () => Check;
    /**
     * Call the provided function with current Check.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Check) => Check) => Check;
}
declare class CheckGroup extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this CheckGroup.
     */
    id: () => Promise<ID>;
    /**
     * Return a list of individual checks and their details
     */
    list: () => Promise<Check[]>;
    /**
     * Generate a markdown report
     */
    report: () => File;
    /**
     * Execute all selected checks
     * @param opts.failFast If true, stop running checks as soon as any check fails.
     */
    run: (opts?: CheckGroupRunOpts) => CheckGroup;
    /**
     * Call the provided function with current CheckGroup.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: CheckGroup) => CheckGroup) => CheckGroup;
}
/**
 * An internal persistent filesync mirror.
 */
declare class ClientFilesyncMirror extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this ClientFilesyncMirror.
     */
    id: () => Promise<ID>;
}
/**
 * Dagger Cloud configuration and state
 */
declare class Cloud extends BaseClient {
    private readonly _id?;
    private readonly _traceURL?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _traceURL?: string);
    /**
     * A unique identifier for this Cloud.
     */
    id: () => Promise<ID>;
    /**
     * The trace URL for the current session
     */
    traceURL: () => Promise<string>;
}
/**
 * An OCI-compatible container, also known as a Docker container.
 */
declare class Container extends BaseClient {
    private readonly _id?;
    private readonly _combinedOutput?;
    private readonly _envVariable?;
    private readonly _exists?;
    private readonly _exitCode?;
    private readonly _export?;
    private readonly _exportImage?;
    private readonly _imageRef?;
    private readonly _label?;
    private readonly _platform?;
    private readonly _publish?;
    private readonly _stderr?;
    private readonly _stdout?;
    private readonly _sync?;
    private readonly _up?;
    private readonly _user?;
    private readonly _workdir?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _combinedOutput?: string, _envVariable?: string, _exists?: boolean, _exitCode?: number, _export?: string, _exportImage?: Void, _imageRef?: string, _label?: string, _platform?: Platform, _publish?: string, _stderr?: string, _stdout?: string, _sync?: ID, _up?: Void, _user?: string, _workdir?: string);
    /**
     * A unique identifier for this Container.
     */
    id: () => Promise<ID>;
    /**
     * Turn the container into a Service.
     *
     * Be sure to set any exposed ports before this conversion.
     * @param opts.args Command to run instead of the container's default command (e.g., ["go", "run", "main.go"]).
     *
     * If empty, the container's default command is used.
     * @param opts.useEntrypoint If the container has an entrypoint, prepend it to the args.
     * @param opts.experimentalPrivilegedNesting Provides Dagger access to the executed command.
     * @param opts.insecureRootCapabilities Execute the command with all root capabilities. This is similar to running a command with "sudo" or executing "docker run" with the "--privileged" flag. Containerization does not provide any security guarantees when using this option. It should only be used when absolutely necessary and only with trusted commands.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the args according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     * @param opts.noInit If set, skip the automatic init process injected into containers by default.
     *
     * This should only be used if the user requires that their exec process be the pid 1 process in the container. Otherwise it may result in unexpected behavior.
     */
    asService: (opts?: ContainerAsServiceOpts) => Service;
    /**
     * Package the container state as an OCI image, and return it as a tar archive
     * @param opts.platformVariants Identifiers for other platform specific containers.
     *
     * Used for multi-platform images.
     * @param opts.forcedCompression Force each layer of the image to use the specified compression algorithm.
     *
     * If this is unset, then if a layer already has a compressed blob in the engine's cache, that will be used (this can result in a mix of compression algorithms for different layers). If this is unset and a layer has no compressed blob in the engine's cache, then it will be compressed using Gzip.
     * @param opts.mediaTypes Use the specified media types for the image's layers.
     *
     * Defaults to OCI, which is largely compatible with most recent container runtimes, but Docker may be needed for older runtimes without OCI support.
     */
    asTarball: (opts?: ContainerAsTarballOpts) => File;
    /**
     * The combined buffered standard output and standard error stream of the last executed command
     *
     * Returns an error if no command was executed
     */
    combinedOutput: () => Promise<string>;
    /**
     * Return the container's default arguments.
     */
    defaultArgs: () => Promise<string[]>;
    /**
     * Retrieve a directory from the container's root filesystem
     *
     * Mounts are included.
     * @param path The path of the directory to retrieve (e.g., "./src").
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    directory: (path: string, opts?: ContainerDirectoryOpts) => Directory;
    /**
     * Retrieves this container's configured docker healthcheck.
     */
    dockerHealthcheck: () => HealthcheckConfig;
    /**
     * Return the container's OCI entrypoint.
     */
    entrypoint: () => Promise<string[]>;
    /**
     * Retrieves the value of the specified persistent environment variable.
     * @param name The name of the environment variable to retrieve (e.g., "PATH").
     */
    envVariable: (name: string) => Promise<string>;
    /**
     * Retrieves the list of persistent environment variables configured on the container.
     */
    envVariables: () => Promise<EnvVariable[]>;
    /**
     * check if a file or directory exists
     * @param path Path to check (e.g., "/file.txt").
     * @param opts.expectedType If specified, also validate the type of file (e.g. "REGULAR_TYPE", "DIRECTORY_TYPE", or "SYMLINK_TYPE").
     * @param opts.doNotFollowSymlinks If specified, do not follow symlinks.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    exists: (path: string, opts?: ContainerExistsOpts) => Promise<boolean>;
    /**
     * The exit code of the last executed command
     *
     * Returns an error if no command was executed
     */
    exitCode: () => Promise<number>;
    /**
     * EXPERIMENTAL API! Subject to change/removal at any time.
     *
     * Configures all available GPUs on the host to be accessible to this container.
     *
     * This currently works for Nvidia devices only.
     */
    experimentalWithAllGPUs: () => Container;
    /**
     * EXPERIMENTAL API! Subject to change/removal at any time.
     *
     * Configures the provided list of devices to be accessible to this container.
     *
     * This currently works for Nvidia devices only.
     * @param devices List of devices to be accessible to this container.
     */
    experimentalWithGPU: (devices: string[]) => Container;
    /**
     * Writes the container as an OCI tarball to the destination file path on the host.
     *
     * It can also export platform variants.
     * @param path Host's destination path (e.g., "./tarball").
     *
     * Path can be relative to the engine's workdir or absolute.
     * @param opts.platformVariants Identifiers for other platform specific containers.
     *
     * Used for multi-platform image.
     * @param opts.forcedCompression Force each layer of the exported image to use the specified compression algorithm.
     *
     * If this is unset, then if a layer already has a compressed blob in the engine's cache, that will be used (this can result in a mix of compression algorithms for different layers). If this is unset and a layer has no compressed blob in the engine's cache, then it will be compressed using Gzip.
     * @param opts.mediaTypes Use the specified media types for the exported image's layers.
     *
     * Defaults to OCI, which is largely compatible with most recent container runtimes, but Docker may be needed for older runtimes without OCI support.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    export: (path: string, opts?: ContainerExportOpts) => Promise<string>;
    /**
     * Exports the container as an image to the host's container image store.
     * @param name Name of image to export to in the host's store
     * @param opts.platformVariants Identifiers for other platform specific containers.
     *
     * Used for multi-platform image.
     * @param opts.forcedCompression Force each layer of the exported image to use the specified compression algorithm.
     *
     * If this is unset, then if a layer already has a compressed blob in the engine's cache, that will be used (this can result in a mix of compression algorithms for different layers). If this is unset and a layer has no compressed blob in the engine's cache, then it will be compressed using Gzip.
     * @param opts.mediaTypes Use the specified media types for the exported image's layers.
     *
     * Defaults to OCI, which is largely compatible with most recent container runtimes, but Docker may be needed for older runtimes without OCI support.
     */
    exportImage: (name: string, opts?: ContainerExportImageOpts) => Promise<void>;
    /**
     * Retrieves the list of exposed ports.
     *
     * This includes ports already exposed by the image, even if not explicitly added with dagger.
     */
    exposedPorts: () => Promise<Port[]>;
    /**
     * Retrieves a file at the given path.
     *
     * Mounts are included.
     * @param path The path of the file to retrieve (e.g., "./README.md").
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    file: (path: string, opts?: ContainerFileOpts) => File;
    /**
     * Download a container image, and apply it to the container state. All previous state will be lost.
     * @param address Address of the container image to download, in standard OCI ref format. Example:"registry.dagger.io/engine:latest"
     * @param opts.registryService Service to use as the registry endpoint for the image address.
     *
     * The service will be started only for this pull.
     * @param opts.protocol Protocol to use for registry communication.
     *
     * Defaults to "HTTPS". Use "HTTP" only for plain HTTP registries.
     * @param opts.insecureSkipTLSVerify Allow HTTPS registry communication without verifying the server certificate.
     */
    from: (address: string, opts?: ContainerFromOpts) => Container;
    /**
     * The unique image reference which can only be retrieved immediately after the 'Container.From' call.
     */
    imageRef: () => Promise<string>;
    /**
     * Reads the container from an OCI tarball.
     * @param source File to read the container from.
     * @param opts.tag Identifies the tag to import from the archive, if the archive bundles multiple tags.
     */
    import_: (source: File, opts?: ContainerImportOpts) => Container;
    /**
     * Retrieves the value of the specified label.
     * @param name The name of the label (e.g., "org.opencontainers.artifact.created").
     */
    label: (name: string) => Promise<string>;
    /**
     * Retrieves the list of labels passed to container.
     */
    labels: () => Promise<Label[]>;
    /**
     * Returns the image layer or configuration blob with the given digest as a File.
     * @param id Digest of the layer or configuration blob (e.g. "sha256:abc123...").
     * @param opts.forcedCompression Force each layer of the image to use the specified compression algorithm.
     *
     * If this is unset, then if a layer already has a compressed blob in the engine's cache, that will be used (this can result in a mix of compression algorithms for different layers). If this is unset and a layer has no compressed blob in the engine's cache, then it will be compressed using Gzip.
     * @param opts.mediaTypes Media types to use for image layers. Defaults to OCI.
     */
    layer: (id: string, opts?: ContainerLayerOpts) => File;
    /**
     * Computes and returns the manifest for this container as a File.
     * @param opts.forcedCompression Force each layer of the image to use the specified compression algorithm.
     *
     * If this is unset, then if a layer already has a compressed blob in the engine's cache, that will be used (this can result in a mix of compression algorithms for different layers). If this is unset and a layer has no compressed blob in the engine's cache, then it will be compressed using Gzip.
     * @param opts.mediaTypes Media types to use for image layers. Defaults to OCI.
     */
    manifest: (opts?: ContainerManifestOpts) => File;
    /**
     * Retrieves the list of paths where a directory is mounted.
     */
    mounts: () => Promise<string[]>;
    /**
     * The platform this container executes and publishes as.
     */
    platform: () => Promise<Platform>;
    /**
     * Package the container state as an OCI image, and publish it to a registry
     *
     * Returns the fully qualified address of the published image, with digest
     * @param address The OCI address to publish to
     *
     * Same format as "docker push". Example: "registry.example.com/user/repo:tag"
     * @param opts.platformVariants Identifiers for other platform specific containers.
     *
     * Used for multi-platform image.
     * @param opts.forcedCompression Force each layer of the published image to use the specified compression algorithm.
     *
     * If this is unset, then if a layer already has a compressed blob in the engine's cache, that will be used (this can result in a mix of compression algorithms for different layers). If this is unset and a layer has no compressed blob in the engine's cache, then it will be compressed using Gzip.
     * @param opts.mediaTypes Use the specified media types for the published image's layers.
     *
     * Defaults to "OCI", which is compatible with most recent registries, but "Docker" may be needed for older registries without OCI support.
     * @param opts.registryService Service to use as the registry endpoint for the image address.
     *
     * The service will be started only for this push.
     * @param opts.protocol Protocol to use for registry communication.
     *
     * Defaults to "HTTPS". Use "HTTP" only for plain HTTP registries.
     * @param opts.insecureSkipTLSVerify Allow HTTPS registry communication without verifying the server certificate.
     */
    publish: (address: string, opts?: ContainerPublishOpts) => Promise<string>;
    /**
     * Return a snapshot of the container's root filesystem. The snapshot can be modified then written back using withRootfs. Use that method for filesystem modifications.
     */
    rootfs: () => Directory;
    /**
     * Return file status
     * @param path Path to check (e.g., "/file.txt").
     * @param opts.doNotFollowSymlinks If specified, do not follow symlinks.
     */
    stat: (path: string, opts?: ContainerStatOpts) => Stat;
    /**
     * The buffered standard error stream of the last executed command
     *
     * Returns an error if no command was executed
     */
    stderr: () => Promise<string>;
    /**
     * The buffered standard output stream of the last executed command
     *
     * Returns an error if no command was executed
     */
    stdout: () => Promise<string>;
    /**
     * Forces evaluation of the pipeline in the engine.
     *
     * It doesn't run the default command if no exec has been set.
     */
    sync: () => Promise<Container>;
    /**
     * Opens an interactive terminal for this container using its configured default terminal command if not overridden by args (or sh as a fallback default).
     * @param opts.cmd If set, override the container's default terminal command and invoke these command arguments instead.
     * @param opts.experimentalPrivilegedNesting Provides Dagger access to the executed command.
     * @param opts.insecureRootCapabilities Execute the command with all root capabilities. This is similar to running a command with "sudo" or executing "docker run" with the "--privileged" flag. Containerization does not provide any security guarantees when using this option. It should only be used when absolutely necessary and only with trusted commands.
     */
    terminal: (opts?: ContainerTerminalOpts) => Container;
    /**
     * Starts a Service and creates a tunnel that forwards traffic from the caller's network to that service.
     *
     * Be sure to set any exposed ports before calling this api.
     * @param opts.random Bind each tunnel port to a random port on the host.
     * @param opts.ports List of frontend/backend port mappings to forward.
     *
     * Frontend is the port accepting traffic on the host, backend is the service port.
     * @param opts.args Command to run instead of the container's default command (e.g., ["go", "run", "main.go"]).
     *
     * If empty, the container's default command is used.
     * @param opts.useEntrypoint If the container has an entrypoint, prepend it to the args.
     * @param opts.experimentalPrivilegedNesting Provides Dagger access to the executed command.
     * @param opts.insecureRootCapabilities Execute the command with all root capabilities. This is similar to running a command with "sudo" or executing "docker run" with the "--privileged" flag. Containerization does not provide any security guarantees when using this option. It should only be used when absolutely necessary and only with trusted commands.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the args according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     * @param opts.noInit If set, skip the automatic init process injected into containers by default.
     *
     * This should only be used if the user requires that their exec process be the pid 1 process in the container. Otherwise it may result in unexpected behavior.
     */
    up: (opts?: ContainerUpOpts) => Promise<void>;
    /**
     * Retrieves the user to be set for all commands.
     */
    user: () => Promise<string>;
    /**
     * Retrieves this container plus the given OCI annotation.
     * @param name The name of the annotation.
     * @param value The value of the annotation.
     */
    withAnnotation: (name: string, value: string) => Container;
    /**
     * Configures default arguments for future commands. Like CMD in Dockerfile.
     * @param args Arguments to prepend to future executions (e.g., ["-v", "--no-cache"]).
     */
    withDefaultArgs: (args: string[]) => Container;
    /**
     * Set the default command to invoke for the container's terminal API.
     * @param args The args of the command.
     * @param opts.experimentalPrivilegedNesting Provides Dagger access to the executed command.
     * @param opts.insecureRootCapabilities Execute the command with all root capabilities. This is similar to running a command with "sudo" or executing "docker run" with the "--privileged" flag. Containerization does not provide any security guarantees when using this option. It should only be used when absolutely necessary and only with trusted commands.
     */
    withDefaultTerminalCmd: (args: string[], opts?: ContainerWithDefaultTerminalCmdOpts) => Container;
    /**
     * Return a new container snapshot, with a directory added to its filesystem
     * @param path Location of the written directory (e.g., "/tmp/directory").
     * @param source Identifier of the directory to write
     * @param opts.exclude Patterns to exclude in the written directory (e.g. ["node_modules/**", ".gitignore", ".git/"]).
     * @param opts.include Patterns to include in the written directory (e.g. ["*.go", "go.mod", "go.sum"]).
     * @param opts.gitignore Apply .gitignore rules when writing the directory.
     * @param opts.owner A user:group to set for the directory and its contents.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     * @param opts.inheritOwner Set the owner to the container's current user.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    withDirectory: (path: string, source: Directory, opts?: ContainerWithDirectoryOpts) => Container;
    /**
     * Retrieves this container with the specificed docker healtcheck command set.
     * @param args Healthcheck command to execute. Example: ["go", "run", "main.go"].
     * @param opts.shell When true, command must be a single element, which is run using the container's shell
     * @param opts.interval Interval between running healthcheck. Example: "30s"
     * @param opts.timeout Healthcheck timeout. Example: "3s"
     * @param opts.startPeriod StartPeriod allows for failures during this initial startup period which do not count towards maximum number of retries. Example: "0s"
     * @param opts.startInterval StartInterval configures the duration between checks during the startup phase. Example: "5s"
     * @param opts.retries The maximum number of consecutive failures before the container is marked as unhealthy. Example: "3"
     */
    withDockerHealthcheck: (args: string[], opts?: ContainerWithDockerHealthcheckOpts) => Container;
    /**
     * Set an OCI-style entrypoint. It will be included in the container's OCI configuration. Note, withExec ignores the entrypoint by default.
     * @param args Arguments of the entrypoint. Example: ["go", "run"].
     * @param opts.keepDefaultArgs Don't reset the default arguments when setting the entrypoint. By default it is reset, since entrypoint and default args are often tightly coupled.
     */
    withEntrypoint: (args: string[], opts?: ContainerWithEntrypointOpts) => Container;
    /**
     * Export environment variables from an env-file to the container.
     * @param source Identifier of the envfile
     */
    withEnvFileVariables: (source: EnvFile) => Container;
    /**
     * Set a new environment variable in the container.
     * @param name Name of the environment variable (e.g., "HOST").
     * @param value Value of the environment variable. (e.g., "localhost").
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value according to the current environment variables defined in the container (e.g. "/opt/bin:$PATH").
     */
    withEnvVariable: (name: string, value: string, opts?: ContainerWithEnvVariableOpts) => Container;
    /**
     * Raise an error.
     * @param err Message of the error to raise. If empty, the error will be ignored.
     */
    withError: (err: string) => Container;
    /**
     * Execute a command in the container, and return a new snapshot of the container state after execution.
     * @param args Command to execute. Must be valid exec() arguments, not a shell command. Example: ["go", "run", "main.go"].
     *
     * To run a shell command, execute the shell and pass the shell command as argument. Example: ["sh", "-c", "ls -l | grep foo"]
     *
     * Defaults to the container's default arguments (see "defaultArgs" and "withDefaultArgs").
     * @param opts.useEntrypoint Apply the OCI entrypoint, if present, by prepending it to the args. Ignored by default.
     * @param opts.stdin Content to write to the command's standard input. Example: "Hello world")
     * @param opts.redirectStdin Redirect the command's standard input from a file in the container. Example: "./stdin.txt"
     * @param opts.redirectStdout Redirect the command's standard output to a file in the container. Example: "./stdout.txt"
     * @param opts.redirectStderr Redirect the command's standard error to a file in the container. Example: "./stderr.txt"
     * @param opts.expect Exit codes this command is allowed to exit with without error
     * @param opts.experimentalPrivilegedNesting Provides Dagger access to the executed command.
     * @param opts.insecureRootCapabilities Execute the command with all root capabilities. Like --privileged in Docker
     *
     * DANGER: this grants the command full access to the host system. Only use when 1) you trust the command being executed and 2) you specifically need this level of access.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the args according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     * @param opts.noInit Skip the automatic init process injected into containers by default.
     *
     * Only use this if you specifically need the command to be pid 1 in the container. Otherwise it may result in unexpected behavior. If you're not sure, you don't need this.
     */
    withExec: (args: string[], opts?: ContainerWithExecOpts) => Container;
    /**
     * Expose a network port. Like EXPOSE in Dockerfile (but with healthcheck support)
     *
     * Exposed ports serve two purposes:
     *
     * - For health checks and introspection, when running services
     *
     * - For setting the EXPOSE OCI field when publishing the container
     * @param port Port number to expose. Example: 8080
     * @param opts.protocol Network protocol. Example: "tcp"
     * @param opts.description Port description. Example: "payment API endpoint"
     * @param opts.experimentalSkipHealthcheck Skip the health check when run as a service.
     */
    withExposedPort: (port: number, opts?: ContainerWithExposedPortOpts) => Container;
    /**
     * Return a container snapshot with a file added
     * @param path Path of the new file. Example: "/path/to/new-file.txt"
     * @param source File to add
     * @param opts.permissions Permissions of the new file. Example: 0600
     * @param opts.owner A user:group to set for the file.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     * @param opts.inheritOwner Set the owner to the container's current user.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    withFile: (path: string, source: File, opts?: ContainerWithFileOpts) => Container;
    /**
     * Retrieves this container plus the contents of the given files copied to the given path.
     * @param path Location where copied files should be placed (e.g., "/src").
     * @param sources Identifiers of the files to copy.
     * @param opts.permissions Permission given to the copied files (e.g., 0600).
     * @param opts.owner A user:group to set for the files.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     * @param opts.inheritOwner Set the owner to the container's current user.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    withFiles: (path: string, sources: File[], opts?: ContainerWithFilesOpts) => Container;
    /**
     * Retrieves this container plus the given label.
     * @param name The name of the label (e.g., "org.opencontainers.artifact.created").
     * @param value The value of the label (e.g., "2023-01-01T00:00:00Z").
     */
    withLabel: (name: string, value: string) => Container;
    /**
     * Retrieves this container plus a cache volume mounted at the given path.
     * @param path Location of the cache directory (e.g., "/root/.npm").
     * @param cache Identifier of the cache volume to mount.
     * @param opts.source Identifier of the directory to use as the cache volume's root.
     * @param opts.sharing Sharing mode of the cache volume.
     * @param opts.owner A user:group to set for the mounted cache directory.
     *
     * Note that this changes the ownership of the specified mount along with the initial filesystem provided by source (if any). It does not have any effect if/when the cache has already been created.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     * @param opts.inheritOwner Set the owner to the container's current user.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    withMountedCache: (path: string, cache: CacheVolume, opts?: ContainerWithMountedCacheOpts) => Container;
    /**
     * Retrieves this container plus a directory mounted at the given path.
     * @param path Location of the mounted directory (e.g., "/mnt/directory").
     * @param source Identifier of the mounted directory.
     * @param opts.owner A user:group to set for the mounted directory and its contents.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     * @param opts.inheritOwner Set the owner to the container's current user.
     * @param opts.readOnly Mount the directory read-only.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    withMountedDirectory: (path: string, source: Directory, opts?: ContainerWithMountedDirectoryOpts) => Container;
    /**
     * Retrieves this container plus a file mounted at the given path.
     * @param path Location of the mounted file (e.g., "/tmp/file.txt").
     * @param source Identifier of the mounted file.
     * @param opts.owner A user or user:group to set for the mounted file.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     * @param opts.inheritOwner Set the owner to the container's current user.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    withMountedFile: (path: string, source: File, opts?: ContainerWithMountedFileOpts) => Container;
    /**
     * Retrieves this container plus a secret mounted into a file at the given path.
     * @param path Location of the secret file (e.g., "/tmp/secret.txt").
     * @param source Identifier of the secret to mount.
     * @param opts.owner A user:group to set for the mounted secret.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     * @param opts.inheritOwner Set the owner to the container's current user.
     * @param opts.mode Permission given to the mounted secret (e.g., 0600).
     *
     * This option requires an owner to be set to be active.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    withMountedSecret: (path: string, source: Secret, opts?: ContainerWithMountedSecretOpts) => Container;
    /**
     * Retrieves this container plus a temporary directory mounted at the given path. Any writes will be ephemeral to a single withExec call; they will not be persisted to subsequent withExecs.
     * @param path Location of the temporary directory (e.g., "/tmp/temp_dir").
     * @param opts.size Size of the temporary directory in bytes.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    withMountedTemp: (path: string, opts?: ContainerWithMountedTempOpts) => Container;
    /**
     * Retrieves this container plus a volume mounted at the given path.
     * @param path Location of the volume mount (e.g., "/mnt/volume").
     * @param volume Identifier of the volume to mount.
     * @param opts.readOnly Mount the volume read-only.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    withMountedVolume: (path: string, volume: Volume, opts?: ContainerWithMountedVolumeOpts) => Container;
    /**
     * Return a new container snapshot, with a file added to its filesystem with text content
     * @param path Path of the new file. May be relative or absolute. Example: "README.md" or "/etc/profile"
     * @param contents Contents of the new file. Example: "Hello world!"
     * @param opts.permissions Permissions of the new file. Example: 0600
     * @param opts.owner A user:group to set for the file.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     * @param opts.inheritOwner Set the owner to the container's current user.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    withNewFile: (path: string, contents: string, opts?: ContainerWithNewFileOpts) => Container;
    /**
     * Attach credentials for future publishing to a registry. Use in combination with publish
     * @param address The image address that needs authentication. Same format as "docker push". Example: "registry.dagger.io/dagger:latest"
     * @param username The username to authenticate with. Example: "alice"
     * @param secret The API key, password or token to authenticate to this registry
     */
    withRegistryAuth: (address: string, username: string, secret: Secret) => Container;
    /**
     * Change the container's root filesystem. The previous root filesystem will be lost.
     * @param directory The new root filesystem.
     */
    withRootfs: (directory: Directory) => Container;
    /**
     * Set a new environment variable, using a secret value
     * @param name Name of the secret variable (e.g., "API_SECRET").
     * @param secret Identifier of the secret value.
     */
    withSecretVariable: (name: string, secret: Secret) => Container;
    /**
     * Establish a runtime dependency from a container to a network service.
     *
     * The service will be started automatically when needed and detached when it is no longer needed, executing the default command if none is set.
     *
     * The service will be reachable from the container via the provided hostname alias.
     *
     * The service dependency will also convey to any files or directories produced by the container.
     * @param alias Hostname that will resolve to the target service (only accessible from within this container)
     * @param service The target service
     */
    withServiceBinding: (alias: string, service: Service) => Container;
    /**
     * Return a snapshot with a symlink
     * @param target Location of the file or directory to link to (e.g., "/existing/file").
     * @param linkName Location where the symbolic link will be created (e.g., "/new-file-link").
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    withSymlink: (target: string, linkName: string, opts?: ContainerWithSymlinkOpts) => Container;
    /**
     * Retrieves this container plus a socket forwarded to the given Unix socket path.
     * @param path Location of the forwarded Unix socket (e.g., "/tmp/socket").
     * @param source Identifier of the socket to forward.
     * @param opts.owner A user:group to set for the mounted socket.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     * @param opts.inheritOwner Set the owner to the container's current user.
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    withUnixSocket: (path: string, source: Socket, opts?: ContainerWithUnixSocketOpts) => Container;
    /**
     * Retrieves this container with a different command user.
     * @param name The user to set (e.g., "root").
     */
    withUser: (name: string) => Container;
    /**
     * Set a new non-secret environment variable for future execs without invalidating exec cache when only its value changes.
     *
     * This is an expert-only escape hatch. If a volatile value affects observable exec results, stale cached results may be reused.
     * @param name Name of the volatile variable (e.g., "CI_RUN_ID").
     * @param value Value of the volatile variable.
     */
    withVolatileVariable: (name: string, value: string) => Container;
    /**
     * Change the container's working directory. Like WORKDIR in Dockerfile.
     * @param path The path to set as the working directory (e.g., "/app").
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    withWorkdir: (path: string, opts?: ContainerWithWorkdirOpts) => Container;
    /**
     * Retrieves this container minus the given OCI annotation.
     * @param name The name of the annotation.
     */
    withoutAnnotation: (name: string) => Container;
    /**
     * Remove the container's default arguments.
     */
    withoutDefaultArgs: () => Container;
    /**
     * Return a new container snapshot, with a directory removed from its filesystem
     * @param path Location of the directory to remove (e.g., ".github/").
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    withoutDirectory: (path: string, opts?: ContainerWithoutDirectoryOpts) => Container;
    /**
     * Retrieves this container without a configured docker healtcheck command.
     */
    withoutDockerHealthcheck: () => Container;
    /**
     * Reset the container's OCI entrypoint.
     * @param opts.keepDefaultArgs Don't remove the default arguments when unsetting the entrypoint.
     */
    withoutEntrypoint: (opts?: ContainerWithoutEntrypointOpts) => Container;
    /**
     * Retrieves this container minus the given environment variable.
     * @param name The name of the environment variable (e.g., "HOST").
     */
    withoutEnvVariable: (name: string) => Container;
    /**
     * Unexpose a previously exposed port.
     * @param port Port number to unexpose
     * @param opts.protocol Port protocol to unexpose
     */
    withoutExposedPort: (port: number, opts?: ContainerWithoutExposedPortOpts) => Container;
    /**
     * Retrieves this container with the file at the given path removed.
     * @param path Location of the file to remove (e.g., "/file.txt").
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    withoutFile: (path: string, opts?: ContainerWithoutFileOpts) => Container;
    /**
     * Return a new container spanshot with specified files removed
     * @param paths Paths of the files to remove. Example: ["foo.txt, "/root/.ssh/config"
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of paths according to the current environment variables defined in the container (e.g. "/$VAR/foo.txt").
     */
    withoutFiles: (paths: string[], opts?: ContainerWithoutFilesOpts) => Container;
    /**
     * Retrieves this container minus the given environment label.
     * @param name The name of the label to remove (e.g., "org.opencontainers.artifact.created").
     */
    withoutLabel: (name: string) => Container;
    /**
     * Retrieves this container after unmounting everything at the given path.
     * @param path Location of the cache directory (e.g., "/root/.npm").
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    withoutMount: (path: string, opts?: ContainerWithoutMountOpts) => Container;
    /**
     * Retrieves this container without the registry authentication of a given address.
     * @param address Registry's address to remove the authentication from.
     *
     * Formatted as [host]/[user]/[repo]:[tag] (e.g. docker.io/dagger/dagger:main).
     */
    withoutRegistryAuth: (address: string) => Container;
    /**
     * Retrieves this container minus the given environment variable containing the secret.
     * @param name The name of the environment variable (e.g., "HOST").
     */
    withoutSecretVariable: (name: string) => Container;
    /**
     * Retrieves this container with a previously added Unix socket removed.
     * @param path Location of the socket to remove (e.g., "/tmp/socket").
     * @param opts.expand Replace "${VAR}" or "$VAR" in the value of path according to the current environment variables defined in the container (e.g. "/$VAR/foo").
     */
    withoutUnixSocket: (path: string, opts?: ContainerWithoutUnixSocketOpts) => Container;
    /**
     * Retrieves this container with an unset command user.
     *
     * Should default to root.
     */
    withoutUser: () => Container;
    /**
     * Retrieves this container minus the given volatile environment variable.
     * @param name The name of the volatile environment variable (e.g., "CI_RUN_ID").
     */
    withoutVolatileVariable: (name: string) => Container;
    /**
     * Unset the container's working directory.
     *
     * Should default to "/".
     */
    withoutWorkdir: () => Container;
    /**
     * Retrieves the working directory for all commands.
     */
    workdir: () => Promise<string>;
    /**
     * Call the provided function with current Container.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Container) => Container) => Container;
}
/**
 * Reflective module API provided to functions at runtime.
 */
declare class CurrentModule extends BaseClient {
    private readonly _id?;
    private readonly _name?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _name?: string);
    /**
     * A unique identifier for this CurrentModule.
     */
    id: () => Promise<ID>;
    /**
     * Treat the currently executing module as an SDK installed in the given workspace, exposing the modules and clients it manages.
     *
     * Errors if the current module is not installed as an SDK in this workspace.
     * @param opts.workspace The workspace to resolve SDK-role data against. Defaults to the current workspace.
     */
    asSDK: (opts?: CurrentModuleAsSdkOpts) => CurrentModuleAsSDK;
    /**
     * The dependencies of the module.
     */
    dependencies: () => Promise<Module_[]>;
    /**
     * The generated files and directories made on top of the module source's context directory.
     */
    generatedContextDirectory: () => Directory;
    /**
     * Return all generators defined by the module
     * @param opts.include Only include generators matching the specified patterns
     * @experimental
     */
    generators: (opts?: CurrentModuleGeneratorsOpts) => GeneratorGroup;
    /**
     * The name of the module being executed in
     */
    name: () => Promise<string>;
    /**
     * The directory containing the module's source code loaded into the engine (plus any generated code that may have been created).
     */
    source: () => Directory;
    /**
     * Load a directory from the module's scratch working directory, including any changes that may have been made to it during module function execution.
     * @param path Location of the directory to access (e.g., ".").
     * @param opts.exclude Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
     * @param opts.include Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
     * @param opts.gitignore Apply .gitignore filter rules inside the directory
     */
    workdir: (path: string, opts?: CurrentModuleWorkdirOpts) => Directory;
    /**
     * Load a file from the module's scratch working directory, including any changes that may have been made to it during module function execution.Load a file from the module's scratch working directory, including any changes that may have been made to it during module function execution.
     * @param path Location of the file to retrieve (e.g., "README.md").
     */
    workdirFile: (path: string) => File;
}
/**
 * The SDK-role data for the currently executing module, as installed in the active workspace.
 */
declare class CurrentModuleAsSDK extends BaseClient {
    private readonly _id?;
    private readonly _name?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _name?: string);
    /**
     * A unique identifier for this CurrentModuleAsSDK.
     */
    id: () => Promise<ID>;
    /**
     * The generated clients this SDK produces in the workspace.
     */
    clients: () => Promise<CurrentModuleAsSDKClient[]>;
    /**
     * The workspace-local modules this SDK authors and manages.
     */
    modules: () => Promise<CurrentModuleAsSDKModule[]>;
    /**
     * The user-facing name of this SDK in the workspace.
     */
    name: () => Promise<string>;
}
/**
 * A generated client the current SDK produces in the workspace.
 */
declare class CurrentModuleAsSDKClient extends BaseClient {
    private readonly _id?;
    private readonly _module?;
    private readonly _path?;
    private readonly _pin?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _module?: string, _path?: string, _pin?: string);
    /**
     * A unique identifier for this CurrentModuleAsSDKClient.
     */
    id: () => Promise<ID>;
    /**
     * The module the client is bound to (workspace-relative path or canonical ref).
     */
    module_: () => Promise<string>;
    /**
     * The resolved module source this client is bound to, including its dependency closure and pinned version.
     */
    moduleSource: () => ModuleSource;
    /**
     * Workspace-root-relative path of the generated client.
     */
    path: () => Promise<string>;
    /**
     * The pinned version of the bound module, if any.
     */
    pin: () => Promise<string>;
}
/**
 * A workspace-local module managed by the current SDK.
 */
declare class CurrentModuleAsSDKModule extends BaseClient {
    private readonly _id?;
    private readonly _path?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _path?: string);
    /**
     * A unique identifier for this CurrentModuleAsSDKModule.
     */
    id: () => Promise<ID>;
    /**
     * Workspace-root-relative path to the managed module.
     */
    path: () => Promise<string>;
}
declare class DiffStat extends BaseClient {
    private readonly _id?;
    private readonly _addedLines?;
    private readonly _kind?;
    private readonly _oldPath?;
    private readonly _path?;
    private readonly _removedLines?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _addedLines?: number, _kind?: DiffStatKind, _oldPath?: string, _path?: string, _removedLines?: number);
    /**
     * A unique identifier for this DiffStat.
     */
    id: () => Promise<ID>;
    /**
     * Number of added lines for this path.
     */
    addedLines: () => Promise<number>;
    /**
     * Type of change.
     */
    kind: () => Promise<DiffStatKind>;
    /**
     * Previous path of the file, set only for renames.
     */
    oldPath: () => Promise<string>;
    /**
     * Path of the changed file or directory.
     */
    path: () => Promise<string>;
    /**
     * Number of removed lines for this path.
     */
    removedLines: () => Promise<number>;
}
/**
 * A directory.
 */
declare class Directory extends BaseClient {
    private readonly _id?;
    private readonly _digest?;
    private readonly _exists?;
    private readonly _export?;
    private readonly _findUp?;
    private readonly _name?;
    private readonly _sync?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _digest?: string, _exists?: boolean, _export?: string, _findUp?: string, _name?: string, _sync?: ID);
    /**
     * A unique identifier for this Directory.
     */
    id: () => Promise<ID>;
    /**
     * Converts this directory to a local git repository
     */
    asGit: () => GitRepository;
    /**
     * Load the directory as a Dagger module source
     * @param opts.sourceRootPath An optional subpath of the directory which contains the module's configuration file.
     *
     * If not set, the module source code is loaded from the root of the directory.
     */
    asModule: (opts?: DirectoryAsModuleOpts) => Module_;
    /**
     * Load the directory as a Dagger module source
     * @param opts.sourceRootPath An optional subpath of the directory which contains the module's configuration file.
     *
     * If not set, the module source code is loaded from the root of the directory.
     */
    asModuleSource: (opts?: DirectoryAsModuleSourceOpts) => ModuleSource;
    /**
     * Creates a synthetic workspace from this directory.
     * @param opts.cwd Current working directory inside the workspace root. Defaults to the workspace root.
     */
    asWorkspace: (opts?: DirectoryAsWorkspaceOpts) => Workspace;
    /**
     * Return the difference between this directory and another directory, typically an older snapshot.
     *
     * The difference is encoded as a changeset, which also tracks removed files, and can be applied to other directories.
     * @param from The base directory snapshot to compare against
     */
    changes: (from: Directory) => Changeset;
    /**
     * Change the owner of the directory contents recursively.
     * @param path Path of the directory to change ownership of (e.g., "/").
     * @param owner A user:group to set for the mounted directory and its contents.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    chown: (path: string, owner: string) => Directory;
    /**
     * Return the difference between this directory and an another directory. The difference is encoded as a directory.
     * @param other The directory to compare against
     */
    diff: (other: Directory) => Directory;
    /**
     * Return the directory's digest. The format of the digest is not guaranteed to be stable between releases of Dagger. It is guaranteed to be stable between invocations of the same Dagger engine.
     */
    digest: () => Promise<string>;
    /**
     * Retrieves a directory at the given path.
     * @param path Location of the directory to retrieve. Example: "/src"
     */
    directory: (path: string) => Directory;
    /**
     * Use Dockerfile compatibility to build a container from this directory. Only use this function for Dockerfile compatibility. Otherwise use the native Container type directly, it is feature-complete and supports all Dockerfile features.
     * @param opts.dockerfile Path to the Dockerfile to use (e.g., "frontend.Dockerfile").
     * @param opts.platform The platform to build.
     * @param opts.buildArgs Build arguments to use in the build.
     * @param opts.target Target build stage to build.
     * @param opts.secrets Secrets to pass to the build.
     *
     * They will be mounted at /run/secrets/[secret-name].
     * @param opts.noInit If set, skip the automatic init process injected into containers created by RUN statements.
     *
     * This should only be used if the user requires that their exec processes be the pid 1 process in the container. Otherwise it may result in unexpected behavior.
     * @param opts.ssh A socket to use for SSH authentication during the build
     *
     * (e.g., for Dockerfile RUN --mount=type=ssh instructions).
     *
     * Typically obtained via host.unixSocket() pointing to the SSH_AUTH_SOCK.
     */
    dockerBuild: (opts?: DirectoryDockerBuildOpts) => Container;
    /**
     * Returns a list of files and directories at the given path.
     * @param opts.path Location of the directory to look at (e.g., "/src").
     */
    entries: (opts?: DirectoryEntriesOpts) => Promise<string[]>;
    /**
     * check if a file or directory exists
     * @param path Path to check (e.g., "/file.txt").
     * @param opts.expectedType If specified, also validate the type of file (e.g. "REGULAR_TYPE", "DIRECTORY_TYPE", or "SYMLINK_TYPE").
     * @param opts.doNotFollowSymlinks If specified, do not follow symlinks.
     */
    exists: (path: string, opts?: DirectoryExistsOpts) => Promise<boolean>;
    /**
     * Writes the contents of the directory to a path on the host.
     * @param path Location of the copied directory (e.g., "logs/").
     * @param opts.wipe If true, then the host directory will be wiped clean before exporting so that it exactly matches the directory being exported; this means it will delete any files on the host that aren't in the exported dir. If false (the default), the contents of the directory will be merged with any existing contents of the host directory, leaving any existing files on the host that aren't in the exported directory alone.
     */
    export: (path: string, opts?: DirectoryExportOpts) => Promise<string>;
    /**
     * Retrieve a file at the given path.
     * @param path Location of the file to retrieve (e.g., "README.md").
     */
    file: (path: string) => File;
    /**
     * Return a snapshot with some paths included or excluded
     * @param opts.exclude If set, paths matching one of these glob patterns is excluded from the new snapshot. Example: ["node_modules/", ".git*", ".env"]
     * @param opts.include If set, only paths matching one of these glob patterns is included in the new snapshot. Example: (e.g., ["app/", "package.*"]).
     * @param opts.gitignore If set, apply .gitignore rules when filtering the directory.
     */
    filter: (opts?: DirectoryFilterOpts) => Directory;
    /**
     * Search up the directory tree for a file or directory, and return its path. If no match, return null
     * @param name The name of the file or directory to search for
     * @param start The path to start the search from
     */
    findUp: (name: string, start: string) => Promise<string>;
    /**
     * Returns a list of files and directories that matche the given pattern.
     * @param pattern Pattern to match (e.g., "*.md").
     */
    glob: (pattern: string) => Promise<string[]>;
    /**
     * Returns the name of the directory.
     */
    name: () => Promise<string>;
    /**
     * Searches for content matching the given regular expression or literal string.
     *
     * Uses Rust regex syntax; escape literal ., [, ], {, }, | with backslashes.
     * @param opts.paths Directory or file paths to search
     * @param opts.globs Glob patterns to match (e.g., "*.md")
     * @param opts.pattern The text to match.
     * @param opts.literal Interpret the pattern as a literal string instead of a regular expression.
     * @param opts.multiline Enable searching across multiple lines.
     * @param opts.dotall Allow the . pattern to match newlines in multiline mode.
     * @param opts.insensitive Enable case-insensitive matching.
     * @param opts.skipIgnored Honor .gitignore, .ignore, and .rgignore files.
     * @param opts.skipHidden Skip hidden files (files starting with .).
     * @param opts.filesOnly Only return matching files, not lines and content
     * @param opts.limit Limit the number of results to return
     */
    search: (opts?: DirectorySearchOpts) => Promise<SearchResult[]>;
    /**
     * Return file status
     * @param path Path to stat (e.g., "/file.txt").
     * @param opts.doNotFollowSymlinks If specified, do not follow symlinks.
     */
    stat: (path: string, opts?: DirectoryStatOpts) => Stat;
    /**
     * Force evaluation in the engine.
     */
    sync: () => Promise<Directory>;
    /**
     * Opens an interactive terminal in new container with this directory mounted inside.
     * @param opts.container If set, override the default container used for the terminal.
     * @param opts.cmd If set, override the container's default terminal command and invoke these command arguments instead.
     * @param opts.experimentalPrivilegedNesting Provides Dagger access to the executed command.
     * @param opts.insecureRootCapabilities Execute the command with all root capabilities. This is similar to running a command with "sudo" or executing "docker run" with the "--privileged" flag. Containerization does not provide any security guarantees when using this option. It should only be used when absolutely necessary and only with trusted commands.
     */
    terminal: (opts?: DirectoryTerminalOpts) => Directory;
    /**
     * Return a directory with changes from another directory applied to it.
     * @param changes Changes to apply to the directory
     */
    withChanges: (changes: Changeset) => Directory;
    /**
     * Return a snapshot with a directory added
     * @param path Location of the written directory (e.g., "/src/").
     * @param source Identifier of the directory to copy.
     * @param opts.exclude Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
     * @param opts.include Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
     * @param opts.gitignore Apply .gitignore filter rules inside the directory
     * @param opts.owner A user:group to set for the copied directory and its contents.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     * @param opts.permissions Permission given to the copied directory and contents (e.g., 0755).
     */
    withDirectory: (path: string, source: Directory, opts?: DirectoryWithDirectoryOpts) => Directory;
    /**
     * Raise an error.
     * @param err Message of the error to raise. If empty, the error will be ignored.
     */
    withError: (err: string) => Directory;
    /**
     * Retrieves this directory plus the contents of the given file copied to the given path.
     * @param path Location of the copied file (e.g., "/file.txt").
     * @param source Identifier of the file to copy.
     * @param opts.permissions Permission given to the copied file (e.g., 0600).
     * @param opts.owner A user:group to set for the copied directory and its contents.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    withFile: (path: string, source: File, opts?: DirectoryWithFileOpts) => Directory;
    /**
     * Retrieves this directory plus the contents of the given files copied to the given path.
     * @param path Location where copied files should be placed (e.g., "/src").
     * @param sources Identifiers of the files to copy.
     * @param opts.permissions Permission given to the copied files (e.g., 0600).
     */
    withFiles: (path: string, sources: File[], opts?: DirectoryWithFilesOpts) => Directory;
    /**
     * Retrieves this directory plus a new directory created at the given path.
     * @param path Location of the directory created (e.g., "/logs").
     * @param opts.permissions Permission granted to the created directory (e.g., 0777).
     */
    withNewDirectory: (path: string, opts?: DirectoryWithNewDirectoryOpts) => Directory;
    /**
     * Return a snapshot with a new file added
     * @param path Path of the new file. Example: "foo/bar.txt"
     * @param contents Contents of the new file. Example: "Hello world!"
     * @param opts.permissions Permissions of the new file. Example: 0600
     */
    withNewFile: (path: string, contents: string, opts?: DirectoryWithNewFileOpts) => Directory;
    /**
     * Retrieves this directory with the given Git-compatible patch applied.
     * @param patch Patch to apply (e.g., "diff --git a/file.txt b/file.txt\nindex 1234567..abcdef8 100644\n--- a/file.txt\n+++ b/file.txt\n@@ -1,1 +1,1 @@\n-Hello\n+World\n").
     * @experimental
     */
    withPatch: (patch: string) => Directory;
    /**
     * Retrieves this directory with the given Git-compatible patch file applied.
     * @param patch File containing the patch to apply
     * @experimental
     */
    withPatchFile: (patch: File) => Directory;
    /**
     * Return a snapshot with a symlink
     * @param target Location of the file or directory to link to (e.g., "/existing/file").
     * @param linkName Location where the symbolic link will be created (e.g., "/new-file-link").
     */
    withSymlink: (target: string, linkName: string) => Directory;
    /**
     * Retrieves this directory with all file/dir timestamps set to the given time.
     * @param timestamp Timestamp to set dir/files in.
     *
     * Formatted in seconds following Unix epoch (e.g., 1672531199).
     */
    withTimestamps: (timestamp: number) => Directory;
    /**
     * Return a snapshot with a subdirectory removed
     * @param path Path of the subdirectory to remove. Example: ".github/workflows"
     */
    withoutDirectory: (path: string) => Directory;
    /**
     * Return a snapshot with a file removed
     * @param path Path of the file to remove (e.g., "/file.txt").
     */
    withoutFile: (path: string) => Directory;
    /**
     * Return a snapshot with files removed
     * @param paths Paths of the files to remove (e.g., ["/file.txt"]).
     */
    withoutFiles: (paths: string[]) => Directory;
    /**
     * Call the provided function with current Directory.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Directory) => Directory) => Directory;
}
/**
 * The Dagger engine configuration and state
 */
declare class Engine extends BaseClient {
    private readonly _id?;
    private readonly _name?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _name?: string);
    /**
     * A unique identifier for this Engine.
     */
    id: () => Promise<ID>;
    /**
     * The list of connected client IDs
     */
    clients: () => Promise<string[]>;
    /**
     * The local engine cache state tracked by dagql
     */
    localCache: () => EngineCache;
    /**
     * The name of the engine instance.
     */
    name: () => Promise<string>;
}
/**
 * A cache storage for the Dagger engine
 */
declare class EngineCache extends BaseClient {
    private readonly _id?;
    private readonly _maxUsedSpace?;
    private readonly _minFreeSpace?;
    private readonly _prune?;
    private readonly _reservedSpace?;
    private readonly _targetSpace?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _maxUsedSpace?: number, _minFreeSpace?: number, _prune?: Void, _reservedSpace?: number, _targetSpace?: number);
    /**
     * A unique identifier for this EngineCache.
     */
    id: () => Promise<ID>;
    /**
     * The current set of entries in the cache
     */
    entrySet: (opts?: EngineCacheEntrySetOpts) => EngineCacheEntrySet;
    /**
     * The maximum bytes to keep in the cache without pruning.
     */
    maxUsedSpace: () => Promise<number>;
    /**
     * The target amount of free disk space the garbage collector will attempt to leave.
     */
    minFreeSpace: () => Promise<number>;
    /**
     * Prune the cache of releaseable entries
     * @param opts.useDefaultPolicy Use the engine-wide default pruning policy if true, otherwise prune the whole cache of any releasable entries.
     * @param opts.maxUsedSpace Override the maximum disk space to keep before pruning (e.g. "200GB" or "80%").
     * @param opts.reservedSpace Override the minimum disk space to retain during pruning (e.g. "500GB" or "10%").
     * @param opts.minFreeSpace Override the minimum free disk space target during pruning (e.g. "20GB" or "20%").
     * @param opts.targetSpace Override the target disk space to keep after pruning (e.g. "200GB" or "50%").
     */
    prune: (opts?: EngineCachePruneOpts) => Promise<void>;
    /**
     * The minimum amount of disk space this policy is guaranteed to retain.
     */
    reservedSpace: () => Promise<number>;
    /**
     * The target number of bytes to keep when pruning.
     */
    targetSpace: () => Promise<number>;
}
/**
 * An individual cache entry in a cache entry set
 */
declare class EngineCacheEntry extends BaseClient {
    private readonly _id?;
    private readonly _activelyUsed?;
    private readonly _createdTimeUnixNano?;
    private readonly _dagqlCall?;
    private readonly _description?;
    private readonly _diskSpaceBytes?;
    private readonly _mostRecentUseTimeUnixNano?;
    private readonly _recordType?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _activelyUsed?: boolean, _createdTimeUnixNano?: number, _dagqlCall?: string, _description?: string, _diskSpaceBytes?: number, _mostRecentUseTimeUnixNano?: number, _recordType?: string);
    /**
     * A unique identifier for this EngineCacheEntry.
     */
    id: () => Promise<ID>;
    /**
     * Whether the cache entry is actively being used.
     */
    activelyUsed: () => Promise<boolean>;
    /**
     * The time the cache entry was created, in Unix nanoseconds.
     */
    createdTimeUnixNano: () => Promise<number>;
    /**
     * The DagQL call that produced this cache entry.
     */
    dagqlCall: () => Promise<string>;
    /**
     * The description of the cache entry.
     */
    description: () => Promise<string>;
    /**
     * The disk space used by the cache entry.
     */
    diskSpaceBytes: () => Promise<number>;
    /**
     * The most recent time the cache entry was used, in Unix nanoseconds.
     */
    mostRecentUseTimeUnixNano: () => Promise<number>;
    /**
     * The type of the cache record (e.g. regular, internal, frontend, source.local, source.git.checkout, exec.cachemount).
     */
    recordType: () => Promise<string>;
    /**
     * The storage record types represented by this cache entry.
     */
    recordTypes: () => Promise<string[]>;
}
/**
 * A set of cache entries returned by a query to a cache
 */
declare class EngineCacheEntrySet extends BaseClient {
    private readonly _id?;
    private readonly _diskSpaceBytes?;
    private readonly _entryCount?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _diskSpaceBytes?: number, _entryCount?: number);
    /**
     * A unique identifier for this EngineCacheEntrySet.
     */
    id: () => Promise<ID>;
    /**
     * The total disk space used by the cache entries in this set.
     */
    diskSpaceBytes: () => Promise<number>;
    /**
     * The list of individual cache entries in the set
     */
    entries: () => Promise<EngineCacheEntry[]>;
    /**
     * The number of cache entries in this set.
     */
    entryCount: () => Promise<number>;
}
/**
 * A definition of a custom enum defined in a Module.
 */
declare class EnumTypeDef extends BaseClient {
    private readonly _id?;
    private readonly _description?;
    private readonly _name?;
    private readonly _sourceModuleName?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _description?: string, _name?: string, _sourceModuleName?: string);
    /**
     * A unique identifier for this EnumTypeDef.
     */
    id: () => Promise<ID>;
    /**
     * A doc string for the enum, if any.
     */
    description: () => Promise<string>;
    /**
     * The members of the enum.
     */
    members: () => Promise<EnumValueTypeDef[]>;
    /**
     * The name of the enum.
     */
    name: () => Promise<string>;
    /**
     * The location of this enum declaration.
     */
    sourceMap: () => SourceMap;
    /**
     * If this EnumTypeDef is associated with a Module, the name of the module. Unset otherwise.
     */
    sourceModuleName: () => Promise<string>;
    /**
     * The members of the enum.
     * @deprecated use members instead
     */
    values: () => Promise<EnumValueTypeDef[]>;
}
/**
 * A definition of a value in a custom enum defined in a Module.
 */
declare class EnumValueTypeDef extends BaseClient {
    private readonly _id?;
    private readonly _deprecated?;
    private readonly _description?;
    private readonly _name?;
    private readonly _value?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _deprecated?: string, _description?: string, _name?: string, _value?: string);
    /**
     * A unique identifier for this EnumValueTypeDef.
     */
    id: () => Promise<ID>;
    /**
     * The reason this enum member is deprecated, if any.
     */
    deprecated: () => Promise<string>;
    /**
     * A doc string for the enum member, if any.
     */
    description: () => Promise<string>;
    /**
     * The name of the enum member.
     */
    name: () => Promise<string>;
    /**
     * The location of this enum member declaration.
     */
    sourceMap: () => SourceMap;
    /**
     * The value of the enum member
     */
    value: () => Promise<string>;
}
declare class Env extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this Env.
     */
    id: () => Promise<ID>;
    /**
     * Return the check with the given name from the installed modules. Must match exactly one check.
     * @param name The name of the check to retrieve
     * @experimental
     */
    check: (name: string) => Check;
    /**
     * Return all checks defined by the installed modules
     * @param opts.include Only include checks matching the specified patterns
     * @param opts.noGenerate When true, only return annotated check functions; exclude generate-as-checks
     * @experimental
     */
    checks: (opts?: EnvChecksOpts) => CheckGroup;
    /**
     * Retrieves an input binding by name
     */
    input: (name: string) => Binding;
    /**
     * Returns all input bindings provided to the environment
     */
    inputs: () => Promise<Binding[]>;
    /**
     * Retrieves an output binding by name
     */
    output: (name: string) => Binding;
    /**
     * Returns all declared output bindings for the environment
     */
    outputs: () => Promise<Binding[]>;
    /**
     * Return all services defined by the installed modules
     * @param opts.include Only include services matching the specified patterns
     * @experimental
     */
    services: (opts?: EnvServicesOpts) => UpGroup;
    /**
     * Create or update a binding of type Address in the environment
     * @param name The name of the binding
     * @param value The Address value to assign to the binding
     * @param description The purpose of the input
     */
    withAddressInput: (name: string, value: Address, description: string) => Env;
    /**
     * Declare a desired Address output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withAddressOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type CacheVolume in the environment
     * @param name The name of the binding
     * @param value The CacheVolume value to assign to the binding
     * @param description The purpose of the input
     */
    withCacheVolumeInput: (name: string, value: CacheVolume, description: string) => Env;
    /**
     * Declare a desired CacheVolume output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withCacheVolumeOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Changeset in the environment
     * @param name The name of the binding
     * @param value The Changeset value to assign to the binding
     * @param description The purpose of the input
     */
    withChangesetInput: (name: string, value: Changeset, description: string) => Env;
    /**
     * Declare a desired Changeset output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withChangesetOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type CheckGroup in the environment
     * @param name The name of the binding
     * @param value The CheckGroup value to assign to the binding
     * @param description The purpose of the input
     */
    withCheckGroupInput: (name: string, value: CheckGroup, description: string) => Env;
    /**
     * Declare a desired CheckGroup output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withCheckGroupOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Check in the environment
     * @param name The name of the binding
     * @param value The Check value to assign to the binding
     * @param description The purpose of the input
     */
    withCheckInput: (name: string, value: Check, description: string) => Env;
    /**
     * Declare a desired Check output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withCheckOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Cloud in the environment
     * @param name The name of the binding
     * @param value The Cloud value to assign to the binding
     * @param description The purpose of the input
     */
    withCloudInput: (name: string, value: Cloud, description: string) => Env;
    /**
     * Declare a desired Cloud output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withCloudOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Container in the environment
     * @param name The name of the binding
     * @param value The Container value to assign to the binding
     * @param description The purpose of the input
     */
    withContainerInput: (name: string, value: Container, description: string) => Env;
    /**
     * Declare a desired Container output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withContainerOutput: (name: string, description: string) => Env;
    /**
     * Installs the current module into the environment, exposing its functions to the model
     *
     * Contextual path arguments will be populated using the environment's workspace.
     */
    withCurrentModule: () => Env;
    /**
     * Create or update a binding of type CurrentModuleAsSDKClient in the environment
     * @param name The name of the binding
     * @param value The CurrentModuleAsSDKClient value to assign to the binding
     * @param description The purpose of the input
     */
    withCurrentModuleAsSDKClientInput: (name: string, value: CurrentModuleAsSDKClient, description: string) => Env;
    /**
     * Declare a desired CurrentModuleAsSDKClient output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withCurrentModuleAsSDKClientOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type CurrentModuleAsSDK in the environment
     * @param name The name of the binding
     * @param value The CurrentModuleAsSDK value to assign to the binding
     * @param description The purpose of the input
     */
    withCurrentModuleAsSDKInput: (name: string, value: CurrentModuleAsSDK, description: string) => Env;
    /**
     * Create or update a binding of type CurrentModuleAsSDKModule in the environment
     * @param name The name of the binding
     * @param value The CurrentModuleAsSDKModule value to assign to the binding
     * @param description The purpose of the input
     */
    withCurrentModuleAsSDKModuleInput: (name: string, value: CurrentModuleAsSDKModule, description: string) => Env;
    /**
     * Declare a desired CurrentModuleAsSDKModule output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withCurrentModuleAsSDKModuleOutput: (name: string, description: string) => Env;
    /**
     * Declare a desired CurrentModuleAsSDK output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withCurrentModuleAsSDKOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type DiffStat in the environment
     * @param name The name of the binding
     * @param value The DiffStat value to assign to the binding
     * @param description The purpose of the input
     */
    withDiffStatInput: (name: string, value: DiffStat, description: string) => Env;
    /**
     * Declare a desired DiffStat output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withDiffStatOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Directory in the environment
     * @param name The name of the binding
     * @param value The Directory value to assign to the binding
     * @param description The purpose of the input
     */
    withDirectoryInput: (name: string, value: Directory, description: string) => Env;
    /**
     * Declare a desired Directory output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withDirectoryOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type EnvFile in the environment
     * @param name The name of the binding
     * @param value The EnvFile value to assign to the binding
     * @param description The purpose of the input
     */
    withEnvFileInput: (name: string, value: EnvFile, description: string) => Env;
    /**
     * Declare a desired EnvFile output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withEnvFileOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Env in the environment
     * @param name The name of the binding
     * @param value The Env value to assign to the binding
     * @param description The purpose of the input
     */
    withEnvInput: (name: string, value: Env, description: string) => Env;
    /**
     * Declare a desired Env output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withEnvOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type File in the environment
     * @param name The name of the binding
     * @param value The File value to assign to the binding
     * @param description The purpose of the input
     */
    withFileInput: (name: string, value: File, description: string) => Env;
    /**
     * Declare a desired File output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withFileOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type GeneratorGroup in the environment
     * @param name The name of the binding
     * @param value The GeneratorGroup value to assign to the binding
     * @param description The purpose of the input
     */
    withGeneratorGroupInput: (name: string, value: GeneratorGroup, description: string) => Env;
    /**
     * Declare a desired GeneratorGroup output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withGeneratorGroupOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Generator in the environment
     * @param name The name of the binding
     * @param value The Generator value to assign to the binding
     * @param description The purpose of the input
     */
    withGeneratorInput: (name: string, value: Generator, description: string) => Env;
    /**
     * Declare a desired Generator output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withGeneratorOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type GitRef in the environment
     * @param name The name of the binding
     * @param value The GitRef value to assign to the binding
     * @param description The purpose of the input
     */
    withGitRefInput: (name: string, value: GitRef, description: string) => Env;
    /**
     * Declare a desired GitRef output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withGitRefOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type GitRepository in the environment
     * @param name The name of the binding
     * @param value The GitRepository value to assign to the binding
     * @param description The purpose of the input
     */
    withGitRepositoryInput: (name: string, value: GitRepository, description: string) => Env;
    /**
     * Declare a desired GitRepository output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withGitRepositoryOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type HTTPState in the environment
     * @param name The name of the binding
     * @param value The HTTPState value to assign to the binding
     * @param description The purpose of the input
     */
    withHTTPStateInput: (name: string, value: HTTPState, description: string) => Env;
    /**
     * Declare a desired HTTPState output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withHTTPStateOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type JSONValue in the environment
     * @param name The name of the binding
     * @param value The JSONValue value to assign to the binding
     * @param description The purpose of the input
     */
    withJSONValueInput: (name: string, value: JSONValue, description: string) => Env;
    /**
     * Declare a desired JSONValue output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withJSONValueOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type LLMContentBlock in the environment
     * @param name The name of the binding
     * @param value The LLMContentBlock value to assign to the binding
     * @param description The purpose of the input
     */
    withLLMContentBlockInput: (name: string, value: LLMContentBlock, description: string) => Env;
    /**
     * Declare a desired LLMContentBlock output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withLLMContentBlockOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type LLMMessage in the environment
     * @param name The name of the binding
     * @param value The LLMMessage value to assign to the binding
     * @param description The purpose of the input
     */
    withLLMMessageInput: (name: string, value: LLMMessage, description: string) => Env;
    /**
     * Declare a desired LLMMessage output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withLLMMessageOutput: (name: string, description: string) => Env;
    /**
     * Sets the main module for this environment (the project being worked on)
     *
     * Contextual path arguments will be populated using the environment's workspace.
     */
    withMainModule: (module_: Module_) => Env;
    /**
     * Installs a module into the environment, exposing its functions to the model
     *
     * Contextual path arguments will be populated using the environment's workspace.
     * @deprecated Use withMainModule instead
     */
    withModule: (module_: Module_) => Env;
    /**
     * Create or update a binding of type ModuleConfigClient in the environment
     * @param name The name of the binding
     * @param value The ModuleConfigClient value to assign to the binding
     * @param description The purpose of the input
     */
    withModuleConfigClientInput: (name: string, value: ModuleConfigClient, description: string) => Env;
    /**
     * Declare a desired ModuleConfigClient output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withModuleConfigClientOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Module in the environment
     * @param name The name of the binding
     * @param value The Module value to assign to the binding
     * @param description The purpose of the input
     */
    withModuleInput: (name: string, value: Module_, description: string) => Env;
    /**
     * Declare a desired Module output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withModuleOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type ModuleSource in the environment
     * @param name The name of the binding
     * @param value The ModuleSource value to assign to the binding
     * @param description The purpose of the input
     */
    withModuleSourceInput: (name: string, value: ModuleSource, description: string) => Env;
    /**
     * Declare a desired ModuleSource output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withModuleSourceOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Schema in the environment
     * @param name The name of the binding
     * @param value The Schema value to assign to the binding
     * @param description The purpose of the input
     */
    withSchemaInput: (name: string, value: Schema, description: string) => Env;
    /**
     * Declare a desired Schema output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withSchemaOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type SearchResult in the environment
     * @param name The name of the binding
     * @param value The SearchResult value to assign to the binding
     * @param description The purpose of the input
     */
    withSearchResultInput: (name: string, value: SearchResult, description: string) => Env;
    /**
     * Declare a desired SearchResult output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withSearchResultOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type SearchSubmatch in the environment
     * @param name The name of the binding
     * @param value The SearchSubmatch value to assign to the binding
     * @param description The purpose of the input
     */
    withSearchSubmatchInput: (name: string, value: SearchSubmatch, description: string) => Env;
    /**
     * Declare a desired SearchSubmatch output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withSearchSubmatchOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Secret in the environment
     * @param name The name of the binding
     * @param value The Secret value to assign to the binding
     * @param description The purpose of the input
     */
    withSecretInput: (name: string, value: Secret, description: string) => Env;
    /**
     * Declare a desired Secret output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withSecretOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Service in the environment
     * @param name The name of the binding
     * @param value The Service value to assign to the binding
     * @param description The purpose of the input
     */
    withServiceInput: (name: string, value: Service, description: string) => Env;
    /**
     * Declare a desired Service output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withServiceOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Socket in the environment
     * @param name The name of the binding
     * @param value The Socket value to assign to the binding
     * @param description The purpose of the input
     */
    withSocketInput: (name: string, value: Socket, description: string) => Env;
    /**
     * Declare a desired Socket output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withSocketOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Stat in the environment
     * @param name The name of the binding
     * @param value The Stat value to assign to the binding
     * @param description The purpose of the input
     */
    withStatInput: (name: string, value: Stat, description: string) => Env;
    /**
     * Declare a desired Stat output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withStatOutput: (name: string, description: string) => Env;
    /**
     * Provides a string input binding to the environment
     * @param name The name of the binding
     * @param value The string value to assign to the binding
     * @param description The description of the input
     */
    withStringInput: (name: string, value: string, description: string) => Env;
    /**
     * Declares a desired string output binding
     * @param name The name of the binding
     * @param description The description of the output
     */
    withStringOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type UpGroup in the environment
     * @param name The name of the binding
     * @param value The UpGroup value to assign to the binding
     * @param description The purpose of the input
     */
    withUpGroupInput: (name: string, value: UpGroup, description: string) => Env;
    /**
     * Declare a desired UpGroup output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withUpGroupOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Up in the environment
     * @param name The name of the binding
     * @param value The Up value to assign to the binding
     * @param description The purpose of the input
     */
    withUpInput: (name: string, value: Up, description: string) => Env;
    /**
     * Declare a desired Up output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withUpOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Volume in the environment
     * @param name The name of the binding
     * @param value The Volume value to assign to the binding
     * @param description The purpose of the input
     */
    withVolumeInput: (name: string, value: Volume, description: string) => Env;
    /**
     * Declare a desired Volume output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withVolumeOutput: (name: string, description: string) => Env;
    /**
     * Returns a new environment with the provided workspace
     * @param workspace The directory to set as the host filesystem
     */
    withWorkspace: (workspace: Directory) => Env;
    /**
     * Create or update a binding of type WorkspaceGit in the environment
     * @param name The name of the binding
     * @param value The WorkspaceGit value to assign to the binding
     * @param description The purpose of the input
     */
    withWorkspaceGitInput: (name: string, value: WorkspaceGit, description: string) => Env;
    /**
     * Declare a desired WorkspaceGit output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withWorkspaceGitOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type Workspace in the environment
     * @param name The name of the binding
     * @param value The Workspace value to assign to the binding
     * @param description The purpose of the input
     */
    withWorkspaceInput: (name: string, value: Workspace, description: string) => Env;
    /**
     * Create or update a binding of type WorkspaceMigration in the environment
     * @param name The name of the binding
     * @param value The WorkspaceMigration value to assign to the binding
     * @param description The purpose of the input
     */
    withWorkspaceMigrationInput: (name: string, value: WorkspaceMigration, description: string) => Env;
    /**
     * Declare a desired WorkspaceMigration output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withWorkspaceMigrationOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type WorkspaceMigrationStep in the environment
     * @param name The name of the binding
     * @param value The WorkspaceMigrationStep value to assign to the binding
     * @param description The purpose of the input
     */
    withWorkspaceMigrationStepInput: (name: string, value: WorkspaceMigrationStep, description: string) => Env;
    /**
     * Declare a desired WorkspaceMigrationStep output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withWorkspaceMigrationStepOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type WorkspaceModule in the environment
     * @param name The name of the binding
     * @param value The WorkspaceModule value to assign to the binding
     * @param description The purpose of the input
     */
    withWorkspaceModuleInput: (name: string, value: WorkspaceModule, description: string) => Env;
    /**
     * Declare a desired WorkspaceModule output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withWorkspaceModuleOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type WorkspaceModuleSetting in the environment
     * @param name The name of the binding
     * @param value The WorkspaceModuleSetting value to assign to the binding
     * @param description The purpose of the input
     */
    withWorkspaceModuleSettingInput: (name: string, value: WorkspaceModuleSetting, description: string) => Env;
    /**
     * Declare a desired WorkspaceModuleSetting output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withWorkspaceModuleSettingOutput: (name: string, description: string) => Env;
    /**
     * Declare a desired Workspace output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withWorkspaceOutput: (name: string, description: string) => Env;
    /**
     * Create or update a binding of type WorkspaceSDK in the environment
     * @param name The name of the binding
     * @param value The WorkspaceSDK value to assign to the binding
     * @param description The purpose of the input
     */
    withWorkspaceSDKInput: (name: string, value: WorkspaceSDK, description: string) => Env;
    /**
     * Declare a desired WorkspaceSDK output to be assigned in the environment
     * @param name The name of the binding
     * @param description A description of the desired value of the binding
     */
    withWorkspaceSDKOutput: (name: string, description: string) => Env;
    /**
     * Returns a new environment without any outputs
     */
    withoutOutputs: () => Env;
    workspace: () => Directory;
    /**
     * Call the provided function with current Env.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Env) => Env) => Env;
}
/**
 * A collection of environment variables.
 */
declare class EnvFile extends BaseClient {
    private readonly _id?;
    private readonly _exists?;
    private readonly _get?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _exists?: boolean, _get?: string);
    /**
     * A unique identifier for this EnvFile.
     */
    id: () => Promise<ID>;
    /**
     * Return as a file
     */
    asFile: () => File;
    /**
     * Check if a variable exists
     * @param name Variable name
     */
    exists: (name: string) => Promise<boolean>;
    /**
     * Lookup a variable (last occurrence wins) and return its value, or an empty string
     * @param name Variable name
     * @param opts.raw Return the value exactly as written to the file. No quote removal or variable expansion
     */
    get: (name: string, opts?: EnvFileGetOpts) => Promise<string>;
    /**
     * Filters variables by prefix and removes the pref from keys. Variables without the prefix are excluded. For example, with the prefix "MY_APP_" and variables: MY_APP_TOKEN=topsecret MY_APP_NAME=hello FOO=bar the resulting environment will contain: TOKEN=topsecret NAME=hello
     * @param prefix The prefix to filter by
     */
    namespace_: (prefix: string) => EnvFile;
    /**
     * Return all variables
     * @param opts.raw Return values exactly as written to the file. No quote removal or variable expansion
     */
    variables: (opts?: EnvFileVariablesOpts) => Promise<EnvVariable[]>;
    /**
     * Add a variable
     * @param name Variable name
     * @param value Variable value
     */
    withVariable: (name: string, value: string) => EnvFile;
    /**
     * Remove all occurrences of the named variable
     * @param name Variable name
     */
    withoutVariable: (name: string) => EnvFile;
    /**
     * Call the provided function with current EnvFile.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: EnvFile) => EnvFile) => EnvFile;
}
/**
 * An environment variable name and value.
 */
declare class EnvVariable extends BaseClient {
    private readonly _id?;
    private readonly _name?;
    private readonly _value?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _name?: string, _value?: string);
    /**
     * A unique identifier for this EnvVariable.
     */
    id: () => Promise<ID>;
    /**
     * The environment variable name.
     */
    name: () => Promise<string>;
    /**
     * The environment variable value.
     */
    value: () => Promise<string>;
}
declare class Error$1 extends BaseClient {
    private readonly _id?;
    private readonly _message?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _message?: string);
    /**
     * A unique identifier for this Error.
     */
    id: () => Promise<ID>;
    /**
     * A description of the error.
     */
    message: () => Promise<string>;
    /**
     * The extensions of the error.
     */
    values: () => Promise<ErrorValue[]>;
    /**
     * Add a value to the error.
     * @param name The name of the value.
     * @param value The value to store on the error.
     */
    withValue: (name: string, value: JSON) => Error$1;
    /**
     * Call the provided function with current Error.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Error$1) => Error$1) => Error$1;
}
declare class ErrorValue extends BaseClient {
    private readonly _id?;
    private readonly _name?;
    private readonly _value?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _name?: string, _value?: JSON);
    /**
     * A unique identifier for this ErrorValue.
     */
    id: () => Promise<ID>;
    /**
     * The name of the value.
     */
    name: () => Promise<string>;
    /**
     * The value.
     */
    value: () => Promise<JSON>;
}
/**
 * An object that can be exported to the host.
 *
 * Calling export writes the object to a path on the host filesystem and returns the path that was written.
 */
interface Exportable {
    id(): Promise<ID>;
    export(path: string): Promise<string>;
}
declare class _ExportableClient extends BaseClient {
    private readonly _id?;
    private readonly _export?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _export?: string);
    id: () => Promise<ID>;
    export: (path: string) => Promise<string>;
}
/**
 * A definition of a field on a custom object defined in a Module.
 *
 * A field on an object has a static value, as opposed to a function on an object whose value is computed by invoking code (and can accept arguments).
 */
declare class FieldTypeDef extends BaseClient {
    private readonly _id?;
    private readonly _deprecated?;
    private readonly _description?;
    private readonly _name?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _deprecated?: string, _description?: string, _name?: string);
    /**
     * A unique identifier for this FieldTypeDef.
     */
    id: () => Promise<ID>;
    /**
     * The reason this enum member is deprecated, if any.
     */
    deprecated: () => Promise<string>;
    /**
     * A doc string for the field, if any.
     */
    description: () => Promise<string>;
    /**
     * The name of the field in lowerCamelCase format.
     */
    name: () => Promise<string>;
    /**
     * The location of this field declaration.
     */
    sourceMap: () => SourceMap;
    /**
     * The type of the field.
     */
    typeDef: () => TypeDef;
}
/**
 * A file.
 */
declare class File extends BaseClient {
    private readonly _id?;
    private readonly _contents?;
    private readonly _digest?;
    private readonly _export?;
    private readonly _name?;
    private readonly _size?;
    private readonly _sync?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _contents?: string, _digest?: string, _export?: string, _name?: string, _size?: number, _sync?: ID);
    /**
     * A unique identifier for this File.
     */
    id: () => Promise<ID>;
    /**
     * Parse as an env file
     * @param opts.expand Replace "${VAR}" or "$VAR" with the value of other vars
     */
    asEnvFile: (opts?: FileAsEnvFileOpts) => EnvFile;
    /**
     * Parse the file contents as JSON.
     */
    asJSON: () => JSONValue;
    /**
     * Change the owner of the file recursively.
     * @param owner A user:group to set for the file.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    chown: (owner: string) => File;
    /**
     * Retrieves the contents of the file.
     * @param opts.offsetLines Start reading after this line
     * @param opts.limitLines Maximum number of lines to read
     */
    contents: (opts?: FileContentsOpts) => Promise<string>;
    /**
     * Return the file's digest. The format of the digest is not guaranteed to be stable between releases of Dagger. It is guaranteed to be stable between invocations of the same Dagger engine.
     * @param opts.excludeMetadata If true, exclude metadata from the digest.
     */
    digest: (opts?: FileDigestOpts) => Promise<string>;
    /**
     * Writes the file to a file path on the host.
     * @param path Location of the written directory (e.g., "output.txt").
     * @param opts.allowParentDirPath If allowParentDirPath is true, the path argument can be a directory path, in which case the file will be created in that directory.
     */
    export: (path: string, opts?: FileExportOpts) => Promise<string>;
    /**
     * Retrieves the name of the file.
     */
    name: () => Promise<string>;
    /**
     * Searches for content matching the given regular expression or literal string.
     *
     * Uses Rust regex syntax; escape literal ., [, ], {, }, | with backslashes.
     * @param pattern The text to match.
     * @param opts.literal Interpret the pattern as a literal string instead of a regular expression.
     * @param opts.multiline Enable searching across multiple lines.
     * @param opts.dotall Allow the . pattern to match newlines in multiline mode.
     * @param opts.insensitive Enable case-insensitive matching.
     * @param opts.skipIgnored Honor .gitignore, .ignore, and .rgignore files.
     * @param opts.skipHidden Skip hidden files (files starting with .).
     * @param opts.filesOnly Only return matching files, not lines and content
     * @param opts.limit Limit the number of results to return
     */
    search: (pattern: string, opts?: FileSearchOpts) => Promise<SearchResult[]>;
    /**
     * Retrieves the size of the file, in bytes.
     */
    size: () => Promise<number>;
    /**
     * Return file status
     */
    stat: () => Stat;
    /**
     * Force evaluation in the engine.
     */
    sync: () => Promise<File>;
    /**
     * Retrieves this file with its name set to the given name.
     * @param name Name to set file to.
     */
    withName: (name: string) => File;
    /**
     * Retrieves the file with content replaced with the given text.
     *
     * If 'all' is true, all occurrences of the pattern will be replaced.
     *
     * If 'firstAfter' is specified, only the first match starting at the specified line will be replaced.
     *
     * If neither are specified, and there are multiple matches for the pattern, this will error.
     *
     * If there are no matches for the pattern, this will error.
     * @param search The text to match.
     * @param replacement The text to match.
     * @param opts.all Replace all occurrences of the pattern.
     * @param opts.firstFrom Replace the first match starting from the specified line.
     */
    withReplaced: (search: string, replacement: string, opts?: FileWithReplacedOpts) => File;
    /**
     * Retrieves this file with its created/modified timestamps set to the given time.
     * @param timestamp Timestamp to set dir/files in.
     *
     * Formatted in seconds following Unix epoch (e.g., 1672531199).
     */
    withTimestamps: (timestamp: number) => File;
    /**
     * Call the provided function with current File.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: File) => File) => File;
}
/**
 * Function represents a resolver provided by a Module.
 *
 * A function always evaluates against a parent object and is given a set of named arguments.
 */
declare class Function_ extends BaseClient {
    private readonly _id?;
    private readonly _deprecated?;
    private readonly _description?;
    private readonly _name?;
    private readonly _sourceModuleName?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _deprecated?: string, _description?: string, _name?: string, _sourceModuleName?: string);
    /**
     * A unique identifier for this Function.
     */
    id: () => Promise<ID>;
    /**
     * Arguments accepted by the function, if any.
     */
    args: () => Promise<FunctionArg[]>;
    /**
     * The reason this function is deprecated, if any.
     */
    deprecated: () => Promise<string>;
    /**
     * A doc string for the function, if any.
     */
    description: () => Promise<string>;
    /**
     * The name of the function.
     */
    name: () => Promise<string>;
    /**
     * The type returned by the function.
     */
    returnType: () => TypeDef;
    /**
     * The location of this function declaration.
     */
    sourceMap: () => SourceMap;
    /**
     * If this function is provided by a module, the name of the module. Unset otherwise.
     */
    sourceModuleName: () => Promise<string>;
    /**
     * Returns the function with the provided argument
     * @param name The name of the argument
     * @param typeDef The type of the argument
     * @param opts.description A doc string for the argument, if any
     * @param opts.defaultValue A default value to use for this argument if not explicitly set by the caller, if any
     * @param opts.defaultPath If the argument is a Directory or File type, default to load path from context directory, relative to root directory.
     * @param opts.ignore Patterns to ignore when loading the contextual argument value.
     * @param opts.sourceMap The source map for the argument definition.
     * @param opts.deprecated If deprecated, the reason or migration path.
     */
    withArg: (name: string, typeDef: TypeDef, opts?: FunctionWithArgOpts) => Function_;
    /**
     * Returns the function updated to use the provided cache policy.
     * @param policy The cache policy to use.
     * @param opts.timeToLive The TTL for the cache policy, if applicable. Provided as a duration string, e.g. "5m", "1h30s".
     */
    withCachePolicy: (policy: FunctionCachePolicy, opts?: FunctionWithCachePolicyOpts) => Function_;
    /**
     * Returns the function with a flag indicating it's a check.
     */
    withCheck: () => Function_;
    /**
     * Returns the function with the provided deprecation reason.
     * @param opts.reason Reason or migration path describing the deprecation.
     */
    withDeprecated: (opts?: FunctionWithDeprecatedOpts) => Function_;
    /**
     * Returns the function with the given doc string.
     * @param description The doc string to set.
     */
    withDescription: (description: string) => Function_;
    /**
     * Returns the function with a flag indicating it's a generator.
     */
    withGenerator: () => Function_;
    /**
     * Returns the function with the given source map.
     * @param sourceMap The source map for the function definition.
     */
    withSourceMap: (sourceMap: SourceMap) => Function_;
    /**
     * Returns the function with a flag indicating it returns a service for dagger up.
     */
    withUp: () => Function_;
    /**
     * Call the provided function with current Function.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Function_) => Function_) => Function_;
}
/**
 * An argument accepted by a function.
 *
 * This is a specification for an argument at function definition time, not an argument passed at function call time.
 */
declare class FunctionArg extends BaseClient {
    private readonly _id?;
    private readonly _defaultAddress?;
    private readonly _defaultPath?;
    private readonly _defaultValue?;
    private readonly _deprecated?;
    private readonly _description?;
    private readonly _name?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _defaultAddress?: string, _defaultPath?: string, _defaultValue?: JSON, _deprecated?: string, _description?: string, _name?: string);
    /**
     * A unique identifier for this FunctionArg.
     */
    id: () => Promise<ID>;
    /**
     * Only applies to arguments of type Container. If the argument is not set, load it from the given address (e.g. alpine:latest)
     */
    defaultAddress: () => Promise<string>;
    /**
     * Only applies to arguments of type File or Directory. If the argument is not set, load it from the given path in the context directory
     */
    defaultPath: () => Promise<string>;
    /**
     * A default value to use for this argument when not explicitly set by the caller, if any.
     */
    defaultValue: () => Promise<JSON>;
    /**
     * The reason this function is deprecated, if any.
     */
    deprecated: () => Promise<string>;
    /**
     * A doc string for the argument, if any.
     */
    description: () => Promise<string>;
    /**
     * Only applies to arguments of type Directory. The ignore patterns are applied to the input directory, and matching entries are filtered out, in a cache-efficient manner.
     */
    ignore: () => Promise<string[]>;
    /**
     * The name of the argument in lowerCamelCase format.
     */
    name: () => Promise<string>;
    /**
     * The location of this arg declaration.
     */
    sourceMap: () => SourceMap;
    /**
     * The type of the argument.
     */
    typeDef: () => TypeDef;
}
/**
 * An active function call.
 */
declare class FunctionCall extends BaseClient {
    private readonly _id?;
    private readonly _name?;
    private readonly _parent?;
    private readonly _parentName?;
    private readonly _returnError?;
    private readonly _returnValue?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _name?: string, _parent?: JSON, _parentName?: string, _returnError?: Void, _returnValue?: Void);
    /**
     * A unique identifier for this FunctionCall.
     */
    id: () => Promise<ID>;
    /**
     * The argument values the function is being invoked with.
     */
    inputArgs: () => Promise<FunctionCallArgValue[]>;
    /**
     * The name of the function being called.
     */
    name: () => Promise<string>;
    /**
     * The value of the parent object of the function being called. If the function is top-level to the module, this is always an empty object.
     */
    parent: () => Promise<JSON>;
    /**
     * The name of the parent object of the function being called. If the function is top-level to the module, this is the name of the module.
     */
    parentName: () => Promise<string>;
    /**
     * Return an error from the function.
     * @param error The error to return.
     */
    returnError: (error: Error$1) => Promise<void>;
    /**
     * Set the return value of the function call to the provided value.
     * @param value JSON serialization of the return value.
     */
    returnValue: (value: JSON) => Promise<void>;
}
/**
 * A value passed as a named argument to a function call.
 */
declare class FunctionCallArgValue extends BaseClient {
    private readonly _id?;
    private readonly _name?;
    private readonly _value?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _name?: string, _value?: JSON);
    /**
     * A unique identifier for this FunctionCallArgValue.
     */
    id: () => Promise<ID>;
    /**
     * The name of the argument.
     */
    name: () => Promise<string>;
    /**
     * The value of the argument represented as a JSON serialized string.
     */
    value: () => Promise<JSON>;
}
/**
 * The result of running an SDK's codegen.
 */
declare class GeneratedCode extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this GeneratedCode.
     */
    id: () => Promise<ID>;
    /**
     * The directory containing the generated code.
     */
    code: () => Directory;
    /**
     * List of paths to mark generated in version control (i.e. .gitattributes).
     */
    vcsGeneratedPaths: () => Promise<string[]>;
    /**
     * List of paths to ignore in version control (i.e. .gitignore).
     */
    vcsIgnoredPaths: () => Promise<string[]>;
    /**
     * Set the list of paths to mark generated in version control.
     */
    withVCSGeneratedPaths: (paths: string[]) => GeneratedCode;
    /**
     * Set the list of paths to ignore in version control.
     */
    withVCSIgnoredPaths: (paths: string[]) => GeneratedCode;
    /**
     * Call the provided function with current GeneratedCode.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: GeneratedCode) => GeneratedCode) => GeneratedCode;
}
declare class Generator extends BaseClient {
    private readonly _id?;
    private readonly _completed?;
    private readonly _description?;
    private readonly _isEmpty?;
    private readonly _name?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _completed?: boolean, _description?: string, _isEmpty?: boolean, _name?: string);
    /**
     * A unique identifier for this Generator.
     */
    id: () => Promise<ID>;
    /**
     * The generated changeset from the last run
     */
    changes: () => Changeset;
    /**
     * Whether the generator complete
     */
    completed: () => Promise<boolean>;
    /**
     * Return the description of the generator
     */
    description: () => Promise<string>;
    /**
     * Whether changeset from the last generator run is empty or not
     */
    isEmpty: () => Promise<boolean>;
    /**
     * Return the fully qualified name of the generator
     */
    name: () => Promise<string>;
    /**
     * The original module in which the generator has been defined
     */
    originalModule: () => Module_;
    /**
     * The path of the generator within its module
     */
    path: () => Promise<string[]>;
    /**
     * Execute the generator
     */
    run: () => Generator;
    /**
     * Call the provided function with current Generator.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Generator) => Generator) => Generator;
}
declare class GeneratorGroup extends BaseClient {
    private readonly _id?;
    private readonly _isEmpty?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _isEmpty?: boolean);
    /**
     * A unique identifier for this GeneratorGroup.
     */
    id: () => Promise<ID>;
    /**
     * The combined changes from the last run of the generators
     *
     * If any conflict occurs, for instance if the same file is modified by multiple generators, or if a file is both modified and deleted, an error is raised and the merge of the changesets will failed.
     *
     * Set 'continueOnConflicts' flag to force to merge the changes in a 'last write wins' strategy.
     * @param opts.onConflict Strategy to apply on conflicts between generators
     */
    changes: (opts?: GeneratorGroupChangesOpts) => Changeset;
    /**
     * Whether the generated changeset from the last run is empty or not
     */
    isEmpty: () => Promise<boolean>;
    /**
     * Return a list of individual generators and their details
     */
    list: () => Promise<Generator[]>;
    /**
     * Load failures tolerated while collecting the generators.
     *
     * Empty unless a workspace module could not be loaded during an unscoped 'dagger generate' (no selector), where load failures are tolerated so the modules that do load still generate. Each entry is a human-readable error message. An explicit selector keeps failing hard instead.
     */
    loadFailures: () => Promise<string[]>;
    /**
     * Execute all selected generators
     */
    run: () => GeneratorGroup;
    /**
     * Call the provided function with current GeneratorGroup.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: GeneratorGroup) => GeneratorGroup) => GeneratorGroup;
}
/**
 * A git ref (tag, branch, or commit).
 */
declare class GitRef extends BaseClient {
    private readonly _id?;
    private readonly _commit?;
    private readonly _ref?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _commit?: string, _ref?: string);
    /**
     * A unique identifier for this GitRef.
     */
    id: () => Promise<ID>;
    /**
     * Creates a synthetic workspace from this git ref.
     * @param opts.cwd Current working directory inside the workspace root. Defaults to the workspace root.
     */
    asWorkspace: (opts?: GitRefAsWorkspaceOpts) => Workspace;
    /**
     * The resolved commit id at this ref.
     */
    commit: () => Promise<string>;
    /**
     * Find the best common ancestor between this ref and another ref.
     * @param other The other ref to compare against.
     */
    commonAncestor: (other: GitRef) => GitRef;
    /**
     * The resolved ref name at this ref.
     */
    ref: () => Promise<string>;
    /**
     * The filesystem tree at this ref.
     * @param opts.discardGitDir Set to true to discard .git directory.
     * @param opts.depth The depth of the tree to fetch.
     * @param opts.includeTags Set to true to populate tag refs in the local checkout .git.
     */
    tree: (opts?: GitRefTreeOpts) => Directory;
    /**
     * Call the provided function with current GitRef.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: GitRef) => GitRef) => GitRef;
}
/**
 * A git repository.
 */
declare class GitRepository extends BaseClient {
    private readonly _id?;
    private readonly _url?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _url?: string);
    /**
     * A unique identifier for this GitRepository.
     */
    id: () => Promise<ID>;
    /**
     * Creates a synthetic workspace from this git repository.
     * @param opts.cwd Current working directory inside the workspace root. Defaults to the workspace root.
     */
    asWorkspace: (opts?: GitRepositoryAsWorkspaceOpts) => Workspace;
    /**
     * Returns details of a branch.
     * @param name Branch's name (e.g., "main").
     */
    branch: (name: string) => GitRef;
    /**
     * branches that match any of the given glob patterns.
     * @param opts.patterns Glob patterns (e.g., "refs/tags/v*").
     */
    branches: (opts?: GitRepositoryBranchesOpts) => Promise<string[]>;
    /**
     * Returns details of a commit.
     * @param id Identifier of the commit (e.g., "b6315d8f2810962c601af73f86831f6866ea798b").
     */
    commit: (id: string) => GitRef;
    /**
     * Returns details for HEAD.
     */
    head: () => GitRef;
    /**
     * Returns details for the latest semver tag.
     */
    latestVersion: () => GitRef;
    /**
     * Returns details of a ref.
     * @param name Ref's name (can be a commit identifier, a tag name, a branch name, or a fully-qualified ref).
     */
    ref: (name: string) => GitRef;
    /**
     * Returns details of a tag.
     * @param name Tag's name (e.g., "v0.3.9").
     */
    tag: (name: string) => GitRef;
    /**
     * tags that match any of the given glob patterns.
     * @param opts.patterns Glob patterns (e.g., "refs/tags/v*").
     */
    tags: (opts?: GitRepositoryTagsOpts) => Promise<string[]>;
    /**
     * Returns the changeset of uncommitted changes in the git repository.
     */
    uncommitted: () => Changeset;
    /**
     * The URL of the git repository.
     */
    url: () => Promise<string>;
}
/**
 * An internal persistent HTTP state.
 */
declare class HTTPState extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this HTTPState.
     */
    id: () => Promise<ID>;
}
/**
 * Image healthcheck configuration.
 */
declare class HealthcheckConfig extends BaseClient {
    private readonly _id?;
    private readonly _interval?;
    private readonly _retries?;
    private readonly _shell?;
    private readonly _startInterval?;
    private readonly _startPeriod?;
    private readonly _timeout?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _interval?: string, _retries?: number, _shell?: boolean, _startInterval?: string, _startPeriod?: string, _timeout?: string);
    /**
     * A unique identifier for this HealthcheckConfig.
     */
    id: () => Promise<ID>;
    /**
     * Healthcheck command arguments.
     */
    args: () => Promise<string[]>;
    /**
     * Interval between running healthcheck. Example:30s
     */
    interval: () => Promise<string>;
    /**
     * The maximum number of consecutive failures before the container is marked as unhealthy. Example:3
     */
    retries: () => Promise<number>;
    /**
     * Healthcheck command is a shell command.
     */
    shell: () => Promise<boolean>;
    /**
     * StartInterval configures the duration between checks during the startup phase. Example:5s
     */
    startInterval: () => Promise<string>;
    /**
     * StartPeriod allows for failures during this initial startup period which do not count towards maximum number of retries. Example:0s
     */
    startPeriod: () => Promise<string>;
    /**
     * Healthcheck timeout. Example:3s
     */
    timeout: () => Promise<string>;
}
/**
 * Information about the host environment.
 */
declare class Host extends BaseClient {
    private readonly _id?;
    private readonly _findUp?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _findUp?: string);
    /**
     * A unique identifier for this Host.
     */
    id: () => Promise<ID>;
    /**
     * Accesses a container image on the host.
     * @param name Name of the image to access.
     */
    containerImage: (name: string) => Container;
    /**
     * Accesses a directory on the host.
     * @param path Location of the directory to access (e.g., ".").
     * @param opts.exclude Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
     * @param opts.include Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
     * @param opts.noCache If true, the directory will always be reloaded from the host.
     * @param opts.gitignore Apply .gitignore filter rules inside the directory
     */
    directory: (path: string, opts?: HostDirectoryOpts) => Directory;
    /**
     * Accesses a file on the host.
     * @param path Location of the file to retrieve (e.g., "README.md").
     * @param opts.noCache If true, the file will always be reloaded from the host.
     */
    file: (path: string, opts?: HostFileOpts) => File;
    /**
     * Search for a file or directory by walking up the tree from system workdir. Return its relative path. If no match, return null
     * @param name name of the file or directory to search for
     */
    findUp: (name: string, opts?: HostFindUpOpts) => Promise<string>;
    /**
     * Creates a service that forwards traffic to a specified address via the host.
     * @param ports Ports to expose via the service, forwarding through the host network.
     *
     * If a port's frontend is unspecified or 0, it defaults to the same as the backend port.
     *
     * An empty set of ports is not valid; an error will be returned.
     * @param opts.host Upstream host to forward traffic to.
     */
    service: (ports: PortForward[], opts?: HostServiceOpts) => Service;
    /**
     * Creates a tunnel that forwards traffic from the host to a service.
     * @param service Service to send traffic from the tunnel.
     * @param opts.native Map each service port to the same port on the host, as if the service were running natively.
     *
     * Note: enabling may result in port conflicts.
     * @param opts.ports Configure explicit port forwarding rules for the tunnel.
     *
     * If a port's frontend is unspecified or 0, a random port will be chosen by the host.
     *
     * If no ports are given, all of the service's ports are forwarded. If native is true, each port maps to the same port on the host. If native is false, each port maps to a random port chosen by the host.
     *
     * If ports are given and native is true, the ports are additive.
     */
    tunnel: (service: Service, opts?: HostTunnelOpts) => Service;
    /**
     * Accesses a Unix socket on the host.
     * @param path Location of the Unix socket (e.g., "/var/run/docker.sock").
     */
    unixSocket: (path: string) => Socket;
}
/**
 * A graphql input type, which is essentially just a group of named args.
 * This is currently only used to represent pre-existing usage of graphql input types
 * in the core API. It is not used by user modules and shouldn't ever be as user
 * module accept input objects via their id rather than graphql input types.
 */
declare class InputTypeDef extends BaseClient {
    private readonly _id?;
    private readonly _name?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _name?: string);
    /**
     * A unique identifier for this InputTypeDef.
     */
    id: () => Promise<ID>;
    /**
     * Static fields defined on this input object, if any.
     */
    fields: () => Promise<FieldTypeDef[]>;
    /**
     * The name of the input object.
     */
    name: () => Promise<string>;
}
/**
 * A definition of a custom interface defined in a Module.
 */
declare class InterfaceTypeDef extends BaseClient {
    private readonly _id?;
    private readonly _description?;
    private readonly _name?;
    private readonly _sourceModuleName?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _description?: string, _name?: string, _sourceModuleName?: string);
    /**
     * A unique identifier for this InterfaceTypeDef.
     */
    id: () => Promise<ID>;
    /**
     * The doc string for the interface, if any.
     */
    description: () => Promise<string>;
    /**
     * Functions defined on this interface, if any.
     */
    functions: () => Promise<Function_[]>;
    /**
     * The name of the interface.
     */
    name: () => Promise<string>;
    /**
     * The location of this interface declaration.
     */
    sourceMap: () => SourceMap;
    /**
     * If this InterfaceTypeDef is associated with a Module, the name of the module. Unset otherwise.
     */
    sourceModuleName: () => Promise<string>;
}
declare class JSONValue extends BaseClient {
    private readonly _id?;
    private readonly _asBoolean?;
    private readonly _asInteger?;
    private readonly _asString?;
    private readonly _contents?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _asBoolean?: boolean, _asInteger?: number, _asString?: string, _contents?: JSON);
    /**
     * A unique identifier for this JSONValue.
     */
    id: () => Promise<ID>;
    /**
     * Decode an array from json
     */
    asArray: () => Promise<JSONValue[]>;
    /**
     * Decode a boolean from json
     */
    asBoolean: () => Promise<boolean>;
    /**
     * Decode an integer from json
     */
    asInteger: () => Promise<number>;
    /**
     * Decode a string from json
     */
    asString: () => Promise<string>;
    /**
     * Return the value encoded as json
     * @param opts.pretty Pretty-print
     * @param opts.indent Optional line prefix
     */
    contents: (opts?: JSONValueContentsOpts) => Promise<JSON>;
    /**
     * Lookup the field at the given path, and return its value.
     * @param path Path of the field to lookup, encoded as an array of field names
     */
    field: (path: string[]) => JSONValue;
    /**
     * List fields of the encoded object
     */
    fields: () => Promise<string[]>;
    /**
     * Encode a boolean to json
     * @param value New boolean value
     */
    newBoolean: (value: boolean) => JSONValue;
    /**
     * Encode an integer to json
     * @param value New integer value
     */
    newInteger: (value: number) => JSONValue;
    /**
     * Encode a string to json
     * @param value New string value
     */
    newString: (value: string) => JSONValue;
    /**
     * Return a new json value, decoded from the given content
     * @param contents New JSON-encoded contents
     */
    withContents: (contents: JSON) => JSONValue;
    /**
     * Set a new field at the given path
     * @param path Path of the field to set, encoded as an array of field names
     * @param value The new value of the field
     */
    withField: (path: string[], value: JSONValue) => JSONValue;
    /**
     * Call the provided function with current JSONValue.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: JSONValue) => JSONValue) => JSONValue;
}
/**
 * A conversation with a large language model (LLM): queue prompts, expose tools, and step the model until it completes its turn.
 */
declare class LLM extends BaseClient {
    private readonly _id?;
    private readonly _contextWindow?;
    private readonly _hasPending?;
    private readonly _lastReply?;
    private readonly _model?;
    private readonly _portableID?;
    private readonly _provider?;
    private readonly _replay?;
    private readonly _sync?;
    private readonly _tools?;
    private readonly _transcript?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _contextWindow?: number, _hasPending?: boolean, _lastReply?: string, _model?: string, _portableID?: ID, _provider?: string, _replay?: ID, _sync?: ID, _tools?: string, _transcript?: string);
    /**
     * A unique identifier for this LLM.
     */
    id: () => Promise<ID>;
    /**
     * returns the type of the current state
     */
    bindResult: (name: string) => Binding;
    /**
     * The model's total context window in tokens, or null if unknown (e.g. a local or uncatalogued model).
     */
    contextWindow: () => Promise<number>;
    /**
     * return the LLM's current environment
     */
    env: () => Env;
    /**
     * Fork the conversation, so that otherwise-identical follow-ups evaluate independently instead of deduplicating to a single cached result.
     * @param label A label distinguishing this fork from its siblings, e.g. "attempt-2" when retrying a flaky evaluation.
     */
    fork: (label: string) => LLM;
    /**
     * Report whether anything is queued to send to the model: an unsent prompt or unevaluated tool results. When true, another step will do work; when false, the turn is complete.
     */
    hasPending: () => Promise<boolean>;
    /**
     * The text of the model's most recent reply.
     */
    lastReply: () => Promise<string>;
    /**
     * Send the queued prompt and step the model against the available tools, until it ends its turn: a reply with no tool calls and nothing left queued.
     * @param opts.maxSteps Cap the number of steps. The loop fails if the cap is reached before the model ends its turn.
     * @param opts.maxTokens Cap the model's output tokens on each step. Defaults to the model's maximum.
     */
    loop: (opts?: LLMLoopOpts) => LLM;
    /**
     * The full message history, as structured messages.
     */
    messages: () => Promise<LLMMessage[]>;
    /**
     * The model the conversation is running against, after resolving any configured default.
     */
    model: () => Promise<string>;
    /**
     * A portable, self-contained ID for the conversation that node() can resolve in any session. Unlike id, which may return an engine-local runtime handle valid only within the current session, this returns the recipe form suitable for persisting and later restoring the conversation.
     */
    portableID: () => Promise<ID>;
    /**
     * The provider serving the model, e.g. "anthropic", "openai", "google", or "local".
     */
    provider: () => Promise<string>;
    /**
     * Re-emit telemetry spans for the full message history, so a loaded conversation displays in the TUI.
     */
    replay: () => Promise<LLM>;
    /**
     * Advance the conversation by a single step: send the queued prompt or tool results to the model, evaluate any tool calls it makes, and queue their results. Use loop to step until the model ends its turn.
     * @param opts.maxTokens Cap the model's output tokens for this step. Defaults to the model's maximum.
     */
    step: (opts?: LLMStepOpts) => LLM;
    /**
     * Force evaluation of the conversation's pending operations (prompts, steps, loops) in the engine.
     */
    sync: () => Promise<LLM>;
    /**
     * The cumulative token usage, summed across every API call in the conversation.
     */
    tokenUsage: () => LLMTokenUsage;
    /**
     * Render documentation for the tools currently exposed to the model.
     */
    tools: () => Promise<string>;
    /**
     * The message history rendered as a plain-text transcript, suitable for feeding back to an LLM (e.g. for summarization).
     */
    transcript: () => Promise<string>;
    /**
     * Return a new LLM with the specified function no longer exposed as a tool
     * @param typeName The type name whose function will be blocked
     * @param function The function to block
     *
     * Will be converted to lowerCamelCase if necessary.
     */
    withBlockedFunction: (typeName: string, function_: string) => LLM;
    /**
     * allow the LLM to interact with an environment via MCP
     */
    withEnv: (env: Env) => LLM;
    /**
     * Add an external MCP server to the LLM
     * @param name The name of the MCP server
     * @param service The MCP service to run and communicate with over stdio
     */
    withMCPServer: (name: string, service: Service) => LLM;
    /**
     * Change the model for the rest of the conversation. The message history is preserved; the new model takes effect on the next step.
     * @param model The model to use, e.g. "claude-sonnet-4-5" or "gpt-5.4".
     * @param opts.provider The provider serving the model, e.g. "openai". Overrides the provider otherwise inferred from the model name — useful when the name matches no known pattern (e.g. a fine-tune), or matches the wrong one.
     */
    withModel: (model: string, opts?: LLMWithModelOpts) => LLM;
    /**
     * Track an object so the LLM can reference it in subsequent tool calls.
     * @param tag Arbitrary string tag for the object, typically in TypeName#Number format
     * @param object The object to track, as a generic ID
     */
    withObject: (tag: string, object: ID) => LLM;
    /**
     * Queue a user prompt, to be sent to the model on the next step or loop.
     * @param prompt The prompt to send
     */
    withPrompt: (prompt: string) => LLM;
    /**
     * Queue a file's contents as a user prompt, like withPrompt.
     * @param file The file to read the prompt from
     */
    withPromptFile: (file: File) => LLM;
    /**
     * Append an assistant response to the message history without calling the model, e.g. to reconstruct a conversation from another source.
     * @param content The response content
     * @param opts.inputTokens Uncached input tokens sent
     * @param opts.outputTokens Tokens received from the model, including text and tool calls
     * @param opts.cachedTokenReads Cached input tokens read
     * @param opts.cachedTokenWrites Cached input tokens written
     * @param opts.totalTokens Total tokens consumed by this response
     */
    withResponse: (content: LLMContentBlockInput[], opts?: LLMWithResponseOpts) => LLM;
    /**
     * Use a static set of tools for method calls, e.g. for MCP clients that do not support dynamic tool registration
     */
    withStaticTools: () => LLM;
    /**
     * Add a system prompt, instructing the model across the whole conversation.
     * @param prompt The system prompt to send
     */
    withSystemPrompt: (prompt: string) => LLM;
    /**
     * Append the result of a tool call to the message history.
     * @param callId The ID of the tool call this result responds to
     * @param content The content returned by the tool
     * @param errored Whether the tool call resulted in an error
     */
    withToolResult: (callId: string, content: string, errored: boolean) => LLM;
    /**
     * Disable the default system prompt
     */
    withoutDefaultSystemPrompt: () => LLM;
    /**
     * Clear the message history, keeping only the system prompts.
     */
    withoutMessageHistory: () => LLM;
    /**
     * Clear the user-added system prompts, keeping only the default system prompt.
     */
    withoutSystemPrompts: () => LLM;
    /**
     * Call the provided function with current LLM.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: LLM) => LLM) => LLM;
}
/**
 * A single piece of content within an LLM message.
 */
declare class LLMContentBlock extends BaseClient {
    private readonly _id?;
    private readonly _arguments?;
    private readonly _callId?;
    private readonly _errored?;
    private readonly _kind?;
    private readonly _signature?;
    private readonly _text?;
    private readonly _toolName?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _arguments?: JSON, _callId?: string, _errored?: boolean, _kind?: LLMContentBlockKind, _signature?: string, _text?: string, _toolName?: string);
    /**
     * A unique identifier for this LLMContentBlock.
     */
    id: () => Promise<ID>;
    /**
     * The arguments passed to the tool, JSON-encoded (for TOOL_CALL kind).
     */
    arguments_: () => Promise<JSON>;
    /**
     * The unique ID of a tool call (for TOOL_CALL or TOOL_RESULT kinds).
     */
    callId: () => Promise<string>;
    /**
     * Whether the tool call resulted in an error (for TOOL_RESULT kind).
     */
    errored: () => Promise<boolean>;
    /**
     * The kind of content block, which determines the other populated fields.
     */
    kind: () => Promise<LLMContentBlockKind>;
    /**
     * Provider-specific opaque data (e.g. Anthropic thinking signature). Preserve it when reconstructing a conversation.
     */
    signature: () => Promise<string>;
    /**
     * Text content (for TEXT, THINKING, or TOOL_RESULT kinds).
     */
    text: () => Promise<string>;
    /**
     * The name of the tool called (for TOOL_CALL kind).
     */
    toolName: () => Promise<string>;
}
/**
 * A single message in an LLM conversation.
 */
declare class LLMMessage extends BaseClient {
    private readonly _id?;
    private readonly _role?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _role?: LLMMessageRole);
    /**
     * A unique identifier for this LLMMessage.
     */
    id: () => Promise<ID>;
    /**
     * The message's content blocks, in the order the model produced them.
     */
    content: () => Promise<LLMContentBlock[]>;
    /**
     * The role that produced this message.
     */
    role: () => Promise<LLMMessageRole>;
    /**
     * Token usage reported by the provider for the API call that produced this message; all zeros except on assistant responses.
     */
    tokenUsage: () => LLMTokenUsage;
}
/**
 * A count of tokens consumed by LLM API calls.
 */
declare class LLMTokenUsage extends BaseClient {
    private readonly _id?;
    private readonly _cachedTokenReads?;
    private readonly _cachedTokenWrites?;
    private readonly _inputTokens?;
    private readonly _outputTokens?;
    private readonly _totalTokens?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _cachedTokenReads?: number, _cachedTokenWrites?: number, _inputTokens?: number, _outputTokens?: number, _totalTokens?: number);
    /**
     * A unique identifier for this LLMTokenUsage.
     */
    id: () => Promise<ID>;
    /**
     * Input tokens served from the provider's prompt cache.
     */
    cachedTokenReads: () => Promise<number>;
    /**
     * Input tokens written to the provider's prompt cache.
     */
    cachedTokenWrites: () => Promise<number>;
    /**
     * Uncached input tokens sent to the model.
     */
    inputTokens: () => Promise<number>;
    /**
     * Tokens received from the model, including text and tool calls.
     */
    outputTokens: () => Promise<number>;
    /**
     * Total tokens consumed, as reported by the provider.
     */
    totalTokens: () => Promise<number>;
}
/**
 * A simple key value object that represents a label.
 */
declare class Label extends BaseClient {
    private readonly _id?;
    private readonly _name?;
    private readonly _value?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _name?: string, _value?: string);
    /**
     * A unique identifier for this Label.
     */
    id: () => Promise<ID>;
    /**
     * The label name.
     */
    name: () => Promise<string>;
    /**
     * The label value.
     */
    value: () => Promise<string>;
}
/**
 * A definition of a list type in a Module.
 */
declare class ListTypeDef extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this ListTypeDef.
     */
    id: () => Promise<ID>;
    /**
     * The type of the elements in the list.
     */
    elementTypeDef: () => TypeDef;
}
/**
 * A Dagger module.
 */
declare class Module_ extends BaseClient {
    private readonly _id?;
    private readonly _description?;
    private readonly _name?;
    private readonly _serve?;
    private readonly _sync?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _description?: string, _name?: string, _serve?: Void, _sync?: ID);
    /**
     * A unique identifier for this Module.
     */
    id: () => Promise<ID>;
    /**
     * Return the check defined by the module with the given name. Must match to exactly one check.
     * @param name The name of the check to retrieve
     * @experimental
     */
    check: (name: string) => Check;
    /**
     * Return all checks defined by the module
     * @param opts.include Only include checks matching the specified patterns
     * @param opts.noGenerate When true, only return annotated check functions; exclude generate-as-checks
     * @experimental
     */
    checks: (opts?: ModuleChecksOpts) => CheckGroup;
    /**
     * The dependencies of the module.
     */
    dependencies: () => Promise<Module_[]>;
    /**
     * The doc string of the module, if any
     */
    description: () => Promise<string>;
    /**
     * Enumerations served by this module.
     */
    enums: () => Promise<TypeDef[]>;
    /**
     * The generated files and directories made on top of the module source's context directory.
     */
    generatedContextDirectory: () => Directory;
    /**
     * Return the generator defined by the module with the given name. Must match to exactly one generator.
     * @param name The name of the generator to retrieve
     * @experimental
     */
    generator: (name: string) => Generator;
    /**
     * Return all generators defined by the module
     * @param opts.include Only include generators matching the specified patterns
     * @experimental
     */
    generators: (opts?: ModuleGeneratorsOpts) => GeneratorGroup;
    /**
     * Interfaces served by this module.
     */
    interfaces: () => Promise<TypeDef[]>;
    /**
     * The introspection schema JSON file for this module.
     *
     * This file represents the schema visible to the module's source code, including all core types and those from the dependencies.
     *
     * Note: this is in the context of a module, so some core types may be hidden.
     */
    introspectionSchemaJSON: () => File;
    /**
     * The name of the module
     */
    name: () => Promise<string>;
    /**
     * Objects served by this module.
     */
    objects: () => Promise<TypeDef[]>;
    /**
     * The container that runs the module's entrypoint. It will fail to execute if the module doesn't compile.
     */
    runtime: () => Container;
    /**
     * The SDK config used by this module.
     */
    sdk: () => SDKConfig;
    /**
     * Serve a module's API in the current session.
     *
     * Note: this can only be called once per session. In the future, it could return a stream or service to remove the side effect.
     * @param opts.includeDependencies Expose the dependencies of this module to the client
     * @param opts.entrypoint Install the module as the entrypoint, promoting its main-object methods onto the Query root
     */
    serve: (opts?: ModuleServeOpts) => Promise<void>;
    /**
     * Return all services defined by the module
     * @param opts.include Only include services matching the specified patterns
     * @experimental
     */
    services: (opts?: ModuleServicesOpts) => UpGroup;
    /**
     * The source for the module.
     */
    source: () => ModuleSource;
    /**
     * Forces evaluation of the module, including any loading into the engine and associated validation.
     */
    sync: () => Promise<Module_>;
    /**
     * User-defined default values, loaded from local .env files.
     */
    userDefaults: () => EnvFile;
    /**
     * Retrieves the module with the given description
     * @param description The description to set
     */
    withDescription: (description: string) => Module_;
    /**
     * This module plus the given Enum type and associated values
     */
    withEnum: (enum_: TypeDef) => Module_;
    /**
     * This module plus the given Interface type and associated functions
     */
    withInterface: (iface: TypeDef) => Module_;
    /**
     * This module plus the given Object type and associated functions.
     */
    withObject: (object: TypeDef) => Module_;
    /**
     * Call the provided function with current Module.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Module_) => Module_) => Module_;
}
/**
 * The client generated for the module.
 */
declare class ModuleConfigClient extends BaseClient {
    private readonly _id?;
    private readonly _directory?;
    private readonly _generator?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _directory?: string, _generator?: string);
    /**
     * A unique identifier for this ModuleConfigClient.
     */
    id: () => Promise<ID>;
    /**
     * The directory the client is generated in.
     */
    directory: () => Promise<string>;
    /**
     * The generator to use
     */
    generator: () => Promise<string>;
}
/**
 * The source needed to load and run a module, along with any metadata about the source such as versions/urls/etc.
 */
declare class ModuleSource extends BaseClient {
    private readonly _id?;
    private readonly _asString?;
    private readonly _cloneRef?;
    private readonly _commit?;
    private readonly _configExists?;
    private readonly _digest?;
    private readonly _engineVersion?;
    private readonly _htmlRepoURL?;
    private readonly _htmlURL?;
    private readonly _kind?;
    private readonly _localContextDirectoryPath?;
    private readonly _moduleName?;
    private readonly _moduleOriginalName?;
    private readonly _originalSubpath?;
    private readonly _pin?;
    private readonly _repoRootPath?;
    private readonly _sourceRootSubpath?;
    private readonly _sourceSubpath?;
    private readonly _sync?;
    private readonly _version?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _asString?: string, _cloneRef?: string, _commit?: string, _configExists?: boolean, _digest?: string, _engineVersion?: string, _htmlRepoURL?: string, _htmlURL?: string, _kind?: ModuleSourceKind, _localContextDirectoryPath?: string, _moduleName?: string, _moduleOriginalName?: string, _originalSubpath?: string, _pin?: string, _repoRootPath?: string, _sourceRootSubpath?: string, _sourceSubpath?: string, _sync?: ID, _version?: string);
    /**
     * A unique identifier for this ModuleSource.
     */
    id: () => Promise<ID>;
    /**
     * Load the source as a module. If this is a local source, the parent directory must have been provided during module source creation
     */
    asModule: () => Module_;
    /**
     * A human readable ref string representation of this module source.
     */
    asString: () => Promise<string>;
    /**
     * The blueprint referenced by the module source.
     * @deprecated Legacy dagger.json field. Generic module loading no longer honors it; use workspace modules in dagger.toml instead.
     */
    blueprint: () => ModuleSource;
    /**
     * The client-facing introspection schema JSON file for this module source.
     *
     * This is the schema consumed by client codegen: unlike introspectionSchemaJSON (the module-facing schema), it hides no core types and installs this module (reached via dag.<moduleName>) so a generated client can bind it. The module's dependencies are excluded: a client is generated for a single module plus core, not its dependency graph.
     */
    clientSchemaIntrospectionJSON: () => File;
    /**
     * The ref to clone the root of the git repo from. Only valid for git sources.
     */
    cloneRef: () => Promise<string>;
    /**
     * The resolved commit of the git repo this source points to.
     */
    commit: () => Promise<string>;
    /**
     * The clients generated for the module.
     */
    configClients: () => Promise<ModuleConfigClient[]>;
    /**
     * Whether an existing module config file was found.
     */
    configExists: () => Promise<boolean>;
    /**
     * The full directory loaded for the module source, including the source code as a subdirectory.
     */
    contextDirectory: () => Directory;
    /**
     * The dependencies of the module source.
     */
    dependencies: () => Promise<ModuleSource[]>;
    /**
     * A content-hash of the module source. Module sources with the same digest will output the same generated context and convert into the same module instance.
     */
    digest: () => Promise<string>;
    /**
     * The directory containing the module configuration and source code (source code may be in a subdir).
     * @param path A subpath from the source directory to select.
     */
    directory: (path: string) => Directory;
    /**
     * The engine version of the module.
     */
    engineVersion: () => Promise<string>;
    /**
     * Generate this module's transitive local dependency closure and return the staged changes as a single changeset against the unstaged workspace root.
     *
     * Each local dependency is generated by its own SDK against a workspace scoped to it, carrying the dependency's own already-generated dependencies. Remote (git) dependencies are assumed committed and skipped. Overlay the result onto the workspace before generating this module; it is not this module's own generated code.
     * @param workspace The workspace to generate the local dependencies against.
     */
    generateLocalDependencies: (workspace: Workspace) => Changeset;
    /**
     * The generated files and directories made on top of the module source's context directory, returned as a Changeset.
     */
    generatedContextChangeset: () => Changeset;
    /**
     * The generated files and directories made on top of the module source's context directory.
     */
    generatedContextDirectory: () => Directory;
    /**
     * The URL to access the web view of the repository (e.g., GitHub, GitLab, Bitbucket).
     */
    htmlRepoURL: () => Promise<string>;
    /**
     * The URL to the source's git repo in a web browser. Only valid for git sources.
     */
    htmlURL: () => Promise<string>;
    /**
     * The introspection schema JSON file for this module source.
     *
     * This file represents the schema visible to the module's source code, including all core types and those from the dependencies.
     *
     * Note: this is in the context of a module, so some core types may be hidden.
     */
    introspectionSchemaJSON: () => File;
    /**
     * The kind of module source (currently local, git or dir).
     */
    kind: () => Promise<ModuleSourceKind>;
    /**
     * The full absolute path to the context directory on the caller's host filesystem that this module source is loaded from. Only valid for local module sources.
     */
    localContextDirectoryPath: () => Promise<string>;
    /**
     * The name of the module, including any setting via the withName API.
     */
    moduleName: () => Promise<string>;
    /**
     * The original name of the module as read from the module config file (or set for the first time with the withName API).
     */
    moduleOriginalName: () => Promise<string>;
    /**
     * The original subpath used when instantiating this module source, relative to the context directory.
     */
    originalSubpath: () => Promise<string>;
    /**
     * The pinned version of this module source.
     */
    pin: () => Promise<string>;
    /**
     * The import path corresponding to the root of the git repo this source points to. Only valid for git sources.
     */
    repoRootPath: () => Promise<string>;
    /**
     * The SDK configuration of the module.
     */
    sdk: () => SDKConfig;
    /**
     * The path, relative to the context directory, that contains the module config.
     */
    sourceRootSubpath: () => Promise<string>;
    /**
     * The path to the directory containing the module's source code, relative to the context directory.
     */
    sourceSubpath: () => Promise<string>;
    /**
     * Forces evaluation of the module source, including any loading into the engine and associated validation.
     */
    sync: () => Promise<ModuleSource>;
    /**
     * The toolchains referenced by the module source.
     * @deprecated Legacy dagger.json field. Generic module loading no longer honors it; use workspace modules in dagger.toml instead.
     */
    toolchains: () => Promise<ModuleSource[]>;
    /**
     * The module's dagger.json with any in-memory edits from with* APIs applied, as a diff relative to the source's context directory.
     *
     * Unlike generatedContextDirectory, this does not run codegen and does not validate the engine version against the running engine, so it can be used to declare an engine requirement newer than the running engine. Loading or serving such a module still fails at moduleSource.asModule.
     */
    updatedConfigDirectory: () => Directory;
    /**
     * User-defined defaults read from local .env files
     */
    userDefaults: () => EnvFile;
    /**
     * The specified version of the git repo this source points to.
     */
    version: () => Promise<string>;
    /**
     * Set a blueprint for the module source.
     * @param blueprint The blueprint module to set.
     * @deprecated Legacy dagger.json field. Generic module loading no longer honors it; use workspace modules in `dagger.toml` instead.
     */
    withBlueprint: (blueprint: ModuleSource) => ModuleSource;
    /**
     * Update the module source with a new client to generate.
     * @param generator The generator to use
     * @param outputDir The output directory for the generated client.
     */
    withClient: (generator: string, outputDir: string) => ModuleSource;
    /**
     * Append the provided dependencies to the module source's dependency list.
     * @param dependencies The dependencies to append.
     */
    withDependencies: (dependencies: ModuleSource[]) => ModuleSource;
    /**
     * Upgrade the engine version of the module to the given value.
     * @param version The engine version to upgrade to.
     */
    withEngineVersion: (version: string) => ModuleSource;
    /**
     * Enable the experimental features for the module source.
     * @param features The experimental features to enable.
     */
    withExperimentalFeatures: (features: ModuleSourceExperimentalFeature[]) => ModuleSource;
    /**
     * Update the module source with additional include patterns for files+directories from its context that are required for building it
     * @param patterns The new additional include patterns.
     */
    withIncludes: (patterns: string[]) => ModuleSource;
    /**
     * Update the module source with a new name.
     * @param name The name to set.
     */
    withName: (name: string) => ModuleSource;
    /**
     * Update the module source with a new SDK.
     * @param source The SDK source to set.
     */
    withSDK: (source: string) => ModuleSource;
    /**
     * Update the module source with a new source subpath.
     * @param path The path to set as the source subpath. Must be relative to the module source's source root directory.
     */
    withSourceSubpath: (path: string) => ModuleSource;
    /**
     * Add toolchains to the module source.
     * @param toolchains The toolchain modules to add.
     * @deprecated Legacy dagger.json field. Generic module loading no longer honors it; use workspace modules in `dagger.toml` instead.
     */
    withToolchains: (toolchains: ModuleSource[]) => ModuleSource;
    /**
     * Update the blueprint module to the latest version.
     * @deprecated Legacy dagger.json field. Generic module loading no longer honors it; use workspace modules in `dagger.toml` instead.
     */
    withUpdateBlueprint: () => ModuleSource;
    /**
     * Update one or more module dependencies.
     * @param dependencies The dependencies to update.
     */
    withUpdateDependencies: (dependencies: string[]) => ModuleSource;
    /**
     * Update one or more toolchains.
     * @param toolchains The toolchains to update.
     * @deprecated Legacy dagger.json field. Generic module loading no longer honors it; use workspace modules in `dagger.toml` instead.
     */
    withUpdateToolchains: (toolchains: string[]) => ModuleSource;
    /**
     * Update one or more clients.
     * @param clients The clients to update
     */
    withUpdatedClients: (clients: string[]) => ModuleSource;
    /**
     * Remove the current blueprint from the module source.
     * @deprecated Legacy dagger.json field. Generic module loading no longer honors it; use workspace modules in `dagger.toml` instead.
     */
    withoutBlueprint: () => ModuleSource;
    /**
     * Remove a client from the module source.
     * @param path The path of the client to remove.
     */
    withoutClient: (path: string) => ModuleSource;
    /**
     * Remove the provided dependencies from the module source's dependency list.
     * @param dependencies The dependencies to remove.
     */
    withoutDependencies: (dependencies: string[]) => ModuleSource;
    /**
     * Disable experimental features for the module source.
     * @param features The experimental features to disable.
     */
    withoutExperimentalFeatures: (features: ModuleSourceExperimentalFeature[]) => ModuleSource;
    /**
     * Remove the provided toolchains from the module source.
     * @param toolchains The toolchains to remove.
     * @deprecated Legacy dagger.json field. Generic module loading no longer honors it; use workspace modules in `dagger.toml` instead.
     */
    withoutToolchains: (toolchains: string[]) => ModuleSource;
    /**
     * Call the provided function with current ModuleSource.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: ModuleSource) => ModuleSource) => ModuleSource;
}
/**
 * An object with a globally unique ID.
 */
interface Node {
    id(): Promise<ID>;
}
declare class _NodeClient extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    id: () => Promise<ID>;
}
/**
 * A definition of a custom object defined in a Module.
 */
declare class ObjectTypeDef extends BaseClient {
    private readonly _id?;
    private readonly _deprecated?;
    private readonly _description?;
    private readonly _name?;
    private readonly _sourceModuleName?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _deprecated?: string, _description?: string, _name?: string, _sourceModuleName?: string);
    /**
     * A unique identifier for this ObjectTypeDef.
     */
    id: () => Promise<ID>;
    /**
     * The function used to construct new instances of this object, if any.
     */
    constructor_: () => Function_;
    /**
     * The reason this enum member is deprecated, if any.
     */
    deprecated: () => Promise<string>;
    /**
     * The doc string for the object, if any.
     */
    description: () => Promise<string>;
    /**
     * Static fields defined on this object, if any.
     */
    fields: () => Promise<FieldTypeDef[]>;
    /**
     * Functions defined on this object, if any.
     */
    functions: () => Promise<Function_[]>;
    /**
     * The name of the object.
     */
    name: () => Promise<string>;
    /**
     * The location of this object declaration.
     */
    sourceMap: () => SourceMap;
    /**
     * If this ObjectTypeDef is associated with a Module, the name of the module. Unset otherwise.
     */
    sourceModuleName: () => Promise<string>;
}
/**
 * A port exposed by a container.
 */
declare class Port extends BaseClient {
    private readonly _id?;
    private readonly _description?;
    private readonly _experimentalSkipHealthcheck?;
    private readonly _port?;
    private readonly _protocol?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _description?: string, _experimentalSkipHealthcheck?: boolean, _port?: number, _protocol?: NetworkProtocol);
    /**
     * A unique identifier for this Port.
     */
    id: () => Promise<ID>;
    /**
     * The port description.
     */
    description: () => Promise<string>;
    /**
     * Skip the health check when run as a service.
     */
    experimentalSkipHealthcheck: () => Promise<boolean>;
    /**
     * The port number.
     */
    port: () => Promise<number>;
    /**
     * The transport layer protocol.
     */
    protocol: () => Promise<NetworkProtocol>;
}
/**
 * The root of the DAG.
 */
declare class Client extends BaseClient {
    private readonly _id?;
    private readonly _defaultPlatform?;
    private readonly _version?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _defaultPlatform?: Platform, _version?: string);
    /**
     * Get the Raw GraphQL client.
     */
    getGQLClient(): graphql_request.GraphQLClient;
    /**
     * A unique identifier for this Query.
     */
    id: () => Promise<ID>;
    /**
     * initialize an address to load directories, containers, secrets or other object types.
     */
    address: (value: string) => Address;
    /**
     * Constructs a cache volume for a given cache key.
     * @param key A string identifier to target this cache volume (e.g., "modules-cache").
     * @param opts.source Identifier of the directory to use as the cache volume's root.
     * @param opts.sharing Sharing mode of the cache volume.
     * @param opts.owner A user:group to set for the cache volume root.
     *
     * The user and group can either be an ID (1000:1000) or a name (foo:bar).
     *
     * If the group is omitted, it defaults to the same as the user.
     */
    cacheVolume: (key: string, opts?: ClientCacheVolumeOpts) => CacheVolume;
    /**
     * Creates an empty changeset
     */
    changeset: () => Changeset;
    /**
     * Dagger Cloud configuration and state
     */
    cloud: () => Cloud;
    /**
     * Creates a scratch container, with no image or metadata.
     *
     * To pull an image, follow up with the "from" function.
     * @param opts.platform Platform to initialize the container with. Defaults to the native platform of the current engine
     */
    container: (opts?: ClientContainerOpts) => Container;
    /**
     * Returns the current environment
     *
     * When called from a function invoked via an LLM tool call, this will be the LLM's current environment, including any modifications made through calling tools. Env values returned by functions become the new environment for subsequent calls, and Changeset values returned by functions are applied to the environment's workspace.
     *
     * When called from a module function outside of an LLM, this returns an Env with the current module installed, and with the current module's source directory as its workspace.
     * @experimental
     */
    currentEnv: () => Env;
    /**
     * The FunctionCall context that the SDK caller is currently executing in.
     *
     * If the caller is not currently executing in a function, this will return an error.
     */
    currentFunctionCall: () => FunctionCall;
    /**
     * The module currently being served in the session, if any.
     */
    currentModule: () => CurrentModule;
    /**
     * The TypeDef representations of the objects currently being served in the session.
     * @param opts.returnAllTypes Return the full referenced typedef closure instead of only top-level served typedefs.
     * @param opts.hideCore Strip core API functions from the Query type, leaving only module-sourced functions (constructors, entrypoint proxies, etc.).
     *
     * Core types (Container, Directory, etc.) are kept so return types and method chaining still work.
     */
    currentTypeDefs: (opts?: ClientCurrentTypeDefsOpts) => Promise<TypeDef[]>;
    /**
     * Detect and return the current workspace.
     * @experimental
     */
    currentWorkspace: () => Workspace;
    /**
     * The default platform of the engine.
     */
    defaultPlatform: () => Promise<Platform>;
    /**
     * Creates an empty directory.
     */
    directory: () => Directory;
    /**
     * The Dagger engine container configuration and state
     */
    engine: () => Engine;
    /**
     * Initializes a new environment
     * @param opts.privileged Give the environment the same privileges as the caller: core API including host access, current module, and dependencies
     * @param opts.writable Allow new outputs to be declared and saved in the environment
     * @experimental
     */
    env: (opts?: ClientEnvOpts) => Env;
    /**
     * Initialize an environment file
     * @param opts.expand Replace "${VAR}" or "$VAR" with the value of other vars
     */
    envFile: (opts?: ClientEnvFileOpts) => EnvFile;
    /**
     * Create a new error.
     * @param message A brief description of the error.
     */
    error: (message: string) => Error$1;
    /**
     * Creates a file with the specified contents.
     * @param name Name of the new file. Example: "foo.txt"
     * @param contents Contents of the new file. Example: "Hello world!"
     * @param opts.permissions Permissions of the new file. Example: 0600
     */
    file: (name: string, contents: string, opts?: ClientFileOpts) => File;
    /**
     * Creates a function.
     * @param name Name of the function, in its original format from the implementation language.
     * @param returnType Return type of the function.
     */
    function_: (name: string, returnType: TypeDef) => Function_;
    /**
     * Create a code generation result, given a directory containing the generated code.
     */
    generatedCode: (code: Directory) => GeneratedCode;
    /**
     * Queries a Git repository.
     * @param url URL of the git repository.
     *
     * Can be formatted as `https://{host}/{owner}/{repo}`, `git@{host}:{owner}/{repo}`.
     *
     * Suffix ".git" is optional.
     * @param opts.keepGitDir DEPRECATED: Set to true to keep .git directory.
     * @param opts.sshKnownHosts Set SSH known hosts
     * @param opts.sshAuthSocket Set SSH auth socket
     * @param opts.httpAuthUsername Username used to populate the password during basic HTTP Authorization
     * @param opts.httpAuthToken Secret used to populate the password during basic HTTP Authorization
     * @param opts.httpAuthHeader Secret used to populate the Authorization HTTP header
     * @param opts.experimentalServiceHost A service which must be started before the repo is fetched.
     */
    git: (url: string, opts?: ClientGitOpts) => GitRepository;
    /**
     * Queries the host environment.
     */
    host: () => Host;
    /**
     * Returns a file containing an http remote url content.
     * @param url HTTP url to get the content from (e.g., "https://docs.dagger.io").
     * @param opts.name File name to use for the file. Defaults to the last part of the URL.
     * @param opts.permissions Permissions to set on the file.
     * @param opts.checksum Expected digest of the downloaded content (e.g., "sha256:...").
     * @param opts.authHeader Secret used to populate the Authorization HTTP header
     * @param opts.experimentalServiceHost A service which must be started before the URL is fetched.
     */
    http: (url: string, opts?: ClientHttpOpts) => File;
    /**
     * Initialize a JSON value
     */
    json: () => JSONValue;
    /**
     * Initialize a new LLM conversation.
     * @param opts.model The model to converse with, e.g. "claude-sonnet-4-5" or "gpt-5.4". Defaults to the configured default model.
     * @param opts.provider The provider serving the model, e.g. "openai". Overrides the provider otherwise inferred from the model name — useful when the name matches no known pattern (e.g. a fine-tune), or matches the wrong one.
     * @experimental
     */
    llm: (opts?: ClientLLMOpts) => LLM;
    /**
     * Create a new module.
     */
    module_: () => Module_;
    /**
     * Create a new module source instance from a source ref string
     * @param refString The string ref representation of the module source
     * @param opts.refPin The pinned version of the module source
     * @param opts.disableFindUp If true, do not attempt to find a module config file in a parent directory of the provided path. Only relevant for local module sources.
     * @param opts.allowNotExists If true, do not error out if the provided ref string is a local path and does not exist yet. Useful when initializing new modules in directories that don't exist yet.
     * @param opts.requireKind If set, error out if the ref string is not of the provided requireKind.
     */
    moduleSource: (refString: string, opts?: ClientModuleSourceOpts) => ModuleSource;
    /**
     * Load any object by its ID.
     */
    node: (id: ID) => Node;
    /**
     * Load a GraphQL introspection schema for merging.
     * @param json The introspection schema JSON to load.
     */
    schema: (json: JSON) => Schema;
    /**
     * Creates a new secret.
     * @param uri The URI of the secret store
     * @param opts.cacheKey If set, the given string will be used as the cache key for this secret. This means that any secrets with the same cache key will be considered equivalent in terms of cache lookups, even if they have different URIs or plaintext values.
     *
     * For example, two secrets with the same cache key provided as secret env vars to other wise equivalent containers will result in the container withExecs hitting the cache for each other.
     *
     * If not set, the cache key for the secret will be derived from its plaintext value as looked up when the secret is constructed.
     */
    secret: (uri: string, opts?: ClientSecretOpts) => Secret;
    /**
     * Sets a secret given a user defined name to its plaintext and returns the secret.
     *
     * The plaintext value is limited to a size of 128000 bytes.
     * @param name The user defined name for this secret
     * @param plaintext The plaintext of the secret
     */
    setSecret: (name: string, plaintext: string) => Secret;
    /**
     * Creates source map metadata.
     * @param filename The filename from the module source.
     * @param line The line number within the filename.
     * @param column The column number within the line.
     */
    sourceMap: (filename: string, line: number, column: number) => SourceMap;
    /**
     * Constructs an SSHFS volume.
     * @param endpoint SSHFS endpoint URL in the form sshfs://user@host[:port]/absolute/path.
     * @param privateKey Private key secret used to authenticate to the remote host.
     * @param opts.knownHosts known_hosts material used to verify the remote host key. Required unless insecureSkipHostKeyCheck is true.
     * @param opts.cacheKey Optional cache equivalence key. If set, volumes with the same cacheKey may be considered equivalent for cache lookups, still subject to their resource dependencies.
     * @param opts.insecureSkipHostKeyCheck Disable SSH host key verification. This is insecure and must be explicitly opted into.
     * @param opts.experimentalServiceHost Service to use as the SSHFS network endpoint while verifying the original host key.
     */
    sshfsVolume: (endpoint: string, privateKey: Secret, opts?: ClientSshfsVolumeOpts) => Volume;
    /**
     * Create a new TypeDef.
     */
    typeDef: () => TypeDef;
    /**
     * Get the current Dagger Engine version.
     */
    version: () => Promise<string>;
}
/**
 * An internal persistent bare git mirror.
 */
declare class RemoteGitMirror extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this RemoteGitMirror.
     */
    id: () => Promise<ID>;
}
/**
 * The SDK config of the module.
 */
declare class SDKConfig extends BaseClient {
    private readonly _id?;
    private readonly _debug?;
    private readonly _source?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _debug?: boolean, _source?: string);
    /**
     * A unique identifier for this SDKConfig.
     */
    id: () => Promise<ID>;
    /**
     * Whether to start the SDK runtime in debug mode with an interactive terminal.
     */
    debug: () => Promise<boolean>;
    /**
     * Source of the SDK. Either a name of a builtin SDK or a module source ref string pointing to the SDK's implementation.
     */
    source: () => Promise<string>;
}
/**
 * A definition of a custom scalar defined in a Module.
 */
declare class ScalarTypeDef extends BaseClient {
    private readonly _id?;
    private readonly _description?;
    private readonly _name?;
    private readonly _sourceModuleName?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _description?: string, _name?: string, _sourceModuleName?: string);
    /**
     * A unique identifier for this ScalarTypeDef.
     */
    id: () => Promise<ID>;
    /**
     * A doc string for the scalar, if any.
     */
    description: () => Promise<string>;
    /**
     * The name of the scalar.
     */
    name: () => Promise<string>;
    /**
     * If this ScalarTypeDef is associated with a Module, the name of the module. Unset otherwise.
     */
    sourceModuleName: () => Promise<string>;
}
/**
 * A GraphQL introspection schema that can be inspected and merged.
 */
declare class Schema extends BaseClient {
    private readonly _id?;
    private readonly _contents?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _contents?: JSON);
    /**
     * A unique identifier for this Schema.
     */
    id: () => Promise<ID>;
    /**
     * Serialize the schema back to introspection JSON.
     */
    contents: () => Promise<JSON>;
    /**
     * Merge a module's introspection-shaped type definitions into the schema, returning the combined schema.
     * @param moduleTypes Introspection JSON describing the types the module defines. Object, interface and enum types are appended to the schema, and a constructor field for the module is added to the Query type.
     * @param moduleName The name of the module whose types are being merged. Used to stamp the @sourceMap directive and to derive the module's constructor field.
     */
    merge: (moduleTypes: JSON, moduleName: string) => Schema;
    /**
     * Call the provided function with current Schema.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Schema) => Schema) => Schema;
}
declare class SearchResult extends BaseClient {
    private readonly _id?;
    private readonly _absoluteOffset?;
    private readonly _filePath?;
    private readonly _lineNumber?;
    private readonly _matchedLines?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _absoluteOffset?: number, _filePath?: string, _lineNumber?: number, _matchedLines?: string);
    /**
     * A unique identifier for this SearchResult.
     */
    id: () => Promise<ID>;
    /**
     * The byte offset of this line within the file.
     */
    absoluteOffset: () => Promise<number>;
    /**
     * The path to the file that matched.
     */
    filePath: () => Promise<string>;
    /**
     * The first line that matched.
     */
    lineNumber: () => Promise<number>;
    /**
     * The line content that matched.
     */
    matchedLines: () => Promise<string>;
    /**
     * Sub-match positions and content within the matched lines.
     */
    submatches: () => Promise<SearchSubmatch[]>;
}
declare class SearchSubmatch extends BaseClient {
    private readonly _id?;
    private readonly _end?;
    private readonly _start?;
    private readonly _text?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _end?: number, _start?: number, _text?: string);
    /**
     * A unique identifier for this SearchSubmatch.
     */
    id: () => Promise<ID>;
    /**
     * The match's end offset within the matched lines.
     */
    end: () => Promise<number>;
    /**
     * The match's start offset within the matched lines.
     */
    start: () => Promise<number>;
    /**
     * The matched text.
     */
    text: () => Promise<string>;
}
/**
 * A reference to a secret value, which can be handled more safely than the value itself.
 */
declare class Secret extends BaseClient {
    private readonly _id?;
    private readonly _name?;
    private readonly _plaintext?;
    private readonly _uri?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _name?: string, _plaintext?: string, _uri?: string);
    /**
     * A unique identifier for this Secret.
     */
    id: () => Promise<ID>;
    /**
     * The name of this secret.
     */
    name: () => Promise<string>;
    /**
     * The value of this secret.
     */
    plaintext: () => Promise<string>;
    /**
     * The URI of this secret.
     */
    uri: () => Promise<string>;
}
/**
 * A content-addressed service providing TCP connectivity.
 */
declare class Service extends BaseClient {
    private readonly _id?;
    private readonly _endpoint?;
    private readonly _hostname?;
    private readonly _start?;
    private readonly _stop?;
    private readonly _sync?;
    private readonly _up?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _endpoint?: string, _hostname?: string, _start?: ID, _stop?: ID, _sync?: ID, _up?: Void);
    /**
     * A unique identifier for this Service.
     */
    id: () => Promise<ID>;
    /**
     * Retrieves an endpoint that clients can use to reach this container.
     *
     * If no port is specified, the first exposed port is used. If none exist an error is returned.
     *
     * If a scheme is specified, a URL is returned. Otherwise, a host:port pair is returned.
     * @param opts.port The exposed port number for the endpoint
     * @param opts.scheme Return a URL with the given scheme, eg. http for http://
     */
    endpoint: (opts?: ServiceEndpointOpts) => Promise<string>;
    /**
     * Retrieves a hostname which can be used by clients to reach this container.
     */
    hostname: () => Promise<string>;
    /**
     * Retrieves the list of ports provided by the service.
     */
    ports: () => Promise<Port[]>;
    /**
     * Start the service and wait for its health checks to succeed.
     *
     * Services bound to a Container do not need to be manually started.
     */
    start: () => Promise<Service>;
    /**
     * Stop the service.
     * @param opts.kill Immediately kill the service without waiting for a graceful exit
     */
    stop: (opts?: ServiceStopOpts) => Promise<Service>;
    /**
     * Forces evaluation of the pipeline in the engine.
     */
    sync: () => Promise<Service>;
    terminal: (opts?: ServiceTerminalOpts) => Service;
    /**
     * Creates a tunnel that forwards traffic from the caller's network to this service.
     * @param opts.ports List of frontend/backend port mappings to forward.
     *
     * Frontend is the port accepting traffic on the host, backend is the service port.
     * @param opts.random Bind each tunnel port to a random port on the host.
     */
    up: (opts?: ServiceUpOpts) => Promise<void>;
    /**
     * Configures a hostname which can be used by clients within the session to reach this container.
     * @param hostname The hostname to use.
     */
    withHostname: (hostname: string) => Service;
    /**
     * Call the provided function with current Service.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Service) => Service) => Service;
}
/**
 * A Unix or TCP/IP socket that can be mounted into a container.
 */
declare class Socket extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this Socket.
     */
    id: () => Promise<ID>;
}
/**
 * Source location information.
 */
declare class SourceMap extends BaseClient {
    private readonly _id?;
    private readonly _column?;
    private readonly _filename?;
    private readonly _line?;
    private readonly _module?;
    private readonly _url?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _column?: number, _filename?: string, _line?: number, _module?: string, _url?: string);
    /**
     * A unique identifier for this SourceMap.
     */
    id: () => Promise<ID>;
    /**
     * The column number within the line.
     */
    column: () => Promise<number>;
    /**
     * The filename from the module source.
     */
    filename: () => Promise<string>;
    /**
     * The line number within the filename.
     */
    line: () => Promise<number>;
    /**
     * The module dependency this was declared in.
     */
    module_: () => Promise<string>;
    /**
     * The URL to the file, if any. This can be used to link to the source map in the browser.
     */
    url: () => Promise<string>;
}
/**
 * A file or directory status object.
 */
declare class Stat extends BaseClient {
    private readonly _id?;
    private readonly _fileType?;
    private readonly _name?;
    private readonly _permissions?;
    private readonly _size?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _fileType?: FileType, _name?: string, _permissions?: number, _size?: number);
    /**
     * A unique identifier for this Stat.
     */
    id: () => Promise<ID>;
    /**
     * file type
     */
    fileType: () => Promise<FileType>;
    /**
     * file name
     */
    name: () => Promise<string>;
    /**
     * permission bits
     */
    permissions: () => Promise<number>;
    /**
     * file size
     */
    size: () => Promise<number>;
}
/**
 * An object that can be force-evaluated.
 *
 * Calling sync ensures that the object's entire dependency DAG has been evaluated, returning the object's ID once complete.
 */
interface Syncer {
    id(): Promise<ID>;
    sync(): Promise<Syncer>;
}
declare class _SyncerClient extends BaseClient {
    private readonly _id?;
    private readonly _sync?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _sync?: ID);
    id: () => Promise<ID>;
    sync: () => Promise<Syncer>;
}
/**
 * An interactive terminal that clients can connect to.
 */
declare class Terminal extends BaseClient {
    private readonly _id?;
    private readonly _sync?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _sync?: ID);
    /**
     * A unique identifier for this Terminal.
     */
    id: () => Promise<ID>;
    /**
     * Forces evaluation of the pipeline in the engine.
     *
     * It doesn't run the default command if no exec has been set.
     */
    sync: () => Promise<Terminal>;
}
/**
 * A definition of a parameter or return type in a Module.
 */
declare class TypeDef extends BaseClient {
    private readonly _id?;
    private readonly _kind?;
    private readonly _name?;
    private readonly _optional?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _kind?: TypeDefKind, _name?: string, _optional?: boolean);
    /**
     * A unique identifier for this TypeDef.
     */
    id: () => Promise<ID>;
    /**
     * If kind is ENUM, the enum-specific type definition. If kind is not ENUM, this will be null.
     */
    asEnum: () => EnumTypeDef;
    /**
     * If kind is INPUT, the input-specific type definition. If kind is not INPUT, this will be null.
     */
    asInput: () => InputTypeDef;
    /**
     * If kind is INTERFACE, the interface-specific type definition. If kind is not INTERFACE, this will be null.
     */
    asInterface: () => InterfaceTypeDef;
    /**
     * If kind is LIST, the list-specific type definition. If kind is not LIST, this will be null.
     */
    asList: () => ListTypeDef;
    /**
     * If kind is OBJECT, the object-specific type definition. If kind is not OBJECT, this will be null.
     */
    asObject: () => ObjectTypeDef;
    /**
     * If kind is SCALAR, the scalar-specific type definition. If kind is not SCALAR, this will be null.
     */
    asScalar: () => ScalarTypeDef;
    /**
     * The kind of type this is (e.g. primitive, list, object).
     */
    kind: () => Promise<TypeDefKind>;
    /**
     * The canonical non-optional name of the type.
     */
    name: () => Promise<string>;
    /**
     * Whether this type can be set to null. Defaults to false.
     */
    optional: () => Promise<boolean>;
    /**
     * Adds a function for constructing a new instance of an Object TypeDef, failing if the type is not an object.
     */
    withConstructor: (function_: Function_) => TypeDef;
    /**
     * Returns a TypeDef of kind Enum with the provided name.
     *
     * Note that an enum's values may be omitted if the intent is only to refer to an enum. This is how functions are able to return their own, or any other circular reference.
     * @param name The name of the enum
     * @param opts.description A doc string for the enum, if any
     * @param opts.sourceMap The source map for the enum definition.
     */
    withEnum: (name: string, opts?: TypeDefWithEnumOpts) => TypeDef;
    /**
     * Adds a static value for an Enum TypeDef, failing if the type is not an enum.
     * @param name The name of the member in the enum
     * @param opts.value The value of the member in the enum
     * @param opts.description A doc string for the member, if any
     * @param opts.sourceMap The source map for the enum member definition.
     * @param opts.deprecated If deprecated, the reason or migration path.
     */
    withEnumMember: (name: string, opts?: TypeDefWithEnumMemberOpts) => TypeDef;
    /**
     * Adds a static value for an Enum TypeDef, failing if the type is not an enum.
     * @param value The name of the value in the enum
     * @param opts.description A doc string for the value, if any
     * @param opts.sourceMap The source map for the enum value definition.
     * @param opts.deprecated If deprecated, the reason or migration path.
     * @deprecated Use withEnumMember instead
     */
    withEnumValue: (value: string, opts?: TypeDefWithEnumValueOpts) => TypeDef;
    /**
     * Adds a static field for an Object TypeDef, failing if the type is not an object.
     * @param name The name of the field in the object
     * @param typeDef The type of the field
     * @param opts.description A doc string for the field, if any
     * @param opts.sourceMap The source map for the field definition.
     * @param opts.deprecated If deprecated, the reason or migration path.
     */
    withField: (name: string, typeDef: TypeDef, opts?: TypeDefWithFieldOpts) => TypeDef;
    /**
     * Adds a function for an Object or Interface TypeDef, failing if the type is not one of those kinds.
     */
    withFunction: (function_: Function_) => TypeDef;
    /**
     * Returns a TypeDef of kind Interface with the provided name.
     */
    withInterface: (name: string, opts?: TypeDefWithInterfaceOpts) => TypeDef;
    /**
     * Sets the kind of the type.
     */
    withKind: (kind: TypeDefKind) => TypeDef;
    /**
     * Returns a TypeDef of kind List with the provided type for its elements.
     */
    withListOf: (elementType: TypeDef) => TypeDef;
    /**
     * Returns a TypeDef of kind Object with the provided name.
     *
     * Note that an object's fields and functions may be omitted if the intent is only to refer to an object. This is how functions are able to return their own object, or any other circular reference.
     */
    withObject: (name: string, opts?: TypeDefWithObjectOpts) => TypeDef;
    /**
     * Sets whether this type can be set to null.
     */
    withOptional: (optional: boolean) => TypeDef;
    /**
     * Returns a TypeDef of kind Scalar with the provided name.
     */
    withScalar: (name: string, opts?: TypeDefWithScalarOpts) => TypeDef;
    /**
     * Call the provided function with current TypeDef.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: TypeDef) => TypeDef) => TypeDef;
}
declare class Up extends BaseClient {
    private readonly _id?;
    private readonly _description?;
    private readonly _name?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _description?: string, _name?: string);
    /**
     * A unique identifier for this Up.
     */
    id: () => Promise<ID>;
    /**
     * The description of the service
     */
    description: () => Promise<string>;
    /**
     * Return the fully qualified name of the service
     */
    name: () => Promise<string>;
    /**
     * The original module in which the service has been defined
     */
    originalModule: () => Module_;
    /**
     * The path of the service within its module
     */
    path: () => Promise<string[]>;
    /**
     * Execute the service function
     */
    run: () => Up;
    /**
     * Call the provided function with current Up.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Up) => Up) => Up;
}
declare class UpGroup extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this UpGroup.
     */
    id: () => Promise<ID>;
    /**
     * Return a list of individual services and their details
     */
    list: () => Promise<Up[]>;
    /**
     * Execute all selected service functions
     */
    run: () => UpGroup;
    /**
     * Call the provided function with current UpGroup.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: UpGroup) => UpGroup) => UpGroup;
}
/**
 * A filesystem volume that can be mounted into containers.
 */
declare class Volume extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this Volume.
     */
    id: () => Promise<ID>;
}
/**
 * A Dagger workspace detected from the current working directory or constructed from a Directory.
 */
declare class Workspace extends BaseClient {
    private readonly _id?;
    private readonly _address?;
    private readonly _configFile?;
    private readonly _configRead?;
    private readonly _cwd?;
    private readonly _export?;
    private readonly _findUp?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _address?: string, _configFile?: string, _configRead?: string, _cwd?: string, _export?: Void, _findUp?: string);
    /**
     * A unique identifier for this Workspace.
     */
    id: () => Promise<ID>;
    /**
     * Canonical Dagger address of the workspace location, or an opaque identity for synthetic workspaces.
     */
    address: () => Promise<string>;
    /**
     * Return this workspace's pending overlay changes.
     */
    changes: () => Changeset;
    /**
     * Return all checks from modules loaded in the workspace.
     * @param opts.include Only include checks matching the specified patterns
     * @param opts.skip Skip checks matching the specified patterns
     * @param opts.noGenerate When true, only return annotated check functions; exclude generate-as-checks
     * @param opts.onlyGenerate When true, only return generate-as-checks; exclude annotated check functions
     */
    checks: (opts?: WorkspaceChecksOpts) => CheckGroup;
    /**
     * Selected native workspace config file relative to the workspace cwd, if any.
     */
    configFile: () => Promise<string>;
    /**
     * Read a configuration value from dagger.toml.
     *
     * If key is empty, returns the full config.
     *
     * If key points to a scalar, returns the value.
     *
     * If key points to a table, returns flattened dotted-key output.
     * @param opts.key Dotted key path (e.g. modules.greeter.source). Empty for full config.
     */
    configRead: (opts?: WorkspaceConfigReadOpts) => Promise<string>;
    /**
     * Current location within the workspace root.
     *
     * The workspace root is returned as "/".
     *
     * Relative paths in workspace APIs resolve from here.
     */
    cwd: () => Promise<string>;
    /**
     * Returns a Directory from the workspace.
     *
     * Relative paths resolve from the workspace cwd. Absolute paths resolve from the workspace root.
     * @param path Location of the directory to retrieve. Relative paths (e.g., "src") resolve from the workspace cwd; absolute paths (e.g., "/src") resolve from the workspace root.
     * @param opts.exclude Exclude artifacts that match the given pattern (e.g., ["node_modules/", ".git*"]).
     * @param opts.include Include only artifacts that match the given pattern (e.g., ["app/", "package.*"]).
     * @param opts.gitignore Apply .gitignore filter rules inside the directory.
     */
    directory: (path: string, opts?: WorkspaceDirectoryOpts) => Directory;
    /**
     * List named environments defined in the workspace configuration.
     */
    envList: () => Promise<string[]>;
    /**
     * Write this workspace's pending changes to its local Git workspace.
     */
    export: () => Promise<void>;
    /**
     * Returns a File from the workspace.
     *
     * Relative paths resolve from the workspace cwd. Absolute paths resolve from the workspace root.
     * @param path Location of the file to retrieve. Relative paths (e.g., "go.mod") resolve from the workspace cwd; absolute paths (e.g., "/go.mod") resolve from the workspace root.
     */
    file: (path: string) => File;
    /**
     * Search for a file or directory by walking up from the start path within the workspace.
     *
     * Returns the absolute workspace path if found, or null if not found.
     *
     * Relative start paths resolve from the workspace cwd.
     *
     * The search stops at the workspace root and will not traverse above it.
     * @param name The name of the file or directory to search for.
     * @param opts.from Path to start the search from. Relative paths resolve from the workspace cwd; absolute paths resolve from the workspace root.
     */
    findUp: (name: string, opts?: WorkspaceFindUpOpts) => Promise<string>;
    /**
     * Return all generators from modules loaded in the workspace.
     * @param opts.include Only include generators matching the specified patterns
     */
    generators: (opts?: WorkspaceGeneratorsOpts) => GeneratorGroup;
    /**
     * Git state for this workspace. Errors if the workspace is not in a git repository.
     */
    git: () => WorkspaceGit;
    /**
     * Returns a list of files and directories that match the given pattern.
     *
     * Patterns match paths relative to the workspace root.
     * @param pattern Pattern to match (e.g., "*.md").
     */
    glob: (pattern: string) => Promise<string[]>;
    /**
     * Plan the explicit migration needed for the current workspace.
     *
     * The returned plan has an empty changeset and no steps when no migration is needed.
     */
    migrate: () => WorkspaceMigration;
    /**
     * Return a module defined in the workspace configuration.
     * @param name Module name to inspect.
     */
    module_: (name: string) => WorkspaceModule;
    /**
     * Load a module source from a path within the workspace.
     *
     * Relative paths (e.g., "foo") resolve from the workspace cwd; absolute paths (e.g., "/foo") resolve from the workspace root.
     *
     * Fails if the path does not point to an initialized module.
     * @param path Location of the module source to load, relative to the workspace cwd or absolute from the workspace root.
     */
    moduleSource: (path: string) => ModuleSource;
    /**
     * List modules defined in the workspace configuration.
     */
    modules: () => Promise<WorkspaceModule[]>;
    /**
     * An installed SDK, by name.
     * @param name SDK name to look up.
     */
    sdk: (name: string) => WorkspaceSDK;
    /**
     * Installed SDKs.
     */
    sdks: () => Promise<WorkspaceSDK[]>;
    /**
     * Searches for content matching the given regular expression or literal string.
     *
     * Uses Rust regex syntax; escape literal ., [, ], {, }, | with backslashes.
     *
     * Runs ripgrep on the client host, falling back to grep if unavailable.
     * @param opts.paths Directory or file paths to search
     * @param opts.globs Glob patterns to match (e.g., "*.md")
     * @param opts.pattern The text to match.
     * @param opts.literal Interpret the pattern as a literal string instead of a regular expression.
     * @param opts.multiline Enable searching across multiple lines.
     * @param opts.dotall Allow the . pattern to match newlines in multiline mode.
     * @param opts.insensitive Enable case-insensitive matching.
     * @param opts.skipIgnored Honor .gitignore, .ignore, and .rgignore files.
     * @param opts.skipHidden Skip hidden files (files starting with .).
     * @param opts.filesOnly Only return matching files, not lines and content
     * @param opts.limit Limit the number of results to return
     */
    search: (opts?: WorkspaceSearchOpts) => Promise<SearchResult[]>;
    /**
     * Return all services from modules loaded in the workspace.
     * @param opts.include Only include services matching the specified patterns
     */
    services: (opts?: WorkspaceServicesOpts) => UpGroup;
    /**
     * Return this workspace with a changeset applied, without mutating the source.
     * @param changes Changes to apply.
     */
    withChanges: (changes: Changeset) => Workspace;
    /**
     * Return this workspace with a named config environment created.
     * @param name Environment name.
     * @param opts.here Write to the workspace config directory at the workspace cwd.
     */
    withConfigEnv: (name: string, opts?: WorkspaceWithConfigEnvOpts) => Workspace;
    /**
     * Return this workspace with a configuration value written.
     * @param key Dotted key path.
     * @param value Value to set. Bools, integers, and comma-separated arrays are auto-detected.
     * @param opts.values List value to set. Elements are stored verbatim, with no auto-detection. Mutually exclusive with value.
     * @param opts.here Write to the workspace config directory at the workspace cwd.
     */
    withConfigValue: (key: string, value: string, opts?: WorkspaceWithConfigValueOpts) => Workspace;
    /**
     * Return this workspace with a generated API client initialized.
     * @param path Workspace-relative output directory for the generated client.
     * @param sdk Workspace SDK name or module entry name to use.
     * @param module Workspace-relative path or canonical ref for the module the client binds to.
     * @param opts.args SDK-specific init arguments.
     * @param opts.here Write to the workspace config directory at the workspace cwd.
     */
    withInitClient: (path: string, sdk: string, module_: string, opts?: WorkspaceWithInitClientOpts) => Workspace;
    /**
     * Return this workspace with a new module initialized.
     * @param name Name of the new module.
     * @param sdk Workspace SDK name or module entry name to use.
     * @param opts.path Workspace-relative path for the new module.
     * @param opts.source Source subpath within the new module.
     * @param opts.include Additional include patterns for the module.
     * @param opts.args SDK-specific init arguments.
     * @param opts.here Write to the workspace config directory at the workspace cwd.
     */
    withInitModule: (name: string, sdk: string, opts?: WorkspaceWithInitModuleOpts) => Workspace;
    /**
     * Return this workspace with a module installed in its config.
     * @param ref Module reference to install.
     * @param opts.name Override name for the installed module entry.
     * @param opts.here Write to the workspace config directory at the workspace cwd.
     */
    withModule: (ref: string, opts?: WorkspaceWithModuleOpts) => Workspace;
    /**
     * Return this workspace with a directory added, without mutating the source.
     * @param path Path of the added directory. Relative paths resolve from the workspace cwd.
     * @param source Directory to add.
     */
    withNewDirectory: (path: string, source: Directory) => Workspace;
    /**
     * Return this workspace with a new or replaced file, without mutating the source.
     * @param path Path of the new file. Relative paths resolve from the workspace cwd.
     * @param contents Contents of the new file.
     * @param opts.permissions Permissions of the new file.
     */
    withNewFile: (path: string, contents: string, opts?: WorkspaceWithNewFileOpts) => Workspace;
    /**
     * Return this workspace with an SDK installed in its config.
     * @param ref SDK module reference to install.
     * @param opts.name Override name for the installed SDK entry.
     * @param opts.here Write to the workspace config directory at the workspace cwd.
     * @param opts.asSdkName User-facing SDK name to persist under `[modules.<name>.as-sdk] name = ...`.
     */
    withSDK: (ref: string, opts?: WorkspaceWithSdkOpts) => Workspace;
    /**
     * Return this workspace with refreshed lockfile state.
     */
    withUpdatedLock: () => Workspace;
    /**
     * Return this workspace with its working directory pointed at the given workspace-relative path.
     * @param path Workspace-relative path to use as the working directory.
     */
    withWorkdir: (path: string) => Workspace;
    /**
     * Return this workspace with a named config environment removed.
     * @param name Environment name.
     * @param opts.here Write to the workspace config directory at the workspace cwd.
     */
    withoutConfigEnv: (name: string, opts?: WorkspaceWithoutConfigEnvOpts) => Workspace;
    /**
     * Return this workspace with a configuration value removed.
     *
     * Errors when the key is not currently set.
     * @param key Dotted key path (e.g. modules.greeter.settings.greeting).
     * @param opts.here Write to the workspace config directory at the workspace cwd.
     */
    withoutConfigValue: (key: string, opts?: WorkspaceWithoutConfigValueOpts) => Workspace;
    /**
     * Return this workspace with a module removed from its config.
     * @param name Name of the installed module entry to remove.
     * @param opts.here Write to the workspace config directory at the workspace cwd.
     */
    withoutModule: (name: string, opts?: WorkspaceWithoutModuleOpts) => Workspace;
    /**
     * Return this workspace with an SDK removed from its config.
     * @param name Name of the installed SDK entry to remove.
     * @param opts.here Write to the workspace config directory at the workspace cwd.
     */
    withoutSDK: (name: string, opts?: WorkspaceWithoutSdkOpts) => Workspace;
    /**
     * Call the provided function with current Workspace.
     *
     * This is useful for reusability and readability by not breaking the calling chain.
     */
    with: (arg: (param: Workspace) => Workspace) => Workspace;
}
/**
 * Local git state for a workspace.
 */
declare class WorkspaceGit extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this WorkspaceGit.
     */
    id: () => Promise<ID>;
    /**
     * The checked-out HEAD of this workspace.
     */
    head: () => GitRef;
    /**
     * Uncommitted changes in this workspace, using the same rules as GitRepository.uncommitted.
     */
    uncommitted: () => Changeset;
}
/**
 * A planned workspace migration.
 */
declare class WorkspaceMigration extends BaseClient {
    private readonly _id?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID);
    /**
     * A unique identifier for this WorkspaceMigration.
     */
    id: () => Promise<ID>;
    /**
     * Filesystem changes for the full migration plan.
     */
    changes: () => Changeset;
    /**
     * Logical migration steps, each identified by a stable code.
     */
    steps: () => Promise<WorkspaceMigrationStep[]>;
}
/**
 * A single logical part of a workspace migration.
 */
declare class WorkspaceMigrationStep extends BaseClient {
    private readonly _id?;
    private readonly _code?;
    private readonly _description?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _code?: string, _description?: string);
    /**
     * A unique identifier for this WorkspaceMigrationStep.
     */
    id: () => Promise<ID>;
    /**
     * Filesystem changes for this step.
     */
    changes: () => Changeset;
    /**
     * Stable code identifying this logical migration step.
     */
    code: () => Promise<string>;
    /**
     * Generic summary of this step's purpose and impact.
     */
    description: () => Promise<string>;
    /**
     * Non-fatal warnings raised while planning this step.
     */
    warnings: () => Promise<string[]>;
}
/**
 * A module entry in the workspace configuration.
 */
declare class WorkspaceModule extends BaseClient {
    private readonly _id?;
    private readonly _entrypoint?;
    private readonly _name?;
    private readonly _source?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _entrypoint?: boolean, _name?: string, _source?: string);
    /**
     * A unique identifier for this WorkspaceModule.
     */
    id: () => Promise<ID>;
    /**
     * Whether the module is the workspace entrypoint (functions aliased to Query root).
     */
    entrypoint: () => Promise<boolean>;
    /**
     * The module name.
     */
    name: () => Promise<string>;
    /**
     * List constructor-backed settings for this module.
     */
    settings: () => Promise<WorkspaceModuleSetting[]>;
    /**
     * The module source path.
     */
    source: () => Promise<string>;
}
/**
 * A constructor-backed module setting.
 */
declare class WorkspaceModuleSetting extends BaseClient {
    private readonly _id?;
    private readonly _description?;
    private readonly _isList?;
    private readonly _key?;
    private readonly _value?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _description?: string, _isList?: boolean, _key?: string, _value?: string);
    /**
     * A unique identifier for this WorkspaceModuleSetting.
     */
    id: () => Promise<ID>;
    /**
     * The constructor argument description.
     */
    description: () => Promise<string>;
    /**
     * Whether the setting accepts a list of values.
     */
    isList: () => Promise<boolean>;
    /**
     * The setting key.
     */
    key: () => Promise<string>;
    /**
     * The configured value after applying the selected workspace environment, or empty when unset.
     */
    value: () => Promise<string>;
}
/**
 * An installed SDK: a module marked for scaffolding other modules and clients.
 */
declare class WorkspaceSDK extends BaseClient {
    private readonly _id?;
    private readonly _name?;
    private readonly _ref?;
    /**
     * Constructor is used for internal usage only, do not create object from it.
     */
    constructor(ctx?: Context, _id?: ID, _name?: string, _ref?: string);
    /**
     * A unique identifier for this WorkspaceSDK.
     */
    id: () => Promise<ID>;
    /**
     * Clients generated with this SDK.
     */
    clients: () => Promise<WorkspaceModule[]>;
    /**
     * Modules authored with this SDK.
     */
    modules: () => Promise<WorkspaceModule[]>;
    /**
     * The user-facing SDK name.
     */
    name: () => Promise<string>;
    /**
     * The module reference this SDK was installed from.
     */
    ref: () => Promise<string>;
}
declare const dag: Client;

declare const ERROR_CODES: {
    /**
     * {@link GraphQLRequestError}
     */
    readonly GraphQLRequestError: "D100";
    /**
     * {@link UnknownDaggerError}
     */
    readonly UnknownDaggerError: "D101";
    /**
     * {@link TooManyNestedObjectsError}
     */
    readonly TooManyNestedObjectsError: "D102";
    /**
     * {@link EngineSessionConnectParamsParseError}
     */
    readonly EngineSessionConnectParamsParseError: "D103";
    /**
     * {@link EngineSessionConnectionTimeoutError}
     */
    readonly EngineSessionConnectionTimeoutError: "D104";
    /**
     * {@link EngineSessionError}
     */
    readonly EngineSessionError: "D105";
    /**
     * {@link InitEngineSessionBinaryError}
     */
    readonly InitEngineSessionBinaryError: "D106";
    /**
     * {@link DockerImageRefValidationError}
     */
    readonly DockerImageRefValidationError: "D107";
    /**
     * {@link NotAwaitedRequestError}
     */
    readonly NotAwaitedRequestError: "D108";
    /**
     * (@link ExecError}
     */
    readonly ExecError: "D109";
    /**
     * {@link IntrospectionError}
     */
    readonly IntrospectionError: "D110";
};
type ErrorCodesType = typeof ERROR_CODES;
type ErrorNames = keyof ErrorCodesType;
type ErrorCodes = ErrorCodesType[ErrorNames];

interface DaggerSDKErrorOptions {
    cause?: Error;
}
/**
 * The base error. Every other error inherits this error.
 */
declare abstract class DaggerSDKError extends Error {
    /**
     * The name of the dagger error.
     */
    abstract readonly name: ErrorNames;
    /**
     * The dagger specific error code.
     * Use this to identify dagger errors programmatically.
     */
    abstract readonly code: ErrorCodes;
    /**
     * The original error, which caused the DaggerSDKError.
     */
    cause?: Error;
    protected constructor(message: string, options?: DaggerSDKErrorOptions);
    /**
     * @hidden
     */
    get [Symbol.toStringTag](): "DockerImageRefValidationError" | "EngineSessionConnectParamsParseError" | "EngineSessionConnectionTimeoutError" | "EngineSessionError" | "ExecError" | "GraphQLRequestError" | "InitEngineSessionBinaryError" | "IntrospectionError" | "NotAwaitedRequestError" | "TooManyNestedObjectsError" | "UnknownDaggerError";
    /**
     * Pretty prints the error
     */
    printStackTrace(): void;
}

/**
 *  This error is thrown if the dagger SDK does not identify the error and just wraps the cause.
 */
declare class UnknownDaggerError extends DaggerSDKError {
    name: "UnknownDaggerError";
    code: "D101";
    /**
     * @hidden
     */
    constructor(message: string, options: DaggerSDKErrorOptions);
}

interface DockerImageRefValidationErrorOptions extends DaggerSDKErrorOptions {
    ref: string;
}
/**
 *  This error is thrown if the passed image reference does not pass validation and is not compliant with the
 *  DockerImage constructor.
 */
declare class DockerImageRefValidationError extends DaggerSDKError {
    name: "DockerImageRefValidationError";
    code: "D107";
    /**
     *  The docker image reference, which caused the error.
     */
    ref: string;
    /**
     *  @hidden
     */
    constructor(message: string, options: DockerImageRefValidationErrorOptions);
}

interface EngineSessionConnectParamsParseErrorOptions extends DaggerSDKErrorOptions {
    parsedLine: string;
}
/**
 * This error is thrown if the EngineSession does not manage to parse the required connection parameters from the session binary
 */
declare class EngineSessionConnectParamsParseError extends DaggerSDKError {
    name: "EngineSessionConnectParamsParseError";
    code: "D103";
    /**
     *  the line, which caused the error during parsing, if the error was caused because of parsing.
     */
    parsedLine: string;
    /**
     * @hidden
     */
    constructor(message: string, options: EngineSessionConnectParamsParseErrorOptions);
}

interface ExecErrorOptions extends DaggerSDKErrorOptions {
    cmd: string[];
    exitCode: number;
    stdout: string;
    stderr: string;
    extensions?: GraphQLErrorExtensions;
}
/**
 *  API error from an exec operation in a pipeline.
 */
declare class ExecError extends DaggerSDKError {
    name: "ExecError";
    code: "D109";
    /**
     *  The command that caused the error.
     */
    cmd: string[];
    /**
     *  The exit code of the command.
     */
    exitCode: number;
    /**
     * The stdout of the command.
     */
    stdout: string;
    /**
     * The stderr of the command.
     */
    stderr: string;
    /**
     * GraphQL error extensions
     */
    extensions?: GraphQLErrorExtensions;
    /**
     *  @hidden
     */
    constructor(message: string, options: ExecErrorOptions);
}

interface GraphQLRequestErrorOptions extends DaggerSDKErrorOptions {
    error: ClientError;
}
/**
 *  This error originates from the dagger engine. It means that some error was thrown and sent back via GraphQL.
 */
declare class GraphQLRequestError extends DaggerSDKError {
    name: "GraphQLRequestError";
    code: "D100";
    /**
     *  The query and variables, which caused the error.
     */
    requestContext: ClientError["request"];
    /**
     *  the GraphQL response containing the error.
     */
    response: ClientError["response"];
    /**
     *  The GraphQL error extentions.
     */
    extensions?: GraphQLErrorExtensions;
    /**
     *  @hidden
     */
    constructor(message: string, options: GraphQLRequestErrorOptions);
}

/**
 *  This error is thrown if the dagger binary cannot be copied from the dagger docker image and copied to the local host.
 */
declare class InitEngineSessionBinaryError extends DaggerSDKError {
    name: "InitEngineSessionBinaryError";
    code: "D106";
    /**
     *  @hidden
     */
    constructor(message: string, options?: DaggerSDKErrorOptions);
}

interface TooManyNestedObjectsErrorOptions extends DaggerSDKErrorOptions {
    response: unknown;
}
/**
 *  Dagger only expects one response value from the engine. If the engine returns more than one value this error is thrown.
 */
declare class TooManyNestedObjectsError extends DaggerSDKError {
    name: "TooManyNestedObjectsError";
    code: "D102";
    /**
     *  the response containing more than one value.
     */
    response: unknown;
    /**
     * @hidden
     */
    constructor(message: string, options: TooManyNestedObjectsErrorOptions);
}

type EngineSessionErrorOptions = DaggerSDKErrorOptions;
/**
 * This error is thrown if the EngineSession does not manage to parse the required port successfully because a EOF is read before any valid port.
 * This usually happens if no connection can be established.
 */
declare class EngineSessionError extends DaggerSDKError {
    name: "EngineSessionError";
    code: "D105";
    /**
     * @hidden
     */
    constructor(message: string, options?: EngineSessionErrorOptions);
}

interface EngineSessionConnectionTimeoutErrorOptions extends DaggerSDKErrorOptions {
    timeOutDuration: number;
}
/**
 * This error is thrown if the EngineSession does not manage to parse the required port successfully because the sessions connection timed out.
 */
declare class EngineSessionConnectionTimeoutError extends DaggerSDKError {
    name: "EngineSessionConnectionTimeoutError";
    code: "D104";
    /**
     * The duration until the timeout occurred in ms.
     */
    timeOutDuration: number;
    /**
     * @hidden
     */
    constructor(message: string, options: EngineSessionConnectionTimeoutErrorOptions);
}

/**
 * This error is thrown when the compute function isn't awaited.
 */
declare class NotAwaitedRequestError extends DaggerSDKError {
    name: "NotAwaitedRequestError";
    code: "D108";
    /**
     * @hidden
     */
    constructor(message: string, options?: DaggerSDKErrorOptions);
}

declare class FunctionNotFound extends DaggerSDKError {
    name: "ExecError";
    code: "D109";
    constructor(message: string, options?: DaggerSDKErrorOptions);
}

declare class IntrospectionError extends DaggerSDKError {
    name: "IntrospectionError";
    code: "D110";
    constructor(message: string, options?: DaggerSDKErrorOptions);
}

/**
 * ConnectOpts defines option used to connect to an engine.
 */
interface ConnectOpts {
    /**
     * Use to overwrite Dagger workdir
     * @defaultValue process.cwd()
     */
    Workdir?: string;
    /**
     * Opt into loading workspace modules for this connection.
     * By default, only the core API is exposed.
     */
    LoadWorkspaceModules?: boolean;
    /**
       * Enable logs output
       * @example
       * LogOutput
       * ```ts
       * connect(async (client: Client) => {
      const source = await client.host().workdir().id()
      ...
      }, {LogOutput: process.stdout})
       ```
       */
    LogOutput?: Writable;
}

type CallbackFct = (client: Client) => Promise<void>;
/**
 * connection executes the given function using the default global Dagger client.
 *
 * @example
 * ```ts
 * await connection(
 *   async () => {
 *     await dag
 *       .container()
 *       .from("alpine")
 *       .withExec(["apk", "add", "curl"])
 *       .withExec(["curl", "https://dagger.io/"])
 *       .sync()
 *   }, { LogOutput: process.stderr }
 * )
 * ```
 */
declare function connection(fct: () => Promise<void>, cfg?: ConnectOpts): Promise<void>;
/**
 * connect runs GraphQL server and initializes a
 * GraphQL client to execute query on it through its callback.
 * This implementation is based on the existing Go SDK.
 */
declare function connect(cb: CallbackFct, config?: ConnectOpts): Promise<void>;

type Class = {
    new (...args: any[]): any;
};
type ArgumentOptions = {
    /**
     * The contextual value to use for the argument.
     *
     * This should only be used for Directory/File or GitRepository/GitRef types.
     *
     * An absolute path would be related to the context source directory (the git repo root or the module source root).
     * A relative path would be relative to the module source root.
     */
    defaultPath?: string;
    /**
     * The default container address to use for the argument.
     *
     * This should only be used for Container types.
     *
     * If the argument is not set, the container will be loaded from this address.
     */
    defaultAddress?: string;
    /**
     * Patterns to ignore when loading the contextual argument value.
     *
     * This should only be used for Directory types.
     */
    ignore?: string[];
};
type FunctionOptions = {
    /**
     * The caching behavior of this function.
     * "never" means no caching.
     * "session" means caching only for the duration of the current client's session.
     * A duration string (e.g., "5m", "1h") means persistent caching for that duration.
     * By default, caching is enabled with a long default set by the engine.
     */
    cache?: "never" | "session" | string;
    /**
     * An optional alias to use for the function when exposed on the API.
     */
    alias?: string;
};
/**
 * Retrieve a class registered via the `@object()` decorator by its name.
 *
 * Useful for generated code (e.g. the static dispatch entrypoint) when the
 * user's class isn't `export`'d but still needs to be reachable to construct
 * instances and walk its prototype.
 */
declare function getRegisteredClass(name: string): Class | undefined;

/**
 * The definition of the `@object` decorator that should be on top of any
 * class module that must be exposed to the Dagger API.
 *
 */
declare const object: () => (<T extends Class>(constructor: T) => T);
/**
 * The definition of @func decorator that should be on top of any
 * class' method that must be exposed to the Dagger API.
 *
 * @param alias The alias to use for the field when exposed on the API.
 * @param cache The cache setting to use for that function.
 */
declare const func: (opts?: FunctionOptions | string) => ((target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => void);
/**
 * The definition of @check decorator that marks a function as a check.
 * Checks are functions that return void/error to indicate pass/fail.
 */
declare const check: () => ((target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => void);
/**
 * The definition of @generate decorator that marks a function as a generator.
 * Generators are functions that return a Changeset representing changes to be applied.
 */
declare const generate: () => ((target: object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => void);
/**
 * The definition of @up decorator that marks a function as a service for dagger up.
 */
declare const up: () => ((target: object, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor);
/**
 * The definition of @field decorator that should be on top of any
 * class' property that must be exposed to the Dagger API.
 *
 * @deprecated In favor of `@func`
 * @param alias The alias to use for the field when exposed on the API.
 */
declare const field: (alias?: string) => ((target: object, propertyKey: string) => void);
/**
 * The definition of the `@enumType` decorator that should be on top of any
 * class module that must be exposed to the Dagger API as enumeration.
 *
 * @deprecated In favor of using TypeScript `enum` types.
 */
declare const enumType: () => (<T extends Class>(constructor: T) => T);
/**
 * Add a `@argument` decorator to an argument of type `Directory` or `File` to load
 * its contents from the module context directory.
 *
 * The context directory is the git repository containing the module.
 * If there's no git repository, the context directory is the directory containing
 * the module source code.
 *
 * @param opts.defaultPath Only applies to arguments of type File or Directory. If the argument is not set,
 * load it from the given path in the context directory.
 * @param opts.ignore Only applies to arguments of type Directory. The ignore patterns are applied to the input directory,
 * and matching entries are filtered out, in a cache-efficient manner..
 *
 * Relative paths are relative to the current source files.
 * Absolute paths are rooted to the module context directory.
 */
declare const argument: (opts?: ArgumentOptions) => ((target: object, propertyKey: string | undefined, parameterIndex: number) => void);

declare function entrypoint(files: string[]): Promise<void>;

export { Address, BaseClient, Binding, CacheSharingMode, CacheSharingModeNameToValue, CacheSharingModeValueToName, CacheVolume, Changeset, ChangesetMergeConflict, ChangesetMergeConflictNameToValue, ChangesetMergeConflictValueToName, ChangesetsMergeConflict, ChangesetsMergeConflictNameToValue, ChangesetsMergeConflictValueToName, Check, CheckGroup, Client, ClientFilesyncMirror, Cloud, Container, Context, CurrentModule, CurrentModuleAsSDK, CurrentModuleAsSDKClient, CurrentModuleAsSDKModule, DaggerSDKError, DiffStat, DiffStatKind, DiffStatKindNameToValue, DiffStatKindValueToName, Directory, DockerImageRefValidationError, ERROR_CODES, Engine, EngineCache, EngineCacheEntry, EngineCacheEntrySet, EngineSessionConnectParamsParseError, EngineSessionConnectionTimeoutError, EngineSessionError, EnumTypeDef, EnumValueTypeDef, Env, EnvFile, EnvVariable, Error$1 as Error, ErrorValue, ExecError, ExistsType, ExistsTypeNameToValue, ExistsTypeValueToName, FieldTypeDef, File, FileType, FileTypeNameToValue, FileTypeValueToName, FunctionArg, FunctionCachePolicy, FunctionCachePolicyNameToValue, FunctionCachePolicyValueToName, FunctionCall, FunctionCallArgValue, FunctionNotFound, Function_, GeneratedCode, Generator, GeneratorGroup, GitRef, GitRepository, GraphQLRequestError, HTTPState, HealthcheckConfig, Host, ImageLayerCompression, ImageLayerCompressionNameToValue, ImageLayerCompressionValueToName, ImageMediaTypes, ImageMediaTypesNameToValue, ImageMediaTypesValueToName, InitEngineSessionBinaryError, InputTypeDef, InterfaceTypeDef, IntrospectionError, JSONValue, LLM, LLMContentBlock, LLMContentBlockKind, LLMContentBlockKindNameToValue, LLMContentBlockKindValueToName, LLMMessage, LLMMessageRole, LLMMessageRoleNameToValue, LLMMessageRoleValueToName, LLMTokenUsage, Label, ListTypeDef, ModuleConfigClient, ModuleSource, ModuleSourceExperimentalFeature, ModuleSourceExperimentalFeatureNameToValue, ModuleSourceExperimentalFeatureValueToName, ModuleSourceKind, ModuleSourceKindNameToValue, ModuleSourceKindValueToName, Module_, NetworkProtocol, NetworkProtocolNameToValue, NetworkProtocolValueToName, NotAwaitedRequestError, ObjectTypeDef, Port, RegistryProtocol, RegistryProtocolNameToValue, RegistryProtocolValueToName, RemoteGitMirror, ReturnType, ReturnTypeNameToValue, ReturnTypeValueToName, SDKConfig, ScalarTypeDef, Schema, SearchResult, SearchSubmatch, Secret, Service, Socket, SourceMap, Stat, Terminal, TooManyNestedObjectsError, TypeDef, TypeDefKind, TypeDefKindNameToValue, TypeDefKindValueToName, UnknownDaggerError, Up, UpGroup, Volume, Workspace, WorkspaceGit, WorkspaceMigration, WorkspaceMigrationStep, WorkspaceModule, WorkspaceModuleSetting, WorkspaceSDK, _ExportableClient, _NodeClient, _SyncerClient, argument, check, connect, connection, dag, entrypoint, enumType, field, func, generate, getRegisteredClass, getTracer, object, up };
export type { AddressDirectoryOpts, AddressFileOpts, BuildArg, CallbackFct, ChangesetWithChangesetOpts, ChangesetWithChangesetsOpts, CheckGroupRunOpts, ClientCacheVolumeOpts, ClientContainerOpts, ClientCurrentTypeDefsOpts, ClientEnvFileOpts, ClientEnvOpts, ClientFileOpts, ClientGitOpts, ClientHttpOpts, ClientLLMOpts, ClientModuleSourceOpts, ClientSecretOpts, ClientSshfsVolumeOpts, ConnectOpts, ContainerAsServiceOpts, ContainerAsTarballOpts, ContainerDirectoryOpts, ContainerExistsOpts, ContainerExportImageOpts, ContainerExportOpts, ContainerFileOpts, ContainerFromOpts, ContainerImportOpts, ContainerLayerOpts, ContainerManifestOpts, ContainerPublishOpts, ContainerStatOpts, ContainerTerminalOpts, ContainerUpOpts, ContainerWithDefaultTerminalCmdOpts, ContainerWithDirectoryOpts, ContainerWithDockerHealthcheckOpts, ContainerWithEntrypointOpts, ContainerWithEnvVariableOpts, ContainerWithExecOpts, ContainerWithExposedPortOpts, ContainerWithFileOpts, ContainerWithFilesOpts, ContainerWithMountedCacheOpts, ContainerWithMountedDirectoryOpts, ContainerWithMountedFileOpts, ContainerWithMountedSecretOpts, ContainerWithMountedTempOpts, ContainerWithMountedVolumeOpts, ContainerWithNewFileOpts, ContainerWithSymlinkOpts, ContainerWithUnixSocketOpts, ContainerWithWorkdirOpts, ContainerWithoutDirectoryOpts, ContainerWithoutEntrypointOpts, ContainerWithoutExposedPortOpts, ContainerWithoutFileOpts, ContainerWithoutFilesOpts, ContainerWithoutMountOpts, ContainerWithoutUnixSocketOpts, CurrentModuleAsSdkOpts, CurrentModuleGeneratorsOpts, CurrentModuleWorkdirOpts, DirectoryAsModuleOpts, DirectoryAsModuleSourceOpts, DirectoryAsWorkspaceOpts, DirectoryDockerBuildOpts, DirectoryEntriesOpts, DirectoryExistsOpts, DirectoryExportOpts, DirectoryFilterOpts, DirectorySearchOpts, DirectoryStatOpts, DirectoryTerminalOpts, DirectoryWithDirectoryOpts, DirectoryWithFileOpts, DirectoryWithFilesOpts, DirectoryWithNewDirectoryOpts, DirectoryWithNewFileOpts, EngineCacheEntrySetOpts, EngineCachePruneOpts, EnvChecksOpts, EnvFileGetOpts, EnvFileVariablesOpts, EnvServicesOpts, Exportable, FileAsEnvFileOpts, FileContentsOpts, FileDigestOpts, FileExportOpts, FileSearchOpts, FileWithReplacedOpts, FunctionWithArgOpts, FunctionWithCachePolicyOpts, FunctionWithDeprecatedOpts, GeneratorGroupChangesOpts, GitRefAsWorkspaceOpts, GitRefTreeOpts, GitRepositoryAsWorkspaceOpts, GitRepositoryBranchesOpts, GitRepositoryTagsOpts, HostDirectoryOpts, HostFileOpts, HostFindUpOpts, HostServiceOpts, HostTunnelOpts, ID, JSON, JSONValueContentsOpts, LLMContentBlockInput, LLMLoopOpts, LLMStepOpts, LLMWithModelOpts, LLMWithResponseOpts, ModuleChecksOpts, ModuleGeneratorsOpts, ModuleServeOpts, ModuleServicesOpts, Node, PipelineLabel, Platform, PortForward, ServiceEndpointOpts, ServiceStopOpts, ServiceTerminalOpts, ServiceUpOpts, Syncer, TypeDefWithEnumMemberOpts, TypeDefWithEnumOpts, TypeDefWithEnumValueOpts, TypeDefWithFieldOpts, TypeDefWithInterfaceOpts, TypeDefWithObjectOpts, TypeDefWithScalarOpts, Void, WorkspaceChecksOpts, WorkspaceConfigReadOpts, WorkspaceDirectoryOpts, WorkspaceFindUpOpts, WorkspaceGeneratorsOpts, WorkspaceSearchOpts, WorkspaceServicesOpts, WorkspaceWithConfigEnvOpts, WorkspaceWithConfigValueOpts, WorkspaceWithInitClientOpts, WorkspaceWithInitModuleOpts, WorkspaceWithModuleOpts, WorkspaceWithNewFileOpts, WorkspaceWithSdkOpts, WorkspaceWithoutConfigEnvOpts, WorkspaceWithoutConfigValueOpts, WorkspaceWithoutModuleOpts, WorkspaceWithoutSdkOpts, __DirectiveArgsOpts, __FieldArgsOpts, __TypeEnumValuesOpts, __TypeFieldsOpts, __TypeInputFieldsOpts, float };
