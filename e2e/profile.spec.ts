import { test, expect, type Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('user1@test.test')
  await page.getByLabel('Password').fill('123456')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/feed')
}

test('views a user profile', async ({ page }) => {
  await login(page)
  await page.goto('/profile/user1')

  await expect(page.getByRole('heading', { name: 'User One' })).toBeVisible()
  await expect(page.getByText('@user1')).toBeVisible()
  await expect(page.getByRole('tab', { name: /Posts/ })).toBeVisible()
})

test('edits own profile and sees the change', async ({ page }) => {
  await login(page)
  await page.goto('/settings')

  const bio = page.getByLabel('Bio')
  await bio.fill('Updated bio from e2e test')
  await page.getByRole('button', { name: 'Save changes' }).click()

  await page.waitForURL('**/profile/user1')
  await expect(page.getByText('Updated bio from e2e test')).toBeVisible()
})
