import { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";
import HomePage from "./Pages/HomePage";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PantissSdgPage from "./Pages/PantissSdgPage";
import Header from "./Components/Common/Header";
import WhoWeAre from "./Pages/WhoWeAre";
import Footer2 from "./Components/Common/Footer2";
import SeoManager from "./Components/Common/SeoManager";
import CareersPage from "./Pages/CareersPage";
import WhatWeDo from "./Pages/WhatWeDo";
import Tenders from "./Pages/Tenders";
import AllTenders from "./Pages/AllTenders";
import Loader from "./Components/Common/Loader/Loader";
import JobsPage from "./Pages/JobsPage";
import YoungProfessionals from "./Pages/YoungProfessionals";
import InternshipProgramme from "./Pages/InternshipProgramme";
import ContactPage from "./Pages/ContactPage";
import Fellowship from "./Pages/Fellowship";
import SummitPage from "./Pages/SummitPage";
import ZeroToleranceToHarassment from "./Pages/life-at-pantiss/ZeroToleranceToHarassment";
import PeopleAtPantiss from "./Pages/life-at-pantiss/PeopleAtPantiss";
import InclusivenessAndDiversity from "./Pages/life-at-pantiss/InclusivenessAndDiversity";
import MeetTheLeaders from "./Pages/life-at-pantiss/MeetTheLeaders";
import InvestingInMentalHealth from "./Pages/life-at-pantiss/InvestingInMentalHealth";
import CareerDevelopment from "./Pages/benefits-at-pantiss/CareerDevelopment";
import TutionAssistance from "./Pages/benefits-at-pantiss/TutionAssistance";
import ParentingBenefits from "./Pages/benefits-at-pantiss/ParentingBenefits";
import HealthInsurance from "./Pages/benefits-at-pantiss/HealthInsurance";
import RetirementProgrammes from "./Pages/benefits-at-pantiss/RetirementProgrammes";
import EmployeeBenefitDetail from "./Pages/benefits-at-pantiss/EmployeeBenefitDetail";
import Publications from "./Pages/Publications";
import WhereWeWorkPage from "./Pages/WhereWeWorkPage";
import Dashboard from "./Pages/Dashboard";
import Odisha from "./Pages/WhereWeWorkPages/Odisha";
import Chattisgarh from "./Pages/WhereWeWorkPages/Chattisgarh";
import Jharkhand from "./Pages/WhereWeWorkPages/Jharkhand";
import Assam from "./Pages/WhereWeWorkPages/Assam";
import TamilNadu from "./Pages/WhereWeWorkPages/TamilNadu";
import Jharsuguda from "./Pages/WhereWeWorkPages/OdishaDistricts/Jharsuguda";
import Sundargarh from "./Pages/WhereWeWorkPages/OdishaDistricts/Sundargarh";
import Keonjhar from "./Pages/WhereWeWorkPages/OdishaDistricts/Keonjhar";
import Kalahandi from "./Pages/WhereWeWorkPages/OdishaDistricts/Kalahandi";
// import Kandhamal from "./Pages/WhereWeWorkPages/OdishaDistricts/Kandhamal";
// import Mayurbhanj from "./Pages/WhereWeWorkPages/OdishaDistricts/Mayurbhanj";
import Koderma from "./Pages/WhereWeWorkPages/JharkhandDistricts/Koderma";
import Dhanbad from "./Pages/WhereWeWorkPages/JharkhandDistricts/Dhanbad";
import Bokaro from "./Pages/WhereWeWorkPages/JharkhandDistricts/Bokaro";
import Neyveli from "./Pages/WhereWeWorkPages/TamilNaduDistricts/Neyveli";
import Dispur from "./Pages/WhereWeWorkPages/AssamDistricts/Dispur";
import Korba from "./Pages/WhereWeWorkPages/Chhattisgarh/Korba";
import Guwahati from "./Pages/WhereWeWorkPages/AssamDistricts/Guwahati";
// import EiaSia from "./Pages/WhatWeDo/EiaSia";
import RehabilitationResettlementOfMines from "./Pages/WhatWeDo/RehabilitationResettlementOfMines";
import SkillTrainingForMiningAffectedYouth from "./Pages/WhatWeDo/SkillTrainingForMiningAffectedYouth";
// import EnterpriseGrowthInMiningVillages from "./Pages/WhatWeDo/EnterpriseGrowthInMiningVillages";
import ReclamationOfAbandonedMines from "./Pages/WhatWeDo/ReclamationOfAbandonedMines";
// import JustTransitionForMiningWorkers from "./Pages/WhatWeDo/JustTransitionForMiningWorkers";
import Nutrition from "./Pages/WhatWeDo/Nutrition&WellbeingInMiningVillages";
// import EcoMineTourism from "./Pages/WhatWeDo/EcoMineTourism";
import ModelMiningVillageInMaking from "./Pages/WhatWeDo/ModelMiningVillageInMaking";
// import IndegenousCommunityEmpowerment from "./Pages/WhatWeDo/IndegenousCommunityEmpowerment";
// import WaterbodyRestorationInMines from "./Pages/WhatWeDo/WaterbodyRestorationInMines";
// import ConnectingRemoteMiningHabitations from "./Pages/WhatWeDo/ConnectingRemoteMiningHabitations";
import InnovationLabPage from "./Pages/InnovationLabPage";
import Anugul from "./Pages/WhereWeWorkPages/OdishaDistricts/Anugul";
import Jajpur from "./Pages/WhereWeWorkPages/OdishaDistricts/Jajpur";
import ModelMiningVillagesSolution from "./Pages/Solutions/ModelMiningVillagesSolution";
import RepurposedMiningVillagesSolution from "./Pages/Solutions/RepurposedMiningVillagesSolution";

const AdminLogin = lazy(() => import("./features/admin/AdminLogin"));
const ContentAdmin = lazy(() => import("./Pages/ContentAdmin"));
const TeamAdmin = lazy(() => import("./Pages/TeamAdmin"));

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const hideHeaderFooter = (location.pathname === "/sdg-pantiss" || (location.pathname === "/admin" || location.pathname.startsWith("/admin/")));

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="overflow-x-clip">
      <SeoManager />
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<Suspense fallback={<Loader />}><AdminLogin /></Suspense>} />
        <Route path="/admin/:resource" element={<Suspense fallback={<Loader />}><ContentAdmin /></Suspense>} />
        <Route path="/admin/team" element={<Suspense fallback={<Loader />}><TeamAdmin /></Suspense>} />
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/sdg-pantiss" element={<PantissSdgPage />} />
        <Route path="/whoweare/*" element={<WhoWeAre />} />
        <Route path="/what-we-do" element={<WhatWeDo />} />
        <Route
          path="/solutions/model-mining-villages"
          element={<ModelMiningVillagesSolution />}
        />
        <Route
          path="/solutions/repurposed-mining-villages"
          element={<RepurposedMiningVillagesSolution />}
        />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/careers/jobs" element={<JobsPage />} />{" "}
        {/* Nested Route */}
        <Route path="/tenders" element={<Tenders />} />
        <Route path="/tenders/all" element={<AllTenders />} />
        <Route path="/where-we-work" element={<WhereWeWorkPage />} />
        <Route
          path="/programmes/young-professionals"
          element={<YoungProfessionals />}
        />
        <Route
          path="/programmes/internships"
          element={<InternshipProgramme />}
        />
        <Route path="/fellowship" element={<Fellowship />} />
        <Route path="/summit" element={<SummitPage />} />
        <Route path="/impact" element={<Publications />} />
        {/* Life-at-pantiss */}
        <Route
          path="/life-at-pantiss/people-at-pantiss"
          element={<PeopleAtPantiss />}
        />
        <Route
          path="/life-at-pantiss/inclusiveness-and-diversity"
          element={<InclusivenessAndDiversity />}
        />
        <Route
          path="/life-at-pantiss/zero-tolerance-for-harassment"
          element={<ZeroToleranceToHarassment />}
        />
        <Route
          path="/life-at-pantiss/meet-the-leaders"
          element={<MeetTheLeaders />}
        />
        <Route
          path="/life-at-pantiss/investing-in-mental-health"
          element={<InvestingInMentalHealth />}
        />
        {/* Benefits */}
        <Route
          path="/benefits-at-pantiss/career-development"
          element={<CareerDevelopment />}
        />
        <Route
          path="/benefits-at-pantiss/tution-assistance"
          element={<TutionAssistance />}
        />
        <Route
          path="/benefits-at-pantiss/parenting-benefits"
          element={<ParentingBenefits />}
        />
        <Route
          path="/benefits-at-pantiss/health-insurance"
          element={<HealthInsurance />}
        />
        <Route
          path="/benefits-at-pantiss/retirement-programmes"
          element={<RetirementProgrammes />}
        />
        <Route
          path="/benefits-at-pantiss/:benefitSlug"
          element={<EmployeeBenefitDetail />}
        />


        {/* Where We Work */}
        <Route path="/where-we-work/odisha" element={<Odisha />} />
        <Route path="/where-we-work/chhattisgarh" element={<Chattisgarh />} />
        <Route path="/where-we-work/jharkhand" element={<Jharkhand />} />
        <Route path="/where-we-work/tamil-nadu" element={<TamilNadu />} />
        <Route path="/where-we-work/assam" element={<Assam />} />


        {/* Odisha Districts */}
        <Route path="/where-we-work/odisha/angul" element={<Anugul />} />
        <Route path="/where-we-work/odisha/jajpur" element={<Jajpur />} />
        <Route
          path="/where-we-work/odisha/jharsuguda"
          element={<Jharsuguda />}
        />
        <Route
          path="/where-we-work/odisha/sundargarh"
          element={<Sundargarh />}
        />
        <Route path="/where-we-work/odisha/keonjhar" element={<Keonjhar />} />
        <Route path="/where-we-work/odisha/kalahandi" element={<Kalahandi />} />
        {/* <Route path="/where-we-work/odisha/kandhamal" element={<Kandhamal />} /> */}
        {/* <Route
          path="/where-we-work/odisha/mayurbhanj"
          element={<Mayurbhanj />}
        /> */}


        {/* Jharkhand Districts */}
        <Route path="/where-we-work/jharkhand/koderma" element={<Koderma />} />
        <Route path="/where-we-work/jharkhand/dhanbad" element={<Dhanbad />} />
        <Route path="/where-we-work/jharkhand/bokaro" element={<Bokaro />} />


        {/* Tamilnadu Districts */}
        <Route path="/where-we-work/tamil-nadu/neyveli" element={<Neyveli />} />
        
        {/* Chhattisgarh */}
        <Route path="/where-we-work/Chhattisgarh/korba" element={<Korba />} />

        {/* Assam Districts */}
        <Route path="/where-we-work/assam/guwahati" element={<Guwahati />} />
        <Route path="/where-we-work/assam/dispur" element={<Dispur />} />




        {/* What-We-Do Routes */}
        <Route path="/what-we-do/land-acquisition-rehabilitation-&-resettlement-of-mines" element={<RehabilitationResettlementOfMines />}/>
        <Route path="/what-we-do/mine-steel-&-power-skill-park" element={<SkillTrainingForMiningAffectedYouth />}/>
        <Route path="/what-we-do/carp-rice-&-duck-livelihood-park" element={<ReclamationOfAbandonedMines />}/>
        <Route path="/what-we-do/nutrinest" element={<Nutrition />}/>

        <Route path="/what-we-do/model-mining-village-in-making" element={<ModelMiningVillageInMaking />}/>


        <Route path="/what-we-do/innovation-lab" element={<InnovationLabPage />}/>

        {/* <Route path="/what-we-do/EIA-SIA-for-land-acquisition" element={<EiaSia />}/> */}
        {/* <Route path="/what-we-do/enterprise-growth-in-mining-villages" element={<EnterpriseGrowthInMiningVillages />}/> */}
        {/* <Route path="/what-we-do/just-transition-for-mining-workers" element={<JustTransitionForMiningWorkers />}/> */}
        {/* <Route path="/what-we-do/eco-mine-tourism" element={<EcoMineTourism />}/> */}
        {/* <Route path="/what-we-do/indegenous-community-empowerment" element={<IndegenousCommunityEmpowerment />}/> */}
        {/* <Route path="/what-we-do/waterbody-restoration-in-mines" element={<WaterbodyRestorationInMines />}/> */}
        {/* <Route path="/what-we-do/connecting-remote-mining-habitations" element={<ConnectingRemoteMiningHabitations />}/> */}
      </Routes>
      {!hideHeaderFooter && <Footer2 />}
    </div>
  );
}

export default App;
