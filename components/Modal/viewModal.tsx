import {useModal} from "@/context/ModalContext";
import {deleteLead} from "@/lib/utils/data/leads";
import {advanceLead, setPendingLead, rollbackLead, resetLead} from "@/lib/utils/data/leadStage";
import {useToast} from "@/context/ToastContext";
import {FormattedLead} from "@/types/formattedLead";

import { ChevronsRight, Flag, Clock, RotateCcw, SquarePen, Trash, Calendar, X, MessageCircleMore, Phone, Mail, Earth} from 'lucide-react';
import { FaInstagram } from "react-icons/fa";
import { IconType } from "react-icons";



type LeadViewData = FormattedLead & {instagramUrl?: string; websiteUrl?: string};
type ViewModalProps = { data: LeadViewData };

function InfoItem({icon: Icon, value, href, title}: {icon: IconType; value?: string | null; href?: string; title?: string}) {
    if (!value) return null;

    return (
        <div className="flex min-w-0 items-center gap-3">
            <Icon className="size-7 shrink-0 text-primary" />
            <div className="min-w-0">
                {title && <p className="text-lg font-semibold text-primary -mb-1">{title}</p>}
                {href ? (
                    <a href={href} target="_blank" rel="noreferrer" className="break-all text-lg text-offblack hover:underline">{value}</a>
                ) : (
                    <p className="break-all text-lg text-black">{value}</p>
                )}
            </div>
        </div>
    );
}

function RailButton({label, onClick, children, destructive = false}: {label: string; onClick: () => void; children: React.ReactNode; destructive?: boolean}) {
    return (
        <button type="button" title={label} aria-label={label} onClick={onClick}
            className={`flex size-12 shrink-0 items-center justify-center rounded-full bg-white/90 text-darkgray shadow-sm transition cursor-pointer`}>
            {children}
        </button>
    );
}

export default function ViewModal({data}: ViewModalProps) {
    const {closeModal, openModal} = useModal();
    const {showToast} = useToast();
    const getContactIcon = (platform?: string | null) => {
        if (platform === "INSTAGRAM") return FaInstagram;
        if (platform === "EMAIL") return Mail;
        return Phone;
    };

    const getContactHref = (platform?: string | null, value?: string | null) => {
        if (!value) return undefined;
        if (platform === "INSTAGRAM") return data.instagramUrl || `https://instagram.com/${value.replace("@", "")}`;
        if (platform === "EMAIL") return `mailto:${value}`;
        if (platform === "PHONE") return `tel:${value}`;
        return undefined;
    };

    const formatPlatform = (platform?: string | null) =>
        platform ? platform.charAt(0) + platform.slice(1).toLowerCase() : "Platform not specified";

    const runAction = async (action: () => Promise<unknown>, success: string) => {
        try {
            await action();
            showToast(success, "", "success");
        } catch (err) {
            showToast("Error", err instanceof Error ? err.message : "Something went wrong", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteLead(data.id);
            closeModal();
            showToast("Lead deleted successfully", "", "success");
        } catch {
            showToast("Error", "", "error");
        }
    };

    function timeUntil(nextActionAt: any) {
        const now = new Date();
        const target = new Date(nextActionAt);

        const diffMs = target.getTime() - now.getTime();

        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }


    return (
        <div className="flex flex-col gap-5">
            <header className="flex items-start justify-between rounded-[2rem] bg-white/85 px-8 py-6 shadow-sm">
                <div className="min-w-0">
                    <h1 className="truncate text-4xl font-bold text-primary">{data.companyName}</h1>
                    {data.nextActionAt && (
                        <span className={`flex items-center gap-2 text-lg font-semibold text-darkgray`}>
                        <Calendar size={20} />
                        <span className="">{data.nextActionAtFormatted.substring(0, data.nextActionAtFormatted.length - 5)}</span>
                        <Clock size={20} />
                        <span className="">{timeUntil(data.nextActionAt) + 1 + "d"}</span>
                    </span>
                    )}
                </div>
                <button onClick={closeModal} aria-label="Close lead details" className="cursor-pointer ml-4 flex size-10 shrink-0 items-center justify-center rounded-full text-darkgray">
                    <X className="size-7"/>
                </button>
            </header>

            <div className="flex min-h-0 gap-5">
                <section className="min-h-[420px] w-full overflow-y-auto rounded-[2rem] bg-white/85 p-4 shadow-sm">
                    <div className="rounded-[1.5rem] gradient-primary px-6 py-5 text-white shadow-set">
                        <p className="-mb-1.5 text-base font-medium">Upcoming action</p>
                        <h3 className="text-3xl font-bold">{data.stageFormatted}</h3>
                    </div>

                    <div className="p-5">
                        <div className="py-3">
                            <InfoItem
                                title="Primary contact"
                                icon={getContactIcon(data.primaryPlatform)}
                                value={data.primaryContactValue}
                                href={getContactHref(
                                    data.primaryPlatform,
                                    data.primaryContactValue
                                )}
                            />
                        </div>

                        <div className="py-3">
                            <InfoItem
                                title="Secondary contact"
                                icon={getContactIcon(data.secondaryPlatform)}
                                value={data.secondaryContactValue}
                                href={getContactHref(
                                    data.secondaryPlatform,
                                    data.secondaryContactValue
                                )}
                            />
                        </div>

                        <div className="py-3">
                            <InfoItem
                                title="Website"
                                icon={Earth}
                                value={data.website}
                                href={
                                    data.websiteUrl ||
                                    (data.website && data.website !== "—"
                                        ? `https://${data.website.replace(/^https?:\/\//, "")}`
                                        : undefined)
                                }
                            />
                        </div>

                        {data.note && (
                            <div className="flex min-w-0 items-start gap-4 py-3">
                                <MessageCircleMore className="mt-1 size-7 shrink-0 text-primary" />

                                <div className="min-w-0">
                                    <p className="-mb-1 text-lg font-semibold text-primary">
                                        Note
                                    </p>

                                    <p className="text-lg leading-relaxed text-offblack">
                                        {data.note}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <aside className="flex flex-col items-center justify-center gap-5 rounded-full bg-white/85 px-7 py-5 shadow-sm w-[80px]">
                    <RailButton label="Advance stage" onClick={() => runAction(async () => { const result = await advanceLead(data.id); if (result?.reachedClosed) openModal("finish", {id: data.id}); }, "Stage advanced")}><ChevronsRight className="ml-0.5" /></RailButton>
                    <RailButton label="Go back one stage" onClick={() => runAction(() => rollbackLead(data.id), "Stage rolled back")}><ChevronsRight className="rotate-180" /></RailButton>
                    <RailButton label="Finish lead" onClick={() => openModal("finish", data)}><Flag/></RailButton>
                    <RailButton label="Set pending" onClick={() => runAction(() => setPendingLead(data.id), "Lead status updated")}><Clock /></RailButton>
                    <RailButton label="Edit lead" onClick={() => openModal("edit", data)}><SquarePen/></RailButton>
                    <RailButton label="Reset stage" destructive onClick={() => runAction(() => resetLead(data.id), "Stage reset")}><RotateCcw/></RailButton>
                    <RailButton label="Delete lead" destructive onClick={handleDelete}><Trash /></RailButton>
                </aside>
            </div>
        </div>
    );
}
