#!/bin/bash

MAX_LENGTH=128
INTERVAL_SIZE=5
INTERVAL_COUNT=`expr 100 / ${INTERVAL_SIZE}`

# From http://stackoverflow.com/a/2395601/760389
SLICE_HEIGHT=`awk "BEGIN { rounded = sprintf(\"%.0f\", $MAX_LENGTH/$INTERVAL_COUNT); print rounded }"`
IMAGE_LENGTH=`expr ${INTERVAL_COUNT} \* ${SLICE_HEIGHT}`

for ((step=0; step<=$INTERVAL_COUNT; step++)); do
  PERCENT=`expr ${step} \* ${INTERVAL_SIZE}`
  FILENAME=`printf "%02d" ${PERCENT}`
  RECTANGLE_HEIGHT=`expr ${SLICE_HEIGHT} \* ${step}`

  FILL=black

  if [ $step -eq 0 ]; then
    RECTANGLE_HEIGHT=$SLICE_HEIGHT
    FILL="rgb(128,128,128)"
  fi

  RECTANGLE_TOP=`expr ${IMAGE_LENGTH} - ${RECTANGLE_HEIGHT}`

  convert -size "${IMAGE_LENGTH}x${IMAGE_LENGTH}" canvas:none \
    -fill $FILL -draw "rectangle 0, $RECTANGLE_TOP, $IMAGE_LENGTH, $IMAGE_LENGTH" \
    -insert 0 -gravity center -append -background white -extent "${IMAGE_LENGTH}x${IMAGE_LENGTH}" \
    "img/sb-${FILENAME}.png"
done
