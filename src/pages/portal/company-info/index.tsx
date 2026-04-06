import React from "react";
import CompanyInfoView from "../../../sections/settings/CompanyInfoView";
import PageTitle from "../../../components/common/PageTitle";

const CompanyInfo = () => {
  return(
    <React.Fragment>
       <PageTitle
        title="Company Information"
        description="Manage your company's details and settings."
        canonical="/portal/company-info"

      />
   <CompanyInfoView />
   </React.Fragment>
   )

};

export default CompanyInfo;