#!/bin/bash

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 057856323501.dkr.ecr.us-east-1.amazonaws.com