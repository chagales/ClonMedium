var gulp = require("gulp");//importamos gulp
var sass = require("gulp-sass");
var notify  = require("gulp-notify");
var browserSync = require("browser-sync").create();
var gulpImport = require("gulp-html-import");



//definimos una tarea por defecto
gulp.task("default",["html","sass"],function(){
    console.log("Iniciamos");
    //Iniciamos el servidor de desarrollo
    browserSync.init({server:"dist/"});

    gulp.watch(["src/scss/*.scss","src/scss/**/*.scss"],["sass"]);

    //observa cambios en los archivos html
    gulp.watch(["src/*.html","src/**/*.html"],["html"]);
});

//compilar sass
gulp.task("sass", function() {
    gulp.src("src/scss/style.scss")//Cargamos el archivo style.scss
        .pipe(sass().on("error",function(error){
            return notify().write(error);
        }))//lo compilamos con gulp-sass
        .pipe(gulp.dest("dist/"))//guardamos el resultado en carpeta css
        .pipe(browserSync.stream()) //recargar la pagina
        .pipe(notify("SaSS Compilado"));
});  

// copiar e importar html
gulp.task("html", function(){
    gulp.src("src/*.html")
        .pipe(gulpImport("src/components/")) // reemplaza los @import de los HTML        
        .pipe(gulp.dest("dist/"))
        .pipe(browserSync.stream())
        .pipe(notify("HTML importado"));
});