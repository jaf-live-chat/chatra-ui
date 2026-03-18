import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Globe,
  Camera,
  Save,
  Eye,
  EyeOff,
  Check,
  Code,
  Copy,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";

export function AccountSettingsView() {
  const [activeSection, setActiveSection] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [integrationRevealed, setIntegrationRevealed] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [verifyError, setVerifyError] = useState(false);

  const handleCopy = (text: string, id: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@jaflivechat.com",
    phone: "+1 (555) 123-4567",
    role: "Owner",
    timezone: "America/New_York",
    language: "English",
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNewChat: true,
    emailMissedChat: true,
    emailWeeklyReport: false,
    pushNewMessage: true,
    pushAgentOffline: false,
    pushQueueAlert: true,
  });

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    twoFactorEnabled: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleVerifySubmit = () => {
    if (verifyPassword.length >= 1) {
      setIntegrationRevealed(true);
      setShowVerifyModal(false);
      setVerifyPassword("");
      setVerifyError(false);
      setShowVerifyPassword(false);
    } else {
      setVerifyError(true);
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "integration", label: "Integration", icon: Code },
  ];

  const widgetScript = `<!-- Live Chat Widget -->\n<script>\n  window.LiveChatConfig = {\n    apiUrl: 'https://depauperate-destiny-superdelicate.ngrok-free.dev/api/v1',\n    socketUrl: 'https://depauperate-destiny-superdelicate.ngrok-free.dev'\n  };\n</script>\n<script src="https://timora-live-chat.vercel.app/widget/live-chat-widget.js"></script>`;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your profile, notifications, and security preferences.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left ${
                    activeSection === section.id
                      ? "bg-cyan-50 text-cyan-700 border-l-[3px] border-cyan-600"
                      : "text-gray-600 hover:bg-gray-50 border-l-[3px] border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Avatar Area */}
              <div className="p-6 border-b border-gray-100 flex items-center gap-5">
                <div className="relative group">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1622169804256-0eb6873ff441?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMGFkbWluJTIwYXZhdGFyfGVufDF8fHx8MTc3MzYyNzk0MXww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                  <button className="absolute inset-0 w-20 h-20 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  <span
                    className="inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "#0891B21A",
                      color: "#0891b2",
                    }}
                  >
                    {profile.role}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-colors"
                      placeholder="Admin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-colors"
                      placeholder="User"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Language
                    </label>
                    <select
                      value={profile.language}
                      onChange={(e) =>
                        setProfile({ ...profile, language: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-colors bg-white"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" /> Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Notification Preferences
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose how and when you want to be notified.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" /> Email
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        key: "emailNewChat" as const,
                        label: "New chat started",
                        desc: "Get notified when a visitor starts a new chat",
                      },
                      {
                        key: "emailMissedChat" as const,
                        label: "Missed chats",
                        desc: "Alert when a chat goes unanswered",
                      },
                      {
                        key: "emailWeeklyReport" as const,
                        label: "Weekly report",
                        desc: "Summary of chat activity every Monday",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [item.key]: !notifications[item.key],
                            })
                          }
                          className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer ${
                            notifications[item.key]
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                              notifications[item.key]
                                ? "translate-x-[18px]"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Push Notifications */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-400" /> Push
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        key: "pushNewMessage" as const,
                        label: "New messages",
                        desc: "Browser push for incoming messages",
                      },
                      {
                        key: "pushAgentOffline" as const,
                        label: "Agent goes offline",
                        desc: "Alert when a team member disconnects",
                      },
                      {
                        key: "pushQueueAlert" as const,
                        label: "Queue overload",
                        desc: "Notify when queue exceeds 10 visitors",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [item.key]: !notifications[item.key],
                            })
                          }
                          className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer ${
                            notifications[item.key]
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                              notifications[item.key]
                                ? "translate-x-[18px]"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" /> Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Security
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update your password and manage two-factor authentication.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Change Password */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" /> Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={security.currentPassword}
                          onChange={(e) =>
                            setSecurity({
                              ...security,
                              currentPassword: e.target.value,
                            })
                          }
                          placeholder="Enter current password"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-colors pr-10"
                        />
                        <button
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={security.newPassword}
                          onChange={(e) =>
                            setSecurity({
                              ...security,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="Enter new password"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 transition-colors pr-10"
                        />
                        <button
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        Must be at least 8 characters with a number and special
                        character.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Two-Factor */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" /> Two-Factor
                    Authentication
                  </h3>
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {security.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setSecurity({
                          ...security,
                          twoFactorEnabled: !security.twoFactorEnabled,
                        })
                      }
                      className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer ${
                        security.twoFactorEnabled
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          security.twoFactorEnabled
                            ? "translate-x-[18px]"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" /> Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Update Security
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Integration Section */}
          {activeSection === "integration" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Integration
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Your API key and live chat widget installation code.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* API Key */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" /> API Key
                  </h3>
                  <div className="flex items-center gap-3">
                    <AnimatePresence mode="wait">
                      <motion.code
                        key={integrationRevealed ? "revealed" : "hidden"}
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-mono select-all"
                      >
                        {integrationRevealed ? "jaf_7soh2kez6vabraidwkdrd8" : "••••••••••••••••••••••••••"}
                      </motion.code>
                    </AnimatePresence>
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => {
                        if (integrationRevealed) {
                          handleCopy("jaf_7soh2kez6vabraidwkdrd8", "apiKey");
                        } else {
                          setShowVerifyModal(true);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-2.5 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      <AnimatePresence mode="wait">
                        {!integrationRevealed ? (
                          <motion.span key="verify" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" /> Verify
                          </motion.span>
                        ) : copied === "apiKey" ? (
                          <motion.span key="copied" initial={{ opacity: 0, scale: 0.8, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="flex items-center gap-1.5 text-green-600">
                            <Check className="w-4 h-4" /> Copied!
                          </motion.span>
                        ) : (
                          <motion.span key="copy" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="flex items-center gap-1.5">
                            <Copy className="w-4 h-4" /> Copy
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Widget Script */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Code className="w-4 h-4 text-gray-400" /> Widget Installation
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Paste this snippet before the closing <code className="text-cyan-600">&lt;/body&gt;</code> tag of your website.
                  </p>
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      <motion.pre
                        key={integrationRevealed ? "revealed" : "hidden"}
                        initial={{ opacity: 0, filter: "blur(4px)", y: 6 }}
                        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        exit={{ opacity: 0, filter: "blur(4px)", y: -6 }}
                        transition={{ duration: 0.35, delay: 0.05 }}
                        className="px-4 py-3.5 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap"
                      >
{integrationRevealed
  ? `<!-- Live Chat Widget -->
<script>
  window.LiveChatConfig = {
    apiUrl: 'https://depauperate-destiny-superdelicate.ngrok-free.dev/api/v1',
    socketUrl: 'https://depauperate-destiny-superdelicate.ngrok-free.dev'
  };
</script>
<script src="https://timora-live-chat.vercel.app/widget/live-chat-widget.js"></script>`
  : `<!-- ••••••••••••••••••• -->
<••••••>
  ••••••.•••••••••••••••• = {
    ••••••: '•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••',
    •••••••••: '•••••••••••••••••••••••••••••••••••••••••••••••••••••••••'
  };
</••••••>
<•••••• •••="••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"></••••••>`}
                      </motion.pre>
                    </AnimatePresence>
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        if (integrationRevealed) {
                          handleCopy(widgetScript, "widget");
                        } else {
                          setShowVerifyModal(true);
                        }
                      }}
                      className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-xs font-medium transition-colors cursor-pointer"
                    >
                      <AnimatePresence mode="wait">
                        {!integrationRevealed ? (
                          <motion.span key="verify" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> Verify
                          </motion.span>
                        ) : copied === "widget" ? (
                          <motion.span key="copied" initial={{ opacity: 0, scale: 0.8, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="flex items-center gap-1.5 text-green-400">
                            <Check className="w-3.5 h-3.5" /> Copied!
                          </motion.span>
                        ) : (
                          <motion.span key="copy" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="flex items-center gap-1.5">
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => {
              setShowVerifyModal(false);
              setVerifyPassword("");
              setVerifyError(false);
              setShowVerifyPassword(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                    className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center"
                  >
                    <Lock className="w-5 h-5 text-cyan-600" />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Verify Your Identity</h3>
                    <p className="text-xs text-gray-500">Enter your password to reveal credentials</p>
                  </div>
                </div>
                <div className="relative mb-2">
                  <input
                    type={showVerifyPassword ? "text" : "password"}
                    value={verifyPassword}
                    onChange={(e) => {
                      setVerifyPassword(e.target.value);
                      setVerifyError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleVerifySubmit();
                    }}
                    placeholder="Enter your password"
                    autoFocus
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 transition-colors pr-10 ${
                      verifyError
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:ring-cyan-100 focus:border-cyan-400"
                    }`}
                  />
                  <button
                    onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showVerifyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {verifyError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-red-500 mb-2"
                    >
                      Please enter your password.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowVerifyModal(false);
                    setVerifyPassword("");
                    setVerifyError(false);
                    setShowVerifyPassword(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleVerifySubmit}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  Verify
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}