import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import { CIMSymbol, SimpleFillSymbol } from "@arcgis/core/symbols";
import { createCircleSymbolLayer } from "./symbolUtils";
import Color from "@arcgis/core/Color";

const greenColor = new Color([0, 130, 0, 0.7]);
const redColor = new Color([200, 0, 0, 0.7]);
const amberColor = new Color([255, 170, 0, 0.7]);
const colors = [greenColor, amberColor, redColor];
const colorLabels = ["green", "amber", "red"];

export const myRenderer = (enabledAttributes: string[]) => {
  const createSizeOverrides = (
    attribute: string,
    colorLabel: string,
    lowerBound: number,
    upperBound: number
  ) => {
    return {
      type: "CIMPrimitiveOverride" as "CIMPrimitiveOverride",
      primitiveName: `circle-${attribute}-${colorLabel}`,
      propertyName: "Size",
      valueExpressionInfo: {
        type: "CIMExpressionInfo" as "CIMExpressionInfo",
        title: `Size`,
        expression: `
                var value=$feature.${attribute};
                if(value >= ${lowerBound} && value < ${upperBound}){
                    return 10;
                }else {
                    return 0;
                }
                `,
      },
    };
  };

  const createAnchorPointOverrides = (
    attribute: string,
    colorLabel: string,
    lowerBound: number,
    upperBound: number
  ) => {
    return {
      type: "CIMPrimitiveOverride" as "CIMPrimitiveOverride",
      primitiveName: `circle-${attribute}-${colorLabel}`,
      propertyName: "OffsetX",
      valueExpressionInfo: {
        type: "CIMExpressionInfo" as "CIMExpressionInfo",
        title: `OffsetX`,
        expression: `
              var value=$feature.${attribute};
              return value;
        `,
        returnType: "Default",
      },
    };
  };

  const primitiveOverrides = enabledAttributes
    .map((attribute, index) => {
      return [
        createSizeOverrides(attribute, "red", 0, 4),
        createSizeOverrides(attribute, "amber", 4, 7),
        createSizeOverrides(attribute, "green", 7, 10),
        createAnchorPointOverrides(attribute, "red", 0, 4),
        createAnchorPointOverrides(attribute, "amber", 4, 7),
        createAnchorPointOverrides(attribute, "green", 7, 10),
      ];
    })
    .flat();
  return new SimpleRenderer({
    symbol: new CIMSymbol({
      data: {
        type: `CIMSymbolReference`,
        symbol: {
          type: `CIMPointSymbol`,
          symbolLayers: enabledAttributes
            .map((attribute, index) => {
              return colorLabels.map((label, i) => ({
                ...createCircleSymbolLayer({
                  primitiveName: `circle-${attribute}-${label}`,
                  anchorPoint: { x: 0, y: -index },
                  color: colors[i].toJSON(),
                }),
                size: 10,
              }));
            })
            .flat(),
        },
        primitiveOverrides,
      },
    }),
  });
};
