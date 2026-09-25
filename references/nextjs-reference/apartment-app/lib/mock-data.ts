export type Tone = "blue" | "green" | "yellow" | "orange" | "red" | "violet";

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  badge?: number;
};

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "⌂" },
      { id: "residents", label: "Residents & Homes", icon: "♙" },
      { id: "rentals", label: "Rental Management", icon: "⌑" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { id: "maintenance", label: "Maintenance", icon: "⚒", badge: 8 },
      { id: "payments", label: "Payments & Accounts", icon: "₹" },
      { id: "visitors", label: "Visitors & Gate", icon: "↪" },
      { id: "cctv", label: "CCTV & Security", icon: "◉", badge: 3 },
      { id: "amenities", label: "Amenities", icon: "♢" },
    ],
  },
  {
    label: "COMMUNITY",
    items: [
      { id: "chat", label: "Chat & Messages", icon: "✉", badge: 5 },
      { id: "notices", label: "Notices & Meetings", icon: "◇" },
      { id: "staff", label: "Staff & Vendors", icon: "♧" },
      { id: "documents", label: "Documents", icon: "▤" },
      { id: "reports", label: "Reports", icon: "▥" },
    ],
  },
];

export const stats = [
  { label: "TOTAL HOMES", value: "248", note: "12 blocks", icon: "⌂", tone: "blue" as Tone },
  { label: "OCCUPIED", value: "226", note: "91.1% occupancy", icon: "♙", tone: "green" as Tone },
  { label: "OPEN REQUESTS", value: "18", note: "5 need attention", icon: "⚒", tone: "orange" as Tone },
  { label: "COLLECTION THIS MONTH", value: "₹18.4L", note: "86% collected", icon: "₹", tone: "violet" as Tone },
];

export const activities = [
  { icon: "⚒", tone: "orange" as Tone, title: "Water leak reported", detail: "B-804 · Plumbing", time: "8 min ago", status: "Urgent" },
  { icon: "↪", tone: "blue" as Tone, title: "Visitor approved", detail: "Amazon Delivery · A-302", time: "12 min ago", status: "At gate" },
  { icon: "₹", tone: "green" as Tone, title: "Maintenance received", detail: "C-1102 · ₹4,850", time: "24 min ago", status: "Paid" },
  { icon: "◉", tone: "red" as Tone, title: "Camera offline", detail: "Basement B2 · CAM-28", time: "31 min ago", status: "Critical" },
  { icon: "♙", tone: "violet" as Tone, title: "New tenant added", detail: "D-406 · Priya Nair", time: "1 hr ago", status: "Verify" },
];

export const tasks = [
  { title: "Approve 4 vendor bills", tag: "Accounts", due: "Today", tone: "orange" as Tone },
  { title: "Review tenant verification", tag: "D-406", due: "Today", tone: "red" as Tone },
  { title: "Lift AMC renewal", tag: "Contract", due: "2 days", tone: "yellow" as Tone },
  { title: "Publish AGM minutes", tag: "Committee", due: "3 days", tone: "blue" as Tone },
];

export const residents = [
  { flat: "A-302", name: "Arjun Mehta", type: "Owner", family: 4, phone: "+91 98450 22118", status: "Verified", initials: "AM", color: "#5B6CF9" },
  { flat: "B-804", name: "Nisha Rao", type: "Tenant", family: 3, phone: "+91 99861 04932", status: "Verified", initials: "NR", color: "#0EA5A8" },
  { flat: "C-1102", name: "Mohammed Irfan", type: "Owner", family: 5, phone: "+91 99002 11456", status: "Verified", initials: "MI", color: "#F59E0B" },
  { flat: "D-406", name: "Priya Nair", type: "Tenant", family: 2, phone: "+91 97422 80715", status: "Pending", initials: "PN", color: "#E86A92" },
  { flat: "A-101", name: "Shankar Iyer", type: "Owner", family: 2, phone: "+91 98444 02631", status: "Verified", initials: "SI", color: "#8B5CF6" },
  { flat: "C-507", name: "Neha Kapoor", type: "Tenant", family: 3, phone: "+91 98802 55210", status: "Expiring", initials: "NK", color: "#F97316" },
];

