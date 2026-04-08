import { Box, Typography } from "@mui/material";
import React, { type ReactNode } from "react";

interface TitleTagProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
}

const TitleTag: React.FC<TitleTagProps> = ({ title, subtitle, icon }: TitleTagProps) => {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
      {icon && (
        <Box
          sx={{
            width: 40,
            height: 40,
            mt: 0.5,
            borderRadius: 2.5,
            bgcolor: "#0891B214",
            border: "1px solid",
            borderColor: "#0891B233",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}

export default TitleTag;