load("@aspect_rules_swc//swc:defs.bzl", "swc")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("//fe/transpiler:babel.bzl", "babel")

ts_project(
    name = "b",
    srcs = ["index.ts"],
    declaration = True,
    transpiler = swc,
    tsconfig = "//fe/deps_lib_transpiler:tsconfig",
    visibility = ["//fe/deps_lib_transpiler:__subpackages__"],
)
