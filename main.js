//Variables globales
let mymap;
let svg, g, lines;
let currentCity = 'Asuncion';
let currentFlyTo = true;
let mapWidth = document.getElementById('map').clientWidth;
let mapHeight = document.getElementById('map').clientHeight;

let citiesMap = {
    Asuncion: {zoom: 11, posicion: [-25.2968361, -57.55]},
    Bogota: {zoom: 11, posicion: [4.6482837, -74.2478945]},
    Bridgetown: {zoom: 13, posicion: [13.1013067, -59.6316129]},
    Buenos_Aires: {zoom: 11, posicion: [-34.6158037, -58.5033387]}
};

//Por defecto, carga Asunción
createMap('Asuncion');

function createMap(ciudad){
    //Llamada al GitHub
    window.fetch('https://raw.githubusercontent.com/CarlosMunozDiazEC/prueba-datos/main/IDB_topojson/' + ciudad + '.json')
        .then(function(response) {
            return response.json();
        })
        .then(function(initData) {
            //Características del mapa
            mymap = L.map('map').setView([citiesMap[currentCity].posicion[0], citiesMap[currentCity].posicion[1]], citiesMap[currentCity].zoom);

            mymap.touchZoom.disable();
            mymap.doubleClickZoom.disable();
            mymap.scrollWheelZoom.disable();
            mymap.boxZoom.disable();
            mymap.keyboard.disable();

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(mymap);

            L.svg({clickable:true}).addTo(mymap);

            svg = d3.select("#map")
                .select("svg")
                .attr("pointer-events", "auto");
                
            g = svg.select("g");

            let transform = d3.geoTransform({point: projectPoint});
            let path = d3.geoPath().projection(transform);

            let data = topojson.feature(initData, initData.objects.Asuncion);

            let lines = g.selectAll("path")
                .data(data.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", '#228B22')
                .attr("fill-opacity", '1');

            mymap.on('viewreset', reset);
            mymap.on('zoom', reset);

            function reset(){
                lines
                    .attr("d", path)
                    .attr("fill", '#228B22')
                    .attr("fill-opacity", '1');
            }
        });   
}

//Función de actualización del mapa
document.getElementById('cities').addEventListener('change', (e) => {
    let target = e.target.value;
    updateMap(target);
});

document.getElementById('flyto').addEventListener('change', function(e) {
    currentFlyTo = e.target.checked;
});

document.getElementById('layers').addEventListener('change', function(e) {
    currentLayer = e.target.value;
    changeLayer(currentLayer);
});

function changeLayer(layer) {
    if(layer == 'carto') {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            //attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(mymap);
    } else if (layer == 'carto-v') {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
            //attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(mymap);
    } else if (layer == 'stamen') {
        L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        }).addTo(mymap);
    } else {
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            //attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
        }).addTo(mymap);
    }   
}

function updateMap(ciudad) {
    currentCity = ciudad;
    //Llamada al GitHub
    window.fetch('https://raw.githubusercontent.com/CarlosMunozDiazEC/prueba-datos/main/IDB_topojson/' + currentCity + '.json')
        .then(function(response) {
            return response.json();
        })
        .then(function(initData) {
            let transform = d3.geoTransform({point: projectPoint});
            let path = d3.geoPath().projection(transform);

            let data = topojson.feature(initData, initData.objects[currentCity]);         

            let lines = g.selectAll("path")
                .data(data.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", '#228B22')
                .attr("fill-opacity", '1');

                mymap.on('viewreset', reset);
                mymap.on('zoom', reset);

            function reset(){
                lines
                    .data(data.features)
                    .attr("d", path)
                    .attr("fill", '#228B22')
                    .attr("fill-opacity", '1');
            }

            //Características del mapa
            if(currentFlyTo) {
                mymap.flyTo([citiesMap[currentCity].posicion[0], citiesMap[currentCity].posicion[1]], citiesMap[currentCity].zoom, {
                    animate: true,
                    duration: 10,
                    noMoveStart: true
                });
            } else {
                mymap.setView([citiesMap[currentCity].posicion[0], citiesMap[currentCity].posicion[1]], citiesMap[currentCity].zoom);
            }            
        }); 
}

/* Helpers */
function projectPoint(x, y) {
    let point = mymap.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

function formatTime(date) {
    let split = date.split("/");
    return new Date(split[2], split[1] - 1, split[0]);
}

d3.timeFormatDefaultLocale({
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
    "currency": ["€", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%d/%m/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    "shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
    "months": ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
    "shortMonths": ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
});

function getNumberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}