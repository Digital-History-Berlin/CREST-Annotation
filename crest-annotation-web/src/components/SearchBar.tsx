import React, { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { Clear, Search } from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
} from "@mui/material";

interface IProps {
  onSearch: (search: string | undefined) => void;
}

type Props = IProps & TextFieldProps;

/**
 * Special application layout
 *
 * Shows a list of objects as a grid of cards.
 * Can be used instead of the default layout.
 */
const SearchBar = ({ onSearch, ...props }: Props) => {
  const [search, setSearch] = useState("");

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      // IMPORTANT: avoid page refresh
      e.preventDefault();

      const trimmed = search.trim();
      onSearch(trimmed.length ? trimmed : undefined);
    },
    [onSearch, search]
  );

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    onSearch("");
  }, [onSearch]);

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        {...props}
        value={search}
        onChange={handleSearch}
        variant="filled"
        placeholder="Search..."
        sx={{ mb: 2 }}
        hiddenLabel
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: search && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={clearSearch}>
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </form>
  );
};

export default SearchBar;
