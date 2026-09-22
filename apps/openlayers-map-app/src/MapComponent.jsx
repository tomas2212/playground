// MapComponent.js
import React, {useEffect} from 'react';
import {Feature, Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import {OGCMapTile} from "ol/source.js";
import VectorSource from "ol/source/Vector";
import {Point} from "ol/geom.js";
import VectorLayer from "ol/layer/Vector";


export const MapComponent = () => {


    const [mapCenter, setMapCenter] = React.useState([0, 0]);
    const [map, setMap] = React.useState(new Map({
        layers: [new TileLayer({
            preload: Infinity,
            source: new OSM(),
        })],
        view: new View({
            center: mapCenter,
            zoom: 0,
        }),
    }));

    useEffect(() => {
        map.setTarget('map')

        const iconFeature = new Feature({
            geometry: new Point([0, 0]),
            name: 'Null Island',
            // population: 4000,
            // rainfall: 500,
        });

        const vectorSource = new VectorSource({
            features: [iconFeature],

        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            // background: 'black'
        });

        const rasterLayer = new TileLayer({
            source: new OGCMapTile({
                url: 'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad',
                crossOrigin: '',
            }),
        });

        map.setLayers([rasterLayer, vectorLayer])


        map.on('click', function (e) {
            const coordinate = e.coordinate;
            // const hdms = toStringHDMS(toLonLat(coordinate));
            console.log('click: evt.coordinate', coordinate)
            setMapCenter(coordinate)
        });

        // map.on('singleclick', function (e) {
        //     const coordinate = e.coordinate;
        //     // const hdms = toStringHDMS(toLonLat(coordinate));
        //
        //     console.log('singleClick: evt.coordinate', coordinate)
        //     setMapCenter(coordinate)
        // });

        return () => map.setTarget(null)
    }, []);


    useEffect(() => {
        console.log('mapCenter useEffect: map', map);
        if (map) {
            const view = map.getView();
            // view.setCenter(mapCenter)
            map.getView().animate({center: mapCenter}, {duration: 2000});
        }
    }, [mapCenter]);


    return (
        <div>
            {/*// className="map-container"*/}
            <div id="map" style={{height: '400px', width: '100%'}}/>
        </div>
    );
}
