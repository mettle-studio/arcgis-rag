import { FC, useEffect, useState } from "react";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridRenderCellParams,
  GridFilterItem,
} from "@mui/x-data-grid";
import useQueryLayerFeatures from "./useQueryLayerFeatures";
import { Stack } from "@mui/system";
import RagScoreIndicator from "./RagScoreIndicator";
import { Box, Typography } from "@mui/material";

const getRagScore = (enabledAttributes: string[]) => (params: any) => {
  const score = enabledAttributes.reduce((acc, attribute) => {
    const value = params.row[attribute];
    return acc + value;
  }, 0);

  return enabledAttributes.length === 0
    ? 0
    : (score / enabledAttributes.length).toFixed(2);
};

const validateAllFilterItemsHaveValues = (filterItems: GridFilterItem[]) => {
  return filterItems.every(
    (item) => item.value !== undefined && item.value !== ""
  );
};

const esriFieldTypeToGridType = (type: typeof __esri.Field.prototype.type) => {
  //TODO: Add more types
  // https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Field.html#type
  switch (type) {
    case "integer":
    case "small-integer":
    case "double":
    case "single":
      return "number";
    default:
      return "string";
  }
};

const gridFilterItemToSql = (
  filterItem: GridFilterItem,
  enabledAttributes: __esri.Field[]
) => {
  if (filterItem.field !== "ragScore") {
    return `${filterItem.field} ${filterItem.operator} ${filterItem.value}`;
  } else {
    const enabledAttributeNames = enabledAttributes.map(
      (attribute) => attribute.name
    );
    return `(${enabledAttributeNames.join("+")})/${
      enabledAttributeNames.length
    } ${filterItem.operator} ${filterItem.value}`;
  }
};

const renderRagScore =
  (enabledAttributes: string[]) => (params: GridRenderCellParams) => {
    const noOfReds = enabledAttributes.reduce((acc, attribute) => {
      const value = params.row[attribute];
      return acc + (value <= 3 ? 1 : 0);
    }, 0);
    const noOfAmbers = enabledAttributes.reduce((acc, attribute) => {
      const value = params.row[attribute];
      return acc + (value > 3 && value <= 6 ? 1 : 0);
    }, 0);
    const noOfGreens = enabledAttributes.reduce((acc, attribute) => {
      const value = params.row[attribute];
      return acc + (value > 6 ? 1 : 0);
    }, 0);
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <RagScoreIndicator
          redScores={noOfReds}
          amberScores={noOfAmbers}
          greenScores={noOfGreens}
        />
        <Box width={30}>
          <Typography>{params.value.toFixed(2)}</Typography>
        </Box>
      </Stack>
    );
  };

type FieldTableProps = {
  layer: __esri.FeatureLayer;
  enabledAttributes: __esri.Field[];
  setSqlExpression: (sqlExpression: string) => void;
};

const FieldTable: FC<FieldTableProps> = ({
  layer,
  enabledAttributes,
  setSqlExpression,
}) => {
  const [queryParams, setQueryParams] = useState<
    __esri.QueryProperties | undefined
  >();
  const [gridFilterItems, setGridFilterItems] = useState<GridFilterItem[]>([]);
  const { data, isLoading } = useQueryLayerFeatures(layer, queryParams);

  //change outfields when enabled attributes change
  useEffect(() => {
    console.log(layer.fields);
    setQueryParams((currentParams) => ({
      ...currentParams,
      outFields: [
        `CAST((${enabledAttributes
          .map((field) => field.name)
          .join("+")}) as FLOAT)/${enabledAttributes.length} as ragScore,` +
          layer.fields.map((field) => field.name).join(","),
      ],
    }));
  }, [enabledAttributes, layer.fields]);

  //update the query when filters or enabled attributes change
  useEffect(() => {
    if (gridFilterItems.length === 0) {
      setQueryParams((currentParams) => ({
        ...currentParams,
        where: undefined,
      }));
    }

    if (!validateAllFilterItemsHaveValues(gridFilterItems)) {
      return;
    }

    const where = gridFilterItems.reduce((acc, item) => {
      if (acc === "") {
        return gridFilterItemToSql(item, enabledAttributes);
      }
      return `${acc} AND ${gridFilterItemToSql(item, enabledAttributes)}`;
    }, "");
    setQueryParams((queryParams) => ({
      ...queryParams,
      where,
    }));
    setSqlExpression(where);
  }, [gridFilterItems, enabledAttributes, setSqlExpression]);

  if (!layer) {
    return null;
  }

  console.log(
    "data",
    data?.map((feature) => feature.attributes)
  );

  let columns: (GridColDef & {
    renderCell?: (params: GridRenderCellParams) => JSX.Element;
  })[] = layer.fields
    .filter(
      (field) =>
        enabledAttributes.includes(field) || !field.name.startsWith("indicator")
    )
    .map((field) => {
      return {
        field: field.name,
        flex: 1,
        type: esriFieldTypeToGridType(field.type),
        description: field.description,
        headerName: field.alias,
        valueGetter: (params: any) => {
          const value = params.row[field.name];
          return value;
        },
      };
    });
  columns = [
    ...columns,
    {
      field: "ragScore",
      headerName: "RAG Score",
      type: "number",
      flex: 1,
      renderCell: renderRagScore(enabledAttributes.map((field) => field.name)),
    },
  ].reverse();

  const rows: GridRowsProp =
    data?.map((feature) => {
      return {
        id: feature.attributes.OBJECTID,
        ...feature.attributes,
      };
    }) ?? [];

  return (
    <DataGrid
      initialState={{
        columns: {
          columnVisibilityModel: {
            OBJECTID: false,
          },
        },
      }}
      sortingMode="server"
      onSortModelChange={(params) => {
        setQueryParams((queryParams) => ({
          ...queryParams,
          orderByFields: params.map((param) => {
            if (param.field === "ragScore") {
              return `(${enabledAttributes
                .map((field) => field.name)
                .join("+")})/${
                enabledAttributes.length
              } ${param.sort?.toUpperCase()}`;
            }
            return `${param.field} ${param.sort?.toUpperCase()}`;
          }),
        }));
      }}
      loading={isLoading}
      filterMode="server"
      onFilterModelChange={(params) => {
        setGridFilterItems(params.items);
      }}
      rows={rows}
      columns={columns}
    />
  );
};

export default FieldTable;
