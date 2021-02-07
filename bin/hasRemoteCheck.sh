#!/bin/bash

# Check the size of the `/remote` folder to see if Remote app is present

DIR=remote
SIZE=10
# in Kilobytes 10 kb

if [ $(du -ks $DIR | awk '{print $1}') -gt $SIZE ]
then
  printf "\n    Looks like Remote app exists \n\n"
else
  printf "\n    WARNING: did you forget to add the Remote? \n\n"
fi
