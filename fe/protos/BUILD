load("@com_google_protobuf//:protobuf.bzl", "py_proto_library")
load("@rules_proto//proto:defs.bzl", "proto_library")
load("@aspect_rules_ts//ts:proto.bzl", "ts_proto_library")

package(default_visibility = ["//visibility:public"])

proto_library(
    name = "level",
    srcs = ["level.proto"],
)

py_proto_library(
    name = "level_py_pb2",
    srcs = ["level.proto"],
)

ts_proto_library(
    name = "level_ts_proto",
    has_services = False,
    copy_files = True,
    node_modules = "//fe:node_modules",
    proto = ":level",
)
