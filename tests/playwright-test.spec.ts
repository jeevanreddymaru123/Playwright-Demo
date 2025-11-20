import {test,expect} from '@playwright/test'

test('First Playwright Test', async ({page}) =>{
    
     await page.goto('https://example.com')
     expect(await page.title()).toBe('Example Domain')
    
    })