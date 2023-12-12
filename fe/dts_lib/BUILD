load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@bazel_skylib//rules:build_test.bzl", "build_test")

ts_project(
    name = "lib",
    srcs = [
        "index.ts",
        "lib_types.d.ts",
        "lib_types_2.d.mts",
    ],
    declaration = True,
    transpiler = "tsc",
    visibility = ["//fe:__subpackages__"],
)

npm_package(
    name = "dts_lib",
    srcs = [":lib"],
    package = "@myorg/dts_lib",
    visibility = ["//fe:__subpackages__"],
)

ts_project(
    name = "importer_rel_ts",
    srcs = ["importer_rel.ts"],
    declaration = True,
    transpiler = "tsc",
    deps = [
        ":lib",
    ],
)

ts_project(
    name = "importer_linked_ts",
    srcs = ["importer_linked.ts"],
    declaration = True,
    transpiler = "tsc",
    deps = [
        "//fe:node_modules/@myorg/dts_lib",
    ],
)

build_test(
    name = "importer_rel_test",
    targets = [":importer_rel_ts"],
)

build_test(
    name = "importer_linked_test",
    targets = [":importer_linked_ts"],
)
