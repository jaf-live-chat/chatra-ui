import { useState } from "react";
import ChatHistoryView from "../../../sections/chat/ChatHistoryView";

const initialMockHistory = [
  {
    id: "CH-1002",
    visitor: "Michael Smith",
    length: "5m 45s",
    date: "Oct 24, 2026, 11:15",
    transcript: [
      { sender: "Michael", time: "11:15", text: "Does this integrate with Salesforce?" },
      { sender: "Agent", time: "11:17", text: "Yes, we have a native Salesforce integration available on the Enterprise tier." },
      { sender: "Michael", time: "11:20", text: "Okay, I'll check out the Enterprise pricing." },
    ],
  },
  {
    id: "CH-1003",
    visitor: "Emily Davis",
    length: "22m 10s",
    date: "Oct 23, 2026, 09:45",
    transcript: [
      { sender: "Emily", time: "09:45", text: "My card was declined, can you help?" },
      { sender: "Agent", time: "09:48", text: "Hi Emily, let me check your account." },
      { sender: "Agent", time: "09:50", text: "It looks like the bank rejected the transaction. Could you try updating your payment method?" },
      { sender: "Emily", time: "10:05", text: "Done. It went through now." },
      { sender: "Agent", time: "10:07", text: "Great! Let me know if you need anything else." },
    ],
  },
  {
    id: "CH-1004",
    visitor: "James Wilson",
    length: "8m 30s",
    date: "Oct 22, 2026, 16:20",
    transcript: [
      { sender: "James", time: "16:20", text: "How do I add team members?" },
      { sender: "Agent", time: "16:22", text: "You can go to Workspace Settings > Members and click 'Invite'." },
      { sender: "James", time: "16:28", text: "Found it, thanks!" },
    ],
  },
  {
    id: "CH-1005",
    visitor: "Sarah Brown",
    length: "35m 00s",
    date: "Oct 21, 2026, 13:10",
    transcript: [
      { sender: "Sarah", time: "13:10", text: "Where can I find the API key?" },
      { sender: "Agent", time: "13:15", text: "Hi Sarah! You can generate an API key under Settings > API." },
      { sender: "Sarah", time: "13:40", text: "Got it, setting it up now." },
      { sender: "Agent", time: "13:45", text: "Awesome. Reach out if you hit any roadblocks." },
    ],
  },
];

const HistoryPage = () => {
  const [historyItems] = useState(initialMockHistory);

  return <ChatHistoryView history={historyItems} />;
};

export default HistoryPage;
