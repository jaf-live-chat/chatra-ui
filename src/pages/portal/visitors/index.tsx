import React from "react";
import PageTitle from "../../../components/common/PageTitle";
import VisitorsTableSection from "../../../sections/visitors/VisitorsTableSection";

const Visitors = () => {
  return (
    <React.Fragment>
      <PageTitle
        title="Visitors"
        description="Browse your website visitors and drill into profile-level chat histories."
        canonical="/portal/visitors"
      />
      <VisitorsTableSection />
    </React.Fragment>
  );
};

export default Visitors;