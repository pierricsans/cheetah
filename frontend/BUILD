load("@aspect_bazel_lib//lib:testing.bzl", "assert_contains")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@aspect_rules_js//npm:defs.bzl", "npm_link_package")
load("@npm//:defs.bzl", "npm_link_all_packages", "npm_link_targets")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config")

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = [":__subpackages__"],
)

# Type-checks, and emits output to
# bazel-bin/frontend/simple/foo.js
# bazel-bin/frontend/simple/foo.d.ts
ts_project(
    name = "main",
    srcs = ["main.ts"],
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//frontend:tsconfig",
    visibility = [
      "//monkey:__pkg__",
      "//frontend:__pkg__",
    ],
    deps = [
        "//frontend/protos:level_ts_proto",
        "//frontend:node_modules/@bufbuild/protobuf",
        "//frontend:node_modules/@types/node",
        "//frontend:node_modules/axios",
    ],
)

# This macro expands to a npm_link_package for each third-party package in package.json
npm_link_all_packages()

npm_link_targets()

load("@aspect_rules_webpack//webpack:defs.bzl", "webpack_bundle")

webpack_bundle(
    name = "bundle",
    node_modules = ":node_modules",
    srcs = [
        ":main",
    ],
    entry_point = ":main",
    visibility = [
      "//monkey:__pkg__",
    ]
)
