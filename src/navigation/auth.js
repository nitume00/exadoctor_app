/**
 * Auth Scenes
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import React from "react";
import { Scene, ActionConst } from "react-native-router-flux";
// Consts and Libs
import { AppStyles, AppSizes, AppColors } from "@theme/";
import { AppConfig } from "@constants/";
import { NavbarMenuButton } from "@containers/ui/NavbarMenuButton/NavbarMenuButtonContainer";
// Scenes
// import LoginForm from '@containers/auth/Forms/LoginContainer';
import SignUpForm from "@containers/auth/Forms/SignUpContainer";
import ResetPasswordForm from "@containers/auth/Forms/ResetPasswordContainer";
import Authenticate from "@containers/auth/AuthenticateView";
import OTP from "@containers/auth/OTP";

const navbarPropsTabs = {
  ...AppConfig.navbarProps,
  ...AppStyles.navbarTitle,
  renderLeftButton: () => <NavbarMenuButton />,
};
/* Routes ==================================================================== */

const scenes = (
  <Scene key={"authenticate"} hideNavBar duration={1}>
    <Scene
      hideNavBar
      key={"authLanding1"}
      duration={1}
      component={Authenticate}
      analyticsDesc={"Authentication"}
    />
    <Scene
      hideNavBar
      key={"signUp"}
      title={"Register"}
      clone
      component={SignUpForm}
      analyticsDesc={"Sign Up"}
    />
    <Scene
      hideNavBar
      key={"otp"}
      title={"Verify OTP"}
      clone
      component={OTP}
      analyticsDesc={"OTP"}
    />
    <Scene
      hideNavBar
      key={"passwordReset"}
      title={"Password Reset"}
      clone
      component={ResetPasswordForm}
      analyticsDesc={"Password Reset"}
    />
  </Scene>
);

export default scenes;
