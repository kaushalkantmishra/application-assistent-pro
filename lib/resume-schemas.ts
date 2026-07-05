export interface FieldDefinition {
  id: string
  label: string
  placeholder: string
  type: "text" | "textarea" | "richtext" | "date" | "checkbox" | "select" | "taginput" | "url" | "email" | "phone" | "number"
  required?: boolean
  hidden?: boolean
  options?: string[] // For select type
  description?: string
  defaultValue?: any
}

export interface SectionSchema {
  id: string
  title: string
  repeatable: boolean
  icon: string
  description: string
  fields: FieldDefinition[]
}

export const RESUME_SECTIONS_SCHEMAS: SectionSchema[] = [
  {
    id: "personalInfo",
    title: "Personal Information",
    repeatable: false,
    icon: "User",
    description: "Your contact and basic profile information",
    fields: [
      { id: "photo", label: "Profile Photo URL", placeholder: "https://example.com/avatar.jpg", type: "text", defaultValue: "" },
      { id: "fullName", label: "Full Name", placeholder: "John Doe", type: "text", required: true, defaultValue: "" },
      { id: "headline", label: "Headline / Professional Title", placeholder: "Senior Full-Stack Engineer", type: "text", defaultValue: "" },
      { id: "email", label: "Email Address", placeholder: "john.doe@example.com", type: "email", required: true, defaultValue: "" },
      { id: "phone", label: "Phone Number", placeholder: "+1 (555) 019-2834", type: "phone", defaultValue: "" },
      { id: "address", label: "Location / Address", placeholder: "San Francisco, CA (Hybrid)", type: "text", defaultValue: "" },
      { id: "linkedIn", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/username", type: "url", defaultValue: "" },
      { id: "github", label: "GitHub URL", placeholder: "https://github.com/username", type: "url", defaultValue: "" },
      { id: "portfolio", label: "LeetCode URL", placeholder: "https://leetcode.com/username", type: "url", defaultValue: "" },
      { id: "website", label: "GeeksforGeeks URL", placeholder: "https://auth.geeksforgeeks.org/user/username", type: "url", defaultValue: "" },
      { id: "customPortfolio", label: "Portfolio URL", placeholder: "https://myportfolio.dev", type: "url", defaultValue: "" },
      { id: "customWebsite", label: "Other Website URL", placeholder: "https://example.com", type: "url", defaultValue: "" },
    ],
  },
  {
    id: "summary",
    title: "Career Summary",
    repeatable: false,
    icon: "FileText",
    description: "Brief summary of your professional background and goals",
    fields: [
      {
        id: "text",
        label: "Summary Description",
        placeholder: "Detail-oriented software engineer with 5+ years of experience building scalable developer tools...",
        type: "textarea",
        defaultValue: "",
      },
    ],
  },
  {
    id: "experience",
    title: "Work Experience",
    repeatable: true,
    icon: "Briefcase",
    description: "Your professional work history and achievements",
    fields: [
      { id: "company", label: "Company Name", placeholder: "Stripe", type: "text", required: true, defaultValue: "" },
      { id: "companySub", label: "Company Subheading / Industry", placeholder: "e.g. IT, ICT and ITES solution provider company", type: "text", defaultValue: "" },
      { id: "role", label: "Job Title", placeholder: "Senior Software Engineer", type: "text", required: true, defaultValue: "" },
      { id: "location", label: "Location", placeholder: "San Francisco, CA (Hybrid)", type: "text", defaultValue: "" },
      { id: "startDate", label: "Start Date", placeholder: "Jan 2022", type: "text", defaultValue: "" },
      { id: "endDate", label: "End Date", placeholder: "Present", type: "text", defaultValue: "" },
      { id: "current", label: "I currently work here", placeholder: "", type: "checkbox", defaultValue: false },
      {
        id: "description",
        label: "Description & Achievements",
        placeholder: "- Led billing platform scaling project using Node.js and Go\n- Improved page render performance by 40%",
        type: "textarea",
        defaultValue: "",
      },
    ],
  },
  {
    id: "education",
    title: "Education",
    repeatable: true,
    icon: "GraduationCap",
    description: "Academic degrees and study credentials",
    fields: [
      { id: "institution", label: "Institution / University", placeholder: "Stanford University", type: "text", required: true, defaultValue: "" },
      { id: "degree", label: "Degree Name", placeholder: "Bachelor of Science", type: "text", required: true, defaultValue: "" },
      { id: "fieldOfStudy", label: "Field of Study", placeholder: "Computer Science", type: "text", defaultValue: "" },
      { id: "location", label: "Location", placeholder: "Stanford, CA", type: "text", defaultValue: "" },
      { id: "startDate", label: "Start Date", placeholder: "Sep 2018", type: "text", defaultValue: "" },
      { id: "endDate", label: "End Date / Expected Graduation", placeholder: "Jun 2022", type: "text", defaultValue: "" },
      { id: "gpa", label: "GPA / Grades", placeholder: "3.8/4.0", type: "text", defaultValue: "" },
      { id: "description", label: "Additional Info (Honors, Societies, etc.)", placeholder: "Dean's list, Teaching assistant for intro to DSA class", type: "textarea", defaultValue: "" },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    repeatable: true,
    icon: "FolderGit",
    description: "Key projects you have worked on",
    fields: [
      { id: "name", label: "Project Name", placeholder: "Personal Resume Builder", type: "text", required: true, defaultValue: "" },
      { id: "role", label: "Your Role / Contribution", placeholder: "Solo Developer", type: "text", defaultValue: "" },
      { id: "url", label: "Project Link / Repo URL", placeholder: "https://github.com/myproject", type: "url", defaultValue: "" },
      { id: "startDate", label: "Start Date", placeholder: "Jan 2024", type: "text", defaultValue: "" },
      { id: "endDate", label: "End Date", placeholder: "Feb 2024", type: "text", defaultValue: "" },
      { id: "technologies", label: "Technologies Used (Comma-separated)", placeholder: "React, Next.js, Tailwind CSS, Drizzle ORM", type: "text", defaultValue: "" },
      { id: "description", label: "Project Description", placeholder: "- Designed schema-driven forms with custom JSON template rendering\n- Integrated Zustand state store for real-time live preview update", type: "textarea", defaultValue: "" },
    ],
  },
  {
    id: "technicalSkills",
    title: "Technical Skills",
    repeatable: true,
    icon: "Code",
    description: "Programming languages, frameworks, databases, and tools",
    fields: [
      { id: "category", label: "Skill Category", placeholder: "Languages / Frameworks / Databases", type: "text", required: true, defaultValue: "" },
      { id: "skills", label: "Skills (Comma-separated)", placeholder: "React, TypeScript, Next.js, Node.js, Go", type: "text", required: true, defaultValue: "" },
    ],
  },
  {
    id: "softSkills",
    title: "Soft Skills",
    repeatable: false,
    icon: "Brain",
    description: "Your key interpersonal and behavioral skills",
    fields: [
      { id: "skills", label: "Soft Skills (Comma-separated)", placeholder: "Leadership, Communication, Problem Solving, Empathy", type: "text", defaultValue: "" },
    ],
  },
  {
    id: "certificates",
    title: "Certificates",
    repeatable: true,
    icon: "Award",
    description: "Professional licenses and certificate courses",
    fields: [
      { id: "name", label: "Certificate Name", placeholder: "AWS Certified Solutions Architect", type: "text", required: true, defaultValue: "" },
      { id: "issuer", label: "Issuing Organization", placeholder: "Amazon Web Services", type: "text", defaultValue: "" },
      { id: "date", label: "Issue Date", placeholder: "Oct 2023", type: "text", defaultValue: "" },
      { id: "url", label: "Credential URL", placeholder: "https://aws.verify/cert-id", type: "url", defaultValue: "" },
    ],
  },
  {
    id: "codingProfiles",
    title: "Coding Profiles",
    repeatable: true,
    icon: "FileCode",
    description: "Your usernames and handles on competitive coding platforms",
    fields: [
      { id: "platform", label: "Platform Name", placeholder: "LeetCode / HackerRank", type: "text", required: true, defaultValue: "" },
      { id: "username", label: "Username / Handle", placeholder: "code_ninja", type: "text", required: true, defaultValue: "" },
      { id: "url", label: "Profile Link URL", placeholder: "https://leetcode.com/code_ninja", type: "url", defaultValue: "" },
    ],
  },
  {
    id: "languages",
    title: "Languages",
    repeatable: true,
    icon: "Languages",
    description: "Languages you speak and write",
    fields: [
      { id: "language", label: "Language", placeholder: "English", type: "text", required: true, defaultValue: "" },
      {
        id: "proficiency",
        label: "Proficiency",
        placeholder: "Select Proficiency",
        type: "select",
        options: ["Native / Bilingual", "Professional Working", "Limited Working", "Elementary"],
        defaultValue: "Native / Bilingual",
      },
    ],
  },
  {
    id: "interests",
    title: "Interests & Hobbies",
    repeatable: false,
    icon: "Heart",
    description: "Your key personal interests and pastimes",
    fields: [
      { id: "items", label: "Interests (Comma-separated)", placeholder: "Open Source contribution, Technical Blogging, Hiking, Chess", type: "text", defaultValue: "" },
    ],
  },
  {
    id: "references",
    title: "References",
    repeatable: true,
    icon: "Users",
    description: "People who can recommend you",
    fields: [
      { id: "name", label: "Reference Name", placeholder: "Dr. Sarah Miller", type: "text", required: true, defaultValue: "" },
      { id: "relationship", label: "Relationship / Title", placeholder: "Engineering Director at Vercel", type: "text", defaultValue: "" },
      { id: "email", label: "Email Address", placeholder: "s.miller@vercel.com", type: "email", defaultValue: "" },
      { id: "phone", label: "Phone Number", placeholder: "+1 (555) 014-9988", type: "phone", defaultValue: "" },
    ],
  },
  {
    id: "publications",
    title: "Publications",
    repeatable: true,
    icon: "BookOpen",
    description: "Academic papers, journal articles, or books you wrote",
    fields: [
      { id: "title", label: "Publication Title", placeholder: "Optimizing State Caching in Serverless Edge Frameworks", type: "text", required: true, defaultValue: "" },
      { id: "publisher", label: "Publisher / Conference", placeholder: "IEEE Edge Compute Symposium", type: "text", defaultValue: "" },
      { id: "date", label: "Publication Date", placeholder: "Nov 2023", type: "text", defaultValue: "" },
      { id: "url", label: "Publication Link URL", placeholder: "https://ieee.org/abstract/123", type: "url", defaultValue: "" },
    ],
  },
  {
    id: "awards",
    title: "Honors & Awards",
    repeatable: true,
    icon: "Sparkles",
    description: "Scholarships, honors, and hackathon wins",
    fields: [
      { id: "title", label: "Award Title", placeholder: "1st Place - Local Hackathon", type: "text", required: true, defaultValue: "" },
      { id: "issuer", label: "Issuing Organization", placeholder: "Tech Crunch", type: "text", defaultValue: "" },
      { id: "date", label: "Award Date", placeholder: "Jun 2024", type: "text", defaultValue: "" },
      { id: "description", label: "Description", placeholder: "Won best API integration prize from Stripe sponsor team.", type: "textarea", defaultValue: "" },
    ],
  },
  {
    id: "volunteerWork",
    title: "Volunteer Work",
    repeatable: true,
    icon: "HeartHandshake",
    description: "Social causes and voluntary projects",
    fields: [
      { id: "organization", label: "Organization Name", placeholder: "Red Cross", type: "text", required: true, defaultValue: "" },
      { id: "role", label: "Volunteer Title", placeholder: "Volunteer Technical Assistant", type: "text", required: true, defaultValue: "" },
      { id: "startDate", label: "Start Date", placeholder: "Jan 2020", type: "text", defaultValue: "" },
      { id: "endDate", label: "End Date", placeholder: "Dec 2021", type: "text", defaultValue: "" },
      { id: "description", label: "Volunteer Activities", placeholder: "Maintained local chapter's registration portal and databases.", type: "textarea", defaultValue: "" },
    ],
  },
]

export function getInitialResumeJson(): Record<string, any> {
  return {
    sectionOrder: ["personalInfo", "education", "experience", "technicalSkills", "projects", "codingProfiles", "certificates"],
    personalInfo: {
      visible: true,
      fullName: "KAUSHAL KANT MISHRA",
      headline: "Full Stack Developer",
      email: "kaushalkantmishra127@gmail.com",
      phone: "+91-8935997843",
      address: "Ranchi, Jharkhand",
      linkedIn: "https://linkedin.com/in/kaushalkantmishra",
      github: "https://github.com/kaushalkantmishra",
      portfolio: "https://leetcode.com/kaushalkantmishra127",
      website: "https://auth.geeksforgeeks.org/user/kaushalkantmishra127"
    },
    summary: {
      visible: false,
      text: ""
    },
    education: {
      visible: true,
      items: [
        {
          id: "edu_1",
          institution: "Dr. Shyama Prasad Mukherjee University, Ranchi",
          degree: "MCA - Master of Computer Applications",
          fieldOfStudy: "",
          location: "Ranchi, Jharkhand",
          startDate: "Jul 2021",
          endDate: "Aug 2023",
          gpa: "8.6",
          description: ""
        },
        {
          id: "edu_2",
          institution: "Marwari College, Ranchi",
          degree: "B.Sc. IT",
          fieldOfStudy: "",
          location: "Ranchi, Jharkhand",
          startDate: "Jun 2017",
          endDate: "Jul 2020",
          gpa: "74.31%",
          description: ""
        }
      ]
    },
    experience: {
      visible: true,
      items: [
        {
          id: "exp_1",
          company: "Aadrika Enterprises",
          companySub: "IT, ICT and ITES solution provider company",
          role: "Full Stack Developer",
          location: "Ranchi, Jharkhand",
          startDate: "Sept 2024",
          endDate: "Present",
          description: "- Delivered 6+ web-based solutions for **Ranchi Municipal Corporation** (RMC) under JUIDCO, covering domains like finance, HRMS, grievance management, and public transport.\n- Developed full-stack applications using React, Next.js, Node.js, TypeScript, PostgreSQL, and Prisma ORM to ensure scalability, maintainability, and type-safe database interactions.\n- Implemented RESTful APIs, optimized backend workflows, and integrated role-based access control for 50+ municipal urban local bodies (ULBs).\n- Collaborated closely with cross-functional teams to gather requirements, improve UX/UI, and align with government digitalization standards."
        },
        {
          id: "exp_2",
          company: "HikmaSpark Pvt. Ltd.",
          companySub: "IT Services and IT Consulting",
          role: "Junior Software Developer",
          location: "Indore, Madhya Pradesh",
          startDate: "March 2024",
          endDate: "Aug 2024",
          description: "- Collaborated in a 4-member team to design and develop the company's official portfolio using React, Node.js, MongoDB and TypeScript.\n- Implemented responsive UI components, optimized performance by 30%, and ensured seamless backend integration for a smooth user experience."
        }
      ]
    },
    technicalSkills: {
      visible: true,
      items: [
        {
          id: "skill_1",
          category: "Languages",
          skills: "JavaScript, TypeScript, Java, SQL"
        },
        {
          id: "skill_2",
          category: "Technologies/Frameworks",
          skills: "Node.js, Express.js, React, Next.js, Redux, Tailwind CSS, Prisma, MongoDB, PostgreSQL"
        },
        {
          id: "skill_3",
          category: "Developer Tools",
          skills: "Git, GitHub, Postman, VS Code, NetBeans"
        }
      ]
    },
    projects: {
      visible: true,
      items: [
        {
          id: "proj_1",
          name: "Wanderlust",
          role: "A hospitality service platform",
          url: "https://github.com/kaushalkantmishra/wanderlust",
          technologies: "MongoDB, EJS, Node.js, Express.js",
          startDate: "May'23",
          endDate: "Aug'23",
          description: "- Achieved a **25% boost** in user satisfaction through a user-friendly interface optimizing property listings.\n- Integrated real-time booking functionality to provide a comprehensive and impressive travel experience.\n- Directed the adoption of **MVC architecture**, resulting in a **30% increase** in maintainability and scalability."
        },
        {
          id: "proj_2",
          name: "Application Assistant",
          role: "Vacancy Tracker Website",
          url: "https://github.com/kaushalkantmishra/application-assistant",
          technologies: "MongoDB, EJS, Node.js",
          startDate: "DEC'22",
          endDate: "Apr'23",
          description: "- Orchestrated the development of user-friendly organizational tools and **optimized job search processes**.\n- Achieved time savings of up to **30%** and improved career planning efficiency and success rates.\n- Integrated **RESTful APIs** into the system, ensuring seamless communication and data exchange between the server and client components."
        },
        {
          id: "proj_3",
          name: "Cloud Points",
          role: "APIs based Weather Application",
          url: "https://github.com/kaushalkantmishra/cloud-points",
          technologies: "React.js, Open Weather API",
          startDate: "Nov'22",
          endDate: "Feb'23",
          description: "- Developed and deployed a responsive weather application in React, leveraging strong front-end skills.\n- Integrated Open Weather Map API for real-time weather data, ensuring a **99% accuracy rate**.\n- Executed **geolocation-based** weather retrieval, leading to a **20% upswing** in user engagement."
        }
      ]
    },
    codingProfiles: {
      visible: true,
      items: [
        {
          id: "profile_1",
          platform: "Leetcode",
          username: "Solved **120+ Problems** on **Leetcode**",
          url: "https://leetcode.com/kaushalkantmishra127"
        },
        {
          id: "profile_2",
          platform: "GeeksforGeeks",
          username: "Solved **200+ Problems** on **GeeksforGeeks**",
          url: "https://auth.geeksforgeeks.org/user/kaushalkantmishra127"
        }
      ]
    },
    certificates: {
      visible: true,
      items: [
        {
          id: "cert_1",
          name: "Data Structure and Algorithms with Java",
          issuer: "Apna College",
          date: "Jul'21 - Aug'23",
          url: ""
        },
        {
          id: "cert_2",
          name: "Fullstack Web Development",
          issuer: "Apna College",
          date: "May'23 - Aug'23",
          url: ""
        },
        {
          id: "cert_3",
          name: "AWS",
          issuer: "Great Learning Academy",
          date: "Jan'2024",
          url: ""
        }
      ]
    }
  }
}