export const tickets = [
  { id: "MR-1048", title: "Water leakage under kitchen sink", flat: "B-804", category: "Plumbing", assignee: "Ravi Plumbing", priority: "Urgent", status: "Assigned", time: "Today, 10:30 AM" },
  { id: "MR-1047", title: "Corridor light flickering", flat: "Block C · Floor 7", category: "Electrical", assignee: "Kumar Electricals", priority: "Medium", status: "In progress", time: "Today, 9:15 AM" },
  { id: "MR-1046", title: "Bedroom window latch broken", flat: "A-302", category: "Carpentry", assignee: "Unassigned", priority: "Normal", status: "New", time: "Yesterday" },
  { id: "MR-1045", title: "Lift noise during operation", flat: "Tower D", category: "Lift", assignee: "KONE Service", priority: "High", status: "Vendor visit", time: "Yesterday" },
];

export const cameras = [
  { id: "CAM-01", name: "Main Gate Entry", area: "Gate 1", status: "Online", recording: "Recording", last: "Live", tone: "green" as Tone },
  { id: "CAM-08", name: "Tower A Lobby", area: "Ground Floor", status: "Online", recording: "Recording", last: "Live", tone: "green" as Tone },
  { id: "CAM-16", name: "Children's Play Area", area: "Central Park", status: "Online", recording: "Recording", last: "Live", tone: "green" as Tone },
  { id: "CAM-28", name: "Basement B2 East", area: "Parking B2", status: "Offline", recording: "No signal", last: "31 min ago", tone: "red" as Tone },
  { id: "CAM-31", name: "Tower D Terrace", area: "Terrace", status: "Attention", recording: "Storage warning", last: "Live", tone: "orange" as Tone },
  { id: "CAM-36", name: "Rear Compound Wall", area: "Boundary", status: "Maintenance", recording: "Paused", last: "Yesterday", tone: "yellow" as Tone },
];

export const vendors = [
  { name: "Ravi Plumbing Services", service: "Plumber", phone: "+91 98450 11882", rating: "4.8", status: "Available", icon: "◌", tone: "blue" as Tone },
  { name: "Kumar Electricals", service: "Electrician", phone: "+91 99012 73048", rating: "4.7", status: "On site", icon: "ϟ", tone: "yellow" as Tone },
  { name: "SecureVision Systems", service: "CCTV & Access", phone: "+91 98863 20114", rating: "4.9", status: "Available", icon: "◉", tone: "violet" as Tone },
  { name: "CleanNest Facility", service: "Housekeeping", phone: "+91 97415 66829", rating: "4.6", status: "Contracted", icon: "✦", tone: "green" as Tone },
  { name: "KONE Service Desk", service: "Lift Maintenance", phone: "1800 425 4254", rating: "4.8", status: "Vendor visit", icon: "↕", tone: "orange" as Tone },
  { name: "GreenCare Solutions", service: "Gardening & Pest", phone: "+91 99804 99128", rating: "4.5", status: "Available", icon: "♧", tone: "green" as Tone },
];

export const payments = [
  { flat: "A-302", resident: "Arjun Mehta", type: "Maintenance", amount: "₹4,850", date: "18 Aug 2026", status: "Paid", ref: "PAY-88421" },
  { flat: "C-1102", resident: "Mohammed Irfan", type: "Maintenance", amount: "₹5,400", date: "18 Aug 2026", status: "Paid", ref: "PAY-88418" },
  { flat: "D-406", resident: "Priya Nair", type: "Move-in charge", amount: "₹2,000", date: "17 Aug 2026", status: "Pending", ref: "INV-72112" },
  { flat: "B-804", resident: "Nisha Rao", type: "Maintenance", amount: "₹4,850", date: "15 Aug 2026", status: "Overdue", ref: "INV-72098" },
];

