import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Alert,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { Actions } from "react-native-router-flux";
import { connect } from "react-redux";
import * as UserActions from "@reduxx/user/actions";
import { AppConfig } from "@constants/";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavComponent from "@components/NavComponent.js";
import Strings from "@lib/string.js";
import ImagePicker from "react-native-image-picker";
import DatePicker from "react-native-datepicker";
import Permissions from "react-native-permissions";
import Icon from "react-native-vector-icons/Ionicons";
import { CheckBox } from "@rneui/themed";
// import ModalPicker from 'react-native-modal-picker';
import AppUtil from "@lib/util";
import Loading from "@components/general/Loading";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import CustomDropdown from "../../components/general/CustomDropDown";
const mapkey = "12345678";
// Consts and Libs
import { AppStyles, AppSizes, AppColors, AppFonts } from "@theme/";
var moment = require("moment");
// Components
import { Spacer, Text, Button, LblFormInput } from "@ui/";
const mapStateToProps = (state) => {
  console.log(
    "props_country_details == " + JSON.stringify(state.user.user_data)
  );
  return {
    user: state.user.user_data,
    country_code_list: state.user.countries,
    city_list: state.user.cities,
    state_list: state.user.states,
    locale_en: state.user.locale_en,
    locale_fr: state.user.locale_fr,
  };
};

// Any actions to map to the component?
const mapDispatchToProps = {
  getCountries: UserActions.getCountries,
  user_profiles: UserActions.user_profiles,
  auth: UserActions.auth,
};
/* Styles ==================================================================== */
const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.navbar, //AppColors.brand.primary,
    flex: 1,
  },
  headertitle: {
    flex: 1,
    fontSize: 14,
    paddingTop: 10,
    color: "#A9A9A9",
  },
  view_divider_horizontal: {
    height: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ccc",
    marginTop: 10,
  },
});

/* Component ==================================================================== */
class ProfileView extends Component {
  static propTypes = {
    countries: PropTypes.func.isRequired,
    user_profiles: PropTypes.func.isRequired,
    auth: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    console.log("fffff gg  " + JSON.stringify(props.user));
    this.site_url = "";
    this.state = {
      loading: false,
      editing: false,
      role_id: props.user ? props.user.role_id : "",
      prefered_language:
        props.user && props.user.prefered_language
          ? props.user.prefered_language
          : "English",
      otherdetails:
        props.user && props.user.user_profile
          ? AppUtil.stripTags(props.user.user_profile.about_me)
          : "",
      photopermission: "",
      camerapermission: "",
      countries: "",
      storagepermission: (Platform.OS: "ios") ? "1" : "",
      locationpermission: "",
      cvrprofileImage: AppConfig.noimage,
      cvrUploadStatus: false,
      email: props.user ? props.user.email : "",
      phone: props.user ? props.user.mobile : "",
      phonecode: props.user ? props.user.mobile_code : "",
      user: props.user ? props.user : "",
      latitude: props.user && props.user.latitude ? props.user.latitude : 0.0,
      longitude:
        props.user && props.user.longitude ? props.user.longitude : 0.0,
      attachment:
        props.user && props.user.attachment ? props.user.attachment : "",
      country_code: [],
      selected_country_code:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.mobile_code
          ? props.user.user_profile.mobile_code
          : "",
      is_selected: 0,
      //Pharmacy
      hospitalorclinicname:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.practice_name
          ? props.user.user_profile.practice_name
          : "",
      hospitalorclinictypeid:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.clinic_type_id
          ? props.user.user_profile.clinic_type_id
          : "",
      webiste_url:
        props.user && props.user.user_profile && props.user.user_profile.website
          ? props.user.user_profile.website
          : "",
      primary_telephone_number:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.primary_telephone_number
          ? props.user.user_profile.primary_telephone_number
          : "",
      primary_fax_number:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.primary_fax_number
          ? props.user.user_profile.primary_fax_number
          : "",
      address:
        props.user && props.user.user_profile && props.user.user_profile.address
          ? props.user.user_profile.address
          : "",
      address1: "",
      city_id:
        props.user && props.user.user_profile && props.user.user_profile.city_id
          ? props.user.user_profile.city_id
          : "",
      city:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.city &&
        props.user.user_profile.city.name
          ? props.user.user_profile.city.name
          : "",
      selected_city: {},
      state_id:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.state_id
          ? props.user.user_profile.state_id
          : "",
      state:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.state &&
        props.user.user_profile.state.name
          ? props.user.user_profile.state.name
          : "",
      selected_state: {},
      country_list: [],
      country_id:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.country_id
          ? props.user.user_profile.country_id
          : "",
      country: "",
      country_iso2: "",
      selected_country: {},
      latitude: "",
      longitude: "",
      country_code_list: props.country_code_list ? props.country_code_list : "",
      postal_code:
        props.user &&
        props.user.user_profile &&
        props.user.user_profile.postal_code
          ? props.user.user_profile.postal_code
          : "",
      postData: {
        service_id: "",
        address: "",
        address1: "",
        zip_code: "",
        city_name: "",
        state_name: "",
        country_iso2: "",
        country_iso: "",
        latitude: "",
        longitude: "",
      },
    };
    this.localee = "EN";
    this.locale_fr = props.locale_fr ? props.locale_fr : "";
    this.locale_en = props.locale_en ? props.locale_en : "";
  }

