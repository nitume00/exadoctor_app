import React, { useState, useEffect } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { AppColors } from "../../theme";

const CustomDropdown = ({
  options,
  placeholder,
  onChangeValue,
  schema,
  dropDownStyle,
  defaultValue, // Add this prop
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState(options);
  const [searchQuery, setSearchQuery] = useState("");

  // Set the default value when the component mounts or when defaultValue changes
  useEffect(() => {
    console.log(defaultValue, typeof defaultValue, "CHECK THIS");
    if (defaultValue) {
      setValue(Number(defaultValue));
    } else {
      setValue(null);
    }
  }, [defaultValue]);

  return (
    <>
      {console.log(value)}
      <DropDownPicker
        style={[
          dropDownStyle,
          {
            borderWidth: 0,
            elevation: 0,
          },
        ]}
        dropDownContainerStyle={{
          borderWidth: 0,
          elevation: 0,
        }}
        textStyle={{
          color: AppColors.brand.txtinputcolor,
        }}
        placeholderStyle={{
          color: AppColors.brand.txtinputcolor,
        }}
        schema={schema}
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={(val) => {
          setValue(val);
          onChangeValue(val);
        }}
        setItems={setItems}
        placeholder={placeholder}
        listMode="MODAL"
        searchable={true}
        searchPlaceholder="Search..."
        searchTextInputStyle={{
          color: AppColors.brand.txtinputcolor,
          borderWidth: 0,
        }}
        onChangeSearchText={(text) => setSearchQuery(text)}
        searchValue={searchQuery}
      />
    </>
  );
};

export default CustomDropdown;
