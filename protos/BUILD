load("@com_google_protobuf//:protobuf.bzl", "py_proto_library")

py_proto_library(
    name = "move_py_pb2",
    srcs = ["move.proto"],
    visibility = ["//visibility:public"],
)

py_proto_library(
    name = "person_py_pb2",
    srcs = ["person.proto"],
    deps = [":move_py_pb2"],
    visibility = ["//visibility:public"],
)

py_proto_library(
    name = "grid_py_pb2",
    srcs = ["grid.proto"],
    deps = [":person_py_pb2"],
    visibility = ["//visibility:public"],
)