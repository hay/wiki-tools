#!/bin/bash

# create the venv
python3 -m venv pyvenv

# activate it
source pyvenv/bin/activate

# upgrade pip inside the venv and add support for the wheel package format
pip install -U pip wheel

# install some concrete packages
pip install requests
pip install jinja2