import { useQuery } from "@tanstack/react-query";

const useQueryLayerFeatures = (
  layer: __esri.FeatureLayer,
  queryParams?: __esri.QueryProperties
) => {
  return useQuery({
    queryKey: ["layer-features", queryParams],
    queryFn: async () => {
      const query = layer.createQuery();
      if (queryParams) {
        Object.assign(query, queryParams);
      }
      const result = await layer.queryFeatures(query);
      return result.features;
    },
    enabled: !!layer,
  });
};

export default useQueryLayerFeatures;
