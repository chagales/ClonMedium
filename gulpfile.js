var gulp = require("gulp"); // importamos la librería gulp
var sass = require("gulp-sass");
var notify = require("gulp-notify");
var browserSync = require("browser-sync").create();
var gulpImport = require("gulp-html-import");
var tap = require("gulp-tap");
var browserify = require("browserify");
var buffer = require("gulp-buffer");
var sourcemaps = require("gulp-sourcemaps");
var htmlmin = require("gulp-htmlmin");
var uglify = require("gulp-uglify");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var imagemin = require("gulp-imagemin");




//definimos una tarea por defecto
gulp.task("default",["html","sass","js"],function(){
    console.log("Iniciamos");
    //Iniciamos el servidor de desarrollo    
    browserSync.init({browser:"chrome",proxy:"http://127.0.0.1:3100/"});

    gulp.watch(["src/scss/*.scss","src/scss/**/*.scss"],["sass"]);

    //observa cambios en los archivos html
    gulp.watch(["src/*.html","src/**/*.html"],["html"]);

    // observa cambios en los archivos JS y entonces ejecuta la tarea 'js'
    gulp.watch(["src/js/*.js", "src/js/**/*.js"], ["js"]);
});

// compilar sass
gulp.task("sass", function(){
    gulp.src("src/scss/style.scss") // cargamos el archivo style.scss
        .pipe(sourcemaps.init()) // comienza a capturar los sourcemaps
        .pipe(sass().on("error", function(error){ // lo compilamos con gulp-sass
            return notify().write(error); // si ocurre un error, mostramos una notificación
        }))
        .pipe(postcss([
            autoprefixer(), // transforma el CSS dándole compatibilidad a versiones antiguas
            cssnano()       // comprime/minifca el CSS
        ]))
        .pipe(sourcemaps.write("./")) // guarda el sourcemap en la misma carpeta que el CSS
        .pipe(gulp.dest("dist/")) // guardamos el resultado en la carpeta css
        .pipe(browserSync.stream()) // recargue el CSS del navegador
        .pipe(notify("SASS Compilado 🤘🏻")) // muestra notifiación en pantalla
});

// copiar e importar html
gulp.task("html", function(){
    gulp.src("src/*.html")
        .pipe(gulpImport("src/components/")) // reemplaza los @import de los HTML
        .pipe(htmlmin({collapseWhitespace: true})) // minifica el HTML
        .pipe(gulp.dest("dist/"))
        .pipe(browserSync.stream())
        .pipe(notify("HTML importado"));
});

// compilar y generar un único javascript
gulp.task("js", function(){
    gulp.src("src/js/main.js")
        .pipe(tap(function(file){ // tap nos permite ejecutar una función por cada fichero seleccionado en gulp.src
            // reemplazamos el contenido del fichero por lo que nos devuelve browserify pasándole el fichero
            file.contents = browserify(file.path, {debug: true}) // creamos una instancia de browserify en base al archivo
                            .transform("babelify", {presets: ["es2015"]}) // traduce nuestro codigo de ES6 -> ES5
                            .bundle() // compilamos el archivo
                            .on("error", function(error){ // en caso de error, mostramos una notificación
                                return notify().write(error);
                            });
        }))
        .pipe(buffer()) // convertimos a buffer para que funcione el siguiente pipe
        .pipe(sourcemaps.init({loadMaps: true})) // captura los sourcemaps del archivo fuente
        .pipe(uglify()) // minificamos el JavaScript
        .pipe(sourcemaps.write('./')) // guarda los sourcemaps en el mismo directorio que el archivo fuente
        .pipe(gulp.dest("dist/")) // lo guardamos en la carpeta dist
        .pipe(browserSync.stream()) // recargamos el navegador
        .pipe(notify("JS Compilado"));
});

// tarea que optimiza y crea las imágenes responsive
gulp.task("img", function(){
    gulp.src("src/img/*")
        .pipe(imagemin()) // optimizamos el peso de las imágenes
        .pipe(gulp.dest("dist/img/"))
});