import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import AttributeColorInfo from "@arcgis/core/renderers/support/AttributeColorInfo";
import PieChartRenderer from "@arcgis/core/renderers/PieChartRenderer";
import {
  CIMSymbol,
  SimpleFillSymbol,
  SimpleMarkerSymbol,
} from "@arcgis/core/symbols";
import { createCircleSymbolLayer } from "./symbolUtils";
import Color from "@arcgis/core/Color";

const greenColor = new Color([0, 130, 0, 0.8]);
const redColor = new Color([200, 0, 0, 0.8]);
const amberColor = new Color([255, 170, 0, 0.8]);
const colors = [greenColor, amberColor, redColor];
const colorLabels = ["green", "amber", "red"];

export const myRenderer = (enabledAttributes: string[]) => {
  const addValuesFromEnabledAttributes = (
    enabledAttributes: string[]
  ): string => {
    const values = enabledAttributes
      .map((attribute, index) => `var value${index}=$feature.${attribute};`)
      .join("\n");
    return values;
  };

  const enabledAttributesToArcadeArray = (
    enabledAttributes: string[]
  ): string => {
    //here we could normalize the values to 0-10 if we wanted to
    const array = `[${enabledAttributes
      .map((attribute, index) => `value${index}`)
      .join(",")}]`;
    return array;
  };

  const symbolLayers = Array(10)
    .fill(0)
    .map((_, index) => {
      return colorLabels.map((label, i) => ({
        ...createCircleSymbolLayer({
          index,
          totalSymbols: 10,
          primitiveName: `circle-${index}-${i}`,
          anchorPoint: { x: 0, y: -index * 0.95 },
          color: colors[i].toJSON(),
        }),
      }));
    })
    .flat();

  const updatedCreateSizeOverrides = (
    pillIndex: number,
    colorIndex: number
  ) => {
    return {
      type: "CIMPrimitiveOverride" as "CIMPrimitiveOverride",
      primitiveName: `circle-${pillIndex}-${colorIndex}`,
      propertyName: "Size",
      // we count the number of enabled attributes that are red ,green or amber and use that to set the size
      valueExpressionInfo: {
        type: "CIMExpressionInfo" as "CIMExpressionInfo",
        title: `OffsetX`,
        expression: `
                var redCount = 0;
                var greenCount = 0;
                var amberCount = 0;
                ${addValuesFromEnabledAttributes(enabledAttributes)}
                var values = ${enabledAttributesToArcadeArray(
                  enabledAttributes
                )};
                function isRed(value){
                  return value >= 0 && value < 4;
                }
                function isAmber(value){
                  return value >= 4 && value < 7;
                }
                function isGreen(value){
                  return value >= 7 && value < 10;
                }
                var reds=Filter(values, isRed);
                var redCount = Round(Count(reds)/${
                  enabledAttributes.length
                }*10);
                var ambers=Filter(values, isAmber);
                var amberCount = Round(Count(ambers)/${
                  enabledAttributes.length
                }*10);
                var greens=Filter(values, isGreen);
                var greenCount = Round(Count(greens)/${
                  enabledAttributes.length
                }*10);

                if(redCount + amberCount + greenCount > 10){
                  if(redCount > amberCount && redCount > greenCount){
                    redCount = redCount - 1;
                  }else if(amberCount > redCount && amberCount > greenCount){
                    amberCount = amberCount - 1;
                  }else if(greenCount > redCount && greenCount > amberCount){
                    greenCount = greenCount - 1;
                  }
                }else if(redCount + amberCount + greenCount < 10){
                  if(redCount < amberCount && redCount < greenCount){
                    redCount = redCount + 1;
                  }else if(amberCount < redCount && amberCount < greenCount){
                    amberCount = amberCount + 1;
                  }else if(greenCount < redCount && greenCount < amberCount){
                    greenCount = greenCount + 1;
                  }
                }

                if(${colorIndex} == 0){ //green
                  if(redCount + amberCount > ${pillIndex}){
                    return 0;
                  }else {
                    return 5;
                  }
                }else if(${colorIndex} == 1){ //amber
                  if(redCount <= ${pillIndex} && ${pillIndex} < 10 - greenCount){
                    return 5;
                  }else{
                    return 0;
                  }
                }else if(${colorIndex} == 2){ //red
                  if(redCount > ${pillIndex}){
                    return 5;
                  }else {
                    return 0;
                  }
                }
                `,
      },
    };
  };

  const redCountArcadeExpression = `
    var redCount = 0;
    ${addValuesFromEnabledAttributes(enabledAttributes)}
    var values = ${enabledAttributesToArcadeArray(enabledAttributes)};
    function isRed(value){
      return value >= 0 && value < 4;
    }
    var reds=Filter(values, isRed);
    var redCount = Round(Count(reds)/${enabledAttributes.length}*10);
    return redCount;
  `;

  const amberCountArcadeExpression = `
    var amberCount = 0;
    ${addValuesFromEnabledAttributes(enabledAttributes)}
    var values = ${enabledAttributesToArcadeArray(enabledAttributes)};
    function isAmber(value){
      return value >= 4 && value < 7;
    }
    var ambers=Filter(values, isAmber);
    var amberCount = Round(Count(ambers)/${enabledAttributes.length}*10);
    return amberCount;
  `;
  const greenCountArcadeExpression = `
    var greenCount = 0;
    ${addValuesFromEnabledAttributes(enabledAttributes)}
    var values = ${enabledAttributesToArcadeArray(enabledAttributes)};
    function isGreen(value){
      return value >= 7 && value < 10;
    }
    var greens=Filter(values, isGreen);
    var greenCount = Round(Count(greens)/${enabledAttributes.length}*10);
    return greenCount;
  `;
  const totalArcadeExpression = `
    var total = 0;
    ${addValuesFromEnabledAttributes(enabledAttributes)}
    var values = ${enabledAttributesToArcadeArray(enabledAttributes)};
    function isGreen(value){
      return value >= 7 && value < 10;
    }
    var greens=Filter(values, isGreen);
    var greenCount = Round(Count(greens)/${enabledAttributes.length}*10);
    return greenCount;
  `;

  const pieChartRenderer = new PieChartRenderer({
    size: 20,
    attributes: [
      new AttributeColorInfo({
        valueExpression: redCountArcadeExpression,
        color: colors[2],
        label: colorLabels[2],
      }),
      new AttributeColorInfo({
        valueExpression: amberCountArcadeExpression,
        color: colors[1],
        label: colorLabels[1],
      }),
      new AttributeColorInfo({
        valueExpression: greenCountArcadeExpression,
        color: colors[0],
        label: colorLabels[0],
      }),
    ],
  });

  const updatedPrimitiveOverrides = Array(10)
    .fill(0)
    .map((_, index) => {
      return colorLabels.map((label, i) => {
        return updatedCreateSizeOverrides(index, i);
      });
    })
    .flat();

  const customRenderer = new SimpleRenderer({
    symbol: new CIMSymbol({
      data: {
        type: `CIMSymbolReference`,
        symbol: {
          type: `CIMPointSymbol`,
          symbolLayers: symbolLayers,
        },
        primitiveOverrides: updatedPrimitiveOverrides,
        maxScale: 0,
        minScale: 0,
      },
    }),
  });

  return { pieChartRenderer, customRenderer };
};

const clusterRenderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    style: "solid",
    color: [0, 0, 0, 1],
    outline: {
      color: [0, 0, 0, 1],
      width: 0,
    },
  }),
  label: "Cluster",
});

export { clusterRenderer };
