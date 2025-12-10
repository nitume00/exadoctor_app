/**
 * Education List
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Actions } from "react-native-router-flux";
import * as UserActions from "@reduxx/user/actions";
import { connect } from "react-redux";
import { AppConfig } from "@constants/";
import Permissions from "react-native-permissions";
// Consts and Libs
import { AppStyles, AppSizes, AppColors, AppFonts } from "@theme/";
import Strings from "@lib/string.js";
import AppUtil from "@lib/util";
import DatePicker from "react-native-datepicker";
import { Spacer, Text, Button, LblFormInput } from "@ui/";
import NavComponent from "@components/NavComponent.js";
// import ModalPicker from 'react-native-modal-picker';
var moment = require("moment");
import Loading from "@components/general/Loading";
const mapStateToProps = (state) => {
  return { user: state.user.user_data };
};
const mapDispatchToProps = {
  users: UserActions.users,
  user_educations: UserActions.user_educations,
  lab_tests: UserActions.lab_tests,
  diagnostic_center_tests: UserActions.diagnostic_center_tests,
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: AppColors.brand.primary,
    flex: 1,
  },
  logo: {
    width: AppSizes.screen.width * 0.85,
    resizeMode: "contain",
  },
  whiteText: {
    color: "#FFF",
  },
  input: {
    margin: 15,
    height: 20,
  },
  label: {
    color: "#a8a8aa",
    fontSize: 16,
  },
  inputBlock: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#cecece",
    marginBottom: 20,
  },
});

class Education extends Component {
  static componentName = "Education";
  constructor(props) {
    super(props);
    this.callInvoked = 0;
    console.log("labdataaaa = " + JSON.stringify(props.lab_data));
    this.state = {
      loading: false,
      nodata: 0,
      userLang: "en",
      edit_id: props.lab_data ? props.lab_data.id : "",
      user: props.user ? props.user : "",
      labtestsitems: "",
      LabTestText: props.lab_data ? props.lab_data.lab_test.name : "",
      lab_id: props.lab_data ? props.lab_data.lab_test_id : "",
      price: props.lab_data ? props.lab_data.price.toString() : "",
      cvrprofileImage: props.imageurl ? props.imageurl : AppConfig.noimage,
      cvrUploadStatus: false,
      camerapermission: "",
      photopermission: "",
      storagepermission: Platform.OS == "ios" ? "1" : "",
      branch_id: props.branch_id ? props.branch_id : "",
    };
  }
  componentWillUnmount() {
    if (this.props.reload) this.props.reload();
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
  componentDidMount() {
    var payload = { order: "name asc", limit: 500, skip: 0 };
    this.props
      .lab_tests({ filter: payload })
      .then((resp) => {
        if (resp.error && resp.error.code == 0) {
          this.setState({ labtestsitems: resp.data });
        }
      })
      .catch(() => {
        console.log("error");
      });
  }
  submit = () => {
    if (this.state.lab_id == "" || this.state.price.trim() == "") {
      Alert.alert(
        AppConfig.appName,
        Strings.allfieldsarerequired,
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    } else if (AppUtil.validateInt(this.state.price) == false) {
      Alert.alert(
        AppConfig.appName,
        Strings.invalidnumber,
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    } else {
      var payload = "";
      this.setState({ loading: true });
      console.log(
        "resp " + this.state.cvrUploadStatus + "==" + this.state.cvrprofileImage
      );
      if (this.state.edit_id) {
        payload = {
          post_type: "PUT",
          id: this.state.edit_id,
          lab_test_id: this.state.lab_id,
          price: this.state.price,
        };
        if (this.state.cvrUploadStatus == true) {
          payload = {
            post_type: "PUT",
            id: this.state.edit_id,
            lab_test_id: this.state.lab_id,
            price: this.state.price,
            diagonostic_test_image_data: this.state.cvrprofileImage,
          };
        }
      } else {
        payload = {
          post_type: "POST",
          lab_test_id: this.state.lab_id,
          price: this.state.price,
          diagnostic_center_user_id: this.state.user.id,
          branch_id: this.state.branch_id,
        };
        if (this.state.cvrUploadStatus == true) {
          payload = {
            post_type: "POST",
            lab_test_id: this.state.lab_id,
            price: this.state.price,
            diagnostic_center_user_id: this.state.user.id,
            branch_id: this.state.branch_id,
            diagonostic_test_image_data: this.state.cvrprofileImage,
          };
        }
      }
      this.props
        .diagnostic_center_tests({ filter: payload })
        .then((resp) => {
          this.setState({ loading: false });
          console.log("resp " + JSON.stringify(resp));
          if (resp.error && resp.error.code == 0) Actions.pop();
        })
        .catch(() => {
          this.setState({ loading: false });
          console.log("error");
        });
    }
  };
  render = () => {
    var vmlabtestsitems = [
      { key: 0, section: true, label: Strings.pleaseselect },
    ];

    if (this.state.labtestsitems) {
      var carraylabtestsitems = this.state.labtestsitems;
      Object.keys(carraylabtestsitems).forEach(function (key) {
        var lbl = carraylabtestsitems[key].name;
        vmlabtestsitems.push({ key: carraylabtestsitems[key].id, label: lbl });
      });
    }
    var imageurl = this.state.cvrprofileImage;

    return (
      <View style={[styles.background]}>
        <NavComponent
          backArrow={true}
          title={this.state.edit_id ? Strings.editlabtest : Strings.addlabtest}
        />
        <ScrollView style={{ flex: 1 }}>
          <View style={{ marginLeft: 10, marginRight: 10, marginTop: 40 }}>
            <Text style={styles.label}>{Strings.labtests + "*"}</Text>
            <View style={styles.inputBlock}>
              {/* <ModalPicker
                data={vmlabtestsitems}
                initValue={Strings.labtests}
                sectionTextStyle={{
                  textAlign: 'left',
                  color: '#000',
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: 'SourceSansPro-Regular',
                }}
                optionTextStyle={{
                  textAlign: 'left',
                  color: '#000',
                  fontSize: 16,
                  fontWeight: 'normal',
                  fontFamily: 'SourceSansPro-Regular',
                }}
                cancelStyle={{
                  backgroundColor: '#F75174',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 50 / 2,
                }}
                cancelTextStyle={{
                  fontSize: 20,
                  fontWeight: 'normal',
                  fontFamily: 'SourceSansPro-Regular',
                }}
                overlayStyle={{backgroundColor: 'rgba(0,0,0,0.9)'}}
                onChange={option => {
                  this.setState({
                    LabTestText: option.label,
                    lab_id: `${option.key}`,
                  });
                }}>
                <View style={{marginLeft: 5}}>
                  <LblFormInput
                    value={this.state.LabTestText}
                    lblText={false}
                    height={60}
                    placeholderTxt={Strings.labtests + '*'}
                    lblTxt={Strings.labtests}
                    editable={false}
                    select_opt={true}
                  />
                </View>
              </ModalPicker> */}
            </View>

            <Text style={styles.label}>{Strings.price + "*"}</Text>
            <View style={styles.inputBlock}>
              <LblFormInput
                lblText={false}
                height={60}
                placeholderTxt={Strings.price}
                lblTxt={Strings.price}
                select_opt={false}
                autoCapitalize={"sentences"}
                value={this.state.price}
                onChangeText={(price) => this.setState({ price })}
              />
            </View>
            <View style={{ height: 10 }} />
            <TouchableOpacity
              onPress={this.pickerImagePressed.bind(this, "home")}
              style={{
                flex: 1,
                height: 150,
                justifyContent: "flex-start",
                alignItems: "flex-start",
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
                  style={{ height: 150, width: 150, marginBottom: 10 }}
                  source={{ uri: imageurl }}
                />
              </View>
            </TouchableOpacity>
          </View>
          <Button
            style={{ padding: 5, backgroundColor: "#34d777" }}
            title={"Save"}
            onPress={this.submit}
            backgroundColor={"#34d777"}
            fontSize={18}
          />
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
export default connect(mapStateToProps, mapDispatchToProps)(Education);
