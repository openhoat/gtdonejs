## What's GTDone.js ?

GTDone.js is a ['Getting Things Done'](http://en.wikipedia.org/wiki/Getting_Things_Done) multi-platform desktop app based on [todotxt](http://todotxt.com/) format and powered by [nodejs](http://nodejs.org/) and [node-webkit](https://github.com/rogerwang/node-webkit).

![GTDoneJS screenshot](/etc/screenshot.png "GTDoneJS")

## Run the built binary

- Windows :
    - Download the [windows binary](http://gtdonejs.s3.amazonaws.com/gtdonejs-win.0.0.2.zip)
    - Unzip gtdonejs-win.0.0.2.zip anywhere
    - Double click on gtdonejs.exe

- Linux :
    - Download the [linux binary](http://gtdonejs.s3.amazonaws.com/gtdonejs-linux.0.0.2.zip)
    - Unzip gtdonejs-linux.0.0.2.zip anywhere
    - Double click on gtdonejs

- Mac Osx : TODO

## Features

- Tasks are associated with projects (+projectName), contexts (@contextName), and tags (#tagName)
- Task due date : A due date less or equal than now appears in 'Today', else in 'Next'
- Frequency with due date : for recurrent tasks, the due date will be updated each time the app starts
- Drag and drop : Drag a task to the left panel, drop it to inbox, today, next, a project or a context
- Settings : by default the app takes the todo.txt file at your home folder, in the settings it is possible to set a file for the current tasks (todo.txt), and another for completed tasks (done.txt)
- Sync : there is no sync or cloud approach in the app, it is just based on local files, so you just have to use any solution like Dropbox to synchronize your tasks

## Build the binary yourself

- Prerequisite :
    1. Clone this project
    2. Install [node.js](http://nodejs.org/)
    3. Install [node-webkit](http://github.com/rogerwang/node-webkit) / direct links to binaries :
        - [Linux64](https://s3.amazonaws.com/node-webkit/v0.6.3/node-webkit-v0.6.3-linux-x64.tar.gz)
        - [Windows](https://s3.amazonaws.com/node-webkit/v0.6.3/node-webkit-v0.6.3-win-ia32.zip)
        - [Mac osx](https://s3.amazonaws.com/node-webkit/v0.6.3/node-webkit-v0.6.3-osx-ia32.zip)
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

## Next step

- Mac Osx packaging
- Android app
- iPhone app

Enjoy !
