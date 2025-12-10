import React from 'react';
import {Scene, ActionConst} from 'react-native-router-flux';

// Consts and Libs
import {AppConfig} from '@constants/';
import {AppStyles, AppSizes} from '@theme/';

// Components
import {NavbarMenuButton} from '@containers/ui/NavbarMenuButton/NavbarMenuButtonContainer';

import Search from '@containers/search/Search';
import Listing from '@containers/search/Listing';
import ListingDetails from '@containers/search/ListingDetails';
import AppointmentDetail from '@containers/search/AppointmentDetail';
import Prescription from '@containers/search/Prescription';
import BookNow from '@containers/search/BookNow';
import Review from '@containers/search/Review';
import Reschedule from '@containers/search/Reschedule';
import MyDoctors from '@containers/User/mydoctors';
import Appointment from '@containers/User/Appointment';
import DoctorAppointment from '@containers/User/DoctorAppointment';
import PrescriptionDetails from '@containers/User/prescriptiondetails';
import PrescriptionRequested from '@containers/Pharmacy/PrescriptionRequested';
import ClinicListingDetail from '@containers/Clinic/ListingDetails';
import BranchListingDetail from '@containers/Branch/ListingDetails';
import DiagnosticListingDetail from '@containers/Diagnostic/ListingDetails';
import UserDiagnosticAppointment from '@containers/Diagnostic/Appointment';
import UserUploadReport from '@containers/Diagnostic/UploadReport';
import DiagnosticBookNow from '@containers/Diagnostic/BookNow';

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
    key={'SearchHome'}
    title={'Search'}
    hideNavBar={true}>
    <Scene
      hideNavBar
      key={'Search'}
      component={Search}
      title={'Search'}
      type={ActionConst.RESET}
    />
    <Scene
      hideNavBar
      key={'Listing'}
      component={Listing}
      analyticsDesc={'Listing'}
      title={'Listing'}
    />
    <Scene
      hideNavBar
      key={'ListingDetails'}
      component={ListingDetails}
      analyticsDesc={'ListingDetails'}
      title={'ListingDetails'}
    />
    <Scene
      hideNavBar
      key={'BranchListingDetail'}
      component={BranchListingDetail}
      analyticsDesc={'BranchListingDetail'}
      title={'BranchListingDetail'}
    />
    <Scene
      hideNavBar
      key={'DiagnosticListingDetail'}
      component={DiagnosticListingDetail}
      analyticsDesc={'DiagnosticListingDetail'}
      title={'DiagnosticListingDetail'}
    />

    <Scene
      hideNavBar
      key={'UserDiagnosticAppointment'}
      component={UserDiagnosticAppointment}
      analyticsDesc={'UserDiagnosticAppointment'}
      title={'UserDiagnosticAppointment'}
    />
    <Scene
      hideNavBar
      key={'UserUploadReport'}
      component={UserUploadReport}
      analyticsDesc={'UserUploadReport'}
      title={'UserUploadReport'}
    />

    <Scene
      hideNavBar
      key={'DiagnosticBookNow'}
      component={DiagnosticBookNow}
      analyticsDesc={'DiagnosticBookNow'}
      title={'DiagnosticBookNow'}
    />
    <Scene
      hideNavBar
      key={'viewclinic'}
      component={ClinicListingDetail}
      analyticsDesc={'ClinicListingDetail'}
      title={'ClinicListingDetail'}
    />

    <Scene
      hideNavBar
      key={'AppointmentDetail'}
      component={AppointmentDetail}
      analyticsDesc={'AppointmentDetail'}
      title={'AppointmentDetail'}
    />
    <Scene
      hideNavBar
      key={'Prescription'}
      component={Prescription}
      analyticsDesc={'Prescription'}
      title={'Prescription'}
    />
    <Scene
      hideNavBar
      key={'BookNow'}
      component={BookNow}
      analyticsDesc={'BookNow'}
      title={'BookNow'}
    />
    <Scene
      hideNavBar
      key={'Review'}
      component={Review}
      analyticsDesc={'Review'}
      title={'Review'}
    />
    <Scene
      hideNavBar
      key={'Reschedule'}
      component={Reschedule}
      analyticsDesc={'Reschedule'}
      title={'Reschedule'}
    />

    <Scene
      hideNavBar
      key={'myDoctors'}
      title={'My Doctors'}
      clone
      component={MyDoctors}
    />

    <Scene
      {...navbarPropsTabs}
      navigationBarStyle={AppStyles.navbarStyle}
      titleStyle={{color: '#FFF', fontSize: 14}}
      key={'prescriptionDetails'}
      title={'Prescription Details'}
      clone
      component={PrescriptionDetails}
      analyticsDesc={'PrescriptionDetails'}
    />

    <Scene
      hideNavBar
      key={'uappointment'}
      title={'Appointment List'}
      component={Appointment}
      clone
    />
    <Scene
      {...navbarPropsTabs}
      navigationBarStyle={AppStyles.navbarStyle}
      titleStyle={[AppStyles.regularFontText, {color: '#FFF', fontSize: 14}]}
      key={'DoctorAppointment'}
      title={'Doctor Appointment'}
      clone
      component={DoctorAppointment}
      analyticsDesc={'Doctor Appointment'}
      type={ActionConst.RESET}
    />

    <Scene
      {...navbarPropsTabs}
      navigationBarStyle={AppStyles.navbarStyle}
      titleStyle={[AppStyles.regularFontText, {color: '#FFF', fontSize: 14}]}
      key={'prescriptionrequested'}
      title={'Prescription Requested'}
      clone
      component={PrescriptionRequested}
      analyticsDesc={'Prescription Requested'}
      type={ActionConst.RESET}
    />

    {/*<Scene
            hideNavBar
            key={'viewPrescrition'}
            title={'Prescription Details'}
            clone
            component={ViewPrescrition}
            analyticsDesc={'View Prescrition'}
          />*/}
  </Scene>
);

export default scenes;
