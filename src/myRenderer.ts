import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import { CIMSymbol, SimpleFillSymbol } from "@arcgis/core/symbols";
import { createCircleSymbolLayer } from "./symbolUtils";
import Color from "@arcgis/core/Color";

const greenColor = new Color([0, 255, 0, 0.7]);
const redColor = new Color([255, 0, 0, 0.7]);
const amberColor = new Color([255, 255, 0, 0.7]);
const colors = [greenColor, amberColor, redColor];
const colorLabels = ["green", "amber", "red"];

export const myRenderer = (enabledAttributes: string[]) => {
  const createOverrides = (
    attribute: string,
    colorLabel: string,
    lowerBound: number,
    upperBound: number
  ) => {
    return {
      type: `CIMPrimitiveOverride`,
      primitiveName: `circle-${attribute}-${colorLabel}`,
      propertyName: "Size",
      valueExpressionInfo: {
        type: `CIMExpressionInfo`,
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

  const primitiveOverrides = enabledAttributes
    .map((attribute, index) => {
      return [
        createOverrides(attribute, "green", 0, 4),
        createOverrides(attribute, "amber", 4, 7),
        createOverrides(attribute, "red", 7, 10),
      ];
    })
    .flat();
  console.log(primitiveOverrides);
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
