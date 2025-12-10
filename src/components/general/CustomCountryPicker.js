// import React from "react";
// import CountryPicker from "react-native-country-picker-modal";
// import Fonts from "../../theme/fonts";
// import { AppColors } from "../../theme";

// const CustomCountryPicker = (props) => {
//   const LIGHT_THEME = {
//     backgroundColor: "#FFFFFF",
//     onBackgroundTextColor: AppColors.brand.txtinputcolor,
//     itemHeight: 48,
//     flagSize: 24,
//     flagType: "flat",
//     fontFamily: Fonts.base.family,
//     fontWeight: "normal",
//     fontSize: 14,
//   };
//   return (
//     <CountryPicker
//       theme={LIGHT_THEME}
//       onSelect={props?.onSelect}
//       containerButtonStyle={props?.textStyle}
//       placeholder={props?.placeholder}
//       withFilter={true}
//       {...props}
//     />
//   );
// };

// export default CustomCountryPicker;
import React, { useState, useEffect } from "react";
import CountryPicker from "react-native-country-picker-modal";
import Fonts from "../../theme/fonts";
import { AppColors } from "../../theme";

const CustomCountryPicker = (props) => {
  const LIGHT_THEME = {
    backgroundColor: "#FFFFFF",
    onBackgroundTextColor: AppColors.brand.txtinputcolor,
    itemHeight: 48,
    flagSize: 24,
    flagType: "flat",
    fontFamily: Fonts.base.family,
    fontWeight: "normal",
    fontSize: 14,
  };

  // Set the default selected country code
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    props.defaultCountryCode
  );

  // Handle country selection
  const handleSelect = (country) => {
    setSelectedCountryCode(country.cca2);
    if (props.onSelect) {
      props.onSelect(country);
    }
  };

  // Update selected country code when props change (e.g., on edit)
  useEffect(() => {
    if (props.defaultCountryCode) {
      setSelectedCountryCode(props.defaultCountryCode);
    }
  }, [props.defaultCountryCode]);

  return (
    <CountryPicker
      theme={LIGHT_THEME}
      onSelect={handleSelect}
      countryCode={selectedCountryCode}
      containerButtonStyle={props?.textStyle}
      placeholder={props?.placeholder}
      withFilter={true}
      withCountryNameButton={true} // Displays the selected country's name
      {...props}
    />
  );
};

export default CustomCountryPicker;
