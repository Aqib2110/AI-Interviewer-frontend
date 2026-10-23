// Dummy data: AI evaluation reports and transcripts, keyed by interview id.

const s = (name, score, explanation) => ({ name, score, explanation });
const q = (id, at, skill, question, answer, evaluation, rating) => ({ id, at, skill, question, answer, evaluation, rating });

export const reports = {
  iv_1042: {
    dimensions: { technical: 90, communication: 84, problemSolving: 88, systemDesign: 84 },
    skills: [
      s("Node.js", 92, "Demonstrated strong understanding of asynchronous processing, event-loop behaviour under load and backend scalability patterns."),
      s("PostgreSQL", 88, "Explained partitioning, composite indexes and query planning clearly; used EXPLAIN ANALYZE output to justify decisions."),
      s("System Design", 84, "Produced a sound multi-tenant architecture; discussion of cross-region failover was brief."),
      s("REST API Design", 91, "Consistent resource modelling, idempotency keys and versioning strategy. Strong pagination and error-contract reasoning."),
      s("Docker", 79, "Comfortable with multi-stage builds and image hygiene; limited depth on orchestration and runtime security."),
      s("Redis", 76, "Correctly applied cache-aside and TTLs; did not address stampede protection or eviction policy trade-offs."),
    ],
    summary: "Sarah demonstrated strong backend engineering fundamentals across API design, data modelling and production operations. She structured answers clearly, grounded them in real incidents from her current role, and consistently reasoned about trade-offs rather than reciting patterns. Her multi-tenant API design was the strongest part of the interview. Gaps appeared in distributed systems topics — cross-region consistency and advanced caching — where answers stayed at a high level. Overall she meets the bar for a senior backend role and would likely ramp quickly on the platform team.",
    strengths: ["Strong API architecture and contract design", "Deep, practical PostgreSQL knowledge", "Methodical debugging approach grounded in real incidents", "Clear, structured communication"],
    weaknesses: ["Limited experience with distributed systems and cross-region consistency", "Some gaps in advanced caching strategies", "Could improve container orchestration knowledge"],
    recommendation: "strong_hire",
    recommendationNote: "Advance to the final team interview. Probe distributed systems depth with a follow-up design exercise.",
    generatedAt: "2026-10-05T15:02:00",
  },
  iv_1041: {
    dimensions: { technical: 93, communication: 91, problemSolving: 92, systemDesign: 86 },
    skills: [s("React", 95, "Expert-level reasoning about rendering, memoisation and state colocation."), s("TypeScript", 93, "Used discriminated unions and generics fluently to model billing states."), s("Node.js", 88, "Solid service design; good grasp of streaming large exports."), s("GraphQL", 91, "Thoughtful schema design with dataloaders and cost limiting."), s("Testing", 90, "Clear testing pyramid with pragmatic contract and E2E coverage.")],
    summary: "Alex is an unusually well-rounded full stack engineer. Answers moved comfortably between UI architecture and backend concerns, with concrete metrics from past work. He proactively raised edge cases in billing proration and explained how he would test them. Minor gaps in large-scale data migration planning.",
    strengths: ["End-to-end ownership mindset", "Excellent frontend architecture", "Pragmatic testing strategy"],
    weaknesses: ["Less experience with large-scale data migrations", "Limited exposure to on-call operations"],
    recommendation: "strong_hire", recommendationNote: "Fast-track to offer conversation with the Billing lead.", generatedAt: "2026-10-04T11:15:00",
  },
  iv_1039: {
    dimensions: { technical: 84, communication: 80, problemSolving: 82, systemDesign: 77 },
    skills: [s("Python", 86, "Idiomatic, well-structured pipeline code with sensible typing."), s("Apache Spark", 85, "Strong on partitioning, skew handling and broadcast joins."), s("SQL", 88, "Window functions and incremental models handled confidently."), s("Airflow", 78, "Good DAG hygiene; less clear on backfill strategy at scale."), s("Data Modeling", 72, "Reasonable star schema; slowly changing dimensions explanation was incomplete.")],
    summary: "Priya showed strong hands-on pipeline engineering with excellent Spark tuning experience. Modelling answers were correct but less deep, particularly around historical tracking. A solid hire for the analytics platform with mentoring on modelling.",
    strengths: ["Excellent Spark performance tuning", "Strong SQL fluency", "Reliability-focused mindset"],
    weaknesses: ["Slowly changing dimensions depth", "Backfill strategy for large DAGs"],
    recommendation: "hire", recommendationNote: "Proceed to team interview with focus on data modelling.", generatedAt: "2026-10-02T17:01:00",
  },
  iv_1037: {
    dimensions: { technical: 77, communication: 70, problemSolving: 74, systemDesign: 72 },
    skills: [s("Kubernetes", 82, "Confident with deployments, HPA and rollout strategies."), s("Terraform", 79, "Good module structure; state management for multi-env was vague."), s("AWS", 76, "Broad service knowledge; networking answers lacked detail."), s("CI/CD", 74, "Solid pipeline design but limited progressive delivery experience."), s("Observability", 60, "Relied on dashboards; little discussion of SLOs or tracing.")],
    summary: "David has practical, hands-on infrastructure experience, particularly with Kubernetes. Answers were sometimes brief and needed prompting. Observability practices are below what the platform team needs.",
    strengths: ["Hands-on Kubernetes operations", "Pragmatic automation"],
    weaknesses: ["Observability and SLO practices", "Concise answers lacked reasoning", "Cloud networking depth"],
    recommendation: "consider", recommendationNote: "Consider for a mid-level infrastructure role rather than senior.", generatedAt: "2026-09-30T12:05:00",
  },
  iv_1036: {
    dimensions: { technical: 70, communication: 74, problemSolving: 66, systemDesign: 62 },
    skills: [s("React", 76, "Comfortable with hooks and composition."), s("CSS Architecture", 78, "Thoughtful token and theming approach."), s("Accessibility", 58, "Knew ARIA basics; struggled with focus management in complex widgets."), s("Performance", 64, "Mentioned Lighthouse but limited profiling depth."), s("TypeScript", 66, "Basic typing; avoided generics.")],
    summary: "Lena has strong design system instincts and communicates well with designers. For a senior role, accessibility and performance depth fell short of expectations.",
    strengths: ["Design token architecture", "Collaboration with design"],
    weaknesses: ["Accessibility depth", "Performance profiling", "Advanced TypeScript"],
    recommendation: "consider", recommendationNote: "Possible fit at mid-level; not recommended for senior.", generatedAt: "2026-09-28T09:44:00",
  },
  iv_1033: {
    dimensions: { technical: 56, communication: 61, problemSolving: 50, systemDesign: 45 },
    skills: [s("React", 64, "Built features but limited understanding of state management trade-offs."), s("Node.js", 52, "Basic Express knowledge; unclear on error handling."), s("Product Thinking", 58, "Suggested experiments without success metrics."), s("SQL", 42, "Struggled with joins and aggregation.")],
    summary: "Marcus is early in his career and showed enthusiasm, but answers lacked depth across backend and data topics. Not a fit for this role at this time.",
    strengths: ["Enthusiasm for product work", "Comfortable with UI implementation"],
    weaknesses: ["SQL fundamentals", "Backend error handling", "Defining success metrics"],
    recommendation: "no_hire", recommendationNote: "Decline politely; revisit for junior roles in 6–12 months.", generatedAt: "2026-09-25T16:20:00",
  },
  iv_p203: {
    dimensions: { technical: 74, communication: 86, problemSolving: 80, systemDesign: 72 },
    skills: [s("People Leadership", 85, "Clear, empathetic approach to underperformance with concrete follow-through."), s("Delivery Planning", 78, "Good quarterly planning; risk buffers were implicit."), s("System Design", 70, "Reasonable architecture guidance, stayed high level."), s("Stakeholder Communication", 82, "Structured updates and crisp trade-off framing.")],
    summary: "You communicated with clarity and empathy, especially in people scenarios. To move up, quantify delivery outcomes and bring more technical depth to architecture questions.",
    strengths: ["Empathetic, structured people leadership", "Clear stakeholder framing"],
    weaknesses: ["Quantifying delivery outcomes", "Technical depth in architecture answers"],
    recommendation: "hire", recommendationNote: "Ready for EM loops. Practise one deep system design story.", generatedAt: "2026-10-01T19:40:00",
  },
  iv_p201: {
    dimensions: { technical: 74, communication: 78, problemSolving: 70, systemDesign: 68 },
    skills: [s("Distributed Systems", 66, "Knew consensus basics; partition handling needed prompting."), s("API Design", 82, "Strong public API versioning experience."), s("Technical Strategy", 70, "Good vision; roadmap sequencing could be sharper.")],
    summary: "Strong API platform background. Distributed systems depth is the main gap for staff-level architecture interviews.",
    strengths: ["Public API platform experience", "Clear communication"],
    weaknesses: ["Distributed systems depth", "Roadmap sequencing"],
    recommendation: "consider", recommendationNote: "Practise partition-tolerance scenarios before staff loops.", generatedAt: "2026-09-18T21:00:00",
  },
};

