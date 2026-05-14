import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="bg-[#1A6FFF] text-white font-bold text-[12px] px-2.5 py-1.5 rounded-md tracking-wide">SIS</div>
        <div>
          <div className="text-[15px] font-bold text-white leading-none">Lead Hunter</div>
          <div className="text-[11px] text-[#7A9AC0]">Shabaka Intelligence System</div>
        </div>
      </div>
      <SignIn />
    </div>
  );
}
