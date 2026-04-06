import React from "react";
import WidgetSettingsView from "../../../sections/settings/WidgetSettingsView";
import PageTitle from "../../../components/common/PageTitle";

const WidgetSettingsPage = () => {
  return(
    <React.Fragment>
       <PageTitle
        title="Widget Settings"
        description="Manage the appearance and behavior of your chat widget."
        canonical="/portal/widget-settings"

      />
   <WidgetSettingsView />
   </React.Fragment>
   )
};

export default WidgetSettingsPage;
