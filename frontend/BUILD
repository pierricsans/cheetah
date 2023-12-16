load("@aspect_rules_js//npm:defs.bzl", "npm_link_package")
load("@npm//:defs.bzl", "npm_link_all_packages", "npm_link_targets")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config")

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = [":__subpackages__"],
)

# This macro expands to a npm_link_package for each third-party package in package.json
npm_link_all_packages()

npm_link_targets()

load("@aspect_rules_webpack//webpack:defs.bzl", "webpack_bundle")

webpack_bundle(
    name = "bundle",
    node_modules = ":node_modules",
    srcs = [
        "//frontend/simple:ts",
    ],
    entry_point = "//frontend/simple:ts",

    visibility = [
      "//monkey:__pkg__",
    ]
)
