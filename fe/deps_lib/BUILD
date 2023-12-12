load("@aspect_rules_swc//swc:defs.bzl", "swc")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config", "ts_project")

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = [":__subpackages__"],
)

ts_project(
    name = "deps_ts",
    srcs = ["index.ts"],
    data = [
        # Also propagate the date-fns npm package downstream so it is an runtime dependency
        # of any linked npm_package that this target is used by.
        "//fe:node_modules/date-fns",
    ],
    declaration = True,
    transpiler = swc,
    deps = [
        "//fe:node_modules/date-fns",
        "//fe/deps_lib/b",
    ],
)

npm_package(
    name = "deps_lib",
    srcs = [
        ":deps_ts",
    ],
    package = "@myorg/deps_lib",
    visibility = ["//fe:__subpackages__"],
)

ts_project(
    name = "importer_rel_ts",
    srcs = ["importer_rel.ts"],
    declaration = True,
    transpiler = swc,
    deps = [
        ":deps_ts",
    ],
)

ts_project(
    name = "importer_linked_ts",
    srcs = ["importer_linked.ts"],
    declaration = True,
    transpiler = swc,
    deps = [
        "//fe:node_modules/@myorg/deps_lib",
    ],
)
