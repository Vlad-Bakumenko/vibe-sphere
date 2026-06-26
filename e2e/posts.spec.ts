import { test, expect, type Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('user1@test.test')
  await page.getByLabel('Password').fill('123456')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/feed')
}

test('creates a post and sees it in the feed', async ({ page }) => {
  await login(page)

  const content = `Hello from e2e ${Date.now()}`
  await page.getByPlaceholder("What's on your mind?").fill(content)
  await page.getByRole('button', { name: 'Post', exact: true }).click()

  await expect(page.getByText(content)).toBeVisible()
})

test('likes a post and the count increments', async ({ page }) => {
  await login(page)

  const content = `Likeable post ${Date.now()}`
  await page.getByPlaceholder("What's on your mind?").fill(content)
  await page.getByRole('button', { name: 'Post', exact: true }).click()

  const post = page.locator('article', { hasText: content })
  await expect(post).toBeVisible()

  const likeButton = post.getByRole('button', { name: 'Like' })
  await expect(likeButton).toContainText('0')
  await likeButton.click()
  await expect(post.getByRole('button', { name: 'Unlike' })).toContainText('1')
})
