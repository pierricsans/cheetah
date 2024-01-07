load("@aspect_rules_ts//ts:proto.bzl", "ts_proto_library")
load("@rules_proto//proto:defs.bzl", "proto_library")

package(default_visibility = ["//visibility:public"])

proto_library(
    name = "level",
    srcs = ["level.proto"],
)

ts_proto_library(
    name = "level_ts_proto",
    has_services = False,
    copy_files = True,
    files_to_copy = [
        "level_pb.js",
        "level_pb.d.ts",
    ],
    node_modules = "//:node_modules",
    proto = ":level",
)
