import { test, expect } from '@playwright/test'

test('landing page renders with auth entry points', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/VibeSphere/)
  await expect(page.getByRole('heading', { name: 'VibeSphere' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible()
})
