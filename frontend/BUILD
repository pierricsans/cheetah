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

ts_project(
    name = "theme",
    srcs = ["theme.ts"],
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//frontend:tsconfig",
    deps = [
        "//frontend/protos:level_ts_proto",
        "//frontend:node_modules/@bufbuild/protobuf",
    ]
)

ts_project(
    name = "bead",
    srcs = ["bead.ts"],
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//frontend:tsconfig",
    deps = [
        ":constants",
        ":util",
        "//frontend/protos:level_ts_proto",
        "//frontend:node_modules/@bufbuild/protobuf",
    ]
)

ts_project(
    name = "selector",
    srcs = ["selector.ts"],
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//frontend:tsconfig",
    deps = [
        ":util",
        "//frontend/protos:level_ts_proto",
        "//frontend:node_modules/@bufbuild/protobuf",
    ]
)

ts_project(
    name = "constants",
    srcs = ["constants.ts"],
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//frontend:tsconfig",
)

ts_project(
    name = "countdown",
    srcs = ["countdown.ts"],
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//frontend:tsconfig",
    deps = [
        ":constants",
        ":util",
        "//frontend/protos:level_ts_proto",
        "//frontend:node_modules/@bufbuild/protobuf",
    ]
)

ts_project(
    name = "scoreboard",
    srcs = ["scoreboard.ts"],
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//frontend:tsconfig",
    deps = [
        ":constants",
        ":util",
        "//frontend/protos:level_ts_proto",
        "//frontend:node_modules/@bufbuild/protobuf",
    ]
)

ts_project(
    name = "util",
    srcs = ["util.ts"],
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//frontend:tsconfig",
)

ts_project(
    name = "grid",
    srcs = ["grid.ts"],
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//frontend:tsconfig",
    deps = [
        ":util",
        ":bead",
        ":countdown",
        "//frontend/protos:level_ts_proto",
        "//frontend:node_modules/@bufbuild/protobuf",
    ]
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
        ":util",
        ":countdown",
        ":grid",
        ":scoreboard",
        ":selector",
        ":theme",
        "//frontend/protos:level_ts_proto",
        "//frontend:node_modules/@bufbuild/protobuf",
        "//frontend:node_modules/@types/node",
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
    webpack_config = "webpack_config.js",
    visibility = [
        "//monkey:__pkg__",
        "//server:__pkg__",
    ],
    deps = [
        "//frontend:node_modules/css-minimizer-webpack-plugin",
        "//frontend:node_modules/mini-css-extract-plugin",
        "//frontend:node_modules/terser-webpack-plugin",
    ]
)
