load("@aspect_rules_swc//swc:defs.bzl", "swc")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

ts_project(
    name = "b",
    srcs = ["index.ts"],
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//fe/deps_lib:tsconfig",
    visibility = ["//fe/deps_lib:__subpackages__"],
)
