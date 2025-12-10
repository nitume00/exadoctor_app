/**
 * App Navigation
 *
 * React Native Starter App
 * https://github.com/mcnamee/react-native-starter-app
 */
import React from 'react';
import {Actions, Scene, ActionConst} from 'react-native-router-flux';

// Consts and Libs
import {AppConfig} from '../constants';
// import { AppStyles, AppSizes } from '@theme/';

// Components
// import Drawer from '@containers/ui/DrawerContainer';

// Scenes
import AppLaunch from '../containers/Launch/LaunchContainer';
// import Placeholder from '@components/general/Placeholder';
import AuthScenes from './auth';
import TabsScenes from './tabs';
import DoctorScenes from './doctor';
import DiagnosticScenes from './diagnostic';
import PharmacyScenes from './pharmacy';
// import MedicinesList from '@containers/Pharmacy/MedicinesList';
import ProfileView from '../containers/Clinic/ProfileView';
import ClinicProfileView from '../containers/Clinic/ProfileView';

import DiagnosticProfileView from '../containers/Diagnostic/profileview';
import Pages from '../containers/User/pages';

import Camera from '../components/CameraView';
import Subscription from '../containers/User/Subscription';
import ConfirmSubscription from '../containers/User/ConfirmSubscription';
import Question from '../containers/User/Question';
import Answer from '../containers/User/Answer';
import QuestionList from '../containers/User/QuestionList';
import MedicalRecords from '../containers/User/MedicalRecords';
import LabReports from '../containers/User/LabReports';
import AddMedicalRecord from '../containers/User/AddMedicalRecord';
import Transactions from '../containers/User/Transactions';
import ChangePassword from '../containers/User/changepassword';
import MoneyTransferAccount from '../containers/Doctor/MoneyTransferAccount';
import Withdraw from '../containers/Doctor/Withdraw';
import Languages from '../containers/auth/Languages';
/* Routes ==================================================================== */
export default Actions.create(
  <Scene key={'root'} {...AppConfig.navbarProps}>
    {/* <Scene
      titleStyle={{ color: '#FFF' }}
      navigationBarStyle={AppStyles.navbarStyle}
      key={'medicinesListee'}
      title={'Medicines'}
      component={MedicinesList}
      analyticsDesc={'Medicines List'}
    /> */}
    <Scene
      hideNavBar
      key={'splash'}
      component={AppLaunch}
      analyticsDesc={'AppLaunch: Launching App'}
    />

    {/* Auth */}
    {AuthScenes}

    {/* Main App */}
    <Scene
      key={'doctorapp'}
      {...AppConfig.navbarProps}
      title={AppConfig.appName}
      hideNavBar={true}
      type={ActionConst.RESET}>
      {/* Drawer Side Menu */}
      <Scene key={'home1'} hideNavBar={true} initial={'tabBar1'}>
        {/* Tabbar */}
        {DoctorScenes}
      </Scene>
    </Scene>
    <Scene
      key={'pharmacyapp'}
      {...AppConfig.navbarProps}
      title={AppConfig.appName}
      hideNavBar={true}
      type={ActionConst.RESET}>
      {/* Drawer Side Menu */}
      <Scene key={'home2'} hideNavBar={true} initial={'tabBar2'}>
        {/* Tabbar */}
        {PharmacyScenes}
      </Scene>
    </Scene>
    <Scene
      key={'diagnosticapp'}
      {...AppConfig.navbarProps}
      title={AppConfig.appName}
      hideNavBar={true}
      type={ActionConst.RESET}>
      {/* Drawer Side Menu */}
      <Scene key={'home3'} hideNavBar={true} initial={'tabBar3'}>
        {/* Tabbar */}
        {DiagnosticScenes}
      </Scene>
    </Scene>
    <Scene
      key={'app'}
      {...AppConfig.navbarProps}
      title={AppConfig.appName}
      hideNavBar={true}
      type={ActionConst.RESET}>
      {/* Drawer Side Menu */}
      <Scene key={'home'} hideNavBar={true}>
        {/* Tabbar */}
        {TabsScenes}
      </Scene>
    </Scene>
    <Scene
      hideNavBar
      key={'Pages'}
      title={'Pages'}
      component={Pages}
      analyticsDesc={'Pages'}
    />
    <Scene
      hideNavBar
      key={'Languages'}
      title={'Languages'}
      component={Languages}
      analyticsDesc={'Languages'}
    />
    <Scene
      hideNavBar
      key={'profileView'}
      title={'Profile'}
      component={ProfileView}
      analyticsDesc={'Profile View'}
    />
    <Scene
      hideNavBar
      key={'clinicprofileview'}
      title={'Profile View'}
      component={ClinicProfileView}
      analyticsDesc={'Clinic Profile View'}
    />

    <Scene
      hideNavBar
      key={'DiagnosticProfileView'}
      title={'Profile'}
      component={DiagnosticProfileView}
      analyticsDesc={'Diagnostic Profile View'}
    />
    <Scene
      hideNavBar
      key={'subscription'}
      component={Subscription}
      analyticsDesc={'Subscription'}
      title={'Subscription'}
    />
    <Scene
      hideNavBar
      key={'confirmsubscription'}
      component={ConfirmSubscription}
      analyticsDesc={'ConfirmSubscription'}
      title={'ConfirmSubscription'}
    />

    <Scene
      hideNavBar
      key={'Question'}
      component={Question}
      analyticsDesc={'Question'}
      title={'Question'}
    />
    <Scene
      hideNavBar
      key={'Answer'}
      component={Answer}
      analyticsDesc={'Answer'}
      title={'Answer'}
    />
    <Scene
      hideNavBar
      key={'QuestionList'}
      component={QuestionList}
      analyticsDesc={'QuestionList'}
      title={'QuestionList'}
    />
    <Scene
      hideNavBar
      key={'MedicalRecords'}
      component={MedicalRecords}
      analyticsDesc={'MedicalRecords'}
      title={'MedicalRecords'}
    />
    <Scene
      hideNavBar
      key={'LabReports'}
      component={LabReports}
      analyticsDesc={'LabReports'}
      title={'LabReports'}
    />
    <Scene
      hideNavBar
      key={'AddMedicalRecord'}
      component={AddMedicalRecord}
      analyticsDesc={'AddMedicalRecord'}
      title={'AddMedicalRecord'}
    />
    <Scene
      hideNavBar
      key={'transactions'}
      component={Transactions}
      analyticsDesc={'Transactions'}
      title={'Transactions'}
    />
    <Scene
      hideNavBar
      key={'moneytransferaccount'}
      title={'MoneyTransferAccount'}
      component={MoneyTransferAccount}
      analyticsDesc={'MoneyTransferAccount'}
    />
    <Scene
      hideNavBar
      key={'withdraw'}
      title={'Withdraw'}
      component={Withdraw}
      analyticsDesc={'Withdraw'}
    />
    <Scene
      hideNavBar
      key={'changepassword'}
      title={'Change Password'}
      component={ChangePassword}
      analyticsDesc={'Change Password'}
    />
    <Scene
      hideNavBar
      key={'Camera'}
      title={'ADD DATING PREFERENCE'}
      component={Camera}
    />
  </Scene>,
);
