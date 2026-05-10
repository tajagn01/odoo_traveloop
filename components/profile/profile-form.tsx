import { updateProfileAction } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const languages = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Japanese", value: "ja" },
];

type ProfileFormProps = {
  name: string;
  email: string;
  languagePreference: string | null;
};

export function ProfileForm({ name, email, languagePreference }: ProfileFormProps) {
  return (
    <form
      action={updateProfileAction}
      className="space-y-6"
      encType="multipart/form-data"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={name} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={email} required />
        </div>
      </div>
      <div>
        <Label htmlFor="languagePreference">Language preference</Label>
        <Select name="languagePreference" defaultValue={languagePreference ?? undefined}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.value} value={language.value}>
                {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="profilePhoto">Profile photo</Label>
        <Input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  );
}
