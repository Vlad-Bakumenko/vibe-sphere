import { test, expect } from '@playwright/test'

// Sign up a brand-new user so the test is idempotent across runs (no
// pre-existing relationship with the seeded users).
test('sends a friend request from a profile', async ({ page }) => {
  const suffix = Date.now()
  await page.goto('/signup')
  await page.getByLabel('Full name').fill('Friend Tester')
  await page.getByLabel('Username').fill(`friend${suffix}`)
  await page.getByLabel('Email').fill(`friend${suffix}@test.test`)
  await page.getByLabel('Password').fill('123456')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.waitForURL('**/feed')

  await page.goto('/profile/user1')
  await page.getByRole('button', { name: 'Add friend' }).click()
  await expect(page.getByRole('button', { name: 'Requested' })).toBeVisible()
})
