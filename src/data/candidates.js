// Dummy data: candidates and resumes.

export const candidates = [
  { id: "cand_sarah", name: "Sarah Khan", email: "sarah.khan@fastmail.com", phone: "+1 (647) 555-0198", location: "Toronto, Canada", experience: "8 years", currentTitle: "Backend Engineer at Lumen Freight", linkedin: "linkedin.com/in/sarahkhan-dev", resumeId: "res_sarah" },
  { id: "cand_alex", name: "Alex Rivera", email: "alex.rivera@proton.me", phone: "+1 (512) 555-0117", location: "Austin, USA", experience: "6 years", currentTitle: "Full Stack Engineer at Cobalt Pay", linkedin: "linkedin.com/in/alexrivera", resumeId: "res_alex" },
  { id: "cand_priya", name: "Priya Natarajan", email: "priya.n@outlook.com", phone: "+44 20 7946 0321", location: "London, UK", experience: "5 years", currentTitle: "Data Engineer at Meridian Retail", linkedin: "linkedin.com/in/priyanatarajan", resumeId: "res_priya" },
  { id: "cand_david", name: "David Chen", email: "dchen.ops@gmail.com", phone: "+1 (206) 555-0175", location: "Seattle, USA", experience: "7 years", currentTitle: "DevOps Engineer at Tidewater Cloud", linkedin: "linkedin.com/in/davidchen-ops", resumeId: "res_david" },
  { id: "cand_lena", name: "Lena Fischer", email: "lena.fischer@posteo.de", phone: "+49 30 555 0144", location: "Berlin, Germany", experience: "6 years", currentTitle: "Frontend Engineer at Kranich Mobility", linkedin: "linkedin.com/in/lenafischer", resumeId: "res_lena" },
  { id: "cand_marcus", name: "Marcus Bell", email: "marcus.bell@icloud.com", phone: "+1 (312) 555-0163", location: "Chicago, USA", experience: "3 years", currentTitle: "Software Engineer at Brightline Studio", linkedin: "linkedin.com/in/marcusbell", resumeId: "res_marcus" },
  { id: "cand_ahmed", name: "Ahmed Ali", email: "ahmed.ali@hey.com", phone: "+971 50 555 0129", location: "Dubai, UAE", experience: "4 years", currentTitle: "Frontend Developer at Souqline", linkedin: "linkedin.com/in/ahmedali-fe", resumeId: "res_ahmed" },
  { id: "cand_john", name: "John Smith", email: "john.smith.dev@gmail.com", phone: "+1 (415) 555-0186", location: "San Francisco, USA", experience: "5 years", currentTitle: "Full Stack Developer at Parcelwise", linkedin: "linkedin.com/in/johnsmith-fs", resumeId: "res_john" },
  { id: "cand_yuki", name: "Yuki Tanaka", email: "yuki.tanaka@mail.jp", phone: "+81 3 5555 0110", location: "Tokyo, Japan", experience: "4 years", currentTitle: "ML Engineer at Kagami AI Lab", linkedin: "linkedin.com/in/yukitanaka", resumeId: "res_yuki" },
  { id: "cand_carlos", name: "Carlos Mendes", email: "carlos.mendes@sapo.pt", phone: "+351 21 555 0137", location: "Lisbon, Portugal", experience: "9 years", currentTitle: "SRE at Atlântico Telecom", linkedin: "linkedin.com/in/carlosmendes", resumeId: "res_carlos" },
  { id: "cand_hannah", name: "Hannah Reyes", email: "hannah.reyes@northwindlabs.io", phone: "+1 (416) 555-0142", location: "Toronto, Canada", experience: "11 years", currentTitle: "Engineering Manager at Northwind Labs", linkedin: "linkedin.com/in/hannahreyes", resumeId: "res_hannah" },
];

const exp = (title, company, period, bullets) => ({ title, company, period, bullets });

