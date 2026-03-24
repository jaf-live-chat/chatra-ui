import { useState } from "react";
import { 
  Search, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Send,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  Tag,
  MessageSquare,
  Globe,
  Timer,
  Plus
} from "lucide-react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";

const CHAT_LIST = [
  { id: 1, name: "Alice Johnson", msg: "I have a question about the Pro plan...", time: "2m", unread: 2, status: "online", avatar: "A", ticketStatus: "active" },
  { id: 2, name: "Michael Smith", msg: "Does this integrate with Salesforce?", time: "5m", unread: 0, status: "online", avatar: "M", ticketStatus: "active" },
  { id: 3, name: "Emily Davis", msg: "My card was declined, can you help?", time: "12m", unread: 1, status: "offline", avatar: "E", ticketStatus: "active" },
  { id: 4, name: "James Wilson", msg: "Thanks, that solved my issue!", time: "1h", unread: 0, status: "offline", avatar: "J", ticketStatus: "ended" },
  { id: 5, name: "Sarah Brown", msg: "Where can I find the API key?", time: "3h", unread: 0, status: "offline", avatar: "S", ticketStatus: "ended" },
];

const MESSAGES = [
  { id: 1, sender: "Alice Johnson", text: "Hi, I'm looking at your pricing page.", time: "10:30 AM", isMine: false },
  { id: 2, sender: "Alice Johnson", text: "I have a question about the Pro plan...", time: "10:31 AM", isMine: false },
  { id: 3, sender: "You", text: "Hello Alice! I'd be happy to help. What specific questions do you have about the Pro plan?", time: "10:32 AM", isMine: true },
  { id: 4, sender: "Alice Johnson", text: "Does it include priority support and custom branding?", time: "10:33 AM", isMine: false },
];

