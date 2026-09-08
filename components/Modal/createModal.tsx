import { useState } from "react";
import {useModal} from "@/context/ModalContext";
import { IoClose } from "react-icons/io5";
import { Label, Input, Select } from "./inputs";
import Button from "@/components/button";
import {useToast} from "@/context/ToastContext";
import {createLead} from "@/lib/utils/data/leads";

export default function CreateModal() {
    const [advanced, setAdvanced] = useState(false);
    const { closeModal } = useModal();
    const { showToast } = useToast();

    const initialForm = {
        companyName: "",
        primaryContactValue: "",
        primaryPlatform: "",
        website: "",
        contactDate: "",
        secondaryContactValue: "",
        secondaryPlatform: "",
        note: "",
    };

    const [form, setForm] = useState(initialForm);

    const handleInputChange = (field: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleLeadCreate = async () => {
        if (!form.companyName.trim()) {
            showToast("Company name is required", "Enter a company name", "error");
            return false;
        }

        try {
            await createLead(form);

            showToast("Lead created successfully", "", "success");
            return true;
        } catch (err) {
            showToast("Failed to create lead", "", "error");

            throw err;
        }
    };

    return (
        <div className="">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-4xl font-bold text-primary">
                    Create a new lead
                </h2>

                <button
                    onClick={() => closeModal()}
                    className="size-12 flex items-center justify-center rounded-full bg-primary-light transition cursor-pointer hover:opacity-90"
                >
                   <IoClose className={'text-primary size-8'}/>
                </button>
            </div>

            {/* Advanced toggle */}
            <div className="flex justify-end">
                <label className="flex items-center gap-2 text-xl cursor-pointer font-bold">
                    <input
                        className={'size-5'}
                        type="checkbox"
                        checked={advanced}
                        onChange={() => setAdvanced(!advanced)}
                    />
                    Advanced mode
                </label>
            </div>

            <div className="grid grid-cols-2 gap-8">

                <div className="col-span-2">
                    <Label >Company name<span className={'required'}/></Label>
                    <Input required value={form.companyName} onChange={(e) => handleInputChange("companyName", e.target.value)} placeholder="Enter company name" />
                </div>

                <div>
                    <Label>Primary contact<span className={''}/></Label>
                    <Input value={form.primaryContactValue} onChange={(e) => handleInputChange("primaryContactValue", e.target.value)} placeholder="E-mail, Instagram, or phone" />
                </div>

                <div>
                    <Label>Primary platform<span className={''}/></Label>
                    <Select value={form.primaryPlatform}
                            onChange={(e) =>
                                handleInputChange("primaryPlatform", e.target.value)
                            }/>
                </div>

                <div>
                    <Label>Website</Label>
                    <Input value={form.website} onChange={(e) => handleInputChange("website", e.target.value)} placeholder="company.com" />
                </div>

                <div>
                    <Label>Contact date</Label>
                    <Input
                        type="date"
                        value={form.contactDate}
                        onChange={(e) => handleInputChange("contactDate", e.target.value)} placeholder="7.7.2027" />
                </div>

                {advanced && (
                    <>
                        <div>
                            <Label>Secondary contact</Label>
                            <Input value={form.secondaryContactValue} onChange={(e) => handleInputChange("secondaryContactValue", e.target.value)} placeholder="E-mail, Instagram, or phone" />
                        </div>

                        <div>
                            <Label>Secondary platform</Label>
                            <Select value={form.secondaryPlatform}
                                    onChange={(e) =>
                                        handleInputChange("secondaryPlatform", e.target.value)
                                    }/>
                        </div>

                        <div className="col-span-2">
                            <Label>Note</Label>
                            <textarea
                                value={form.note}
                                className="w-full min-h-[100px] rounded-xl border border-lightgray px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Add notes, context, or follow-up details"
                                onChange={(e) => handleInputChange("note", e.target.value)}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="flex justify-end gap-3 mt-10">
                <Button className={'bg-primary-light! text-primary!'} onClickAction={async () => {
                    if (await handleLeadCreate()) {
                        setForm(initialForm);
                    }
                }}>
                    Create & Next
                </Button>
                <Button onClickAction={async () => {
                    try {
                        if (await handleLeadCreate()) {
                            closeModal();
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }}>
                    Create
                </Button>
            </div>
        </div>
    );
}

