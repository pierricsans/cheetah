"""Simplest example of using ts_project to transpile and type-check a file"""

load("@aspect_bazel_lib//lib:testing.bzl", "assert_contains")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

# Type-checks, and emits output to
# bazel-bin/frontend/simple/foo.js
# bazel-bin/frontend/simple/foo.d.ts
ts_project(
    name = "ts",
    srcs = ["foo.ts"],
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
