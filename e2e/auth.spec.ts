import { test, expect } from '@playwright/test'

// Uses the seeded user from prisma/seed.ts (password: 123456).
const SEEDED_EMAIL = 'user1@test.test'
const SEEDED_PASSWORD = '123456'

test('redirects unauthenticated users from a protected route to login', async ({ page }) => {
  await page.goto('/feed')
  await page.waitForURL(/\/login/) // redirect adds a ?callbackUrl=… query
  await expect(page.getByText('Welcome back')).toBeVisible()
})

test('signs in with seeded credentials and lands on the feed', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(SEEDED_EMAIL)
  await page.getByLabel('Password').fill(SEEDED_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await page.waitForURL('**/feed')
  await expect(page.getByRole('heading', { name: 'Feed' })).toBeVisible()
  // Authenticated app shell is present.
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
})

test('shows an error for invalid credentials', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(SEEDED_EMAIL)
  await page.getByLabel('Password').fill('wrong-password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByText('Invalid email or password')).toBeVisible()
  await expect(page).toHaveURL(/\/login/)
})