export const visitors = [
  { name: "Amazon Delivery", flat: "A-302", purpose: "Delivery", entry: "7:42 PM", status: "Inside", icon: "AM" },
  { name: "Rajesh Kumar", flat: "C-1102", purpose: "Guest", entry: "7:18 PM", status: "Inside", icon: "RK" },
  { name: "Urban Company", flat: "B-804", purpose: "Service", entry: "6:55 PM", status: "Exited", icon: "UC" },
  { name: "Swiggy Delivery", flat: "D-406", purpose: "Delivery", entry: "6:21 PM", status: "Exited", icon: "SW" },
];

export const amenities = [
  { name: "Community Hall", detail: "Up to 120 guests", available: "Available today", charge: "₹3,500 / slot", icon: "⌂", color: "#5B6CF9" },
  { name: "Badminton Court", detail: "60-minute slots", available: "Next: 8:00 PM", charge: "₹100 / hour", icon: "◒", color: "#0EA5A8" },
  { name: "Guest Room", detail: "2 rooms available", available: "Available 21 Aug", charge: "₹1,200 / night", icon: "▣", color: "#8B5CF6" },
  { name: "Swimming Pool", detail: "6:00 AM – 9:00 PM", available: "Open now", charge: "Included", icon: "≈", color: "#0EA5E9" },
];

export const documents = [
  { name: "Apartment Association Bylaws", category: "Legal", updated: "12 Jun 2026", status: "Current", icon: "§" },
  { name: "Fire Safety Certificate", category: "Compliance", updated: "02 Apr 2026", status: "Expires in 42 days", icon: "△" },
  { name: "Lift AMC – Towers A to D", category: "Contract", updated: "18 Aug 2025", status: "Renewal due", icon: "↕" },
  { name: "AGM Minutes – July 2026", category: "Meetings", updated: "30 Jul 2026", status: "Current", icon: "▤" },
];

export const moduleCards = {
  rentals: [
    { title: "Active agreements", value: "87", note: "6 expire within 45 days", tone: "blue" as Tone },
    { title: "Monthly rent tracked", value: "₹14.8L", note: "Private to owners", tone: "green" as Tone },
    { title: "Renewals pending", value: "6", note: "2 need attention", tone: "orange" as Tone },
    { title: "Move-ins this month", value: "9", note: "1 verification pending", tone: "violet" as Tone },
  ],
  staff: [
    { title: "Staff on duty", value: "34", note: "Across 3 shifts", tone: "green" as Tone },
    { title: "Approved vendors", value: "42", note: "11 AMC partners", tone: "blue" as Tone },
    { title: "Attendance today", value: "96%", note: "2 absent", tone: "violet" as Tone },
    { title: "Contracts expiring", value: "3", note: "Within 30 days", tone: "orange" as Tone },
  ],
  notices: [
    { title: "Active notices", value: "7", note: "2 are important", tone: "blue" as Tone },
    { title: "Upcoming meetings", value: "2", note: "AGM on 24 Aug", tone: "violet" as Tone },
    { title: "Open polls", value: "1", note: "Closes tomorrow", tone: "orange" as Tone },
    { title: "Residents reached", value: "94%", note: "Push + SMS", tone: "green" as Tone },
  ],
  reports: [
    { title: "Reports generated", value: "38", note: "This month", tone: "blue" as Tone },
    { title: "Collection rate", value: "86%", note: "+4.2% from July", tone: "green" as Tone },
    { title: "Avg. resolution", value: "7.4h", note: "Within SLA", tone: "violet" as Tone },
    { title: "Open audit items", value: "4", note: "Review required", tone: "orange" as Tone },
  ],
};
