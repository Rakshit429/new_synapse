// src/utils/constants.js

export const DEPARTMENTS = [
  "Computer Science and Engineering", "Electrical Engineering", "Mechanical Engineering", 
  "Civil Engineering", "Chemical Engineering", "Biochemical Engineering and Biotechnology",
  "Physics", "Chemistry", "Mathematics", "Textile and Fibre Engineering"
];

export const HOSTELS = [
  "Aravali",
  "Dronagiri",
  "Girnar",
  "Himadri",
  "Jwalamukhi",
  "Kailash",
  "Karakoram",
  "Kumaon",
  "Nalanda",
  "Nilgiri",
  "Satpura",
  "Sahyadri",
  "Saptagiri",
  "Shivalik",
  "Udaigiri",
  "Vindhyachal",
  "Zanskar"
];


export const YEARS = [1, 2, 3, 4, 5];

// 🔥 NEW: STRICT BACKEND ENUMS (Must match backend/app/models/enums.py exactly)

export const ORG_TYPES = [
  { label: "Club", value: "club" },
  { label: "Board", value: "board" },
  { label: "Society", value: "society" },
  { label: "Fest", value: "fest" },
  { label: "Department", value: "department" }
];

// src/utils/constants.js

export const HEAD_ROLES = [
  "overall coordinator",
  "president",
  "general secretary",
  "vice president",
  "deputy general secretary",
  "secretary",
  "convener"
];

export const TEAM_ROLES = [
  "team head",
  "achead",
  "coordinator",
  "executive"
];

export const ALL_ROLES = [...HEAD_ROLES, ...TEAM_ROLES];

// Master list of all organizations (Matches backend OrgName enum)
export const ALL_ORGS = {
  "club": [
    "devclub", "robotics club", "aeromodelling club", "business and consulting club", 
    "economics club", "physics and astronomy club", "algorithms and computing club", 
    "aries", "igem", "hyperloop club", "music club", "dance club", "dramatics club", 
    "literary club", "debating club", "photography and films club", 
    "fine arts and crafts club", "design club", "quizzing club", 
    "hindi samiti", "spic macay", "indradhanu"
  ],
  "board": [
    "student affairs council", "board for student welfare", "board for sports activities",
    "board for recreational and creative activities", "board for student publications",
    "co-curricular and academic interaction council"
  ],
  "society": [
    "mathsoc", "aces acm", "chemical engineering society", "mechanical engineering society",
    "electrical engineering society", "civil engineering forum", "materials science and engineering society",
    "biotechnology society", "physics society", "textile engineering society", "energy society"
  ],
  "fest": ["rendezvous", "tryst", "becon", "literati"],
  "department": ["cse", "ee", "me", "ce", "che", "dbeb", "physics", "chemistry", "maths", "textile"]
};