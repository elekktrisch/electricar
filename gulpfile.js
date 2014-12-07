var config = require('./gulp-config.js');
var utils = require('./gulp-utils.js');

var gulp = require('gulp');
var gulpIgnore = require('gulp-ignore');
var bower = require('gulp-bower-files');
var karma = require('gulp-karma');
var filter = require('gulp-filter');
var flatten = require('gulp-flatten');
var inject = require('gulp-inject');
var angularFilesort = require('gulp-angular-filesort');
var concat = require('gulp-concat');
var es = require('event-stream');
var ngMin = require('gulp-ngmin');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var cssmin = require('gulp-cssmin');
var connect = require('gulp-connect');
var open = require('gulp-open');
var order = require("gulp-order");
var changed = require("gulp-changed");
var prefix = require("gulp-prefix");
var debug = require('gulp-debug');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var shell = require('gulp-shell');
var replace = require('gulp-token-replace');
var rename = require('gulp-rename');

var paths = config.paths;
var patterns = config.patterns;
var env = config.env;


function copyFiles(fileExt, devDest, distDest) {
    var devResult = gulp.src(paths.src + fileExt)
        .pipe(gulp.dest(devDest || paths.dev));

    return utils.execForDist(devResult, function () {
        return devResult
            .pipe(gulp.dest(distDest || paths.dist));
    });
}

function appendCache(path) {
    path.basename += '.cache'
}

gulp.task('connect', function () {
    connect.server({
        root: 'dev',
        port: 9000,
        livereload: true
    });
});
gulp.task('connect-dist', function () {
    connect.server({
        root: 'dist',
        port: 9000,
        livereload: true
    });
});

gulp.task('clean', function () {
    utils.clean([paths.dist, paths.dev, 'karma_html', 'karma_unit', 'coverage']).pipe(debug());
});

gulp.task('build-info', function () {
    console.info('==========================================================');
    console.info('  using minify:       ' + utils.minify());
    console.info('  build dist version: ' + utils.buildDist());
    console.info('==========================================================');
});

gulp.task('build-app-img', function () {
    return copyFiles(patterns.imgFiles);
});

gulp.task('build-app-fonts', function () {
    return gulp.src('bower_components/**/fonts/*')
        .pipe(flatten())
        .pipe(gulp.dest(paths.devLib + '/fonts'))
        .pipe(gulp.dest(paths.distLib + '/fonts'));
});


gulp.task('build-lib-css', function () {
    var libCssFiles = es.merge(
        gulp.src('bower_components/bootstrap/dist/css/bootstrap.min.css'),
        gulp.src('bower_components/jquery-ui/themes/' + config.jqueryUiTheme + '/jquery-ui.css'),
        gulp.src('bower_components/font-awsome/css/font-awsome.min.css')
    ).pipe(flatten());

    return libCssFiles
        .pipe(concat('libs.css'))
        .pipe(gulp.dest(paths.devStyles))
        .pipe(rev())
        .pipe(rename(appendCache))
        .pipe(gulp.dest(paths.distStyles));
});
gulp.task('build-lib-images', function () {
    var libImageFiles = es.merge(
        gulp.src('bower_components/jquery-ui/themes/' + config.jqueryUiTheme + '/images/*')
    ).pipe(flatten());

    return libImageFiles
        .pipe(gulp.dest(paths.devStyles + '/images'))
        .pipe(gulp.dest(paths.distStyles + '/images'));
});

gulp.task('build-app-json', function () {
    return copyFiles(patterns.jsonFiles);
});

gulp.task('build-app-css', function () {
    var devResult = gulp.src(paths.src + '**/*.css')
        .pipe(concat('ecompare.css'))
        .pipe(gulp.dest(paths.devStyles));
    return utils.execForDist(devResult, function () {
        return devResult
            .pipe(cssmin())
            .pipe(rev())
            .pipe(rename(appendCache))
            .pipe(gulp.dest(paths.distStyles));
    });
});

gulp.task('build-app-htaccess', function () {
    return copyFiles('.htaccess');
});

gulp.task('build-app-favicon', function () {
    return copyFiles('favicon.ico');
});

gulp.task('build-app-404', function () {
    return copyFiles('404.html');
});

