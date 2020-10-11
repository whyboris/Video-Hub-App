#!/bin/bash

# Check the size of the `/release` folder to see if it is larger than desired

DIR=release
SIZE=360000
# in Kilobytes 350MB ~ 350,000 kb

if [ $(du -ks $DIR | awk '{print $1}') -gt $SIZE ]
then
  printf "\n    WARNING: build may be larger than desired \n\n"
else
  printf "\n    Build success, under 360mb \n\n"
fi
