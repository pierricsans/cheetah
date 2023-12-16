load("@rules_python//python:defs.bzl", "py_binary", "py_library")
load("@my_deps//:requirements.bzl", "requirement")

py_library(
    name = "move_maker",
    srcs = ["move_maker.py"],
    deps = [
        "//fe/protos:level_py_pb2",
    ],
)

py_library(
    name = "alternate_routes",
    srcs = ["alternate_routes.py"],
    deps = [
        ":move_maker",
        "//fe/protos:level_py_pb2",
        requirement("webcolors"),
        requirement("absl-py"),
        "//exceptions:errors",
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
