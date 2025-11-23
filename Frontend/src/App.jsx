import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HelpToSignUp from "./components/help/HelpToSignUp";
import HelpToHome from "./components/help/HelpToHome";
import HelpToQuiz from "./components/help/HelpToQuiz";
import NotFound from "./components/pages/NotFound";
import { Predict } from "./components";
import Chat from "./components/pages/Chat";
import VoiceBot from "./components/pages/Voice";
import TestPredict from "./components/pages/TestPredict";
import SignIn from "./components/pages/SignIn";
import SignUp from "./components/pages/SignUp";
import EnhancedResults from "./components/pages/EnhancedResults";
import AdaptiveQuiz from "./components/adaptiveQuiz/AdaptiveQuiz";
import AdaptiveQuizDashboard from "./components/adaptiveQuiz/AdaptiveQuizDashboard";
import QuizCategories from "./components/adaptiveQuiz/QuizCategories";
import QuizTaking from "./components/adaptiveQuiz/QuizTaking";
import QuizResults from "./components/adaptiveQuiz/QuizResults";
import SkillProfile from "./components/adaptiveQuiz/SkillProfile";
import LearningPath from "./components/learningPath/LearningPath";
import Portfolio from "./components/portfolio/Portfolio";
import SkillAssessment from "./components/skillAssessment/SkillAssessment";
import LaborMarket from "./components/laborMarket/LaborMarket";
import LaborMarketLayout from "./components/laborMarket/LaborMarketLayout";
import MarketDashboard from "./pages/laborMarket/MarketDashboard";
import IndustryExplorer from "./pages/laborMarket/IndustryExplorer";
import JobRoleSearch from "./pages/laborMarket/JobRoleSearch";
import JobRoleDetails from "./pages/laborMarket/JobRoleDetails";
import SalaryInsights from "./pages/laborMarket/SalaryInsights";
import SkillsDemand from "./pages/laborMarket/SkillsDemand";
import CompanyInsights from "./pages/laborMarket/CompanyInsights";
import EmergingRoles from "./pages/laborMarket/EmergingRoles";
import CareerRecommender from "./pages/laborMarket/CareerRecommender";
import RecommendationDetail from "./pages/laborMarket/RecommendationDetail";
import SkillGapAnalyzer from "./pages/laborMarket/SkillGapAnalyzer";
import MarketTrends from "./pages/laborMarket/MarketTrends";
import LearningPathGenerator from "./pages/laborMarket/LearningPathGenerator";
import FeaturesDashboard from "./components/pages/FeaturesDashboard";
import "regenerator-runtime/runtime";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HelpToHome />} />
        <Route path="/register" element={<HelpToSignUp />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/quiz" element={<HelpToQuiz />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/test-predict" element={<TestPredict />} />
        <Route path="/results" element={<EnhancedResults />} />
        <Route path="/features" element={<FeaturesDashboard />} />
        <Route path="/adaptive-quiz" element={<AdaptiveQuiz />} />
        <Route path="/quiz/dashboard" element={<AdaptiveQuizDashboard />} />
        <Route path="/quiz/categories" element={<QuizCategories />} />
        <Route path="/quiz/take/:quizId" element={<QuizTaking />} />
        <Route path="/quiz/results/:quizId" element={<QuizResults />} />
        <Route path="/quiz/profile" element={<SkillProfile />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/skill-assessment" element={<SkillAssessment />} />
        <Route path="/labor-market" element={<LaborMarket />} />
        {/* New Labor Market Routes */}
        <Route path="/market/dashboard" element={<LaborMarketLayout><MarketDashboard /></LaborMarketLayout>} />
        <Route path="/market/industries" element={<LaborMarketLayout><IndustryExplorer /></LaborMarketLayout>} />
        <Route path="/market/jobs" element={<LaborMarketLayout><JobRoleSearch /></LaborMarketLayout>} />
        <Route path="/market/jobs/:id" element={<LaborMarketLayout><JobRoleDetails /></LaborMarketLayout>} />
        <Route path="/market/skills" element={<LaborMarketLayout><SkillsDemand /></LaborMarketLayout>} />
        <Route path="/market/companies" element={<LaborMarketLayout><CompanyInsights /></LaborMarketLayout>} />
        <Route path="/market/emerging" element={<LaborMarketLayout><EmergingRoles /></LaborMarketLayout>} />
        <Route path="/market/recommend" element={<LaborMarketLayout><CareerRecommender /></LaborMarketLayout>} />
        <Route path="/market/recommend/:id" element={<LaborMarketLayout><RecommendationDetail /></LaborMarketLayout>} />
        <Route path="/market/gap-analysis" element={<LaborMarketLayout><SkillGapAnalyzer /></LaborMarketLayout>} />
        <Route path="/market/trends" element={<LaborMarketLayout><MarketTrends /></LaborMarketLayout>} />
        <Route path="/market/learning-path" element={<LaborMarketLayout><LearningPathGenerator /></LaborMarketLayout>} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/voice" element={<VoiceBot />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
