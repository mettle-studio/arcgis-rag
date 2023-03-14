import { Checkbox, Divider, styled, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { ChevronRight as ChevronRightIcon } from "@mott-macdonald/smi-react-ui-kit/icons";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import { FC, useState } from "react";
import { groupBy } from "rambdax";
import { formatAttributeName } from "./utils";

type AttributeLayerTreeProps = {
  fields: __esri.Field[];
  enabledFields: __esri.Field[];
  toggleAttribute: (attribute: __esri.Field) => void;
};

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ChevronRightIcon />} {...props} />
))(({ theme }) => ({
  paddingLeft: theme.spacing(1),
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AttributeLayerTree: FC<AttributeLayerTreeProps> = ({
  fields,
  enabledFields,
  toggleAttribute,
}) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const groupedFields = groupBy((field) => field.name.split("00")[1], fields);

  return (
    <Box flex={1}>
      <Box p={2}>
        <Typography align="center" variant="h6">
          Attributes
        </Typography>
      </Box>
      <Divider />
      <Stack height="100%" divider={<Divider />}>
        {Object.entries(groupedFields).map(([key, value]) => (
          <Accordion
            key={key}
            expanded={expanded.includes(key)}
            onChange={() => {
              if (expanded.includes(key)) {
                setExpanded(expanded.filter((item) => item !== key));
              } else {
                setExpanded([...expanded, key]);
              }
            }}
          >
            <AccordionSummary>
              <Typography>{formatAttributeName(key)}</Typography>
            </AccordionSummary>
            {value.map((field) => (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                key={field.name}
                pl={3}
              >
                <Typography>{field.alias}</Typography>
                <Checkbox
                  color="default"
                  checked={enabledFields.includes(field)}
                  onChange={() => toggleAttribute(field)}
                />
              </Stack>
            ))}
          </Accordion>
        ))}
      </Stack>
    </Box>
  );
};

export default AttributeLayerTree;
