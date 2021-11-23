function showModal(modalId, modalClose) {
    const modal = document.getElementById(modalId);

    modal.style.display = "block";

    const span = document.getElementsByClassName(modalClose)[0];

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.style.display = "none";
        }
    });
}

function geoPopUp(modalId, modalClose, geoPoint, created, checked, valid, img) {
    console.log(created, checked, valid);
    const modal = document.getElementById(modalId);

    modal.style.display = "block";
    mapCactus(geoPoint);
    addData(geoPoint, created, checked, valid, img);

    const span = document.getElementsByClassName(modalClose);

    for (s of span) {
        s.onclick = function() {
            modal.style.display = "none";
        }
    }


    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.style.display = "none";
        }
    });
}

function addData(geoPoint, created, checked, valid, img) {
    const dataId = document.getElementById('c_data');
    const [lon, lat] = geoPoint.split(',');

    dataId.innerHTML = `
        <p>Created: ${created}</p>
        <p>lat: ${lat}</p>
        <p>lon: ${lon}</p>
        <p>Checked: ${checked}</p>
        <p>Mined: ${valid}</p>
    `;

    const dataImgId = document.getElementById('c_img');

    dataImgId.innerHTML = `<img src="data:image/jpg;charset=utf-8;base64,${img}" alt="Cactus"></img>`;
}

function mapCactus(coords) {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2lvcmciLCJhIjoiY2t2MTVpd3U3MTdsdjJvdGMxenB3eTIxeiJ9.zxzzAN2jGN-_zAW_0H55-A';
    
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: coords.split(','), // starting position [lng, lat]
        zoom: 13 // starting zoom
    });

    const el = document.createElement('div');
    el.className = 'marker';
    
    new mapboxgl.Marker(el).setLngLat(coords.split(',')).addTo(map);
}

function bigGeoMap(modalId, modalClose, cactusData) {
    const modal = document.getElementById(modalId);

    modal.style.display = "block";

    mapAll(cactusData);

    const span = document.getElementsByClassName(modalClose);

    for (s of span) {
        s.onclick = function() {
            modal.style.display = "none";
        }
    }


    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.style.display = "none";
        }
    });
}

function mapAll(cactusData) {
    const data = makeFeatures(cactusData);

    mapboxgl.accessToken = 'pk.eyJ1IjoiY2lvcmciLCJhIjoiY2t2MTVpd3U3MTdsdjJvdGMxenB3eTIxeiJ9.zxzzAN2jGN-_zAW_0H55-A';
    
    const map = new mapboxgl.Map({
        container: 'inner_big_map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [-111.5, 33.5], // starting position [lng, lat]
        zoom: 5.5 // starting zoom
    });

    map.on('load', () => {
        map.addSource('my-data', {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                features: data
            }
        });

        map.addLayer({
            id: 'tester',
            type: 'circle',
            source: 'my-data',
            paint: {
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    10, 3,
                    15, 5
                ],
                'circle-color': '#1c6404'
            }
        });
    });
}

function makeFeatures(cactusData) {
    return cactusData.split('__').map((c) => {
        const [lon, lat] = c.split(',');

        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [Number(lon), Number(lat)]
            },
            properties: {
                title: c
            }
        }
    });
}
