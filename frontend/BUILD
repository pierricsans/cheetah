load("@aspect_bazel_lib//lib:testing.bzl", "assert_contains")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config")
load("@aspect_rules_webpack//webpack:defs.bzl", "webpack_bundle")

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = [":__subpackages__"],
)

ts_project(
    name = "main",
    srcs = [
        "main.ts",
    ],
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//frontend:tsconfig",
    visibility = [
      "//monkey:__pkg__",
      "//frontend:__pkg__",
    ],
    deps = [
        "//frontend/src:util",
        "//frontend/src:countdown",
        "//frontend/src:grid",
        "//frontend/src:scoreboard",
        "//frontend/src:selector",
        "//frontend/src:theme",
        "//frontend/protos:level_ts_proto",
        "//:node_modules/@bufbuild/protobuf",
        "//:node_modules/@types/node",
    ],
)


webpack_bundle(
    name = "bundle",
    node_modules = "//:node_modules",
    srcs = [
        ":main",
        "static/style.css",
        "static/index.html",
        "static/favicon.png",
    ],
    entry_point = ":main",
    output_dir = True,
    webpack_config = "webpack_config.js",
    deps = [
      "//:node_modules/babel-loader",
      "//:node_modules/clean-webpack-plugin",
      "//:node_modules/css-loader",
      "//:node_modules/css-minimizer-webpack-plugin",
      "//:node_modules/favicons-webpack-plugin",
      "//:node_modules/mini-css-extract-plugin",
      "//:node_modules/html-webpack-plugin",
      "//:node_modules/terser-webpack-plugin",
      "//:node_modules/webpack-merge",
    ]
)
