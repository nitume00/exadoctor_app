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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Actions } from "react-native-router-flux";
import * as UserActions from "@reduxx/user/actions";
import { connect } from "react-redux";
import Strings from "@lib/string.js";
import Icon from "react-native-vector-icons/Ionicons";

// Consts and Libs
import { AppStyles, AppSizes, AppColors } from "@theme/";

// Components
import { Spacer, Text, Button } from "@ui/";

/* Styles ==================================================================== */
const MENU_BG_COLOR = "#263137";

const styles = StyleSheet.create({
  backgroundFill: {
    backgroundColor: MENU_BG_COLOR,
    height: AppSizes.screen.height,
    width: AppSizes.screen.width,
    position: "absolute",
    top: 0,
    left: 0,
  },
  container: {
    position: "relative",
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    left: 0,
    right: 0,
    backgroundColor: MENU_BG_COLOR,
  },

  // Main Menu
  menu: {
    flex: 3,
    left: 0,
    right: 0,
    backgroundColor: MENU_BG_COLOR,
    padding: 20,
    paddingTop: AppSizes.statusBarHeight + 20,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: Platform.OS == "android" ? 10 : 0,
  },
  menuItem_text: {
    fontSize: 16,
    lineHeight: parseInt(16 + 16 * 0.5, 10),
    fontWeight: "500",
    marginTop: 14,
    marginBottom: 8,
    color: "#EEEFF0",
  },

  // Menu Bottom
  menuBottom: {
    flex: 1,
    left: 0,
    right: 0,
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
  menuBottom_text: {
    color: "#EEEFF0",
  },
});
const mapStateToProps = (state) => {
  return {
    user: state ? state.user.user_data : "",
  };
};
const mapDispatchToProps = {
  logoutApp: UserActions.logoutApp,
  deleteAccount: UserActions.delete_account,
};
/* Component ==================================================================== */
class Menu extends Component {
  static propTypes = {
    logoutApp: PropTypes.func.isRequired,
    closeSideMenu: PropTypes.func.isRequired,
    user: PropTypes.shape({
      email: PropTypes.string,
    }),
    unauthMenu: PropTypes.arrayOf(PropTypes.shape({})),
    authMenu: PropTypes.arrayOf(PropTypes.shape({})),
  };
  constructor(props) {
    super(props);
    this.state = {
      user: props.user ? props.user : "",
    };
  }
  static defaultProps = {
    onItemSelected: PropTypes.func.isRequired,
    user: null,
    unauthMenu: [],
    authMenu: [],
  };

  /**
   * On Press of any menu item
   */
  onPress = (item) => {
    if (this.props.onItemSelected) this.props.onItemSelected(item);
  };
  componentWillReceiveProps(props) {
    console.log("cmpreceiveprops == 12 = " + JSON.stringify(props.user));
    if (props.user && props.user) this.setState({ user: props.user });
  }
  /**
   * On Delete Press
   */
  deleteAccount = () => {
    Alert.alert(
      "",
      Strings.deactivateconfirmation,
      [
        {
          text: Strings.cancel,
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: Strings.yes,
          onPress: async () => {
            try {
              this.props.deleteAccount(this?.state?.user).then((res) => {
                if (res && res?.status == "success") {
                  if (this.props.logoutApp) {
                    AsyncStorage.clear();
                    Alert.alert(
                      "",
                      Strings.deactivatesuccess,
                      [
                        {
                          text: Strings.ok,
                          onPress: () => {
                            console.log("Cancel Pressed");
                          },
                        },
                      ],
                      { cancelable: false }
                    );
                    Actions.Languages({ type: "reset" });
                  }
                }
              });
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert("", Strings.deactivatetryagain);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  /**
  /**
   * On Logout Press
   */
  logout = () => {
    if (this.props.logoutApp) {
      this.props.logoutApp();
      AsyncStorage.clear();
      Alert.alert(
        "",
        Strings.youhavesuccessfullylogout,
        [
          {
            text: Strings.ok,
            onPress: () => {
              console.log("Cancel Pressed");
            },
          },
        ],
        { cancelable: false }
      );
      Actions.Languages({ type: "reset" });
    }
  };
  /**
   * Each Menu Item looks like this
   */
  menuItem = (item) => (
    <TouchableOpacity
      key={`menu-item-${item.title}`}
      onPress={() => this.onPress(item.onPress)}
    >
      <View style={[styles.menuItem]}>
        <Text style={[styles.menuItem_text]}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  /**
   * Build the Menu List
   */
  menuList = () => {
    console.log("menu user == 11= " + JSON.stringify(this.state.user));
    // Determine which menu to use - authenticated user menu or unauthenicated version?
    let menu = this.props.unauthMenu;
    if (this.state.user && this.state.user.email) menu = this.props.authMenu;

    return menu.map((item) => this.menuItem(item));
  };

  render = () => {
    console.log("menu user == " + JSON.stringify(this.state.user));
    return (
      <View style={{ flex: 1, backgroundColor: AppColors.brand.navbar }}>
        {Platform.OS == "ios" && AppSizes.screen.height >= 812 ? (
          <View style={{ height: 20 }} />
        ) : null}
        <ScrollView>
          {this.state.user && this.state.user.role_id == 2 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.Search();
                this.onPress("search");
              }}
              style={{
                marginTop: AppSizes.statusBarHeight,
                flexDirection: "row",
                height: 25,
                alignItems: "center",
              }}
            >
              <Icon
                style={{ flex: 0.1, marginLeft: 10 }}
                size={20}
                name="search"
                color={"#FFF"}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: "white",
                  fontSize: 14,
                  padding: 0,
                }}
              >
                {Strings.menufindadoctor}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id ? (
            <View>
              {Platform.OS == "ios" ? <View style={{ height: 30 }} /> : null}
              <View
                style={{
                  flex: 1,
                  height: 50,
                  alignItems: "flex-start",
                  backgroundColor: AppColors.brand.grey,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    marginLeft: 10,
                    color: AppColors.brand.black,
                    fontSize: 14,
                  }}
                >
                  {Strings.menumyaccount}
                </Text>
              </View>
            </View>
          ) : null}
          {this.state.user && this.state.user.role_id ? (
            <View>
              {this.state.user.role_id == 7 ? (
                <TouchableOpacity
                  onPress={() => {
                    Actions.DiagnosticProfileView();
                    this.onPress("DiagnosticProfileView");
                  }}
                  style={{
                    flexDirection: "row",
                    height: 60,
                    alignItems: "center",
                    backgroundColor: AppColors.brand.white,
                  }}
                >
                  <Icon
                    style={{ flex: 0.1, marginLeft: 10 }}
                    size={25}
                    name="person"
                    color={AppColors.brand.black}
                  />
                  <Text
                    style={{
                      flex: 0.9,
                      marginLeft: 10,
                      color: AppColors.brand.black,
                      fontSize: 14,
                    }}
                  >
                    {Strings.menueditprofile}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {this.state.user.role_id == 3 ? (
                <TouchableOpacity
                  onPress={() => {
                    Actions.dprofileView();
                    this.onPress("dprofileView");
                  }}
                  style={{
                    flexDirection: "row",
                    height: 60,
                    alignItems: "center",
                    backgroundColor: AppColors.brand.white,
                  }}
                >
                  <Icon
                    style={{ flex: 0.1, marginLeft: 10 }}
                    size={25}
                    name="person-circle-outline"
                    color={AppColors.brand.black}
                  />
                  <Text
                    style={{
                      flex: 0.9,
                      marginLeft: 10,
                      color: AppColors.brand.black,
                      fontSize: 14,
                    }}
                  >
                    {Strings.menueditprofile}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {this.state.user.role_id == 5 ? (
                <TouchableOpacity
                  onPress={() => {
                    Actions.clinicprofileview();
                    this.onPress("clinicprofileview");
                  }}
                  style={{
                    flexDirection: "row",
                    height: 60,
                    alignItems: "center",
                    backgroundColor: AppColors.brand.white,
                  }}
                >
                  <Icon
                    style={{ flex: 0.1, marginLeft: 10 }}
                    size={25}
                    name="person"
                    color={AppColors.brand.black}
                  />
                  <Text
                    style={{
                      flex: 0.9,
                      marginLeft: 10,
                      color: AppColors.brand.black,
                      fontSize: 14,
                    }}
                  >
                    {Strings.menueditprofile}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {this.state.user.role_id != 3 &&
              this.state.user.role_id != 7 &&
              this.state.user.role_id != 5 ? (
                <TouchableOpacity
                  onPress={() => {
                    Actions.profileView();
                    this.onPress("profileView");
                  }}
                  style={{
                    flexDirection: "row",
                    height: 60,
                    alignItems: "center",
                    backgroundColor: AppColors.brand.white,
                  }}
                >
                  <Icon
                    style={{ flex: 0.1, marginLeft: 10 }}
                    size={25}
                    name="person"
                    color={AppColors.brand.black}
                  />
                  <Text
                    style={{
                      flex: 0.9,
                      marginLeft: 10,
                      color: AppColors.brand.black,
                      fontSize: 14,
                    }}
                  >
                    {Strings.menueditprofile}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View>
              {Platform.OS == "ios" ? <View style={{ height: 30 }} /> : null}
              <TouchableOpacity
                onPress={() => {
                  Actions.authenticate({ type: "reset" });
                  this.onPress("authenticate");
                }}
                style={{
                  flexDirection: "row",
                  height: 60,
                  alignItems: "center",
                  backgroundColor: AppColors.brand.white,
                }}
              >
                <Icon
                  style={{ flex: 0.1, marginLeft: 10 }}
                  size={Platform.OS == "ios" ? 25 : 30}
                  name="log-in-outline"
                  color={AppColors.brand.black}
                />
                <Text
                  style={{
                    flex: 0.9,
                    marginLeft: 10,
                    color: AppColors.brand.black,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  {Strings.menulogin}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {this.state.user &&
          (this.state.user.role_id == 5 ||
            this.state.user.role_id == 6 ||
            this.state.user.role_id == 7) ? (
            <TouchableOpacity
              onPress={() => {
                Actions.subscription();
                this.onPress("subscription");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/subscription.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menusubscription}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id == 3 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.getverified();
                this.onPress("getverified");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/verified.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menugetverified}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id == 7 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.DiagnosticAppointment();
                this.onPress("DiagnosticAppointment");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/appointment.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menumyappointment}
              </Text>
            </TouchableOpacity>
          ) : (
            <View>
              {this.state.user &&
              this.state.user.role_id &&
              this.state.user.role_id != 6 ? (
                <View>
                  {this.state.user && this.state.user.role_id == 3 ? (
                    <TouchableOpacity
                      onPress={() => {
                        Actions.DoctorAppointment();
                        this.onPress("DoctorAppointment");
                      }}
                      style={{
                        flexDirection: "row",
                        height: 60,
                        alignItems: "center",
                        backgroundColor: AppColors.brand.white,
                      }}
                    >
                      <Image
                        style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                        source={require("../../../images/appointment.png")}
                      />
                      <Text
                        style={{
                          flex: 0.9,
                          marginLeft: 10,
                          color: AppColors.brand.black,
                          fontSize: 14,
                        }}
                      >
                        {Strings.menumyappointment}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        Actions.uappointment();
                        this.onPress("appointment");
                      }}
                      style={{
                        flexDirection: "row",
                        height: 60,
                        alignItems: "center",
                        backgroundColor: AppColors.brand.white,
                      }}
                    >
                      <Image
                        style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                        source={require("../../../images/appointment.png")}
                      />
                      <Text
                        style={{
                          flex: 0.9,
                          marginLeft: 10,
                          color: AppColors.brand.black,
                          fontSize: 14,
                        }}
                      >
                        {Strings.menumyappointment}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
            </View>
          )}
          {this.state.user && this.state.user.role_id == 3 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.educationList();
                this.onPress("educationList");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/education.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menumyeducation}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id == 3 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.language();
                this.onPress("language");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/language.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menumylanguage}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id == 3 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.speciality();
                this.onPress("speciality");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/speciality.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menumyspecialty}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id == 3 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.insurance();
                this.onPress("insurance");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/insurance.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menumyinsurance}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user &&
          ((this.state.user.role_id == 3 &&
            this.state.user.is_individual == 1) ||
            this.state.user.role_id == 5 ||
            this.state.user.role_id == 7) ? (
            <TouchableOpacity
              onPress={() => {
                Actions.moneytransferaccount();
                this.onPress("moneytransferaccount");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/moneytransfer.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menumoneytransferaccount}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user &&
          ((this.state.user.role_id == 3 &&
            this.state.user.is_individual == 1) ||
            this.state.user.role_id == 5 ||
            this.state.user.role_id == 7) ? (
            <TouchableOpacity
              onPress={() => {
                Actions.withdraw();
                this.onPress("withdraw");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/withdraw.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menucashwithdrawls}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user &&
          (this.state.user.role_id == 2 ||
            this.state.user.role_id == 3 ||
            this.state.user.role_id == 5 ||
            this.state.user.role_id == 7) ? (
            <TouchableOpacity
              onPress={() => {
                Actions.transactions();
                this.onPress("transactions");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/transaction.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menutransactions}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user &&
          this.state.user.role_id &&
          this.state.user.role_id != 3 &&
          this.state.user.role_id != 5 &&
          this.state.user.role_id != 6 &&
          this.state.user.role_id != 7 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.myDoctors();
                this.onPress("myDoctors");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/medical-team.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menumyfavorites}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id == 2 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.UserDiagnosticAppointment();
                this.onPress("UserDiagnosticAppointment");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/appointment.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menumylabtests}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id == 2 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.MedicalRecords();
                this.onPress("MedicalRecords");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/medicalrecords.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menumedicalrecords}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id == 2 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.LabReports();
                this.onPress("LabReports");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/labreport.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menulabreports}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user &&
          (this.state.user.role_id == 2 || this.state.user.role_id == 3) ? (
            <TouchableOpacity
              onPress={() => {
                Actions.QuestionList();
                this.onPress("QuestionList");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/question.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {this.state.user.role_id == 2
                  ? Strings.menuaskaquestion
                  : Strings.qanda}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id == 6 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.medicinesList();
                this.onPress("medicinesList");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{ flex: 0.1, marginLeft: 10, height: 40 }}
                source={require("../../../images/medicine.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menumedicines}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id == 7 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.DiagnosticBranches();
                this.onPress("DiagnosticBranches");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{
                  flex: 0.1,
                  marginLeft: 10,
                  height: 40,
                  resizeMode: "contain",
                }}
                source={require("../../../images/branch.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menumybranches}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id == 4 ? (
            <TouchableOpacity
              onPress={() => {
                Actions.medicinesList();
                this.onPress("medicinesList");
              }}
              style={{
                flexDirection: "row",
                height: 60,
                alignItems: "center",
                backgroundColor: AppColors.brand.white,
              }}
            >
              <Image
                style={{
                  flex: 0.1,
                  marginLeft: 10,
                  height: 40,
                  resizeMode: "contain",
                }}
                source={require("../../../images/bag.png")}
              />
              <Text
                style={{
                  flex: 0.9,
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menumedicines}
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.setItem("language", "");
              Actions.Languages({ coming_from: "menu" });
              this.onPress("languages");
            }}
            style={{
              flex: 1,
              height: 50,
              alignItems: "flex-start",
              backgroundColor: AppColors.brand.grey,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                marginLeft: 10,
                color: AppColors.brand.black,
                fontSize: 14,
              }}
            >
              {Strings.menulanguages}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "",
                Strings.areyousurewanttocleardata,
                [
                  {
                    text: Strings.cancel,
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                  },
                  {
                    text: Strings.ok,
                    onPress: async () => {
                      await AsyncStorage.setItem("language", "");
                      this.props.logoutApp();
                      AsyncStorage.clear();
                      Actions.Languages({
                        type: "reset",
                        coming_from: "clear",
                      });
                      this.onPress("languages");
                    },
                  },
                ],
                { cancelable: false }
              );
            }}
            style={{
              flex: 1,
              height: 50,
              alignItems: "flex-start",
              backgroundColor: AppColors.brand.grey,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                marginLeft: 10,
                color: AppColors.brand.black,
                fontSize: 14,
              }}
            >
              {Strings.menucleardata}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Actions.Pages({ page: "terms-and-conditions-1" });
              this.onPress("terms-and-conditions-1");
            }}
            style={{
              flex: 1,
              height: 50,
              alignItems: "flex-start",
              backgroundColor: AppColors.brand.grey,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                marginLeft: 10,
                color: AppColors.brand.black,
                fontSize: 14,
              }}
            >
              {Strings.menutermsandconditions}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Actions.Pages({ page: "privacy-policy-1" });
              this.onPress("privacy-policy-1");
            }}
            style={{
              flex: 1,
              height: 50,
              alignItems: "flex-start",
              backgroundColor: AppColors.brand.grey,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                marginLeft: 10,
                color: AppColors.brand.black,
                fontSize: 14,
              }}
            >
              {Strings.menuprivacypolicy}
            </Text>
          </TouchableOpacity>
          {this.state.user && this.state.user.role_id ? (
            <TouchableOpacity
              onPress={() => {
                Actions.changepassword();
                this.onPress("changepassword");
              }}
              style={{
                flex: 1,
                height: 50,
                alignItems: "flex-start",
                backgroundColor: AppColors.brand.grey,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menuchangepassword}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id ? (
            <TouchableOpacity
              onPress={() => {
                this.deleteAccount();
              }}
              style={{
                flex: 1,
                height: 50,
                alignItems: "flex-start",
                backgroundColor: AppColors.brand.grey,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menudeactivateaccount}
              </Text>
            </TouchableOpacity>
          ) : null}
          {this.state.user && this.state.user.role_id ? (
            <TouchableOpacity
              onPress={this.logout}
              style={{
                flex: 1,
                height: 50,
                alignItems: "flex-start",
                backgroundColor: AppColors.brand.grey,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  marginLeft: 10,
                  color: AppColors.brand.black,
                  fontSize: 14,
                }}
              >
                {Strings.menulogout}
              </Text>
            </TouchableOpacity>
          ) : null}
          {Platform.OS == "ios" && AppSizes.screen.height >= 812 ? (
            <View style={{ height: 20 }} />
          ) : null}
        </ScrollView>
      </View>
    );
  };
}

/* Export Component ==================================================================== */
export default connect(mapStateToProps, mapDispatchToProps)(Menu);
