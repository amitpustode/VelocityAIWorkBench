import React from "react";
import { Box } from "@mui/material";
import Icon from "./Icons";
import "../styles/searchbar.scss"; // Import the SCSS file

interface SearchBarProps {
  status: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ status, placeholder, value, onChange }) => {
  return (
    <Box className="search-bar">
      <Box className="search-box">
        {status !== "inactive" && (
          <>
            <Icon className="search-icon" size={16} name="search" />
            <input 
              type="text" 
              placeholder={placeholder} 
              value={value} 
              onChange={onChange} 
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default SearchBar;
