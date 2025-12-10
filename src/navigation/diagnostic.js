/**
 * Diagnostic Scenes
 *
 */
import React from 'react';
import {Scene, ActionConst} from 'react-native-router-flux';

// Consts and Libs
import {AppConfig} from '../constants';
import {AppStyles, AppSizes} from '../theme';

// Components
import {TabIcon} from '@ui/';
import {NavbarMenuButton} from '../containers/ui/NavbarMenuButton/NavbarMenuButtonContainer';

// Scenes
import DiagnosticAppointment from '../containers/Diagnostic/Appointment';
import DiagnosticBranches from '../containers/Diagnostic/Branches';
import LabTests from '../containers/Diagnostic/LabTests';
import LabTestsList from '../containers/Diagnostic/LabTestsList';
import UploadReport from '../containers/Diagnostic/UploadReport';
const navbarPropsTabs = {
  ...AppConfig.navbarProps,
  renderLeftButton: () => <NavbarMenuButton />,
  sceneStyle: {
    ...AppConfig.navbarProps.sceneStyle,
    //paddingBottom: AppSizes.tabbarHeight,
  },
};

/* Routes ==================================================================== */
const scenes = (
  <Scene
    headerLayoutPreset={'center'}
    key={'SearchHome3'}
    title={'Search3'}
    hideNavBar={true}>
    <Scene
      hideNavBar
      titleStyle={[AppStyles.regularFontText, {color: '#FFF', fontSize: 16}]}
      key={'DiagnosticAppointment'}
      title={'Diagnostic Dashboard'}
      component={DiagnosticAppointment}
    />

    <Scene
      hideNavBar
      key={'DiagnosticBranches'}
      title={'Branches'}
      component={DiagnosticBranches}
    />
    <Scene
      hideNavBar
      key={'LabTest'}
      title={'Add Lab Test'}
      component={LabTests}
    />
    <Scene
      hideNavBar
      key={'LabTestsListing'}
      title={'Lab Tests'}
      component={LabTestsList}
    />
    <Scene
      hideNavBar
      key={'UploadReport'}
      title={'Upload Report'}
      component={UploadReport}
    />
  </Scene>
);

export default scenes;
