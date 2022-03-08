import AutoComplete from "antd/es/auto-complete";
import Input from "antd/es/input";
import "antd/dist/antd.css";
import React from "react";
import { useAddressSearch } from "./use-address-search";

export const AntdDemo: React.FC = () => {
  const addressSearchHandle = useAddressSearch();
  const autoCompleteOptions = addressSearchHandle.options.map((match, i) => {
    return {
      value: match.addressInfo.path.map((node) => node.name).join("/"),
      label: (
        <React.Fragment key={i}>
          {match.fragments.map((fragment, j) => (
            <span key={j} className={fragment.matched ? "highlight" : ""}>
              {fragment.text}
            </span>
          ))}
        </React.Fragment>
      ),
    };
  });
  return (
    <div style={{ margin: 10 }}>
      <AutoComplete
        onChange={(text) => {
          console.log(text);
        }}
        placeholder="输入首拼或汉字搜索"
        options={autoCompleteOptions}
        style={{ width: 240 }}
        onSearch={addressSearchHandle.handleSearch}
        dropdownMatchSelectWidth={false}
        onPopupScroll={(e) => {
          const { target } = e;
          if (!(target instanceof HTMLElement)) {
            return;
          }
          if (Math.abs(target.scrollTop + target.offsetHeight - target.scrollHeight) < 10) {
            addressSearchHandle.hanldeNextPage();
          }
        }}
      >
        <Input.Search enterButton></Input.Search>
      </AutoComplete>
    </div>
  );
};
