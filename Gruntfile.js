var pkg = require('./package')
  , path = require('path')
  , gruntConfig;


gruntConfig = function (grunt) {
  var nodeWebkitLinuxDir, nodeWebkitMacDir, nodeWebkitWinDir, distDir;

  grunt.registerTask('mkdir', 'Create dir', function (goal) {
    var fs = require('fs')
      , configName, dirs;
    configName = this.name + (goal ? '.' + goal : '');
    dirs = grunt.config(configName + '.dir');
    if (!(dirs instanceof Array)) {
      dirs = [dirs];
    }
    dirs.forEach(function (dir) {
      try {
        fs.mkdirSync(dir);
      } catch (err) {
      }
    });
  });

  grunt.registerTask('chmod', 'Chmod a file', function (goal) {
    var fs = require('fs')
      , configName, file, mode;
    configName = this.name + (goal ? '.' + goal : '');
    file = grunt.config(configName + '.file');
    mode = grunt.config(configName + '.mode');
    fs.chmodSync(file, mode);
  });

  grunt.registerTask('binconcat', 'Concat binary files', function (goal) {
    var fs = require('fs')
      , configName, srcFiles, destFile, data;
    configName = this.name + (goal ? '.' + goal : '');
    srcFiles = grunt.config(configName + '.src');
    destFile = grunt.config(configName + '.dest');
    try {
      fs.unlinkSync(destFile);
    } catch (err) {
    }
    srcFiles.forEach(function (srcFile) {
      data = fs.readFileSync(srcFile);
      fs.appendFileSync(destFile, data);
    });
  });

  nodeWebkitLinuxDir = path.join('lib', 'node-webkit', 'node-webkit-v0.6.3-linux-x64');
  nodeWebkitMacDir = path.join('lib', 'node-webkit', 'node-webkit-v0.6.3-osx-ia32');
  nodeWebkitWinDir = path.join('lib', 'node-webkit', 'node-webkit-v0.6.3-win-ia32');
  distDir = path.join('dist');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      build: {
        src: distDir
      }
    },
    less: {
      production: {
        options: {
          yuicompress: true
        },
        files: {
          'css/style.css': path.join('less', 'style.less')
        }
      }
    },
    exec: {
      nwsnapshot: {
        cmd: 'nwsnapshot --logfile dist/v8.log --extra_code b.js dist/b.bin'
      }
    },
    mkdir: {
      dir: [
        distDir,
        distDir + '/linux',
        distDir + '/mac',
        distDir + '/win'
      ]
    },
    compress: {
      app: {
        options: {
          archive: path.join(distDir, 'gtdonejs.nw'),
          mode: 'zip'
        },
        files: [
          {
            expand: true,
            src: [
              'controllers/**',
              'css/**',
              'img/**',
              'lib/*.js',
              'lib/angular-1.0.7/**',
              'lib/bootstrap-3.0.0-rc1/**',
              'lib/glyphicons/**',
              'lib/jquery-1.10.2/**',
              'lib/jquery-ui-1.10.3.custom/**',
              'lib/Respond-1.2.0/**',
              'node_modules/moment/**',
              'views/**',
              'app.js',
              'config.js',
              'package.json',
              'index.html',
              path.join(distDir, 'hello.bin')
            ]
          }
        ]
      },
      linux: {
        options: {
          archive: path.join(distDir, pkg.name + '-linux.' + pkg.version + '.zip'),
          mode: 'zip'
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              path.join(distDir, 'linux', '**')
            ]
          }
        ]
      },
      mac: {
        options: {
          archive: path.join(distDir, pkg.name + '-mac.' + pkg.version + '.zip'),
          mode: 'zip'
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              path.join(distDir, 'mac', '**')
            ]
          }
        ]
      },
      win: {
        options: {
          archive: path.join(distDir, pkg.name + '-win.' + pkg.version + '.zip'),
          mode: 'zip'
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              path.join(distDir, 'win', '**')
            ]
          }
        ]
      }
    },
    binconcat: {
      linux: {
        src: [path.join(nodeWebkitLinuxDir, 'nw'), path.join(distDir, 'gtdonejs.nw')],
        dest: path.join(distDir, 'linux', 'gtdonejs')
      },
      mac: {
        src: [path.join(nodeWebkitMacDir, 'nw'), path.join(distDir, 'gtdonejs.nw')],
        dest: path.join(distDir, 'mac', 'gtdonejs')
      },
      win: {
        src: [path.join(nodeWebkitWinDir, 'nw.exe'), path.join(distDir, 'gtdonejs.nw')],
        dest: path.join(distDir, 'win', 'gtdonejs.exe')
      }
    },
    chmod: {
      linux: {
        file: path.join(distDir, 'linux', 'gtdonejs'),
        mode: '775'
      },
      mac: {
        file: path.join(distDir, 'mac', 'gtdonejs'),
        mode: '775'
      },
      win: {
        file: path.join(distDir, 'win', 'gtdonejs.exe'),
        mode: '775'
      }
    },
    copy: {
      linux: {
        files: [
          {
            expand: true,
            flatten: true,
            src: path.join(nodeWebkitLinuxDir, 'nw.pak'),
            dest: path.join(distDir, 'linux') + '/'
          }
        ]
      },
      mac: {
        files: [
          {
            expand: true,
            flatten: true,
            src: path.join(nodeWebkitMacDir, 'nw.pak'),
            dest: path.join(distDir, 'mac') + '/'
          }
        ]
      },
      win: {
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              path.join(nodeWebkitWinDir, 'nw.pak'),
              path.join(nodeWebkitWinDir, 'icudt.dll')
            ],
            dest: path.join(distDir, 'win') + '/'
          }
        ]
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('build', ['less', 'mkdir', 'compress:app']);
  grunt.registerTask('linux', ['build', 'binconcat:linux', 'chmod:linux', 'copy:linux', 'compress:linux']);
  grunt.registerTask('mac', ['build', 'binconcat:mac', 'chmod:mac', 'copy:mac', 'compress:mac']);
  grunt.registerTask('win', ['build', 'binconcat:win', 'chmod:win', 'copy:win', 'compress:win']);
  grunt.registerTask('default', ['clean', 'linux', 'win']);
};

module.exports = gruntConfig;