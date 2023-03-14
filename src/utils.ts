// take a string in the form air_quality and return Air Quality
export const formatAttributeName = (attribute: string) => {
  return attribute
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
