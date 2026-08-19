"use client";

import { useState } from "react";
import { formatVND, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
   Plus,
   FolderKanban,
   Edit,
   Trash2,
   Eye,
   Target,
   Activity,
   FileText,
   AlertCircle,
   ArrowLeft,
   X,
   ExternalLink,
   Package
} from "lucide-react";
import { toast } from "sonner";
import { ProjectFormDialog } from "@/components/dashboard/ProjectFormDialog";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Project {
   id: string;
   creatorId: string;
   title: string;
   description: string | null;
   slug: string | null;
   coverImage: string | null;
   richDescription: any;
   linkedBlogPostIds: string[];
   linkedRewardIds: string[];
   createdAt: Date;
   updatedAt: Date;
   campaignCount: number;
   blogPostCount: number;
   linkedBlogCount: number;
   linkedRewardCount: number;
   hasActiveCampaign: boolean;
}

interface ProjectsManagementClientProps {
   projects: Project[];
   totalProjects: number;
   totalRaised: number;
   activeCampaignsCount: number;
}

export default function ProjectsManagementClient({
   projects,
   totalProjects,
   totalRaised,
   activeCampaignsCount
}: ProjectsManagementClientProps) {
   const [isLoading, setIsLoading] = useState(false);
   const [formDialogOpen, setFormDialogOpen] = useState(false);
   const [formProject, setFormProject] = useState<Project | null>(null);
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [selectedProject, setSelectedProject] = useState<Project | null>(null);

   const handleDeleteProject = async () => {
      if (!selectedProject) return;

      setIsLoading(true);
      try {
         const response = await fetch(`/api/projects/${selectedProject.id}`, {
            method: "DELETE",
         });

         if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Không thể xóa Project");
         }

         toast.success("Đã xóa Project thành công");
         setDeleteDialogOpen(false);
         setSelectedProject(null);
         window.location.reload();
      } catch (error) {
         toast.error(error instanceof Error ? error.message : "Lỗi xóa Project");
      } finally {
         setIsLoading(false);
      }
   };

   const openEditDialog = (project: Project) => {
      setFormProject(project);
      setFormDialogOpen(true);
   };

   const openCreateDialog = () => {
      setFormProject(null);
      setFormDialogOpen(true);
   };

   const openDeleteDialog = (project: Project) => {
      setSelectedProject(project);
      setDeleteDialogOpen(true);
   };

   return (
      <div className="min-h-screen bg-slate-50/50 pt-32 pb-24 px-6">
         <div className="max-w-7xl mx-auto space-y-8">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
                     <FolderKanban size={12} /> Quản lý Projects
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">Projects của tôi</h1>
                  <p className="text-lg text-gray-400 font-medium">Tổ chức và quản lý các chiến dịch của bạn theo Project.</p>
               </div>

               <Button
                  onClick={() => openCreateDialog()}
                  className="h-20 px-10 bg-blue-600 text-white font-black rounded-3xl hover:bg-black transition flex items-center gap-3 shadow-xl"
               >
                  <Plus size={24} />
                  Tạo Project
               </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-soft flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
                  <div className="w-16 h-16 bg-purple-50 rounded-[1.8rem] flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-500">
                     <FolderKanban size={32} />
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng Projects</div>
                     <div className="text-2xl font-black text-gray-900">{totalProjects}</div>
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-soft flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
                  <div className="w-16 h-16 bg-blue-50 rounded-[1.8rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                     <Target size={32} />
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng huy động</div>
                     <div className="text-2xl font-black text-gray-900">{formatVND(totalRaised)}</div>
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-soft flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
                  <div className="w-16 h-16 bg-orange-50 rounded-[1.8rem] flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500">
                     <Activity size={32} />
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Campaigns đang chạy</div>
                     <div className="text-2xl font-black text-gray-900">{activeCampaignsCount}</div>
                  </div>
               </div>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
               <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <FolderKanban className="text-purple-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                     Chưa có Project nào
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                     Tạo Project để tổ chức các chiến dịch của bạn một cách hiệu quả hơn
                  </p>
                  <Button
                     onClick={() => openCreateDialog()}
                     className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 transition"
                  >
                     <Plus size={20} />
                     Tạo Project đầu tiên
                  </Button>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project) => (
                     <Card key={project.id} className="rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                           {project.coverImage ? (
                              <Link
                                 href={`/projects/${project.id}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="block -mt-1 -mx-4 mb-3 overflow-hidden rounded-t-3xl"
                              >
                                 <img
                                    src={project.coverImage}
                                    alt={project.title}
                                    className="w-full h-44 object-cover hover:scale-105 transition-transform duration-500"
                                 />
                              </Link>
                           ) : (
                              <Link
                                 href={`/projects/${project.id}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="block -mt-1 -mx-4 mb-3 rounded-t-3xl"
                              >
                                 <div className="w-full h-28 bg-gradient-to-br from-purple-100 via-blue-50 to-blue-100 flex items-center justify-center">
                                    <FolderKanban size={36} className="text-purple-300" />
                                 </div>
                              </Link>
                           )}
                           <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                 <Link
                                    href={`/projects/${project.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Xem trang dự án công khai"
                                    className="group cursor-pointer"
                                 >
                                    <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 group-hover:underline transition-colors inline-flex items-center gap-1">
                                       {project.title}
                                       <ExternalLink size={12} className="text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                                    </CardTitle>
                                 </Link>
                                 {project.description && (
                                    <CardDescription className="line-clamp-2 text-sm">
                                       {project.description}
                                    </CardDescription>
                                 )}
                              </div>
                              {project.hasActiveCampaign && (
                                 <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Có campaign đang chạy" />
                              )}
                           </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {/* Stats */}
                           <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Target className="text-blue-600" size={16} />
                                 </div>
                                 <div>
                                    <div className="text-xs text-gray-400 font-semibold">Campaigns</div>
                                    <div className="text-sm font-bold text-gray-900">{project.campaignCount}</div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                                    <FileText className="text-orange-600" size={16} />
                                 </div>
                                 <div>
                                    <div className="text-xs text-gray-400 font-semibold">Blogs</div>
                                    <div className="text-sm font-bold text-gray-900">{project.blogPostCount}</div>
                                 </div>
                              </div>
                           </div>
                           {(project.linkedBlogCount > 0 || project.linkedRewardCount > 0) && (
                              <div className="flex items-center gap-2 pt-1">
                                 {project.linkedRewardCount > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-semibold">
                                       <Package size={11} />
                                       {project.linkedRewardCount} sản phẩm
                                    </span>
                                 )}
                                 {project.linkedBlogCount > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-full text-xs font-semibold">
                                       <FileText size={11} />
                                       {project.linkedBlogCount} bài viết
                                    </span>
                                 )}
                              </div>
                           )}

                           {/* Status */}
                           <div className="flex items-center gap-2">
                              {project.hasActiveCampaign ? (
                                 <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                                    <Activity size={10} />
                                    Đang chạy
                                 </div>
                              ) : (
                                 <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                                    <Activity size={10} />
                                    Không hoạt động
                                 </div>
                              )}
                              <span className="text-xs text-gray-400">
                                 Tạo: {formatDate(project.createdAt)}
                              </span>
                           </div>

                           {/* Actions */}
                           <div className="flex items-center gap-2 pt-2">
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => openEditDialog(project)}
                                 className="flex-1"
                              >
                                 <Edit size={14} />
                                 Sửa
                              </Button>
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => openDeleteDialog(project)}
                                 className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                 <Trash2 size={14} />
                              </Button>
                           </div>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            )}

            {/* Create/Edit Project Form Dialog */}
            <ProjectFormDialog
               open={formDialogOpen}
               onOpenChange={setFormDialogOpen}
               project={formProject}
               onSuccess={() => {
                  window.location.reload();
               }}
            />

            {/* Delete Project Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
               <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                     <DialogTitle className="text-red-600">Xác nhận xóa Project</DialogTitle>
                     <DialogDescription>
                        Bạn có chắc chắn muốn xóa Project này?
                     </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                     <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                           <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                           <div className="text-sm text-amber-800">
                              <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                              <p>Campaigns và blog sẽ không bị xóa, chỉ tách khỏi Project (projectId = null).</p>
                           </div>
                        </div>
                     </div>
                     {selectedProject && (
                        <div className="bg-gray-50 rounded-lg p-3">
                           <p className="text-sm font-semibold text-gray-900">{selectedProject.title}</p>
                           <p className="text-xs text-gray-500">
                              {selectedProject.campaignCount} campaigns • {selectedProject.blogPostCount} blogs
                           </p>
                        </div>
                     )}
                     <div className="flex justify-end gap-3 pt-4">
                        <Button
                           variant="outline"
                           onClick={() => setDeleteDialogOpen(false)}
                           disabled={isLoading}
                        >
                           Hủy
                        </Button>
                        <Button
                           variant="default"
                           onClick={handleDeleteProject}
                           disabled={isLoading}
                           className="bg-red-600 hover:bg-red-700"
                        >
                           {isLoading ? "Đang xóa..." : "Xóa Project"}
                        </Button>
                     </div>
                  </div>
               </DialogContent>
            </Dialog>
         </div>
      </div>
   );
}
