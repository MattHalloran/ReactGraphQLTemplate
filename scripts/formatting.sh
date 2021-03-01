#!/bin/bash

# These functions help to prettify echos

# Prints group with information
header () {
    echo $GROUP
    if [[ $(ls $INFO | wc -c) -ne 0 ]]
        echo "$(tput setaf 2)$INFO"
        INFO=""
}

# Wrapper function for printing "PASS" or "FAIL"
checker () {
    echo "$GROUP - $MSG"
    COMMAND=$@
    if [ `$COMMAND; echo $?` -eq 0 ]; then
        echo "$(tput setaf 2)Pass - $MSG"
    else
        echo "$(tput setaf 1)Fail - $MSG"
    fi
}