const ConversationsView = () => {
  const [activeChat, setActiveChat] = useState(CHAT_LIST[0]);
  const [messageInput, setMessageInput] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [chatFilter, setChatFilter] = useState("Active");

  const filteredChats = CHAT_LIST.filter(chat => {
    if (chatFilter === "All") return true;
    return chat.ticketStatus === chatFilter.toLowerCase();
  });

  const getAvatarColor = (id: number) => {
    const colors = ['#FF5A1F', '#1F75FE', '#A855F7', '#B48600', '#0891b2'];
    return colors[id % colors.length];
  };

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)", bgcolor: "background.paper", overflow: "hidden" }}>
      
      {/* Left Panel: Conversation List */}
      <Box sx={{ width: 320, borderRight: "1px solid", borderColor: "grey.200", display: "flex", flexDirection: "column", bgcolor: "grey.50" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "grey.200", bgcolor: "background.paper" }}>
          <Stack direction="row" alignItems="center" justifyItems="space-between" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "grey.900" }}>Inbox</Typography>
            <Paper elevation={0} sx={{ p: 0.5, bgcolor: "grey.100", display: "flex", borderRadius: 2 }}>
              {['Active', 'Ended', 'All'].map(filter => (
                <Button 
                  key={filter}
                  onClick={() => setChatFilter(filter)}
                  sx={{ 
                    minWidth: 0, px: 1.5, py: 0.5, borderRadius: 1.5,
                    bgcolor: chatFilter === filter ? "background.paper" : "transparent",
                    color: chatFilter === filter ? "grey.900" : "text.secondary",
                    fontWeight: 600, fontSize: "0.75rem",
                    boxShadow: chatFilter === filter ? 1 : 0,
                    "&:hover": { bgcolor: chatFilter === filter ? "background.paper" : "grey.200" }
                  }}
                >
                  {filter}
                </Button>
              ))}
            </Paper>
          </Stack>
          <Box sx={{ position: "relative" }}>
            <Box sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "text.secondary", display: "flex" }}>
              <Search size={18} />
            </Box>
            <InputBase 
              placeholder="Search messages..." 
              sx={{ 
                w: "100%", pl: 4.5, pr: 2, py: 1, 
                bgcolor: "grey.100", border: "1px solid transparent", 
                borderRadius: 2, fontSize: "0.875rem",
                "&.Mui-focused": { bgcolor: "background.paper", borderColor: "secondary.main" }
              }}
              fullWidth
            />
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {filteredChats.map((chat) => (
            <Box 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              sx={{ 
                p: 2, borderBottom: "1px solid", borderColor: "grey.100", cursor: "pointer", 
                display: "flex", gap: 1.5, transition: "background-color 0.2s",
                bgcolor: activeChat.id === chat.id ? "error.lighter" : "background.paper",
                "&:hover": { bgcolor: activeChat.id === chat.id ? "error.lighter" : "grey.50" }
              }}
            >
              <Box sx={{ position: "relative" }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(chat.id), fontWeight: 700 }}>
                  {chat.avatar}
                </Avatar>
                <Box sx={{ 
                  position: "absolute", bottom: 0, right: 0, width: 12, height: 12, 
                  borderRadius: "50%", border: "2px solid white", 
                  bgcolor: chat.status === 'online' ? "success.main" : "grey.400" 
                }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: activeChat.id === chat.id ? 700 : 600, color: "grey.900" }}>
                    {chat.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap", ml: 1 }}>
                    {chat.time}
                  </Typography>
                </Stack>
                <Typography variant="body2" noWrap sx={{ color: chat.unread > 0 ? "grey.900" : "text.secondary", fontWeight: chat.unread > 0 ? 600 : 400 }}>
                  {chat.msg}
                </Typography>
              </Box>
              {chat.unread > 0 && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: "secondary.main", color: "white", fontSize: "0.625rem", fontWeight: 700, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {chat.unread}
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Center Panel: Active Chat */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, bgcolor: "background.paper" }}>
        <Box sx={{ height: 64, borderBottom: "1px solid", borderColor: "grey.200", display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, bgcolor: "background.paper" }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ position: "relative" }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: getAvatarColor(activeChat.id), fontWeight: 700 }}>
                {activeChat.avatar}
              </Avatar>
              <Box sx={{ 
                position: "absolute", bottom: 0, right: 0, width: 12, height: 12, 
                borderRadius: "50%", border: "2px solid white", 
                bgcolor: activeChat.status === 'online' ? "success.main" : "grey.400" 
              }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeChat.name}</Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }} />
                <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>Currently viewing Pricing Page</Typography>
              </Stack>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Button 
              variant="outlined"
              size="small"
              startIcon={<CheckCircle2 size={16} />}
              sx={{ color: "grey.700", borderColor: "grey.300", bgcolor: "grey.50", "&:hover": { bgcolor: "grey.100", borderColor: "grey.400" } }}
            >
              Resolve
            </Button>
            <IconButton size="small"><MoreVertical size={20} /></IconButton>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "grey.50", display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ textAlign: "center", my: 2 }}>
            <Chip label="Today, 10:30 AM" size="small" sx={{ bgcolor: "grey.200", color: "text.secondary", fontWeight: 600 }} />
          </Box>
          
          {MESSAGES.map((message) => (
            <Box key={message.id} sx={{ display: "flex", justifyContent: message.isMine ? 'flex-end' : 'flex-start' }}>
              <Stack direction={message.isMine ? 'row-reverse' : 'row'} spacing={1.5} sx={{ maxWidth: "80%" }}>
                {!message.isMine && (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: getAvatarColor(activeChat.id), fontSize: "0.75rem", fontWeight: 600, mt: 0.5, flexShrink: 0 }}>
                    {activeChat.avatar}
                  </Avatar>
                )}
                <Stack spacing={0.5} alignItems={message.isMine ? 'flex-end' : 'flex-start'}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      px: 2, py: 1.5, 
                      bgcolor: message.isMine ? 'secondary.main' : 'background.paper', 
                      color: message.isMine ? 'white' : 'grey.900',
                      border: "1px solid",
                      borderColor: message.isMine ? 'secondary.dark' : 'grey.200',
                      borderRadius: 3,
                      borderBottomRightRadius: message.isMine ? 2 : 12,
                      borderBottomLeftRadius: !message.isMine ? 2 : 12,
                      boxShadow: message.isMine ? 0 : 1
                    }}
                  >
                    <Typography variant="body2">{message.text}</Typography>
                  </Paper>
                  <Typography variant="caption" color="text.disabled" sx={{ px: 0.5 }}>{message.time}</Typography>
                </Stack>
              </Stack>
            </Box>
          ))}
          
          {/* Typing Indicator */}
          {activeChat.id === 1 && (
            <Box sx={{ display: "flex", justifyContent: 'flex-start' }}>
              <Stack direction='row' spacing={1.5} sx={{ maxWidth: "80%" }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: getAvatarColor(activeChat.id), fontSize: "0.75rem", fontWeight: 600, mt: 0.5, flexShrink: 0 }}>
                  {activeChat.avatar}
                </Avatar>
                <Stack spacing={0.5} alignItems='flex-start'>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      px: 2, py: 1.5, height: 42,
                      bgcolor: 'background.paper', 
                      border: "1px solid", borderColor: 'grey.200',
                      borderRadius: 3, borderBottomLeftRadius: 2,
                      boxShadow: 1, display: "flex", alignItems: "center", gap: 0.5
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "grey.400", animation: "pulse 1.5s infinite" }} />
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "grey.400", animation: "pulse 1.5s infinite", animationDelay: "0.2s" }} />
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "grey.400", animation: "pulse 1.5s infinite", animationDelay: "0.4s" }} />
                  </Paper>
                  <Typography variant="caption" color="text.disabled" sx={{ px: 0.5 }}>{activeChat.name} is typing...</Typography>
                </Stack>
              </Stack>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 2, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "grey.200" }}>
          <Paper elevation={0} sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200", borderRadius: 2, p: 0.5, pl: 1 }}>
            <IconButton 
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ 
                bgcolor: anchorEl ? "secondary.light" : "transparent",
                color: anchorEl ? "secondary.dark" : "text.secondary",
                "&:hover": { bgcolor: anchorEl ? "secondary.light" : "grey.200" }
              }}
            >
              <Plus size={20} style={{ transform: anchorEl ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
            </IconButton>

            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              PaperProps={{ sx: { mb: 1, width: 200, borderRadius: 2, p: 1 } }}
            >
              <MenuItem onClick={() => setAnchorEl(null)} sx={{ borderRadius: 1, py: 1 }}><Paperclip size={16} style={{ marginRight: 12, color: "#9ca3af" }} /> <Typography variant="body2">Attach file</Typography></MenuItem>
              <MenuItem onClick={() => setAnchorEl(null)} sx={{ borderRadius: 1, py: 1 }}><Smile size={16} style={{ marginRight: 12, color: "#9ca3af" }} /> <Typography variant="body2">Emoji</Typography></MenuItem>
              <MenuItem onClick={() => setAnchorEl(null)} sx={{ borderRadius: 1, py: 1 }}><MessageSquare size={16} style={{ marginRight: 12, color: "#9ca3af" }} /> <Typography variant="body2">Saved replies</Typography></MenuItem>
            </Popover>

            <InputBase
              placeholder="Type your reply..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              sx={{ flex: 1, py: 1, px: 1, fontSize: "0.875rem" }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setMessageInput("");
                }
              }}
            />
            
            <Button 
              variant="contained"
              color="secondary"
              disabled={!messageInput.trim()}
              sx={{ minWidth: 0, width: 40, height: 40, p: 0, borderRadius: 1.5 }}
            >
              <Send size={18} style={{ marginLeft: 2 }} />
            </Button>
          </Paper>
        </Box>
      </Box>

      {/* Right Panel: Visitor Information */}
      <Box sx={{ width: { lg: 320, md: 280 }, display: { xs: "none", md: "flex" }, flexDirection: "column", borderLeft: "1px solid", borderColor: "grey.200", bgcolor: "grey.50", overflowY: "auto" }}>
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: getAvatarColor(activeChat.id), fontSize: "2rem", fontWeight: 800, mb: 2, border: "2px solid white", boxShadow: 1 }}>
            {activeChat.avatar}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "grey.900" }}>{activeChat.name}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>{activeChat.name.toLowerCase().replace(' ', '.')}@example.com</Typography>
          
          <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
            <Button variant="outlined" startIcon={<User size={16} />} sx={{ flex: 1, bgcolor: "background.paper", color: "grey.700", borderColor: "grey.200", "&:hover": { bgcolor: "grey.50", borderColor: "grey.300" } }}>
              Profile
            </Button>
            <Button variant="outlined" startIcon={<Tag size={16} />} sx={{ flex: 1, bgcolor: "background.paper", color: "grey.700", borderColor: "grey.200", "&:hover": { bgcolor: "grey.50", borderColor: "grey.300" } }}>
              Add Tag
            </Button>
          </Stack>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography variant="overline" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: "0.05em", display: "block", mb: 2 }}>
            Visitor Details
          </Typography>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1.5}>
              <User size={18} color="#9ca3af" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>Visitor ID</Typography>
                <Typography variant="body2" color="text.secondary">V-98214</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <MapPin size={18} color="#9ca3af" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>Location</Typography>
                <Typography variant="body2" color="text.secondary">New York, United States</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Clock size={18} color="#9ca3af" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>Local Time</Typography>
                <Typography variant="body2" color="text.secondary">10:34 AM (EST)</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Globe size={18} color="#9ca3af" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>IP Address</Typography>
                <Typography variant="body2" color="text.secondary">192.168.1.104</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Timer size={18} color="#9ca3af" style={{ marginTop: 2 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "grey.900" }}>Session Duration</Typography>
                <Typography variant="body2" color="text.secondary">14m 32s</Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default ConversationsView;


