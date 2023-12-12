load("@bazel_gazelle//:def.bzl", "gazelle", "gazelle_binary")
load("@buildifier_prebuilt//:rules.bzl", "buildifier")

gazelle_binary(
    name = "gazelle_bin",
    languages = ["@bazel_skylib_gazelle_plugin//bzl"],
)

load("@npm__at_types_node__15.12.2__links//:defs.bzl", npm_link_types_node = "npm_link_imported_package")

npm_link_types_node(name = "node_modules")
load("@axios//:defs.bzl", npm_link_types_node = "npm_link_imported_package")

npm_link_types_node(name = "node_modules")

gazelle(
    name = "gazelle",
    gazelle = "gazelle_bin",
)

buildifier(
    name = "buildifier",
    exclude_patterns = ["./.git/*"],
    lint_mode = "fix",
    mode = "fix",
)

buildifier(
    name = "buildifier.check",
    exclude_patterns = ["./.git/*"],
    lint_mode = "warn",
    mode = "diff",
)
