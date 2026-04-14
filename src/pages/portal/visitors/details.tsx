import React from "react";
import PageTitle from "../../../components/common/PageTitle";
import VisitorDetailsSection from "../../../sections/visitors/VisitorDetailsSection";

const VisitorDetails = () => {
  return (
    <React.Fragment>
      <PageTitle
        title="Visitor Details"
        description="Inspect a visitor profile and complete chat history timeline."
        canonical="/portal/visitors"
      />
      <VisitorDetailsSection />
    </React.Fragment>
  );
};

export default VisitorDetails;