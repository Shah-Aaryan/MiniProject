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
import LearningPath from "./components/learningPath/LearningPath";
import AdvancedFeatures from "./components/navigation/AdvancedFeatures";
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
        <Route path="/adaptive-quiz" element={<AdaptiveQuiz userId={localStorage.getItem('userId')} />} />
        <Route path="/learning-path" element={<LearningPath userId={localStorage.getItem('userId')} />} />
        <Route path="/features" element={<AdvancedFeatures />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/voice" element={<VoiceBot />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
