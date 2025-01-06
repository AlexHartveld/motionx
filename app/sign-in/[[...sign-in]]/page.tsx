import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="flex flex-col items-center space-y-3 pt-8 pb-4">
          <div className="relative w-20 h-20">
            <Image
              src="/mascot-welcome.svg"
              alt="Welcome Mascot"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        </div>
        
        <SignIn
          appearance={{
            layout: {
              logoPlacement: "none",
              socialButtonsVariant: "blockButton",
              socialButtonsPlacement: "top",
            },
            elements: {
              rootBox: "w-full px-8",
              card: "bg-transparent shadow-none p-0",
              header: "hidden",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtons: "space-y-3",
              socialButtonsIconButton: "hidden",
              socialButtonsBlockButton: "w-full h-12 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg font-medium text-base",
              socialButtonsProviderIcon: "w-5 h-5 mr-3",
              dividerContainer: "my-4",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500 mx-3 text-sm",
              formFieldInput: "h-12 w-full rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-base px-4",
              formFieldLabel: "text-gray-700 text-sm font-medium",
              formButtonPrimary: "w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base mt-4",
              footerActionText: "text-gray-600 text-sm",
              footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
              formFieldLabelRow: "mb-2",
              identityPreviewText: "text-gray-600 text-sm",
              identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
              alert: "rounded-lg border border-red-500 bg-red-50 p-3 text-red-700",
              alertText: "text-sm",
              formFieldWarningText: "text-red-600 text-sm mt-1",
              formFieldSuccessText: "text-green-600 text-sm mt-1",
              formResendCodeLink: "text-blue-600 hover:text-blue-700",
              main: "w-full",
              form: "w-full space-y-4",
              formField: "mb-4",
              footer: "mt-6",
            },
          }}
        />
      </div>
    </div>
  );
} 