import SelectInput from "ink-select-input";
import { Item } from "ink-select-input/build/SelectInput";
import React from "react";

interface DialogProps {
  limit: number,
  options: {
    label: string,
    value: string,
    handler: () => any,
  }[],
}
export const Dialog = (props: DialogProps): JSX.Element => {
  const handleSelect = (item: Item<string>): void => {
    props.options.find(option => option.value === item.value)!.handler();
  };

  const items: Item<string>[] = props.options.map(option => {
    return {
      label: option.label,
      value: option.value,
    };
  });

  return <SelectInput
    items={items}
    onSelect={handleSelect}
    limit={props.limit} />;
};
