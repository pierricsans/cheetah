# Utility for running blaze commands
# Sample usage:
# ./release.sh [ -o c ]
# Args:
# -o(peration): c|t|u|r (see below for meaning of each value)
#
COMPILE_ONLY=0  # This is the default. Simply compiles everything
COMPILE_AND_TEST=1  # Does compile only and then runs all tests
UPDATE_COMPILE_AND_TEST=2  # Does a fresh pnpm update in addition
UPDATE_COMPILE_TEST_AND_RELEASE=3  # Does everything and then pushes to server

while getopts ":o:" opt; do
    case $opt in
        o)
            OPERATION=${OPTARG}
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
        :)
            echo "Option -$OPTARG requires an argument." >&2
            exit 1
            ;;
    esac
done

if [ -z "${OPERATION}" ]; then
  _OPERATION=${COMPILE_ONLY}
elif [ "${OPERATION}" == "c" ]; then
  _OPERATION=${COMPILE_ONLY}
elif [ "${OPERATION}" == "t" ]; then
  _OPERATION=${COMPILE_AND_TEST}
elif [ "${OPERATION}" == "u" ]; then
  _OPERATION=${UPDATE_COMPILE_AND_TEST}
elif [ "${OPERATION}" == "r" ]; then
  _OPERATION=${UPDATE_COMPILE_TEST_AND_RELEASE}
else
  echo "Unknown operation ${OPERATION}. Exiting"
  exit 1
fi

cmd=""
if [ ${_OPERATION} == ${UPDATE_COMPILE_AND_TEST} ] ||
   [ ${_OPERATION} == ${UPDATE_COMPILE_TEST_AND_RELEASE} ]; then
cmd+="sudo bazel clean && sudo pnpm update && "
fi
cmd+="bazel build -c opt //... "
cmd+="&& bazel run -c opt //frontend/protos:copy_files "
cmd+="&& bazel run -c opt //frontend/protos:level_ts_proto.copy "
if [ ${_OPERATION} == ${UPDATE_COMPILE_TEST_AND_RELEASE} ]; then
cmd+="&& cp -R bazel-bin/frontend/bundle/* /Volumes/web/ "
fi
echo "Will execute $cmd"
eval $cmd
