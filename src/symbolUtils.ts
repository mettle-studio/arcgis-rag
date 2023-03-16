import { CIMSymbol } from "@arcgis/core/symbols";
type CIMSymbolLayer = CIMSymbol["data"]["symbol"]["symbolLayers"][number];

const upHalfEllipseGeometry = {
  rings: [
    [
      [12.5, 0],
      [10.38, 0.66],
      [8.32, 1.4],
      [6.39, 2.62],
      [4.64, 4.28],
      [3.14, 6.32],
      [1.92, 8.7],
      [1.02, 11.32],
      [0.48, 14.12],
      [0, 17],
      [25, 17],
      [24.52, 14.12],
      [23.98, 11.32],
      [23.08, 8.7],
      [21.86, 6.32],
      [20.36, 4.28],
      [18.61, 2.62],
      [16.68, 1.4],
      [14.62, 0.66],
      [12.5, 0],
    ],
  ],
};

const downHalfEllipseGeometry = {
  rings: [
    [
      [12.5, 17],
      [14.62, 16.34],
      [16.68, 15.6],
      [18.61, 14.38],
      [20.36, 12.72],
      [21.86, 10.68],
      [23.08, 8.3],
      [23.98, 5.68],
      [24.52, 2.88],
      [25, 0],
      [0, 0],
      [0.48, 2.88],
      [1.02, 5.68],
      [1.92, 8.3],
      [3.14, 10.68],
      [4.64, 12.72],
      [6.39, 14.38],
      [8.32, 15.6],
      [10.38, 16.34],
      [12.5, 17],
    ],
  ],
};

const cimSquareGeometry = {
  rings: [
    [
      [0.0, 0.0],
      [25.0, 0.0],
      [25.0, 17.0],
      [0.0, 17.0],
      [0.0, 0.0],
    ],
  ],
};

interface CreateSymbolLayerParams {
  primitiveName: string;
  color: number[];
  anchorPoint: { x: number; y: number };
  index: number;
  totalSymbols: number;
}

export function createCircleSymbolLayer(params: CreateSymbolLayerParams) {
  const { primitiveName, color, anchorPoint, index, totalSymbols } = params;

  const symbol = {
    type: "CIMPolygonSymbol",
    symbolLayers: [
      {
        type: "CIMSolidFill",
        enable: true,
        color,
      },
    ],
  };

  return {
    type: "CIMVectorMarker",
    enable: true,
    anchorPoint,
    colorLocked: false,
    anchorPointUnits: "Relative",
    primitiveName,
    frame: { xmin: 0.0, ymin: 0.0, xmax: 25.0, ymax: 17.0 },
    markerGraphics: [
      {
        type: "CIMMarkerGraphic",
        geometry:
          index === 0
            ? upHalfEllipseGeometry
            : index === totalSymbols - 1
            ? downHalfEllipseGeometry
            : cimSquareGeometry,
        symbol,
      },
    ],
    respectFrame: true,
    scaleSymbolsProportionally: true,
  } as CIMSymbolLayer;
}
