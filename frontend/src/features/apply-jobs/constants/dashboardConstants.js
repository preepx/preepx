import {
  Wifi, Building2, GraduationCap, CalendarDays, Sparkles, Home, Layers, TrendingUp
} from "lucide-react";

export const CATEGORIES = [
  { label: "Remote", q: "remote", icon: Wifi },
  { label: "MNC", q: "engineer", icon: Building2 },
  { label: "Internship", q: "intern", icon: GraduationCap },
  { label: "Walk-in", q: "walk-in", icon: CalendarDays },
  { label: "Fresher", q: "fresher", icon: Sparkles },
  { label: "Work from home", q: "work from home", icon: Home },
  { label: "Product", q: "product", icon: Layers },
  { label: "Data / AI", q: "data", icon: TrendingUp },
];

export const EXP_OPTIONS = [
  { value: "", label: "Experience" },
  { value: "0", label: "Fresher" },
  { value: "1", label: "1–3 years" },
  { value: "3", label: "3–5 years" },
  { value: "5", label: "5+ years" },
];

export const EVENTS = [
  {
    id: 1,
    type: "Virtual Fair",
    title: "Pan-India Tech Hiring Fair 2026",
    date: "28 Aug",
    time: "10:00 AM – 6:00 PM IST",
    loc: "Online · Live",
    companies: 48,
    roles: "2,400+",
    cta: "Register free",
  },
  {
    id: 2,
    type: "Walk-in",
    title: "Product Engineering Walk-in Drive",
    date: "30 Aug",
    time: "9:30 AM onwards",
    loc: "Bengaluru · Whitefield",
    companies: 12,
    roles: "180+",
    cta: "Get pass",
  },
  {
    id: 3,
    type: "Campus",
    title: "Campus Connect · Freshers Batch",
    date: "02 Sep",
    time: "11:00 AM",
    loc: "Hyderabad · HITEC City",
    companies: 22,
    roles: "900+",
    cta: "Apply now",
  },
];

export const SKILL_DEMAND = [
  { name: "React", growth: "+18%" },
  { name: "Python", growth: "+14%" },
  { name: "AWS", growth: "+22%" },
  { name: "SQL", growth: "+9%" },
  { name: "Java", growth: "+11%" },
  { name: "Figma", growth: "+16%" },
];
