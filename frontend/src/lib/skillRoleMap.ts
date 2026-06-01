/** Must match backend `career_id_to_job_role` (jobs + SkillTest storage). */
export function skillRoleForApi(careerId: string): string {
  const m: Record<string, string> = {
    frontend: "frontend",
    backend: "backend",
    fullstack: "fullstack",
    mobile: "mobile",
    devops: "devops",
    designer: "designer",
    data: "backend",
    qa: "frontend",
    cybersecurity: "devops",
    management: "fullstack",
    cloud: "devops",
    ai_ml: "backend",
    blockchain: "backend",
  };
  return m[careerId] || "fullstack";
}
