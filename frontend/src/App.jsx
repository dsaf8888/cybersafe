import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage4 from './pages/landing/LandingPage4'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsAndConditions from './pages/legal/TermsAndConditions'
import AboutUs from './pages/AboutUs'
import FAQ from './pages/FAQ'
import Guides from './pages/Guides'
import GuideView from './pages/GuideView'
import CreateGuide from './pages/CreateGuide'
import SafetyTips from './pages/SafetyTips'
import ReportIssue from './pages/ReportIssue'
import HelpCenter from './pages/HelpCenter'
import Blog from './pages/blog/Blog'
import BlogPost from './pages/blog/BlogPost'
import CreateBlog from './pages/blog/CreateBlog'
import NetworkSecurityTest from './pages/tools/NetworkSecurityTest'
import URLScanner from './pages/tools/URLScanner'
import PasswordStrength from './pages/tools/PasswordStrength'
import EmailBreachChecker from './pages/tools/EmailBreachChecker'
import PhishingQuiz from './pages/tools/PhishingQuiz'
import AccountSecurityScore from './pages/tools/AccountSecurityScore'
import BrowserSecurity from './pages/tools/BrowserSecurity'
import ScamMessageAnalyzer from './pages/tools/ScamMessageAnalyzer'
import FileSafetyChecker from './pages/tools/FileSafetyChecker'
import WiFiSafetyChecker from './pages/tools/WiFiSafetyChecker'
import SocialPrivacyChecker from './pages/tools/SocialPrivacyChecker'
import WebsitePerformance from './pages/tools/WebsitePerformance'
import SetContent from './pages/admin/SetContent'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage4 />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/create" element={<CreateBlog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/tools/network-security" element={<NetworkSecurityTest />} />
        <Route path="/tools/url-scanner" element={<URLScanner />} />
        <Route path="/tools/password-strength" element={<PasswordStrength />} />
        <Route path="/tools/email-breach" element={<EmailBreachChecker />} />
        <Route path="/tools/phishing-quiz" element={<PhishingQuiz />} />
        <Route path="/tools/account-security-score" element={<AccountSecurityScore />} />
        <Route path="/tools/browser-security" element={<BrowserSecurity />} />
        <Route path="/tools/scam-analyzer" element={<ScamMessageAnalyzer />} />
        <Route path="/tools/file-safety" element={<FileSafetyChecker />} />
        <Route path="/tools/wifi-safety" element={<WiFiSafetyChecker />} />
        <Route path="/tools/social-privacy" element={<SocialPrivacyChecker />} />
        <Route path="/tools/website-performance" element={<WebsitePerformance />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/guides/create" element={<CreateGuide />} />
        <Route path="/guides/:slug" element={<GuideView />} />
        <Route path="/safety-tips" element={<SafetyTips />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/set-content" element={<SetContent />} />
      </Routes>
    </BrowserRouter>
  )
}
