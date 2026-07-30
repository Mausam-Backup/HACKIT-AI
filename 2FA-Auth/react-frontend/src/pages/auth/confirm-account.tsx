import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { toast } from "@/hooks/use-toast";
import { verifyEmailMutationFn } from "@/lib/api";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ConfirmAccount() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const code = params.get("code");

  const { mutate, isPending } = useMutation({
    mutationFn: verifyEmailMutationFn,
  });

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!code) {
      toast({
        title: "Error",
        description: "Confirmation token not found",
        variant: "default",
      });
      return;
    }
    mutate(
      { code },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Account confirmed successfully",
            variant: "destructive",
          });
          navigate(`/home`);
        },
        onError: (error) => {
          console.log(error);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };
  return (
    <main className="w-full">
      <div className="w-full p-5 rounded-md text-gray-900 dark:text-white">

        <h1 className="text-3xl tracking-tight text-gray-900 dark:text-white font-bold mb-2 text-center sm:text-left">
          Account confirmation
        </h1>
        <p className="mb-6 text-center sm:text-left text-sm text-gray-500 dark:text-white/60 font-normal">
          To confirm your account, please follow the button below.
        </p>
        <form onSubmit={handleSubmit}>
          <Button
            disabled={isPending}
            type="submit"
            className="w-full h-12 mt-2 bg-[#7e57c2] hover:bg-[#6847a3] text-white rounded-lg font-semibold transition-colors"
          >
            {isPending && <Loader className="animate-spin mr-2" />}
            Confirm account
          </Button>
        </form>

        <p className="mt-6 text-sm text-gray-500 dark:text-white/60 font-normal text-center sm:text-left">
          If you have any issue confirming your account please, contact{" "}
          <a
            className="outline-none transition duration-150 ease-in-out text-[#7e57c2] hover:underline"
            href="#"
          >
            support@aegis.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
