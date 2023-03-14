import { Box, Stack } from "@mui/system";
import { FC, memo } from "react";

type RagScoreIndicatorProps = {
  redScores: number;
  amberScores: number;
  greenScores: number;
};

const RagScoreIndicator: FC<RagScoreIndicatorProps> = ({
  redScores,
  amberScores,
  greenScores,
}) => {
  const totalScores = redScores + amberScores + greenScores;
  if (totalScores === 0) {
    return null;
  }

  const redPercentage = redScores / totalScores;
  const amberPercentage = amberScores / totalScores;
  const greenPercentage = greenScores / totalScores;

  return (
    <Stack
      height={35}
      width={10}
      sx={{
        borderRadius: "5px",
      }}
      overflow="hidden"
    >
      <Box
        flex={greenPercentage}
        sx={{
          backgroundColor: "green",
        }}
      />

      <Box
        flex={amberPercentage}
        sx={{
          backgroundColor: "orange",
        }}
      />
      <Box
        flex={redPercentage}
        sx={{
          backgroundColor: "red",
        }}
      />
    </Stack>
  );
};

export default memo(RagScoreIndicator);
