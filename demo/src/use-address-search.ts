import * as chinaAddressSearch from "china-address-search";
import React from "react";
interface InternalSearchState {
  options: chinaAddressSearch.AddressSearchResult[];
  value: chinaAddressSearch.AddressSearchResult | undefined;
  iterator: IterableIterator<chinaAddressSearch.AddressSearchResult>;
}
const searchAddressWith: (text: string) => React.SetStateAction<InternalSearchState> = (text) => (prev) => {
  const newIterator = chinaAddressSearch.queryAddress(text);
  const newOptions = chinaAddressSearch.takeResult(newIterator, 10);
  return {
    ...prev,
    iterator: newIterator,
    options: newOptions,
  };
};
const reduceNextPage: React.SetStateAction<InternalSearchState> = (prev) => {
  const { iterator, options } = prev;
  const addOns = chinaAddressSearch.takeResult(iterator, 10);
  return {
    ...prev,
    options: [...options, ...addOns],
  };
};
export const useAddressSearch = () => {
  const [state, setState] = React.useState<InternalSearchState>({
    value: undefined,
    options: [],
    iterator: chinaAddressSearch.queryAddress(""),
  });
  const { options, value } = state;
  return {
    options,
    value,
    onChange: (option: chinaAddressSearch.AddressSearchResult | undefined) => {
      setState((prev) => ({
        ...prev,
        value: option,
      }));
    },
    handleSearch: (text: string) => setState(searchAddressWith(text)),
    hanldeNextPage: () => setState(reduceNextPage),
  };
};
