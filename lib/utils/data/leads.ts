'use server'

import { prisma } from "@/lib/prisma";
import { formatLead } from "@/lib/utils/data/formatLead";
import { revalidatePath } from "next/cache";


function revalidatePaths () {
    revalidatePath("/dashboard");
    revalidatePath("/kanban");
    revalidatePath("/table");
}

export async function getLeads() {
    const leads = await prisma.lead.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return leads.map(formatLead);
}

export async function createLead(form: any) {
    if (typeof form?.companyName !== "string" || !form.companyName.trim()) {
        throw new Error("Company name is required");
    }

    await prisma.lead.create({
        data: {
            companyName: form.companyName,
            primaryContactValue: form.primaryContactValue || null,
            primaryPlatform: form.primaryPlatform || null,
            website: form.website || null,
            nextActionAt: form.contactDate
                ? new Date(form.contactDate)
                : null,
            secondaryContactValue:
                form.secondaryContactValue || undefined,
            secondaryPlatform:
                form.secondaryPlatform || undefined,
            note: form.note,
            stage: form.contactDate
                ? "PRIMARY_CONTACT"
                : "BACKLOG",
            status: form.contactDate
                ? "ACTIVE"
                : "IDLE",
            primaryContactAt: form.contactDate
                ? new Date(form.contactDate)
                : null,
            logs: {
                create: {
                    type: "CREATED",
                    toStage: form.contactDate
                        ? "PRIMARY_CONTACT"
                        : "BACKLOG",
                    toStatus: form.contactDate
                        ? "ACTIVE"
                        : "IDLE",
                    toNextActionAt: form.contactDate
                        ? new Date(form.contactDate)
                        : null,
                }
            }
        },

    });
    revalidatePaths();
}

export async function deleteLead(id: string) {
    await prisma.lead.delete({
        where: {
            id,
        },
    });
    revalidatePaths();
}

export async function updateLead(id: string, form: any) {
    const lead = await prisma.lead.findUnique({
        where: { id },
    });

    if (!lead) {
        throw new Error("Lead not found");
    }

    const nextActionAt = form.contactDate
        ? new Date(form.contactDate)
        : null;

    await prisma.lead.update({
        where: { id },
        data: {
            companyName: form.companyName,
            primaryContactValue: form.primaryContactValue,
            primaryPlatform: form.primaryPlatform,
            website: form.website,
            nextActionAt,
            secondaryContactValue:
                form.secondaryContactValue || undefined,
            secondaryPlatform:
                form.secondaryPlatform || undefined,
            note: form.note,

            ...(nextActionAt &&
                lead.stage === "BACKLOG" && {
                    stage: "PRIMARY_CONTACT",
                    primaryContactAt: nextActionAt,
                }),
        },
    });

    revalidatePaths();
}
