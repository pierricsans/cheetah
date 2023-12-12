load("@aspect_rules_js//npm:defs.bzl", "npm_link_package")
load("@npm//:defs.bzl", "npm_link_all_packages", "npm_link_targets")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config")

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = [":__subpackages__"],
)

# Building this target results in bazel-bin/fe/node_modules/@myorg/js_lib, so that
# TypeScript and other node programs beneath bazel-bin/fe are able to resolve its location.
npm_link_package(
    name = "node_modules/@myorg/js_lib",
    src = "//fe/js_lib",
    root_package = "fe",
    visibility = ["//fe:__subpackages__"],
)

npm_link_package(
    name = "node_modules/@myorg/dts_lib",
    src = "//fe/dts_lib",
    root_package = "fe",
    visibility = ["//fe:__subpackages__"],
)

npm_link_package(
    name = "node_modules/@myorg/deps_lib",
    src = "//fe/deps_lib",
    root_package = "fe",
    visibility = ["//fe:__subpackages__"],
)

npm_link_package(
    name = "node_modules/@myorg/deps_lib_transpiler",
    src = "//fe/deps_lib_transpiler",
    root_package = "fe",
    visibility = ["//fe:__subpackages__"],
)

# This macro expands to a npm_link_package for each third-party package in package.json
npm_link_all_packages()

npm_link_targets()
