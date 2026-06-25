import { redirect } from 'next/navigation'

import { getMyProfile } from '@/features/profile/actions'
import { EditProfileForm } from '@/features/profile/components/edit-profile-form'

export default async function SettingsPage() {
  const profile = await getMyProfile()
  if (!profile) redirect('/login')

  return (
    <div className="grid max-w-xl gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <EditProfileForm
        defaultValues={{
          fullName: profile.name ?? '',
          username: profile.username ?? '',
          bio: profile.bio,
          location: profile.location,
          interests: profile.interests,
        }}
      />
    </div>
  )
}
