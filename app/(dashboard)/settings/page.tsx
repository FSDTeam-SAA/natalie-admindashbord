import { ChangePassword } from "./_components/ChangePassword";
import { PersonalInformation } from "./_components/PersonalInformation";
import { ProfileHeader } from "./_components/ProfileHeader";

const page = () => {
  return (
    <main className="space-y-6">
      <ProfileHeader />

      <PersonalInformation />
      <ChangePassword />
    </main>
  );
};

export default page;
