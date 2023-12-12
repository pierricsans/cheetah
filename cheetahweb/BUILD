load("@rules_python//python:defs.bzl", "py_binary")
load("@my_deps//:requirements.bzl", "requirement")

py_binary(
    name = "manage",
    srcs = ["manage.py"],
    deps = [
        "//cheetahweb/cheetahweb:asgi",
        "//cheetahweb/cheetahweb:settings",
        "//cheetahweb/cheetahweb:urls",
        "//cheetahweb/cheetahweb:wsgi",
        "//monkey:urls",
        "//monkey:views",
        requirement("Django"),
    ],
)
