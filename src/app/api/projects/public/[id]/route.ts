import { NextRequest, NextResponse } from 'next/server';
import { projectIdSchema } from '@/lib/project/project.validation';
import { logError } from '@/lib/project/project.errors';
import {
    handleServiceError,
    validationErrorResponse,
    mapZodErrors,
} from '@/lib/project/project.response-handlers';
import { z } from 'zod';
import { getPublicProjectDetail } from '@/lib/project/get-public-project-detail';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;

        let validatedProjectId;
        try {
            validatedProjectId = projectIdSchema.parse(projectId);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return validationErrorResponse(mapZodErrors(error));
            }
            throw error;
        }

        const project = await getPublicProjectDetail(validatedProjectId);
        if (!project) {
            const { notFoundResponse } = await import('@/lib/project/project.response-handlers');
            return notFoundResponse('Project not found');
        }

        return NextResponse.json(project, { status: 200 });
    } catch (error) {
        const projectId = await params.then(p => p.id).catch(() => 'unknown');
        logError(error as Error, {
            operation: 'getPublicProjectById',
            projectId,
            method: 'GET',
            path: `/api/projects/public/${projectId}`,
            params: { id: projectId },
        });

        return handleServiceError(error);
    }
}
