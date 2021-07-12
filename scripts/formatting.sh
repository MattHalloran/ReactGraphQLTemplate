#!/bin/bash

# These functions help to prettify echos

# Print header message
header() {
    echo "$(tput setaf 7)$1"
}

# Print info message
info() {
    echo "$(tput setaf 3)$1"
}

# Print success message
success() {
    echo "$(tput setaf 2)$1"
}

# Print error message
error() {
    echo "$(tput setaf 1)$1"
}

# Prints group with information
group() {
    GROUP="$1"
    header $GROUP
}

# Wrapper function for printing "PASS" or "FAIL"
# **NOTE: Do not use on any commands that write data to a file
checker () {
    header "$GROUP - $MSG..."
    if "$@"; then
        success "Pass - $MSG"
    else
        error "Fail - $MSG"
    fi
    MSG=""
}