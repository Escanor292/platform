import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProjectsManagementClient from "./ProjectsManagementClient";

export default async function ProjectsManagementPage() {
   const session = await auth();
   if (!session?.user) redirect("/auth/login");

   const userId = (session.user as any).id;

   // Get all projects for the creator
   const projects = await prisma.projects.findMany({
      where: { creatorId: userId },
      include: {
         campaigns: {
            select: {
               id: true,
               status: true,
               currentAmount: true,
            },
         },
      },
      orderBy: { createdAt: "desc" },
   });

   // Calculate statistics
   const totalProjects = projects.length;
   const totalRaised = projects.reduce((acc, project) => {
      return acc + project.campaigns.reduce((sum, c) => sum + Number(c.currentAmount), 0);
   }, 0);
   const activeCampaignsCount = projects.reduce((acc, project) => {
      return acc + project.campaigns.filter(c => c.status === "ACTIVE").length;
   }, 0);

   // Serialize the data for client component
   const serializedProjects = projects.map(project => ({
      id: project.id,
      creatorId: project.creatorId,
      title: project.title,
      slug: project.slug,
      coverImage: project.coverImage,
      richDescription: project.richDescription,
      linkedBlogPostIds: [], // Will be calculated separately
      linkedRewardIds: [], // Will be calculated separately
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      campaignCount: project.campaigns.length,
      blogPostCount: 0, // Will be calculated separately
      hasActiveCampaign: project.campaigns.some(c => c.status === "ACTIVE"),
   }));

   // Get blog post counts and linked-item counts for each project
   const projectsWithBlogCounts = await Promise.all(
      serializedProjects.map(async (project) => {
         const [blogPostCount, linkedBlogCount, linkedRewardCount, linkedBlogLinks, linkedRewardLinks] = await Promise.all([
            prisma.blog_posts.count({
               where: { projectId: project.id },
            }),
            prisma.project_blog_links.count({
               where: { projectId: project.id },
            }),
            prisma.project_reward_links.count({
               where: { projectId: project.id },
            }),
            prisma.project_blog_links.findMany({
               where: { projectId: project.id },
               select: { blogPostId: true },
            }),
            prisma.project_reward_links.findMany({
               where: { projectId: project.id },
               select: { rewardId: true },
            }),
         ]);
         return {
            ...project,
            blogPostCount,
            linkedBlogCount,
            linkedRewardCount,
            linkedBlogPostIds: linkedBlogLinks.map((l) => l.blogPostId),
            linkedRewardIds: linkedRewardLinks.map((l) => l.rewardId),
         };
      })
   );

   return (
      <ProjectsManagementClient
         projects={projectsWithBlogCounts}
         totalProjects={totalProjects}
         totalRaised={totalRaised}
         activeCampaignsCount={activeCampaignsCount}
      />
   );
}
