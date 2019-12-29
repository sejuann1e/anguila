var gulp = require('gulp'); // ローカルgulp
var browserSync = require('browser-sync'); // ローカルサーバ＆ブラウザオートリロード
var plumber = require('gulp-plumber'); // エラーによる強制停止を防止
var notify = require('gulp-notify'); // エラー通知
var rename = require('gulp-rename'); // ファイルリネーム
var sourcemaps = require('gulp-sourcemaps'); // ソースマップ
var sass = require('gulp-sass'); // sassコンパイル
var autoprefixer = require('gulp-autoprefixer'); // ベンダープレフィックス
var concat = require('gulp-concat'); // 結合
var uglify = require('gulp-uglify'); // js圧縮
var imagemin = require('gulp-imagemin'); // 画像圧縮
var pngquant = require('imagemin-pngquant'); // png圧縮
var cleanCSS = require('gulp-clean-css'); // CSS圧縮
var data = require('gulp-data');
var htmlbeautify = require('gulp-html-beautify');
var beautify_options = {
  'indent_with_tabs': true
}
var rimraf = require('rimraf');//ファイル削除
var runSequence = require('run-sequence');//順処理

//dist削除タスク
gulp.task('clean', function (cb) {
  return rimraf('app/dist', cb);
});

//ローカルサーバ起動タスク
gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: 'app/dist',
      index: 'index.html',
    },
    watch: true,
    baseDir: 'app/dist',
    index: 'index.html',
    rewriteRules: [{ match: "Content-Security-Policy", replace: "" }]
  });
});

//htmlタスク
gulp.task('html', function () {
  return gulp.src('src/**/*.html')
    .pipe(browserSync.reload({ stream: true })) // ブラウザリロード
    .pipe(gulp.dest('app/dist')); // 開発ディレクトリにコピー
});

// サイトマップ
gulp.task('xml', function () {
  return gulp.src('src/**/*.xml')
    .pipe(gulp.dest('app/dist')); // 開発ディレクトリにコピー
});

//Sassタスク
gulp.task('sass', function () {
  return gulp.src('src/**/**.scss')
    .pipe(plumber({
      errorHandler: notify.onError("Error Sass: <%= error.message %>")
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    // .pipe(rename({
    //     suffix: '.min'
    // }))
    .pipe(gulp.dest('app/dist')) // 開発ディレクトリにcss書き出し
    .pipe(browserSync.reload({ stream: true })); // ブラウザリロード
});

// cssタスク
gulp.task('css', function () {
  return gulp.src('src/**/**.css')
    .pipe(gulp.dest('app/dist'))
    .pipe(browserSync.reload({ stream: true })); // ブラウザリロード
});

// JavaScriptタスク
gulp.task('js', function () {
  return gulp.src('src/**/**.js')
    .pipe(plumber({
      errorHandler: notify.onError("Error JS: <%= error.message %>")
    }))
    //.pipe(concat('main.js')) //結合する場合
    .pipe(uglify()) // 圧縮
    // .pipe(rename({
    //     suffix: '.min'
    // }))
    .pipe(gulp.dest('app/dist')) // 開発ディレクトリに書き出し
    .pipe(browserSync.reload({ stream: true })); // ブラウザリロード
});

// imageタスク
gulp.task('img', function () { // 画像圧縮
  return gulp.src('src/**/*.+(jpg|jpeg|png|gif|svg)')
    .pipe(plumber({
      errorHandler: notify.onError("Error Image: <%= error.message %>")
    }))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('app/dist')) // 開発ディレクトリに書き出し
});

gulp.task('copy', function () { // distディレクトリにコピータスク
  return gulp.src('src/**/*.+(ico|pdf|xml|eps|zip|json|mp4)')
    .pipe(gulp.dest('app/dist')) // 開発ディレクトリにコピー
});

gulp.task('watch', ['browser-sync', 'html', 'xml', 'css', 'sass', 'js', 'img', 'copy'], function () {
  gulp.watch(['src/**/**.html'], ['html']);
  gulp.watch(['src/**/**.xml'], ['xml']);
  gulp.watch(['src/**/**.css'], ['css']);
  gulp.watch(['src/**/**.+(scss|sass)'], ['sass']);
  gulp.watch(['src/**/**.js'], ['js']);
  gulp.watch(['src/**/*.+(jpg|jpeg|png|gif|svg)'], ['img']);
  gulp.watch(['src/**/*.+(ico|pdf|eps|zip|json)'], ['copy']);
});

//デフォルトタスク（gulpで実行される）cleanタスクを実行してからdistを生成
gulp.task('default', function (callback) {
  runSequence('clean', ['html', 'xml', 'css', 'sass', 'js', 'img', 'copy'], callback);
});