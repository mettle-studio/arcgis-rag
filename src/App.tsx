import React, { useRef, useEffect, useState } from "react";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import config from "@arcgis/core/config.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import FeatureReductionCluster from "@arcgis/core/layers/support/FeatureReductionCluster";
import { DoubleChevronRight as ExpandIcon } from "@mott-macdonald/smi-react-ui-kit/icons";

import "./App.css";
import { Box, Stack } from "@mui/system";
import { Button, Divider } from "@mui/material";
import { clusterRenderer, myRenderer } from "./myRenderer";
import AttributeLayerTree from "./AttributeLayerTree";
import FieldTable from "./FieldTable";
import RagScoreIndicator from "./RagScoreIndicator";
import Color from "@arcgis/core/Color";
import { Font, TextSymbol } from "@arcgis/core/symbols";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
const maxScale = 4622324 / 16;
function App() {
  const mapDiv = useRef(null);
  const layerRef = useRef<FeatureLayer | null>(null);
  const mapRef = useRef<WebMap | null>(null);
  const viewRef = useRef<MapView | null>(null);
  const [isCustomRender, setisCustomRender] = useState(true);
  const [attributes, setAttributes] = useState<__esri.Field[]>([]);
  const [enabledAttributes, setEnabledAttributes] = useState<__esri.Field[]>(
    []
  );
  const [showFilterMenu, setShowFilterMenu] = useState(true);
  const [sqlExpression, setSqlExpression] = useState<string | undefined>();

  useEffect(() => {
    if (mapDiv.current) {
      config.apiKey =
        "AAPK976f3e731f144618981ecad3eceabf10D6h1o2pA5DObOHQBclYQI1fvwTFuPcSAfuZin68y3ee7jgDS7lE_gKRDJNCYVGQg";
      /**
       * Initialize application
       */
      mapRef.current = new WebMap({
        basemap: "arcgis-topographic", // Basemap layer service
      });

      viewRef.current = new MapView({
        map: mapRef.current,
        center: [-0.1076, 51.5072], // Longitude, latitude
        zoom: 13,
        container: mapDiv.current, // Div element
      });

      layerRef.current = new FeatureLayer({
        portalItem: {
          id: "4405d7a2b9be48e8887b5122fd687684",
        },
      });
      /*

      layerRef.current.featureReduction = new FeatureReductionCluster({
        clusterRadius: 50,
        clusterMinSize: 24,
        clusterMaxSize: 60,
        labelingInfo: [
          new LabelClass({
            deconflictionStrategy: "none",
            labelExpressionInfo: {
              expression: "Text($feature.cluster_count, '#,###')",
            },
            symbol: new TextSymbol({
              color: new Color("white"),
              font: new Font({
                size: 20,
                family: "Noto Sans",
                weight: "bold",
              }),
            }),
            labelPlacement: "center-center",
          }),
        ],
      });
*/
      mapRef.current.add(layerRef.current);
    }
  }, []);

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  useEffect(() => {
    if (!layerRef.current) return;
    //when we have the attributes, update the state
    layerRef.current.load().then(() => {
      if (!layerRef.current?.fields) return;
      const attributes = layerRef.current!.fields.filter(
        (field) =>
          field.name !== "OBJECTID" && field.name.startsWith("indicator")
      );
      setAttributes(attributes);
      setEnabledAttributes(attributes);
    });
  }, [layerRef]);

  const toggleAttribute = (attribute: __esri.Field) => {
    const newEnabledAttributes = enabledAttributes.find(
      (attr) => attr.name === attribute.name
    )
      ? enabledAttributes.filter((attr) => attr.name !== attribute.name)
      : [...enabledAttributes, attribute];
    setEnabledAttributes(newEnabledAttributes);
  };

  useEffect(() => {
    if (!layerRef.current || !layerRef.current.fields) return;
    if (isCustomRender) {
      layerRef.current.renderer = myRenderer(
        enabledAttributes.map((attr) => attr.name)
      ).customRenderer;
    } else {
      layerRef.current.renderer = myRenderer(
        enabledAttributes.map((attr) => attr.name)
      ).pieChartRenderer;
    }
  }, [enabledAttributes, isCustomRender]);

  useEffect(() => {
    if (!layerRef.current) return;
    if (!sqlExpression) return;
    layerRef.current.definitionExpression = sqlExpression;
  }, [sqlExpression]);

  const toggleCustomRender = () => {
    setisCustomRender(!isCustomRender);
  };

  return (
    <Stack
      direction="row"
      height={"100vh"}
      divider={<Divider flexItem orientation="vertical" />}
    >
      <Stack
        justifyContent="space-between"
        width={showFilterMenu ? 300 : 0}
        divider={<Divider />}
      >
        <AttributeLayerTree
          fields={attributes}
          enabledFields={enabledAttributes}
          toggleAttribute={toggleAttribute}
        />
        <Button onClick={toggleCustomRender}>Toggle Custom Render</Button>

        <Stack alignItems="flex-end" p={1.5}>
          <ExpandIcon onClick={toggleFilterMenu} />
        </Stack>
      </Stack>
      <Box flex={1}>
        <Box width="100%" height="55%" className="mapDiv" ref={mapDiv}></Box>
        <Box width="100%" height="45%">
          {layerRef.current && (
            <FieldTable
              enabledAttributes={enabledAttributes}
              layer={layerRef.current}
              setSqlExpression={setSqlExpression}
            />
          )}
        </Box>
      </Box>
    </Stack>
  );
}

export default App;
