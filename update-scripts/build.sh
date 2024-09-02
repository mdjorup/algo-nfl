#/bin/bash

# This script is used to build the project

export DOCKER_BUILDKIT=1

docker build -t algo_nfl_cron_jobs ./update-scripts
