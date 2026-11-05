import { interviews, candidates, transcripts, aiInterviewer } from "@/data";

const planFor = (iv) => {
  const fromTranscript = (transcripts[iv.id] || []).map((t) => ({ id: t.id, skill: t.skill, text: t.question }));
  if (fromTranscript.length >= 3) return fromTranscript;
  return [
    { id: "q0", skill: "Introduction", text: `Thanks for joining. To start, tell me about your background and what draws you to the ${iv.role} role.` },
    ...iv.requiredSkills.map((s, i) => ({ id: `q${i + 1}`, skill: s, text: `Walk me through a recent project where ${s} was central. What decisions did you make, and what would you change now?` })),
  ];
};
import { respond, reject } from "./client";
import {  authenticatedRequest, publicRequest, tenantRequest } from "./api";
import { method } from "lodash";


const sortKey = (iv) => new Date(iv.interviewDate || iv.createdAt).getTime();
export const withCandidate = (iv) => ({ ...iv, candidate: candidates.find((c) => c.id === iv.candidateId) });

export const scopeInterviews = ({ context = "organization", orgId } = {}) =>
  interviews
    .filter((iv) => (context === "individual" ? iv.context === "individual" : iv.context === "organization" && iv.orgId === orgId))
    .sort((a, b) => sortKey(b) - sortKey(a));

export const interviewsService = {
  list(context) {
    if(context === "individual")
    {
     return authenticatedRequest("/api/v1/user/interviews",{
    method:"GET"
   });
    }
    return tenantRequest("/api/v1/organization/interviews",{
    method:"GET",
   });;
  },
  getPublicReport(token)
  {
   return publicRequest(`/api/v1/public/reports/${token}`,{
    method:"GET"
   })
  },
  getDetail(slug,context) {
    if(context === "individual")return authenticatedRequest(`/api/v1/user/interview/${slug}`,{method:"GET"})
    return tenantRequest(`/api/v1/organization/interview/${slug}`,{method:"GET"});
  },
  getPublicInterviewInfo(token){
   return publicRequest(`/api/v1/public/interviewInfo/${token}`,{
    method:"GET"
   })
  },
  saveExchange({interviewId,slug,aiMsg,userMsg,organizationId,isPublic=false})
  {
    console.log(interviewId,slug,aiMsg,userMsg,organizationId,isPublic=false,".......567")
    if(!isPublic && !organizationId)
    {
    return authenticatedRequest("/api/v1/user/interview/message",{
    method:"POST",
    body:JSON.stringify({interviewId,aiMsg,userMsg}) })
    }
    console.log("reach");
    return publicRequest("/api/v1/organization/interview/message",{
    method:"POST",
    body:JSON.stringify({organizationId,
    userMsg,
    aiMsg,
    interviewId,
    slug})
    })
  },
  getLiveSession(id,isPublic) {
    if(isPublic)
    {
 return publicRequest("/api/v1/organization/interview/session",{
    method:"POST",
    body:JSON.stringify({slug:id})
   })
    }
   return authenticatedRequest("/api/v1/user/interview/session",{
    method:"POST",
    body:JSON.stringify({slug:id})
   })
  
  },
  startInterviewUpload(interviewId,organizationId){
    return publicRequest("/api/v1/interview/upload/start",{
      method:"POST",
      body:JSON.stringify({interviewId})
    })
  },
  getInterviewVideoUrls(interviewId, uploadId, startPart, count){
   return publicRequest("/api/v1/interview/video/sign-url",{
    method:"POST",
    body:JSON.stringify({interviewId, uploadId, startPart, count})
   })
  },
   InterviewVideoComplete(interviewId, uploadId, parts){
   return publicRequest("/api/v1/interview/upload/complete",{
    method:"POST",
    body:JSON.stringify({interviewId, uploadId, parts})
   })
  },
  create(payload,context ) {

     if(context === "individual")
    {
     return authenticatedRequest("/api/v1/user/interview",{
    method:"POST",
    body:JSON.stringify({
    title: payload.title,
    role: payload.role,
    compName: payload.company,
    description: payload.description,
    skills: payload.skills,
    durationMinutes: payload.durationMinutes
    }),
   });
    }
     return tenantRequest("/api/v1/organization/interview",{
    method:"POST",
       body:JSON.stringify({
     title: payload.title,
    role: payload.role,
    compName: payload.company,
    description: payload.description,
    skills: payload.skills,
    email: payload.candidateEmail,
    durationMinutes: payload.durationMinutes
    }),
   });
  },
};