export const transcripts = {
  iv_1042: [
    q("t1", "05:12", "System Design", "How would you design a scalable API for a multi-tenant SaaS platform?", "I'd resolve tenant context at the edge from the auth token, then carry it through every layer as an explicit parameter rather than ambient state. For data I'd start with a shared schema and a tenant_id on every row, enforced with Postgres row-level security, and keep a path to move large tenants to dedicated databases. Rate limits and quotas would be per tenant, stored in Redis.", "Strong understanding of tenant isolation and API architecture. Proactively mentioned row-level security and a migration path for large tenants.", "strong"),
    q("t2", "11:40", "REST API Design", "A client retries a payment creation request after a timeout. How do you prevent duplicate charges?", "Idempotency keys. The client sends a key per logical operation; we store the key with the request hash and the response. On retry we return the stored response. If the hash differs, we reject with a 422. Keys expire after 24 hours.", "Precise and production-ready. Covered request hashing and expiry, which most candidates miss.", "strong"),
    q("t3", "15:05", "PostgreSQL", "A query on a 400M-row events table has become slow. Walk me through how you'd investigate.", "First EXPLAIN ANALYZE to see whether it's a seq scan or a bad join. Check that statistics are fresh. Often it's a missing composite index matching the WHERE and ORDER BY. At that size I'd also look at time-based partitioning so queries prune old partitions.", "Systematic diagnosis with correct tooling. Partitioning recommendation fits the data shape.", "strong"),
    q("t4", "23:40", "Redis", "How would you cache tenant configuration that is read on every request?", "Cache-aside in Redis with a TTL of a few minutes, plus explicit invalidation when config changes. Maybe an in-process LRU in front of Redis for the hottest keys.", "Correct baseline, but did not address cache stampede or consistency between the in-process and Redis layers.", "adequate"),
    q("t5", "31:30", "Node.js", "Tell me about a production incident you debugged in a Node.js service.", "We had p99 spikes every few minutes. Heap snapshots showed a large JSON parse blocking the event loop on webhook payloads. We moved parsing to a worker thread and added payload size limits. p99 dropped from 2.1s to 180ms.", "Excellent incident narrative with measurable outcome. Clear understanding of event-loop blocking.", "strong"),
    q("t6", "36:50", "System Design", "How would your design change if we needed active-active across two regions?", "I'd probably keep writes in one primary region and replicate reads… for true active-active we'd need conflict resolution, maybe CRDTs, but I haven't run that in production.", "Honest but shallow. Limited depth on multi-region consistency and failover — a key follow-up area.", "weak"),
  ],
  iv_1041: [
    q("t1", "06:20", "GraphQL", "How do you avoid N+1 queries in a GraphQL API?", "Dataloaders per request to batch and cache lookups, plus query cost analysis to reject expensive queries before execution.", "Strong, complete answer including cost limiting.", "strong"),
    q("t2", "14:05", "React", "A billing table with 5,000 rows feels sluggish. What do you do?", "Profile first. Usually it's re-renders from unstable props — memoise row components, virtualise the list, and move filter state closer to where it's used.", "Methodical and correct; profiling-first mindset.", "strong"),
    q("t3", "24:30", "Testing", "How would you test proration logic?", "Pure function with table-driven unit tests for edge dates, then one contract test against the billing provider sandbox.", "Pragmatic testing pyramid aligned to risk.", "strong"),
  ],
  iv_1039: [
    q("t1", "08:10", "Apache Spark", "A Spark job is slow because of a skewed join key. How do you fix it?", "Salt the hot keys, or broadcast the smaller side if it fits in memory. AQE skew join handling helps in Spark 3.", "Clear and practical; mentioned AQE.", "strong"),
    q("t2", "19:40", "Data Modeling", "How do you track historical changes to customer plans?", "A type 2 dimension with valid_from and valid_to… I'd need to think about late-arriving updates.", "Correct pattern, incomplete handling of late-arriving data.", "adequate"),
    q("t3", "30:15", "Airflow", "How do you backfill six months of data safely?", "Run the DAG with catchup in small date ranges and limit concurrency.", "Reasonable but missed idempotency and downstream impact.", "adequate"),
  ],
  iv_1037: [
    q("t1", "07:30", "Kubernetes", "How do you roll out a risky change to a critical service?", "Rolling update with readiness probes, and I'd watch the dashboards.", "Workable, but no canary or automated rollback criteria.", "adequate"),
    q("t2", "18:10", "Observability", "How would you define SLOs for an API?", "Uptime, I guess 99.9%. And alert when CPU is high.", "Confuses resource metrics with user-facing SLIs.", "weak"),
    q("t3", "27:45", "Terraform", "How do you structure Terraform for three environments?", "Shared modules, separate state per environment, and a pipeline that plans on PR.", "Solid structure.", "strong"),
  ],
  iv_1036: [
    q("t1", "05:40", "CSS Architecture", "How do you structure design tokens for theming?", "Primitive tokens, then semantic tokens that components consume, so themes only remap semantics.", "Clear, scalable token architecture.", "strong"),
    q("t2", "15:20", "Accessibility", "How do you manage focus in a modal dialog?", "Set focus on open and… return it on close. I'd use a library for the trap.", "Partially correct; missed inert background and escape handling.", "weak"),
    q("t3", "24:10", "Performance", "A page has a poor LCP score. What do you check?", "Image sizes and lazy loading.", "Too narrow; no mention of render-blocking resources or server timing.", "adequate"),
  ],
  iv_1033: [
    q("t1", "06:00", "SQL", "Find the top 3 customers by revenue per month.", "I'd select from orders, group by customer, and order by sum… I'm not sure how to do per month.", "Did not reach window functions or date bucketing.", "weak"),
    q("t2", "14:30", "Product Thinking", "How would you test a new onboarding checklist?", "Ship it to half the users and see if they like it.", "No success metric or guardrail defined.", "weak"),
    q("t3", "22:15", "React", "When would you lift state up?", "When two siblings need the same data.", "Correct basic answer.", "adequate"),
  ],
  iv_p203: [
    q("t1", "06:30", "People Leadership", "A senior engineer is missing commitments. How do you handle it?", "Private conversation first to understand context, agree on specific expectations, then weekly check-ins with clear examples.", "Empathetic and structured.", "strong"),
    q("t2", "17:10", "Delivery Planning", "How do you plan a quarter with uncertain scope?", "Commit to outcomes, sequence by risk, and keep a capacity buffer.", "Good, but quantify the buffer and how it is reviewed.", "adequate"),
    q("t3", "28:00", "Stakeholder Communication", "How do you push back on an executive deadline?", "Present options with trade-offs and the cost of each.", "Crisp trade-off framing.", "strong"),
  ],
  iv_p201: [
    q("t1", "09:15", "Distributed Systems", "What happens to your design during a network partition?", "We'd lose writes to one side… I'd need to think about which side wins.", "Needed prompting to reason about CAP trade-offs.", "weak"),
    q("t2", "21:00", "API Design", "How do you deprecate a public API version?", "Announce, add sunset headers, monitor usage per client, then contact the long tail directly.", "Excellent operational detail.", "strong"),
    q("t3", "33:30", "Technical Strategy", "How would you sequence a platform migration?", "Start with the least risky services to build confidence.", "Reasonable; could tie sequencing to business value.", "adequate"),
  ],
};
