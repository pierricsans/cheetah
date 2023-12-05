load("@rules_python//python:defs.bzl", "py_library")
load("@my_deps//:requirements.bzl", "requirement")
load("@aspect_rules_js//js:defs.bzl", "js_test")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@aspect_rules_ts//ts:proto.bzl", "ts_proto_library")
load("@rules_proto//proto:defs.bzl", "proto_library")


py_library(
  name="urls",
  srcs=["urls.py"],
  deps=[
    ":views",
      requirement("Django"),
  ],
  visibility = ["//cheetahweb:__pkg__"],
)

ts_project(
    name = "main_lib",
    srcs = ["main.ts"],
    transpiler = "tsc",
)

py_library(
  name="views",
  srcs=["views.py"],
  deps=[
    "//server:main",
    requirement("Django"),
  ],
  data = [
    ":main_lib",
  ],
  visibility = ["//cheetahweb:__pkg__"],
)