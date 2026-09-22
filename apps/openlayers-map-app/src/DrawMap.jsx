// MarkerPopupMap.js
import React, {useEffect} from "react"
import "ol/ol.css"
import Map from "ol/Map"
import View from "ol/View"
import {Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {toLonLat} from 'ol/proj.js';
import {toStringHDMS} from 'ol/coordinate.js';
import OSM from "ol/source/OSM";
import {Draw} from "ol/interaction.js";

export const DrawMap = () => {

    const [type, setType] = React.useState();

    const [map, setMap] = React.useState(new Map({
        view: new View({
            center: [-11000000, 4600000],
            zoom: 4,
        })
    }));

    const [draw, setDraw] = React.useState();
    console.log('draw', draw);

    const [isDrawing, setIsDrawing] = React.useState(false);

    const [points, setPoints] = React.useState([]);
    console.log('points', points)

    const mapOnClickFn = React.useCallback((e) => {
        const coordinate = e.coordinate;
        const hdms = toStringHDMS(toLonLat(coordinate));

        // console.log('coordinate', coordinate)
        // console.log('hdms', hdms)


        // v case inicializacie, tzn. ze potom uz neupdatujeme stav, takze preto musime znova priradit tu funkciu.
        if (isDrawing) {
            setPoints((prevState => [...prevState, coordinate]))
        }
    },[isDrawing, draw])

    // on Mount
    useEffect(() => {
        const raster = new TileLayer({
            source: new OSM(),
        });

        const source = new VectorSource({wrapX: false});

        const vector = new VectorLayer({
            source: source,
        });

        map.setTarget('map')
        map.setLayers([raster, vector])


        /**
         * Add a click handler to the map to render the popup.
         */
        // singleclick
        map.on('click', mapOnClickFn);


        // map.on('change', function (evt) {
        //     console.log('change')
        // });

        return () => map.setTarget(null)

    }, [])


    // change type
    React.useEffect(() => {

        if (!type) return


        // Cancel button
        if (type === 'None' && draw) {
            map.removeInteraction(draw);
            return
        }


        if (type && draw){
            map.removeInteraction(draw);
        }



        const source = new VectorSource({wrapX: false});
        const drawObj = new Draw({
            source: source,
            type: type,
        });

        drawObj.on('drawend', (e) => {
            const geometry = e.feature.getGeometry();
            const coords = geometry.getCoordinates();
            console.log('coords', coords)
        })

        setDraw(drawObj);
        map.addInteraction(drawObj)

        map.on('click', mapOnClickFn);

    },[type])


    const handlePolygonClick = () => {
        setType('Polygon')
        setIsDrawing(true);
    }

    const handleLineStringClick = () => {
        setType('LineString')
        setIsDrawing(true);
    }

    const handleCancelClick = () => {
        setType('None')
        setIsDrawing(false);
    }

    return (
        <div>
            <div id="map" style={{width: "100%", height: "400px"}}/>
            <button onClick={handlePolygonClick}>Polygon</button>
            <button onClick={handleLineStringClick}>LineString</button>
            <button onClick={handleCancelClick}>Cancel</button>
            <button onClick={() => {
                console.log('draw', draw)
                draw.removeLastPoint();
            }}>Undo</button>
        </div>
    )
}

