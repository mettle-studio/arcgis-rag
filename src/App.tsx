import React, { useRef, useEffect, useState } from "react";
import Bookmarks from "@arcgis/core/widgets/Bookmarks";
import Expand from "@arcgis/core/widgets/Expand";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import config from "@arcgis/core/config.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";

import "./App.css";
import { Box, Stack } from "@mui/system";
import Renderer from "@arcgis/core/renderers/Renderer";
import { Button, Typography } from "@mui/material";
import { myRenderer } from "./myRenderer";

function App() {
  const mapDiv = useRef(null);
  const renderer = new Renderer();
  const layerRef = useRef<FeatureLayer | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [isCustomRender, setisCustomRender] = useState(false);
  const [attributes, setAttributes] = useState<string[]>([]);
  const [enabledAttributes, setEnabledAttributes] = useState<string[]>([]);

  useEffect(() => {
    if (mapDiv.current) {
      config.apiKey =
        "AAPK976f3e731f144618981ecad3eceabf10D6h1o2pA5DObOHQBclYQI1fvwTFuPcSAfuZin68y3ee7jgDS7lE_gKRDJNCYVGQg";
      /**
       * Initialize application
       */
      mapRef.current = new Map({
        basemap: "arcgis-topographic", // Basemap layer service
      });

      const view = new MapView({
        map: mapRef.current,
        center: [-0.1076, 51.5072], // Longitude, latitude
        zoom: 13, // Zoom level
        container: mapDiv.current, // Div element
      });

      layerRef.current = new FeatureLayer({
        url: "https://services.arcgis.com/lXbC2IQh1QTF54Xm/arcgis/rest/services/pp_indicators/FeatureServer/0",
      });

      mapRef.current.add(layerRef.current);
    }
  }, []);
  //disable console clear

  window.console.clear = () => {};

  useEffect(() => {
    if (!layerRef.current) return;
    //when we have the attributes, update the state
    layerRef.current.load().then(() => {
      if (!layerRef.current?.fields) return;
      const attributes = layerRef
        .current!.fields.filter((field) => field.name !== "OBJECTID")
        .map((field) => field.name);
      setAttributes(attributes);
      setEnabledAttributes(attributes);
    });
  }, [layerRef]);

  const toggleAttribute = (attribute: string) => {
    const newEnabledAttributes = enabledAttributes.includes(attribute)
      ? enabledAttributes.filter((attr) => attr !== attribute)
      : [...enabledAttributes, attribute];
    setEnabledAttributes(newEnabledAttributes);
  };

  const enableCustomRenderer = () => {
    setisCustomRender(true);
  };

  useEffect(() => {
    if (!layerRef.current) return;
    if (!isCustomRender) return;
    layerRef.current.renderer = myRenderer(enabledAttributes);
  }, [enabledAttributes, isCustomRender]);

  return (
    <Stack alignItems="center" justifyContent="center" sx={{ height: "100vh" }}>
      <Box
        sx={{ width: 1000, height: 1000 }}
        className="mapDiv"
        ref={mapDiv}
      ></Box>
      <Stack>
        <Button variant="contained" onClick={enableCustomRenderer}>
          Enable Custom Renderer
        </Button>
        <Typography variant="h2">Attributes</Typography>
        {attributes.map((attribute) => (
          <Button
            color={
              enabledAttributes.includes(attribute) ? "primary" : "secondary"
            }
            key={attribute}
            onClick={() => toggleAttribute(attribute)}
          >
            {attribute}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}

export default App;
