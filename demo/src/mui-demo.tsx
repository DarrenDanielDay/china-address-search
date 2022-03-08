import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useAddressSearch } from "./use-address-search";
import type * as chinaAddressSearch from "china-address-search";

export const MuiDemo: React.FC = () => {
  const [inputValue, setInputValue] = React.useState("");
  const addressSearchHandle = useAddressSearch();

  React.useEffect(() => {
    addressSearchHandle.handleSearch(inputValue);
  }, [inputValue]);

  return (
    <div style={{ margin: 10 }}>
      <Autocomplete
        sx={{ width: 300 }}
        getOptionLabel={(option) => option?.addressInfo.path.map((node) => node.name).join("")}
        filterOptions={(x) => x}
        options={addressSearchHandle.options}
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={addressSearchHandle.value}
        onChange={(_, newValue: chinaAddressSearch.AddressSearchResult | null) => {
          addressSearchHandle.onChange(newValue || undefined);
          console.log(newValue);
        }}
        onInputChange={(_, newInputValue) => {
          setInputValue(newInputValue);
        }}
        renderInput={(params) => <TextField {...params} label="输入首拼或汉字搜索" fullWidth />}
        renderOption={(props, option) => {
          const { fragments } = option;
          return (
            <li {...props}>
              {fragments.map((fragment, i) => (
                <span key={i} className={fragment.matched ? "highlight" : ""}>
                  {fragment.text}
                </span>
              ))}
            </li>
          );
        }}
      />
    </div>
  );
};
