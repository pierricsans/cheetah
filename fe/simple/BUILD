"""Simplest example of using ts_project to transpile and type-check a file"""

load("@aspect_bazel_lib//lib:testing.bzl", "assert_contains")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

# Type-checks, and emits output to
# bazel-bin/fe/simple/foo.js
# bazel-bin/fe/simple/foo.d.ts
ts_project(
    name = "ts",
    srcs = ["foo.ts"],
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//fe:tsconfig",
    visibility = [
      "//monkey:__pkg__",
      "//fe:__pkg__",
    ],
    deps = [
        # Two dependencies are linked from first-party code in this repo
        # by the npm_link_package calls in /fe/BUILD.bazel
        "//fe:node_modules/@myorg/js_lib",
        "//fe:node_modules/@myorg/dts_lib",
        "//fe/protos:level_ts_proto",
        "//fe:node_modules/@bufbuild/protobuf",
        # Two dependencies are linked from third-party npm packages
        # by the npm_link_all_packages call in //fe/BUILD.bazel
        "//fe:node_modules/@types/node",
        "//fe:node_modules/axios",
    ],
)
