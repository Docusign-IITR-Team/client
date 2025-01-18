//Components
import { SignInButtonWithProvider } from "./SignInButtonWithProvider";
import { SignInForm } from "./SignInForm";

export const AuthCard = () => {
  return (
    <div className="flex flex-col gap-10 bg-white w-[90%] lg:w-[30%] h-[60%] items-center rounded-md shadow-md justify-center">
     
        <SignInButtonWithProvider provider="google" />
    </div>
  );
};
