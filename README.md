Cashbox
=======

Cashbox is a single-page HTML5 app that helps you track and analyze your expenses. It accepts
CSV files that you export from your bank account, parses the data, and lets you look at it in
a variety of ways.

This project is in a very early stage of development, so there are probably some bugs and
incompatibilities. Bug reports are appreciated!

Features
--------

* Drag-and-drop import of CSV files
* In-browser data persistence via localstorage


Note
-----

For best results with file importing, you won't want to open app.html from a file:// URI. In some browsers
this will prevent the file access APIs from working correctly, so it's recommended that you serve the files
from a simple web server for testing and development instead.
