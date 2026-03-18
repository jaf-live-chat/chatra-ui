import { useState, useEffect, useRef, useMemo } from "react";
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Smile,
  Plus,
  Globe,
  Monitor,
  MapPin,
  Clock,
  Link as LinkIcon,
  Zap,
  Search,
  X,
  CornerDownLeft,
  User,
} from "lucide-react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Avatar from "@mui/material/Avatar";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";

import { SEED_REPLIES, type QuickReply } from "./QuickRepliesView";

const QR_STORAGE_KEY = "jaf_quick_replies";

const CATEGORY_COLORS: Record<string, string> = {
  Greetings: "#a855f7",
  General:   "#3b82f6",
  Billing:   "#f59e0b",
  Technical: "#0891b2",
};

interface Visitor {
  id: string;
  name: string;
  message: string;
  status: string;
  timeInQueue?: string;
  sessionId?: string;
  messages?: any[];
}

interface ActiveChatViewProps {
  visitor: Visitor;
  onEndChat: (messages: Message[], length: string) => void;
}

interface Message {
  id: string;
  sender: 'visitor' | 'agent';
  text: string;
  timestamp: string;
}

const avatarColors = ['#FF5A1F', '#1F75FE', '#A855F7', '#B48600', '#0891b2'];

export function ActiveChatView({ visitor, onEndChat }: ActiveChatViewProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"details" | "quick-replies">("details");
  const [qrSearch, setQrSearch] = useState("");
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(() => {
    try {
      const stored = localStorage.getItem(QR_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* silently fail */ }
    return SEED_REPLIES;
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  const getInitialMessages = (): Message[] => {
    if (visitor.sessionId && visitor.messages && visitor.messages.length > 0) {
      return visitor.messages.map((m: any, i: number) => ({
        id: `${i}-${Date.now()}`,
        sender: m.sender === 'visitor' ? 'visitor' as const : 'agent' as const,
        text: m.text,
        timestamp: m.timestamp || '12:00 PM',
      }));
    }
    return [{
      id: '1',
      sender: 'visitor' as const,
      text: visitor.message,
      timestamp: '12:00 PM'
    }];
  };

  const [messages, setMessages] = useState<Message[]>(getInitialMessages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!visitor.sessionId) return;

    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem("jaf_live_queue");
        if (!stored) return;
        const queue = JSON.parse(stored);
        const entry = queue.find((q: any) => q.sessionId === visitor.sessionId);
        if (!entry || !entry.messages) return;

        const visitorMsgs = entry.messages.filter((m: any) => m.sender === "visitor");
        const currentVisitorMsgCount = messages.filter(m => m.sender === "visitor").length;
        if (visitorMsgs.length > currentVisitorMsgCount) {
          const newMsgs = visitorMsgs.slice(currentVisitorMsgCount);
          const formattedNewMsgs: Message[] = newMsgs.map((m: any, i: number) => ({
            id: `visitor-${Date.now()}-${i}`,
            sender: 'visitor' as const,
            text: m.text,
            timestamp: m.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setMessages(prev => [...prev, ...formattedNewMsgs]);
        }
      } catch (e) {
        // silently fail
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [visitor.sessionId, messages]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      text: chatMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setChatMessage("");

    if (visitor.sessionId) {
      try {
        const key = `jaf_admin_replies_${visitor.sessionId}`;
        const stored = localStorage.getItem(key);
        const replies = stored ? JSON.parse(stored) : [];
        replies.push({
          id: newMessage.id,
          text: newMessage.text,
          time: newMessage.timestamp,
        });
        localStorage.setItem(key, JSON.stringify(replies));
        window.dispatchEvent(new Event("jaf_admin_reply"));
      } catch (e) {
        // silently fail
      }
    }
  };
  
  const charCode = visitor.id.charCodeAt(visitor.id.length - 1) || 0;
  const bgColor = avatarColors[charCode % avatarColors.length];

  // Sync quick replies from localStorage when tab becomes active
  useEffect(() => {
    if (sidebarTab !== "quick-replies") return;
    try {
      const stored = localStorage.getItem(QR_STORAGE_KEY);
      setQuickReplies(stored ? JSON.parse(stored) : SEED_REPLIES);
    } catch { /* silently fail */ }
  }, [sidebarTab]);

  const filteredReplies = useMemo(() => {
    const q = qrSearch.trim().toLowerCase();
    if (!q) return quickReplies;
    return quickReplies.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.shortcut.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q)
    );
  }, [quickReplies, qrSearch]);

  return (
    <Box sx={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column", bgcolor: "grey.50", p: { xs: 2, lg: 3 } }}>
      <Paper elevation={0} sx={{ flex: 1, width: "100%", mx: "auto", display: "flex", flexDirection: "row", overflow: "hidden", border: "1px solid", borderColor: "grey.200", borderRadius: 3 }}>
        
        {/* Main Chat Area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        
        {/* Chat Header */}
        <Box sx={{ height: 64, borderBottom: "1px solid", borderColor: "grey.200", bgcolor: "background.paper", display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => onEndChat(messages, "5m 20s")} sx={{ ml: -1 }} size="small">
              <ArrowLeft size={20} />
            </IconButton>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: bgColor, width: 40, height: 40, fontWeight: 600 }}>
                {visitor.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1 }}>{visitor.name}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10b981" }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Active
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Button 
              variant="contained" 
              color="error" 
              size="small"
              sx={{ bgcolor: "#dc2626", color: "#fff", fontSize: "0.75rem", px: 1.5, py: 0.5, "&:hover": { bgcolor: "#b91c1c" } }}
              onClick={() => setShowEndConfirm(true)}
            >
              End Chat
            </Button>
          </Stack>
        </Box>

        {/* Chat Messages Area */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "grey.50", display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box sx={{ textAlign: "center" }}>
            <Chip label="Chat started from Queue" size="small" sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "grey.200", fontWeight: 500, color: "text.secondary" }} />
          </Box>
          
          {messages.map((msg) => (
            <Box key={msg.id} sx={{ display: "flex", justifyContent: msg.sender === 'visitor' ? 'flex-start' : 'flex-end' }}>
              <Stack direction={msg.sender === 'visitor' ? 'row' : 'row-reverse'} spacing={1.5} sx={{ maxWidth: "65%", alignItems: "flex-end" }}>
                {msg.sender === 'visitor' ? (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: bgColor, fontSize: "0.75rem", fontWeight: 600, mb: 0, flexShrink: 0 }}>
                    {visitor.name.charAt(0).toUpperCase()}
                  </Avatar>
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "grey.800", fontSize: "0.75rem", fontWeight: 600, mb: 0, flexShrink: 0 }}>
                    You
                  </Avatar>
                )}
                <Stack spacing={0.5} alignItems={msg.sender === 'agent' ? 'flex-end' : 'flex-start'}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ ml: msg.sender === 'visitor' ? 0.5 : 0, mr: msg.sender === 'visitor' ? 0 : 0.5 }}>
                    {msg.sender === 'visitor' ? visitor.name : 'You'} • {msg.timestamp}
                  </Typography>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      px: 2, py: 1, 
                      bgcolor: msg.sender === 'visitor' ? '#e5e7eb' : 'secondary.main', 
                      color: msg.sender === 'visitor' ? 'text.primary' : 'secondary.contrastText',
                      border: "none",
                      borderRadius: "18px",
                      borderBottomLeftRadius: msg.sender === 'visitor' ? "4px" : "18px",
                      borderBottomRightRadius: msg.sender === 'agent' ? "4px" : "18px",
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                  </Paper>
                </Stack>
              </Stack>
            </Box>
          ))}
          <div ref={bottomRef}></div>
        </Box>

        {/* Input Area */}
        <Box sx={{ p: 2.5, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "grey.200", flexShrink: 0 }}>
          <Paper elevation={0} sx={{ display: "flex", alignItems: "flex-end", gap: 0, bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200", borderRadius: 2, p: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5, px: 0.5 }}>
              <IconButton 
                size="small"
                onClick={() => setShowAttachments(!showAttachments)}
                sx={{ 
                  transition: "all 0.2s",
                  bgcolor: showAttachments ? "secondary.main" : "transparent",
                  color: showAttachments ? "white" : "text.secondary",
                  transform: showAttachments ? "rotate(45deg)" : "none",
                  "&:hover": { bgcolor: showAttachments ? "secondary.dark" : "grey.200" }
                }}
              >
                <Plus size={18} />
              </IconButton>
              
              <Box sx={{ 
                display: "flex", alignItems: "center", overflow: "hidden", 
                transition: "all 0.3s ease-in-out", 
                width: showAttachments ? 100 : 0, 
                opacity: showAttachments ? 1 : 0,
                gap: showAttachments ? 0.5 : 0
              }}>
                <IconButton size="small"><Paperclip size={18} /></IconButton>
                <IconButton size="small"><ImageIcon size={18} /></IconButton>
                <IconButton size="small"><Smile size={18} /></IconButton>
              </Box>
            </Stack>
            
            <InputBase
              placeholder="Type your reply..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              multiline
              maxRows={3}
              sx={{ flex: 1, py: 0.75, px: 1.5, fontSize: "0.875rem", minHeight: 36, ml: 0 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            
            <IconButton 
              color="secondary"
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
              sx={{ mb: 0.5, bgcolor: "secondary.main", color: "white", borderRadius: 1.5, "&:hover": { bgcolor: "secondary.dark" }, "&.Mui-disabled": { bgcolor: "grey.300", color: "white" } }}
            >
              <Send size={16} style={{ marginLeft: 2 }} />
            </IconButton>
          </Paper>
        </Box>

        </Box>

        {/* Visitor Info Sidebar */}
        <Box sx={{ width: 280, borderLeft: "1px solid", borderColor: "grey.200", bgcolor: "background.paper", display: { xs: "none", md: "flex" }, flexDirection: "column", flexShrink: 0 }}>
          {/* Visitor Profile */}
          <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "grey.200", textAlign: "center" }}>
            <Avatar sx={{ bgcolor: bgColor, width: 48, height: 48, fontWeight: 700, fontSize: "1.1rem", mx: "auto", mb: 1 }}>
              {visitor.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{visitor.name}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center" sx={{ mt: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#10b981" }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>Online</Typography>
            </Stack>
          </Box>

          {/* Tab switcher */}
          <Box sx={{ display: "flex", borderBottom: "1px solid", borderColor: "grey.200", flexShrink: 0 }}>
            {([
              { id: "details",       label: "Details", icon: <User size={13} /> },
              { id: "quick-replies", label: "Quick Replies", icon: <Zap size={13} /> },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  padding: "10px 6px",
                  fontSize: "0.72rem",
                  fontWeight: sidebarTab === tab.id ? 700 : 500,
                  color: sidebarTab === tab.id ? "#0891b2" : "#6b7280",
                  borderBottom: sidebarTab === tab.id ? "2px solid #0891b2" : "2px solid transparent",
                  background: "none",
                  border: "none",
                  borderBottomWidth: 2,
                  borderBottomStyle: "solid",
                  borderBottomColor: sidebarTab === tab.id ? "#0891b2" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </Box>

          {/* Tab: Details */}
          {sidebarTab === "details" && (
            <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 1, mb: 1.5, display: "block" }}>
                Session Details
              </Typography>
              <Stack spacing={1.75} sx={{ mb: 2.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Session ID</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace", mt: 0.25, fontSize: "0.72rem" }}>{visitor.sessionId || visitor.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={visitor.status || "Active"} size="small" sx={{ bgcolor: "#ecfdf5", color: "#065f46", fontWeight: 600, fontSize: "0.7rem" }} />
                  </Box>
                </Box>
                {visitor.timeInQueue && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>Time in Queue</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>{visitor.timeInQueue}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Messages</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>{messages.length}</Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 1, mb: 1.5, display: "block" }}>
                Visitor Metadata
              </Typography>
              <Stack spacing={1.5}>
                {[
                  { icon: <Globe size={12} />, label: "Browser", value: "Chrome 122.0" },
                  { icon: <Monitor size={12} />, label: "OS / Device", value: "Windows 11 • Desktop" },
                  { icon: <MapPin size={12} />, label: "Location", value: "New York, NY, US" },
                  { icon: <Clock size={12} />, label: "Local Time", value: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }) },
                  { icon: <Globe size={12} />, label: "IP Address", value: "192.168.1.***" },
                  { icon: <LinkIcon size={12} />, label: "Current Page", value: "/pricing" },
                  { icon: <LinkIcon size={12} />, label: "Referrer", value: "google.com" },
                ].map(({ icon, label, value }) => (
                  <Box key={label}>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.25, color: "text.secondary" }}>
                      {icon}
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600, pl: 2.25, fontSize: "0.78rem", wordBreak: "break-all" }}>{value}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Tab: Quick Replies */}
          {sidebarTab === "quick-replies" && (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Search */}
              <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "grey.100", flexShrink: 0 }}>
                <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Box sx={{ position: "absolute", left: 8, color: "text.secondary", display: "flex", pointerEvents: "none" }}>
                    <Search size={13} />
                  </Box>
                  <InputBase
                    placeholder="Search replies…"
                    value={qrSearch}
                    onChange={(e) => setQrSearch(e.target.value)}
                    sx={{
                      width: "100%", pl: 3.5, pr: qrSearch ? 3.5 : 1.5, py: 0.75,
                      bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200",
                      borderRadius: 1.5, fontSize: "0.78rem",
                      "&.Mui-focused": { borderColor: "#0891b2", boxShadow: "0 0 0 2px #0891b226" },
                    }}
                  />
                  {qrSearch && (
                    <Box
                      component="button"
                      onClick={() => setQrSearch("")}
                      sx={{ position: "absolute", right: 8, color: "text.secondary", display: "flex", cursor: "pointer", background: "none", border: "none", p: 0 }}
                    >
                      <X size={13} />
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Hint */}
              <Box sx={{ px: 1.5, py: 1, bgcolor: "#0891b208", borderBottom: "1px solid", borderColor: "grey.100", display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                <CornerDownLeft size={11} color="#0891b2" />
                <Typography variant="caption" sx={{ color: "#0e7490", fontSize: "0.68rem" }}>
                  Click a reply to insert it into the message box
                </Typography>
              </Box>

              {/* List */}
              <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
                {filteredReplies.length > 0 ? (
                  <Stack spacing={0.75}>
                    {filteredReplies.map((reply) => {
                      const dotColor = CATEGORY_COLORS[reply.category] ?? "#6b7280";
                      return (
                        <Box
                          key={reply.id}
                          component="button"
                          onClick={() => setChatMessage(reply.message)}
                          sx={{
                            width: "100%", textAlign: "left", p: 1.25, borderRadius: 1.5,
                            border: "1px solid", borderColor: "grey.200",
                            bgcolor: "background.paper",
                            cursor: "pointer", transition: "all 0.15s",
                            "&:hover": { bgcolor: "#0891b208", borderColor: "#0891b230" },
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: dotColor, flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "grey.900", fontSize: "0.72rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {reply.title}
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#0891b2", bgcolor: "#0891b20f", px: 0.75, py: 0.25, borderRadius: 0.75, flexShrink: 0 }}>
                              {reply.shortcut}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {reply.message}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1 }}>
                      <Zap size={16} color="#9ca3af" />
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                      {qrSearch ? "No replies match your search" : "No quick replies saved yet"}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Sidebar Footer */}
          <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "grey.200", flexShrink: 0 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", display: "block", textAlign: "center" }}>
              {quickReplies.length} quick {quickReplies.length === 1 ? "reply" : "replies"} available
            </Typography>
          </Box>
        </Box>

      </Paper>

      {/* Confirmation Modal */}
      <Dialog open={showEndConfirm} onClose={() => setShowEndConfirm(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>End Chat</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to end this chat session? This will mark the conversation as resolved and update your status back to Online.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "grey.50", borderTop: "1px solid", borderColor: "grey.200" }}>
          <Button onClick={() => setShowEndConfirm(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button 
            onClick={() => {
              setShowEndConfirm(false);
              onEndChat(messages, "5m 20s");
            }} 
            variant="contained"
            color="error"
            sx={{ fontWeight: 600 }}
          >
            Confirm End Chat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}