export const resumes = {
  res_sarah: {
    id: "res_sarah", fileName: "Sarah_Khan_Resume_2026.pdf", uploadedAt: "2026-10-01", sizeKb: 184, pages: 2,
    headline: "Senior Backend Engineer · Node.js, PostgreSQL, distributed APIs",
    summary: "Backend engineer with 8 years building high-throughput logistics and payments APIs. Led the migration of a monolithic dispatch system to a modular Node.js service platform serving 40M requests/day.",
    experience: [
      exp("Backend Engineer", "Lumen Freight", "2022 — Present", ["Designed multi-tenant shipment API used by 1,200 carriers; cut p95 latency from 480ms to 120ms.", "Introduced PostgreSQL partitioning and read replicas for 2.3TB of tracking data.", "Mentored 4 engineers and owned the on-call runbook for the dispatch domain."]),
      exp("Software Engineer", "Quaypoint Payments", "2019 — 2022", ["Built idempotent payment webhooks processing $90M/month.", "Containerised 14 services with Docker and introduced contract testing."]),
      exp("Junior Developer", "Northgate Digital", "2017 — 2019", ["Shipped REST APIs and admin tooling for retail clients."]),
    ],
    education: "B.Sc. Computer Science — University of Waterloo, 2017",
    skills: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Docker", "Kafka", "AWS", "REST", "gRPC"],
  },
  res_alex: {
    id: "res_alex", fileName: "alex-rivera-cv.pdf", uploadedAt: "2026-09-29", sizeKb: 142, pages: 1,
    headline: "Full Stack Engineer · React, TypeScript, Node.js, GraphQL",
    summary: "Product-minded full stack engineer focused on payments UX and developer-facing dashboards.",
    experience: [
      exp("Full Stack Engineer", "Cobalt Pay", "2021 — Present", ["Rebuilt merchant dashboard in React + GraphQL; increased activation by 18%.", "Owned end-to-end testing strategy with Playwright across 3 squads."]),
      exp("Frontend Developer", "Harbor & Pine", "2019 — 2021", ["Built a component library adopted by 6 product teams."]),
    ],
    education: "B.S. Software Engineering — UT Austin, 2019",
    skills: ["React", "TypeScript", "Node.js", "GraphQL", "Playwright", "PostgreSQL"],
  },
  res_priya: {
    id: "res_priya", fileName: "Priya_Natarajan_DataEng.pdf", uploadedAt: "2026-09-27", sizeKb: 201, pages: 2,
    headline: "Data Engineer · Spark, Airflow, dimensional modelling",
    summary: "Data engineer building reliable batch and streaming pipelines for retail analytics.",
    experience: [
      exp("Data Engineer", "Meridian Retail", "2022 — Present", ["Migrated 140 Airflow DAGs to a lakehouse architecture on Delta Lake.", "Reduced nightly batch runtime from 6h to 1h40m with Spark tuning."]),
      exp("Analytics Engineer", "Fenwick Insights", "2020 — 2022", ["Designed star schemas powering finance reporting."]),
    ],
    education: "M.Sc. Data Science — Imperial College London, 2020",
    skills: ["Python", "Apache Spark", "SQL", "Airflow", "dbt", "Delta Lake"],
  },
  res_david: {
    id: "res_david", fileName: "DavidChen_DevOps.pdf", uploadedAt: "2026-09-24", sizeKb: 133, pages: 1,
    headline: "DevOps Engineer · Kubernetes, Terraform, AWS",
    summary: "Infrastructure engineer automating cloud platforms for SaaS teams.",
    experience: [
      exp("DevOps Engineer", "Tidewater Cloud", "2021 — Present", ["Managed 18 EKS clusters with Terraform and ArgoCD.", "Cut CI pipeline time by 42% through caching and parallelism."]),
      exp("Systems Engineer", "Evergreen Hosting", "2018 — 2021", ["Ran on-call for 300+ customer VMs."]),
    ],
    education: "B.S. Computer Engineering — University of Washington, 2018",
    skills: ["Kubernetes", "Terraform", "AWS", "GitHub Actions", "Prometheus"],
  },
  res_lena: {
    id: "res_lena", fileName: "Lena-Fischer-Lebenslauf-EN.pdf", uploadedAt: "2026-09-21", sizeKb: 167, pages: 2,
    headline: "Frontend Engineer · React, design systems",
    summary: "Frontend engineer building mobility booking interfaces used across 9 European cities.",
    experience: [
      exp("Frontend Engineer", "Kranich Mobility", "2021 — Present", ["Led design system rollout across web and kiosk apps.", "Improved Lighthouse performance score from 61 to 88."]),
      exp("Web Developer", "Studio Nord", "2019 — 2021", ["Built marketing sites and e-commerce storefronts."]),
    ],
    education: "B.Sc. Media Informatics — HTW Berlin, 2019",
    skills: ["React", "TypeScript", "CSS", "Storybook", "Vite"],
  },
  res_marcus: {
    id: "res_marcus", fileName: "marcus_bell_resume.pdf", uploadedAt: "2026-09-19", sizeKb: 96, pages: 1,
    headline: "Software Engineer · React, Node.js",
    summary: "Engineer at a digital agency shipping client web apps.",
    experience: [
      exp("Software Engineer", "Brightline Studio", "2023 — Present", ["Built booking flows for 5 hospitality clients."]),
      exp("Engineering Intern", "Loop Commerce", "2022", ["Wrote internal tooling in Node.js."]),
    ],
    education: "B.S. Computer Science — DePaul University, 2023",
    skills: ["React", "Node.js", "MongoDB", "Figma"],
  },
  res_ahmed: {
    id: "res_ahmed", fileName: "Ahmed_Ali_Frontend.pdf", uploadedAt: "2026-10-03", sizeKb: 118, pages: 1,
    headline: "Frontend Developer · React, Next.js",
    summary: "Frontend developer building high-traffic e-commerce experiences in the GCC region.",
    experience: [
      exp("Frontend Developer", "Souqline", "2022 — Present", ["Built RTL-first checkout used by 2M monthly shoppers."]),
      exp("Web Developer", "Falcon Digital", "2020 — 2022", ["Delivered 20+ client sites with Next.js."]),
    ],
    education: "B.Sc. Computer Science — American University of Sharjah, 2020",
    skills: ["React", "Next.js", "TypeScript", "Jest"],
  },
  res_john: {
    id: "res_john", fileName: "JohnSmith_FullStack.pdf", uploadedAt: "2026-10-05", sizeKb: 109, pages: 1,
    headline: "Full Stack Developer · Node.js, React, AWS",
    summary: "Full stack developer on last-mile delivery software.",
    experience: [exp("Full Stack Developer", "Parcelwise", "2021 — Present", ["Built driver routing dashboard and REST APIs."])],
    education: "B.S. Computer Science — San José State University, 2021",
    skills: ["Node.js", "React", "PostgreSQL", "AWS"],
  },
  res_yuki: {
    id: "res_yuki", fileName: "Yuki_Tanaka_ML.pdf", uploadedAt: "2026-10-05", sizeKb: 154, pages: 2,
    headline: "ML Engineer · PyTorch, MLOps",
    summary: "ML engineer deploying vision models to production.",
    experience: [exp("ML Engineer", "Kagami AI Lab", "2022 — Present", ["Shipped defect-detection models with 97.2% precision."])],
    education: "M.Eng. Information Science — University of Tokyo, 2022",
    skills: ["Python", "PyTorch", "MLflow", "Kubernetes"],
  },
  res_carlos: {
    id: "res_carlos", fileName: "Carlos_Mendes_SRE.pdf", uploadedAt: "2026-09-15", sizeKb: 121, pages: 1,
    headline: "Site Reliability Engineer",
    summary: "SRE with 9 years running telecom-grade infrastructure.",
    experience: [exp("SRE", "Atlântico Telecom", "2019 — Present", ["Owned SLOs for 99.99% voice platform."])],
    education: "M.Sc. Informatics — University of Lisbon, 2016",
    skills: ["Linux", "Go", "Prometheus", "Kubernetes"],
  },
  res_hannah: {
    id: "res_hannah", fileName: "Hannah_Reyes_EM_Resume.pdf", uploadedAt: "2026-09-12", sizeKb: 176, pages: 2,
    headline: "Engineering Manager · Platform & developer experience",
    summary: "Engineering manager leading 3 platform teams (17 engineers). Previously a staff backend engineer focused on API platforms and reliability.",
    experience: [
      exp("Engineering Manager", "Northwind Labs", "2023 — Present", ["Grew platform org from 6 to 17 engineers with a structured hiring loop.", "Reduced incident count by 35% through ownership and SLO programme."]),
      exp("Staff Software Engineer", "Arcturus Data", "2019 — 2023", ["Designed public API platform used by 4,000 customers.", "Led cross-team architecture reviews."]),
      exp("Senior Software Engineer", "Bluefin Analytics", "2015 — 2019", ["Built ingestion services in Go and Java."]),
    ],
    education: "B.A.Sc. Computer Engineering — University of Toronto, 2015",
    skills: ["People leadership", "System design", "Go", "PostgreSQL", "Delivery planning", "Hiring"],
  },
};
