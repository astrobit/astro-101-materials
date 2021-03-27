#!/bin/bash
for image in moonFQ moonFull moonNew moonTQ moonWnC moonWnG moonWxC moonWxG
do
	convert ${image}.png -scale 16 ${image}16.png
	convert ${image}.png -scale 24 ${image}24.png
done
