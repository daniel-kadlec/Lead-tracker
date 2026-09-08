"use client";

import {useModal} from "@/context/ModalContext";
import CreateModal from "@/components/Modal/createModal";
import EditModal from "@/components/Modal/editModal";
import ViewModal from "@/components/Modal/viewModal";
import FinishModal from "@/components/Modal/finishModal";
import SettingsModal from "@/components/Modal/settingsModal";
import {AnimatePresence, motion} from "motion/react";


const MODAL_COMPONENTS = {
    create: CreateModal,
    edit: EditModal,
    view: ViewModal,
    finish: FinishModal,
    settings: SettingsModal
};


export default function ModalShell() {
    const { modal, closeModal } = useModal();

    const Component = modal.type ? MODAL_COMPONENTS[modal.type] : null;

    // Only close if the click is directly on the overlay
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    return (
        <AnimatePresence>
            {modal.isOpen && Component && (
                <motion.div onClick={handleOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.15 } }}
                        exit={{ opacity: 0,  transition: { duration: 0.15 } }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } }}
                        exit={{ opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.15 } }}
                        className={"w-full max-w-[700px] rounded-[50px] shadow-[inset_5px_5px_15px_rgba(255,255,255,0.30)] bg-white/40 backdrop-blur-[2px] p-6"}
                    >
                        <Component data={modal.data} />
                    </motion.div>
            </motion.div>
            )}
        </AnimatePresence>

    );
}
