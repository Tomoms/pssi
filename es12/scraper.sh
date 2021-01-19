#!/bin/bash

scrape() {
    printf "${1}-${2}-${3}," >> prices.csv
    trap "killall chromium" RETURN

    chromium "www.geniallife.it/home.html" &
    sleep 10
    xdotool mousemove 1379 570 click 1
    xdotool type ${1}${2}${3}

    if [[ ${4} == "m" ]]
    then
        printf "Male," >> prices.csv
        xdotool mousemove 1296 641 click 1
    else
        printf "Female," >> prices.csv
        xdotool mousemove 1407 641 click 1
    fi

    if [[ ${5} == "y" ]]
    then
        printf "Yes," >> prices.csv
        xdotool mousemove 1320 737 click 1
    else
        printf "No," >> prices.csv
        xdotool mousemove 1383 737 click 1
    fi

    xdotool mousemove 1372 884 click 1

    sleep 7

    xdotool mousemove 1356 944
    xdotool click --repeat 2 1

    xdotool key ctrl+c
    price=$(xclip -selection clipboard -o | sed 's/\,/\./')
    echo ${price} >> prices.csv
}

touch prices.csv
echo "birthdate,gender,smoker?,price" >> prices.csv

for i in {1975..2000}; do
    scrape 18 04 ${i} f n
    scrape 18 04 ${i} m n
    scrape 18 04 ${i} f y
    scrape 18 04 ${i} m y
done
