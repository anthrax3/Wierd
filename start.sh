#!/bin/sh

THIS=`realpath $0`
DIR=`dirname $THIS`
cd $DIR
(sleep 1 && python -m webbrowser -t "http://127.0.0.1:8000/impl/wierd.js/demo/wierd.html") &
python -m SimpleHTTPServer