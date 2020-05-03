var app = angular.module('myApp', []);

app.controller('ControladorDescargar', ['$scope', '$http',
  function($scope, $http) {
    $scope.download = function () {
        $http({
            method: 'GET',
            url: 'proxy/index.php?op=0&ipRequest='+$scope.urlname
        }).then(function (data, status, headers) {
            console.log("!-- Estoy en 200.");

            var array = [];
            var zip = new JSZip();
            var count = 0;
            var zipFilename = "imagenes.zip";
            var filename = $scope.nombrebase;
            var countName = 1;

            //Como con el proxy se devuelve un JSON, hay que acceder a data.data para obtener el código de toda la página de Gematsu.
            data = data.data;
            //Se buscan todas las miniaturas que hay en Gematsu, que están en 'thumbnails'.
            $(data).find("#thumbnails").children().each(function(){
              //Me quedo con los nombres de los href, y a partir de ahí construyo la URL de cada imagen.
              var elem = $(this).find('a:first').attr('href');
              var val = "https://gematsu.com" + elem;
              val = val.slice(0,28)+"albums/"+val.slice(28);
              val = val.slice(0, -4);
              //Guardo la URL de las imágenes en un array.
              array.push(val);
            })
            //No sé por qué hay un elemento a mayores en el array que no es una imagen, así que lo elimino.
            array.splice(-1);

            //Se recorre el array de imágenes para meterlas en el zip.
            $.each(array, function(index, val) {
              //Se carga la imagen y se mete en el zip.
              JSZipUtils.getBinaryContent('proxy/index.php?op=1&ipRequest='+val, function (err, data) {
                 if(err) {
                    throw err;
                 }
                 //Se crea una carpeta con el nombre 'imagenes' y se meten las imágenes con el nombre introducido por el usuario
                 //seguido de un número que se va incrementando en cada iteración, y la extensión correspondiente (los cuatro últimos caracteres de la URL).
                 zip.folder("imagenes").file(filename+"-"+countName+val.slice(-4), data, {binary:true});
                 count++;
                 countName++;
                 //Cuando se recorre todo el array, se genera el zip.
                 if (count == array.length) {
                   zip.generateAsync({type:'blob'}).then(function(content) {
                      saveAs(content, zipFilename);
                   });
                 }
              });
            });

        }).catch(function (data, status, headers) {
            console.log("!-- Estoy en 404.");
        });
    }
  }
]);
