load("@rules_python//python:defs.bzl", "py_binary", "py_library")
load("@my_deps//:requirements.bzl", "requirement")

py_library(
    name = "move_maker",
    srcs = ["move_maker.py"],
    deps = [
        "//frontend/protos:level_py_pb2",
    ],
)

py_library(
    name = "alternate_routes",
    srcs = ["alternate_routes.py"],
    deps = [
        ":move_maker",
        "//frontend/protos:level_py_pb2",
        requirement("attrs"),
        requirement("webcolors"),
        requirement("absl-py"),
        ":errors",
    ],
)

py_binary(
    name = "main",
    srcs = ["main.py"],
    data = ["//server/templates:table.html"],
    visibility = ["//monkey:__pkg__"],
    deps = [
        ":alternate_routes",
        requirement("jinja2"),
    ],
)

py_library(
    name = "errors",
    srcs = ["errors.py"],
)