  async componentDidMount() {
    this.site_url = await AsyncStorage.getItem("SITE_URL");
    AsyncStorage.getItem("language").then((value) => {
      this.localee = value;
    });
    var cbg = AppConfig.ConstClinicTypes;
    var that = this;
    Object.keys(cbg).forEach(function (key) {
      var lbl = cbg[key];
      if (that.state.hospitalorclinictypeid == key) {
        that.setState({ hospitalorclinictype: lbl });
      }
    });
    if (this.state.country_code_list) {
      var tttt = [];
      var ttt = [];
      for (var i = 0; i < this.state.country_code_list.length; i++) {
        var temp = this.state.country_code_list[i];
        var tem = this.state.country_code_list[i];
        temp["key"] = this.state.country_code_list[i].id;
        tem["key"] = this.state.country_code_list[i].id;
        temp["label"] =
          this.state.country_code_list[i].name +
          " " +
          this.state.country_code_list[i].phone_code;
        tem["label"] = this.state.country_code_list[i].name;
        tttt.push(temp);
        ttt.push(temp);
        console.log(
          "props_country_details====> " +
            this.state.country_id +
            "==" +
            this.state.country_code_list[i].id +
            "==" +
            this.state.country_code_list[i].name
        );
        if (this.state.country_id == this.state.country_code_list[i].id) {
          this.setState({
            country_iso2: this.state.country_code_list[i].iso2,
            country: this.state.country_code_list[i].name,
            selected_country: this.state.country_code_list[i],
          });
        }
      }
      this.setState({ country_code: tttt, country_list: ttt }, () => {
        console.log("this.state.country_code======> " + JSON.stringify(ttt));
      });
    }

    console.log(
      "updateImagetoServer 111" + JSON.stringify(this.state.attachment)
    );
    if (this.state.attachment && this.state.attachment.filename) {
      var md5string = "UserProfile" + this.state.attachment.id + "pngbig_thumb";
      var imagetemp = AppUtil.MD5(md5string);
      imageurl =
        this.site_url +
        "/images/big_thumb/UserProfile/" +
        this.state.attachment.id +
        "." +
        imagetemp +
        ".png";
      console.log("updateImagetoServer 111" + JSON.stringify(imageurl));
      this.setState({ cvrprofileImage: imageurl });
    }
    if (this.state.locationpermission === "") {
      console.log("updateImagetoServer 222");
      Permissions.check("location").then((response) => {
        //response is an object mapping type to permission
        if (response.location == "authorized") {
          console.log("updateImagetoServer 333");
          this.setState({ locationpermission: "1" });
        } else {
          console.log("updateImagetoServer 444");
          Permissions.request("location").then((response) => {
            if (response == "authorized") {
              this.setState({ locationpermission: "1" });
              this.getLocation();
            }
          });
        }
      });
    }
    //this.getCountries();
    if (this.state.role_id == 6) {
      this.getstate();
      this.getcity();
    }
  }
  getLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
        console.log(
          "updateImagetoServer dsfsdf" +
            position.coords.latitude +
            "==" +
            position.coords.longitude
        );
      },
      (error) => console.log("dsfsdf"),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
    );
  }
  getCountries() {
    var payload = '{"where":{"is_show_in_frontend":1}}';
    this.callInvoked = 1;
    this.props
      .getCountries({ filter: payload })
      .then((resp) => {
        if (resp.data) {
          this.setState({ countries: resp.data });
          var ctry = resp.data;
          if (ctry) {
            Object.keys(ctry).forEach(function (key) {
              if (ctry[key].id == this.state.nationality_id) {
                this.setState({ nationality_lbl: ctry[key].name });
              }
            });
          }
        }
      })
      .catch(() => {
        console.log("error");
      });
  }

  getcity() {
    var ttt = [];
    this.setState({ loading: true });
    for (var i = 0; i < this.props.city_list.length; i++) {
      var tem = this.props.city_list[i];
      tem["key"] = this.props.city_list[i].id;
      tem["label"] = this.props.city_list[i].name;
      ttt.push(tem);
      if (this.state.city_id == this.props.city_list[i].id) {
        this.setState({
          city: this.props.city_list[i].name,
          selected_city: this.props.city_list[i],
          loading: false,
        });
      }
    }
    this.setState({ loading: false, modal_city_list: ttt });
  }

  getstate() {
    var ttt = [];
    this.setState({ loading: true });
    for (var i = 0; i < this.props.state_list.length; i++) {
      var tem = this.props.state_list[i];
      tem["key"] = this.props.state_list[i].id;
      tem["label"] = this.props.state_list[i].name;
      ttt.push(tem);
      if (this.state.state_id == this.props.state_list[i].id) {
        this.setState({
          state: this.props.state_list[i].name,
          selected_state: this.props.state_list[i],
          loading: false,
        });
      }
    }
    this.setState({ loading: false, modal_state_list: ttt });
  }

  pickerImagePressed = (imgtype) => {
    if (this.state.camerapermission === "") {
      Permissions.request("camera").then((response) => {
        if (response == "authorized") {
          this.setState(
            { camerapermission: "1" },
            this.pickerImagePressed(imgtype)
          );
        }
      });
    } else if (this.state.photopermission === "") {
      Permissions.request("photo").then((response) => {
        if (response == "authorized") {
          this.setState(
            { photopermission: "1" },
            this.pickerImagePressed(imgtype)
          );
        }
      });
    } else if (this.state.storagepermission === "") {
      Permissions.request("storage").then((response) => {
        if (response == "authorized") {
          this.setState(
            { storagepermission: "1" },
            this.pickerImagePressed(imgtype)
          );
        }
      });
    } else {
      Actions.Camera({
        imgtype: imgtype,
        reloadView: this.getCatpturedImage.bind(this, imgtype),
      });
    }
  };
  getCatpturedImage = (imgtype, image) => {
    if (image.image) {
      this.setState({
        cvrUploadStatus: true,
        cvrprofileImage: "data:image/png;base64," + image.image,
        video_post_url: "",
      });
    }
  };

  editProfile = () => {
    if (this.state.hospitalorclinicname == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenterhospitalorclinicname,
        [
          {
            text: "OK",
            onPress: () => {
              console.log("OK Pressed");
            },
          },
        ],
        { cancelable: false }
      );
    } else if (this.state.hospitalorclinictype == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseselecthospitalorclinictype,
        [
          {
            text: "OK",
            onPress: () => {
              console.log("OK Pressed");
            },
          },
        ],
        { cancelable: false }
      );
    } else if (this.state.primary_telephone_number == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenterprimarttelnumber,
        [
          {
            text: "OK",
            onPress: () => {
              console.log("OK Pressed");
            },
          },
        ],
        { cancelable: false }
      );
    } else if (
      AppUtil.validateInt(this.state.primary_telephone_number) == false
    ) {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentervalidtelephonenumber,
        [
          {
            text: "OK",
            onPress: () => {
              console.log("OK Pressed");
            },
          },
        ],
        { cancelable: false }
      );
    } else if (this.state.address == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenteraddress,
        [
          {
            text: "OK",
            onPress: () => {
              console.log("OK Pressed");
            },
          },
        ],
        { cancelable: false }
      );
    } else if (this.state.city.trim() == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseentercity,
        [
          {
            text: "OK",
            onPress: () => {
              console.log("OK Pressed");
            },
          },
        ],
        { cancelable: false }
      );
    } else if (this.state.state.trim() == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.pleaseenterstate,
        [
          {
            text: "OK",
            onPress: () => {
              console.log("OK Pressed");
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      this.setState({ loading: true });
      var dateofbirth = moment(this.state.dob, "MM-DD-YYYY").format(
        "YYYY-MM-DD"
      );
      var payload = {
        practice_name: this.state.hospitalorclinicname,
        primary_telephone_number: this.state.primary_telephone_number,
        primary_fax_number: this.state.primary_fax_number,
        website: this.state.webiste_url,
        about_me: this.state.otherdetails,
        clinic_type_id: this.state.hospitalorclinictypeid,
        address: this.state.address,
        city: { name: this.state.city },
        state: { name: this.state.state },
        country: { iso2: this.state.country_iso2, name: this.state.country },
        postal_code: this.state.postal_code,
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        prefered_language: this.state.prefered_language,
      };

      if (this.state.cvrUploadStatus == true) {
        payload = {
          practice_name: this.state.hospitalorclinicname,
          primary_telephone_number: this.state.primary_telephone_number,
          primary_fax_number: this.state.primary_fax_number,
          website: this.state.webiste_url,
          about_me: this.state.otherdetails,
          clinic_type_id: this.state.hospitalorclinictypeid,
          address: this.state.address,
          city: { name: this.state.city },
          state: { name: this.state.state },
          country: { iso2: this.state.country_iso2, name: this.state.country },
          postal_code: this.state.postal_code,
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          image_data: this.state.cvrprofileImage,
          prefered_language: this.state.prefered_language,
        };
      }

      this.setState({ loading: true });
      this.props
        .user_profiles(payload)
        .then((resp) => {
          console.log("user_profiles " + JSON.stringify(resp));
          if (resp.error && resp.error.code == 0) {
            Alert.alert(
              AppConfig.appName,
              Strings.userprofileupdated,
              [
                {
                  text: "OK",
                  onPress: () => {
                    this.setState({ loading: false });
                    var payload = {
                      user_id: this.state.user.id,
                      token: this.state.user.userToken,
                    };
                    this.props
                      .auth(payload)
                      .then((resp) => {
                        if (resp.data) {
                          Actions.pop();
                        }
                      })
                      .catch(() => {});
                  },
                },
              ],
              { cancelable: false }
            );
          } else {
            this.setState({ loading: false });
            Alert.alert(
              AppConfig.appName,
              resp.error.message,
              [{ text: "OK", onPress: () => console.log("OK Pressed") }],
              { cancelable: false }
            );
          }
        })
        .catch(() => {
          this.setState({ loading: false });
          console.log("error");
        });
    }
  };

  handleValueChange = (value, vmbg) => {
    let option = vmbg.find((item) => item.key === value());

    this.setState({
      hospitalorclinictype: option.label,
      hospitalorclinictypeid: option.key,
    });
  };

  render = () => {
    var imageurl = this.state.cvrprofileImage;
    var vmbg = [{ key: 0, section: true, label: Strings.hospitalorclinictype }];
    var cbg = AppConfig.ConstClinicTypes;
    Object.keys(cbg).forEach(function (key) {
      var lbl = cbg[key];
      vmbg.push({ key: key, label: lbl });
    });
    var phone = this.state.phonecode + " " + this.state.phone;

    return (
      <View style={[styles.background]}>
        <NavComponent backArrow={true} title={Strings.editprofile} />
        <ScrollView
          style={{ flex: 1, backgroundColor: AppColors.brand.primary }}
          keyboardShouldPersistTaps="always"
        >
          <View style={{ flex: 1, marginBottom: 200 }}>
            <TouchableOpacity
              onPress={this.pickerImagePressed.bind(this, "home")}
              style={{
                flex: 1,
                height: 200,
                backgroundColor: AppColors.brand.navbar,
              }}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  style={{ height: 150, width: 150, borderRadius: 75 }}
                  source={{ uri: imageurl }}
                />
              </View>
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                backgroundColor: AppColors.brand.white,
                justifyContent: "center",
                marginTop: 5,
              }}
            >
              <View style={{ marginBottom: 10 }}>
                <View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                      {Strings.email}: {this.state.email}
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: 3 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                      {Strings.mobile}: {phone}
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: 3, paddingLeft: 10 }}>
                  <Text style={[styles.headertitle]}>
                    {Strings.prefered_language}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "space-around",
                    }}
                  >
                    <CheckBox
                      left
                      title={"English"}
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      containerStyle={{
                        padding: 0,
                        margin: 10,
                        backgroundColor: "transparent",
                        borderWidth: 0,
                        width: 75,
                      }}
                      checked={this.state.prefered_language == "English"}
                      textStyle={{
                        fontFamily: AppFonts.base.family,
                        fontSize: 12,
                        color: AppColors.brand.black,
                        fontWeight: "400",
                      }}
                      onPress={() => {
                        this.setState({
                          prefered_language: "English",
                        });
                      }}
                    />
                    <CheckBox
                      left
                      title={"French"}
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      containerStyle={{
                        padding: 0,
                        margin: 10,
                        backgroundColor: "transparent",
                        borderWidth: 0,
                        width: 75,
                      }}
                      checked={this.state.prefered_language == "French"}
                      textStyle={{
                        fontFamily: AppFonts.base.family,
                        fontSize: 12,
                        color: AppColors.brand.black,
                        fontWeight: "400",
                      }}
                      onPress={() => {
                        this.setState({
                          prefered_language: "French",
                        });
                      }}
                    />
                  </View>
                </View>
                <View style={{ marginTop: 15 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                      {Strings.hospitalorclinicname}
                    </Text>
                    <Text
                      style={{ paddingLeft: 5, paddingTop: 5, color: "red" }}
                    >
                      *
                    </Text>
                  </View>
                  <LblFormInput
                    textAlignVertical={"top"}
                    lblText={false}
                    height={50}
                    placeholderTxt={Strings.hospitalorclinicname}
                    lblTxt={Strings.hospitalorclinicname}
                    select_opt={false}
                    numberOfLines={1}
                    multiline={false}
                    value={this.state.hospitalorclinicname}
                    onChangeText={(text) => {
                      this.setState({ hospitalorclinicname: text });
                    }}
                  />
                </View>
                <View
                  style={{
                    borderBottomWidth: 0.3,
                    borderColor: AppColors.brand.black,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ paddingLeft: 10, paddingTop: 7 }}>
                      {Strings.hospitalorclinictype}
                    </Text>
                    <Text
                      style={{ paddingLeft: 5, paddingTop: 7, color: "red" }}
                    >
                      *
                    </Text>
                  </View>
                  {/* DONE <ModalPicker
                    data={vmbg}
                    initValue={Strings.hospitalorclinictype}
                    sectionTextStyle={{
                      textAlign: 'left',
                      color: '#000',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}
                    optionTextStyle={{
                      textAlign: 'left',
                      color: '#000',
                      fontSize: 16,
                      fontWeight: 'normal',
                    }}
                    cancelStyle={{
                      backgroundColor: '#F75174',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 50 / 2,
                    }}
                    cancelTextStyle={{fontSize: 20, fontWeight: 'normal'}}
                    overlayStyle={{backgroundColor: 'rgba(0,0,0,0.9)'}}
                    onChange={option => {
                      console.log('sdfsdfsdf ' + JSON.stringify(option));
                      this.setState({
                        hospitalorclinictype: option.label,
                        hospitalorclinictypeid: option.key,
                      });
                    }}>
                    <View style={{marginLeft: 5}}>
                      <LblFormInput
                        lblText={false}
                        height={50}
                        select_opt={true}
                        value={this.state.hospitalorclinictype}
                        editable={false}
                      />
                    </View>
                  </ModalPicker> */}

                  <CustomDropdown
                    options={vmbg}
                    placeholder={Strings.hospitalorclinictype}
                    onChangeValue={(value) =>
                      this.handleValueChange(value, vmbg)
                    }
                    schema={{
                      label: "label",
                      value: "key",
                    }}
                    defaultValue={
                      this?.state?.hospitalorclinictypeid != "" &&
                      this.state?.hospitalorclinictypeid.toString()
                    }
                  />
                </View>
                <View style={{ marginTop: 10 }}>
                  <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                    {Strings.websiteurl}
                  </Text>
                  <LblFormInput
                    textAlignVertical={"top"}
                    placeholderTxt={"http://"}
                    lblText={false}
                    height={50}
                    select_opt={false}
                    numberOfLines={1}
                    multiline={false}
                    value={this.state.webiste_url}
                    onChangeText={(text) => {
                      this.setState({ webiste_url: text });
                    }}
                  />
                </View>
                <View style={{ marginTop: 10 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                      {Strings.primarytelepnonenumber}
                    </Text>
                    <Text
                      style={{ paddingLeft: 5, paddingTop: 5, color: "red" }}
                    >
                      *
                    </Text>
                  </View>
                  <LblFormInput
                    textAlignVertical={"top"}
                    lblText={false}
                    height={50}
                    select_opt={false}
                    numberOfLines={1}
                    multiline={false}
                    value={this.state.primary_telephone_number}
                    onChangeText={(text) => {
                      this.setState({ primary_telephone_number: text });
                    }}
                  />
                </View>
                <View style={{ marginTop: 10 }}>
                  <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                    {Strings.primaryfaxnumber}
                  </Text>
                  <LblFormInput
                    textAlignVertical={"top"}
                    lblText={false}
                    height={50}
                    select_opt={false}
                    numberOfLines={1}
                    multiline={false}
                    value={this.state.primary_fax_number}
                    onChangeText={(text) => {
                      this.setState({ primary_fax_number: text });
                    }}
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: AppColors.brand.grey,
                    justifyContent: "center",
                    marginTop: 10,
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 14, padding: 5 }}>
                    {Strings.addressandcontactinformation}
                  </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                      {Strings.residentof}
                    </Text>
                    <Text
                      style={{ paddingLeft: 5, paddingTop: 5, color: "red" }}
                    >
                      *
                    </Text>
                  </View>
                  <GooglePlacesAutocomplete
                    placeholder={this.state.address}
                    placeholderTextColor="#9E9E9E"
                    minLength={4} // minimum length of text to search
                    autoFocus={false}
                    listViewDisplayed={true} // true/false/undefined
                    fetchDetails={true}
                    renderDescription={(row) => row.description} // custom description render
                    onPress={(data, details = null) => {
                      // 'details' is provided when fetchDetails = true
                      console.log(
                        "GooglePlacesAutocomplete_details=====> " +
                          JSON.stringify(details)
                      );
                      var itemDetail = {};
                      var postData = Object.assign({}, this.state.postData);
                      itemDetail["adr_address"] = details.formatted_address;
                      postData.address = itemDetail.adr_address;
                      postData.address1 = itemDetail.adr_address;

                      this.setState({
                        is_selected: 1,
                        address: details.formatted_address,
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                      });
                      var postaltown = 0;
                      for (
                        var i = 0;
                        i < details.address_components.length;
                        i++
                      ) {
                        if (
                          details.address_components[i].types[0] == "country"
                        ) {
                          itemDetail["country"] =
                            details.address_components[i].long_name;
                          this.setState({
                            country: details.address_components[i].long_name,
                            country_iso2:
                              details.address_components[i].short_name,
                          });
                          itemDetail["country_iso"] =
                            details.address_components[i].short_name;
                          postData.country_iso2 = itemDetail.country;
                          postData.country_iso = itemDetail.country_iso;
                        } else if (
                          details.address_components[i].types[0] == "locality"
                        ) {
                          itemDetail["administrative_area_level_2"] =
                            details.address_components[i].short_name;
                          postData.city_name =
                            itemDetail.administrative_area_level_2;
                          this.setState({
                            city: itemDetail.administrative_area_level_2,
                            city_id: itemDetail.administrative_area_level_2,
                          });
                        } else if (
                          details.address_components[i].types[0] ==
                          "postal_town"
                        ) {
                          postaltown = 1;
                          itemDetail["administrative_area_level_2"] =
                            details.address_components[i].short_name;
                          postData.city_name =
                            itemDetail.administrative_area_level_2;
                          this.setState({
                            city: itemDetail.administrative_area_level_2,
                            city_id: itemDetail.administrative_area_level_2,
                          });
                        } else if (
                          details.address_components[i].types[0] ==
                            "administrative_area_level_2" &&
                          postaltown == 1
                        ) {
                          itemDetail["administrative_area_level_2"] =
                            details.address_components[i].short_name;
                          postData.state_name =
                            itemDetail.administrative_area_level_2;
                          this.setState({
                            state: itemDetail.administrative_area_level_2,
                            state_id: itemDetail.administrative_area_level_2,
                          });
                        } else if (
                          details.address_components[i].types[0] ==
                            "administrative_area_level_1" &&
                          postaltown == 0
                        ) {
                          itemDetail["administrative_area_level_1"] =
                            details.address_components[i].long_name;
                          postData.state_name =
                            itemDetail.administrative_area_level_1;
                          this.setState({
                            state: itemDetail.administrative_area_level_1,
                            state_id: itemDetail.administrative_area_level_1,
                          });
                        } else if (
                          details.address_components[i].types[0] ==
                          "postal_code"
                        ) {
                          itemDetail["postal_code"] =
                            details.address_components[i].short_name;
                          postData.zip_code = itemDetail.postal_code;
                          this.setState({
                            postal_code:
                              details.address_components[i].short_name,
                          });
                        }
                      }
                      this.setState({ postData: postData });
                    }}
                    getDefaultValue={() => {
                      return ""; // text input default value
                    }}
                    query={{
                      key: mapkey,
                      language: "en", // language of the results
                      types: "", // default: 'geocode'
                    }}
                    styles={{
                      textInput: {
                        color: "#9E9E9E",
                        fontSize: 14,
                        textAlign: "center",
                        marginLeft: 20,
                      },
                      description: {
                        fontSize: 14,
                        color: "#9E9E9E",
                      },
                      predefinedPlacesDescription: {
                        color: "#9E9E9E",
                      },
                    }}
                    nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                    debounce={0} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                  />
                  <View style={{ marginTop: 10 }}>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                        {Strings.area}
                      </Text>
                      <Text
                        style={{ paddingLeft: 5, paddingTop: 5, color: "red" }}
                      >
                        *
                      </Text>
                    </View>
                    <LblFormInput
                      textAlignVertical={"top"}
                      lblText={false}
                      height={50}
                      placeholderTxt={Strings.area}
                      lblTxt={Strings.area}
                      select_opt={false}
                      numberOfLines={1}
                      multiline={false}
                      value={this.state.city}
                      onChangeText={(text) => {
                        this.setState({ city: text, city_id: text });
                      }}
                    />
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                        {Strings.region}
                      </Text>
                      <Text
                        style={{ paddingLeft: 5, paddingTop: 5, color: "red" }}
                      >
                        *
                      </Text>
                    </View>
                    <LblFormInput
                      textAlignVertical={"top"}
                      lblText={false}
                      height={50}
                      placeholderTxt={Strings.region}
                      lblTxt={Strings.region}
                      select_opt={false}
                      numberOfLines={1}
                      multiline={false}
                      value={this.state.state}
                      onChangeText={(text) => {
                        this.setState({ state: text });
                      }}
                    />
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                        {Strings.country}
                      </Text>
                      <Text
                        style={{ paddingLeft: 5, paddingTop: 5, color: "red" }}
                      >
                        *
                      </Text>
                    </View>
                    <LblFormInput
                      editable={false}
                      textAlignVertical={"top"}
                      lblText={false}
                      height={50}
                      placeholderTxt={Strings.country}
                      lblTxt={Strings.country}
                      select_opt={false}
                      numberOfLines={1}
                      multiline={false}
                      value={this.state.country}
                      onChangeText={(text) => {
                        this.setState({ country: text });
                      }}
                    />
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ paddingLeft: 10, paddingTop: 5 }}>
                      {Strings.postalcode}
                    </Text>
                    <LblFormInput
                      textAlignVertical={"top"}
                      lblText={false}
                      height={50}
                      placeholderTxt={Strings.postalcode}
                      lblTxt={Strings.postalcode}
                      select_opt={false}
                      numberOfLines={1}
                      multiline={false}
                      value={this.state.postal_code}
                      onChangeText={(text) => {
                        this.setState({ postal_code: text });
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: AppColors.brand.grey,
                    justifyContent: "center",
                    marginTop: 10,
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 14, padding: 5 }}>
                    {Strings.otherdetail}
                  </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <LblFormInput
                    textAlignVertical={"top"}
                    lblText={false}
                    height={50}
                    select_opt={false}
                    numberOfLines={4}
                    multiline={true}
                    value={this.state.otherdetails}
                    onChangeText={(text) => {
                      this.setState({ otherdetails: text });
                    }}
                  />
                </View>
              </View>
            </View>
            <Button
              onPress={this.editProfile}
              title={Strings.submit}
              backgroundColor={AppColors.brand.buttonclick}
              fontSize={15}
            />
          </View>
        </ScrollView>
        {this.state.loading ? (
          <View style={AppStyles.LoaderStyle}>
            <Loading color={AppColors.brand.primary} />
          </View>
        ) : null}
      </View>
    );
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);
