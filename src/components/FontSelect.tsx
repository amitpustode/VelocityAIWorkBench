import React from 'react';
import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface FontSelectProps {
  selectedFont: string;
  onFontChange: (font: string) => void;
}

const systemFonts = [
  "Arial",
  "Open Sans",
  "Verdana",
  "Helvetica",
  "Times New Roman",
  "Trebuchet MS",
  "Georgia",
  "Courier New",
  "Lucida Console",
  "Tahoma",
  "Impact",
  "Comic Sans MS",
  "Segoe UI",
];

const FontSelect: React.FC<FontSelectProps> = ({ selectedFont, onFontChange }) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const font = event.target.value as string;
    onFontChange(font);
  };

  return (
    <div>
      <FormControl fullWidth>
        <Select
          className='no-font-change'
          id="font-select"
          value={selectedFont}
          onChange={handleChange}
        >
          {systemFonts.map((font) => (
            <MenuItem className='no-font-change' key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default FontSelect;
