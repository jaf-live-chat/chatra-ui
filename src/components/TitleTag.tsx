import { Typography } from '@mui/material';
import React from 'react'

interface TitleTagProps {
  title: string;
  subtitle: string;
}

const TitleTag: React.FC<TitleTagProps> = ({ title, subtitle }: TitleTagProps) => {
  return (
    <React.Fragment>
      <Typography variant="h5" sx={{ fontWeight: 800, color: "grey.900" }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {subtitle}
      </Typography>
    </React.Fragment>
  )
}

export default TitleTag