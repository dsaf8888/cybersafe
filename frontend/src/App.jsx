import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage4 from './pages/landing/LandingPage4'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsAndConditions from './pages/legal/TermsAndConditions'
import AboutUs from './pages/AboutUs'
import FAQ from './pages/FAQ'
import Guides from './pages/Guides'
import SafetyTips from './pages/SafetyTips'
import ReportIssue from './pages/ReportIssue'
import HelpCenter from './pages/HelpCenter'
import Blog from './pages/blog/Blog'
import BlogPost from './pages/blog/BlogPost'
import CreateBlog from './pages/blog/CreateBlog'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage4 />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/create" element={<CreateBlog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/safety-tips" element={<SafetyTips />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/help" element={<HelpCenter />} />
      </Routes>
    </BrowserRouter>
  )
}