gulp.task('build-app-dev', function () {
    return utils.prepareScripts(paths.src, patterns.htmlTemplateFiles, patterns.jsSrcFiles, patterns.jsConfigFiles, env.dev)
        .pipe(gulp.dest(paths.dev))
        .pipe(filter('**/!(chartFormats).js'))
        .pipe(filter('**/!(templates).js'))
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('build-app-dist', function () {
    var devResult = utils.prepareScripts(paths.src, patterns.htmlTemplateFiles, patterns.jsSrcFiles, patterns.jsConfigFiles, env.dist)
        .pipe(angularFilesort())
        .pipe(concat(paths.appJs));

    return utils.execForDist(devResult, function () {
        var step2 = devResult;
        if (utils.minify()) {
            step2 = devResult
                .pipe(ngMin())
                .pipe(uglify());
        }

        return step2
            .pipe(rev())
            .pipe(rename(appendCache))
            .pipe(gulp.dest(paths.dist));
    });
});

gulp.task('build-lib', function () {
    var jsFilesFilter = filter(patterns.jsFiles);
    var jsDistLibFolder = gulp.dest(paths.distLib + 'js/');
    var jsDevLibFolder = gulp.dest(paths.devLib + 'js/');
    var cssFilesFilter = filter(patterns.cssFiles);
    var cssDistLibFolder = gulp.dest(paths.distLib + 'css/');
    var cssDevLibFolder = gulp.dest(paths.devLib + 'css/');

    var devResult = es.merge(bower(),
            gulp.src('bower_components/angular-bootstrap/ui-bootstrap.min.js'),
            gulp.src('bower_components/valdr/valdr-message.min.js'),
            gulp.src('bower_components/angular-google-maps/dist/angular-google-maps.min.js'))
        .pipe(flatten())
        .pipe(jsFilesFilter)
        .pipe(jsDevLibFolder);

    var step2 = devResult;
    if (utils.minify()) {
        step2 = devResult
            .pipe(ngMin())
            .pipe(uglify());
    }

    var step3 = utils.execForDist(step2, function () {
        var libs = step2
            .pipe(order(config.jsLibConcatOrder))
            .pipe(concat('libs.min.js'));

        if (utils.minify()) {
            libs = libs.pipe(ngMin())
                .pipe(uglify())
        }

        return es.merge(libs.pipe(rev())
                .pipe(rename(appendCache)))
            .pipe(jsDistLibFolder);
    });

    var step5 = step3
        .pipe(jsFilesFilter.restore())
        .pipe(cssFilesFilter)
        .pipe(cssDevLibFolder);

    var step6 = utils.execForDist(step5, function () {
        return step5
            .pipe(cssDistLibFolder);
    });

    return step6
        .pipe(cssFilesFilter.restore());
});

gulp.task('inject-index-dist', ['build-dist'], function () {
    return utils.injectScriptNames(paths.dist, env.dist);
});

gulp.task('inject-index-dev', ['build-dev'], function () {
    return utils.injectScriptNames(paths.dev, env.dev)
        .pipe(connect.reload());
});

gulp.task("url", ['connect'], function () {
    var options = {
        url: "http://localhost:9000",
        app: "chrome.exe"
    };
    gulp.src("dev/index.html")
        .pipe(open("", options));
});
gulp.task("url-dist", ['connect-dist'], function () {
    var options = {
        url: "http://localhost:9000",
        app: "chrome.exe"
    };
    gulp.src("dist/index.html")
        .pipe(open("", options));
});

gulp.task('build', [
    'build-info',
    'build-app-htaccess',
    'build-app-favicon',
    'build-app-404',
    'build-app-img',
    'build-app-fonts',
    'build-lib-css',
    'build-lib-images',
    'build-app-json',
    'build-app-css',
    'build-lib']);

gulp.task('test-dev', ['inject-index-dev'],
    shell.task(['echo executing tests... && karma start --singleRun & echo done'])
);
gulp.task('test-dist', ['inject-index-dist'],
    shell.task(['echo executing tests... && grunt & echo done'])
);

gulp.task('test-e2e', ['inject-index-dev', 'connect'],
    shell.task(['echo executing e2e-tests... && protractor test/e2e/protractor.conf.js  --baseUrl="http://127.0.0.1:9000"  & echo done'])
);

gulp.task('build-dist', ['build-app-dist', 'build']);

gulp.task('build-dev', ['build-app-dev', 'build']);

gulp.task('default', ['test-dev'], function () {
    utils.setBuildDist(true);
    utils.setMinify(true);
    gulp.start('inject-index-dist');
});

gulp.task('dev', ['test-dev', 'url'], function () {
    gulp.watch([paths.src + patterns.anyFile, 'test/' + patterns.anyFile], ['build-info', 'test-dev']);
});

gulp.task('dist', ['default', 'url-dist'], function () {
    gulp.watch([paths.src + patterns.anyFile, 'test/' + patterns.anyFile], ['default']);
});