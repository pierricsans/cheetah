load("@rules_python//python:defs.bzl", "py_library")
load("@my_deps//:requirements.bzl", "requirement")

py_library(
    name = "urls",
    srcs = ["urls.py"],
    visibility = ["//cheetahweb:__pkg__"],
    deps = [
        ":views",
        requirement("Django"),
    ],
)

py_library(
    name = "views",
    srcs = ["views.py"],
    data = [
        "//fe:bundle",
    ],
    visibility = ["//cheetahweb:__pkg__"],
    deps = [
        "//server:main",
        requirement("Django"),
    ],
)
