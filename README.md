## What's GTDone.js ?

GTDone.js is a ['Getting Things Done'](http://en.wikipedia.org/wiki/Getting_Things_Done) multi-platform desktop app based on [todotxt](http://todotxt.com/) format and powered by [nodejs](http://nodejs.org/) and [node-webkit](https://github.com/rogerwang/node-webkit).

## Run the built binary

- Windows :
    - Download the [windows binary](http://gtdonejs.s3.amazonaws.com/gtdonejs-win.0.0.1.zip)
    - Unzip gtdonejs-win.0.0.1.zip anywhere
    - Double click on gtdonejs.exe

- Linux :
    - Download the [linux binary](http://gtdonejs.s3.amazonaws.com/gtdonejs-linux.0.0.1.zip)
    - Unzip gtdonejs-linux.0.0.1.zip anywhere
    - Double click on gtdonejs

- Mac Osx : TODO

## Build the binary yourself

- Prerequisite :
    1. Clone this project
    2. Install [node.js](http://nodejs.org/)
    3. Install [node-webkit](http://github.com/rogerwang/node-webkit)
        - Direct link to binary files for [Linux64](https://s3.amazonaws.com/node-webkit/v0.6.3/node-webkit-v0.6.3-linux-x64.tar.gz)
        - Direct link to binary files for [Windows](https://s3.amazonaws.com/node-webkit/v0.6.3/node-webkit-v0.6.3-win-ia32.zip)
        - Direct link to binary files for [Mac osx](https://s3.amazonaws.com/node-webkit/v0.6.3/node-webkit-v0.6.3-osx-ia32.zip)
    4. Extract the node-webkit zip/tgz content to gtdonejs/lib/node-webkit/
- Build :

        $ cd gtdonejs
        $ npm install
        $ grunt

- Run from the gtdonejs :

        $ nw

- Run from elsewhere :

        $ nw /path_to_gtdonejs/

## Linux issue

If you encounter an error like : "error while loading shared libraries: libudev.so.0: cannot open shared object file: No such file or directory"
Fix the issue with :

        $ sudo ln -fs /usr/lib64/libudev.so.1 /usr/lib64/libudev.so.0

Enjoy !
