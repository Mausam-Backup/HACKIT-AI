import CustomTemplatePage from "./CustomTemplatePage";
import FloatingNav from "@/components/ui/FloatingNav";

export const dynamic = "force-dynamic";

export default function Page() {
    return (
        <>
            <FloatingNav />
            <CustomTemplatePage
                useTemplateV2Generation
            />
        </>
    );
}
