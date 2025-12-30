from playwright.sync_api import sync_playwright, expect

def verify_theme_toggle():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to homepage
        page.goto("http://localhost:3001")

        # Wait for hydration
        page.wait_for_timeout(2000)

        # There are two buttons because of desktop/mobile header duplication
        # We'll pick the first one which is likely the desktop one

        toggle_btn = page.locator("button[aria-label='Switch to dark mode']").first
        if not toggle_btn.is_visible():
             toggle_btn = page.locator("button[aria-label='Switch to light mode']").first

        if not toggle_btn.is_visible():
            print("Could not find theme toggle button")
            page.screenshot(path="verification/error_state.png")
            return

        print("Found toggle button")

        # Take screenshot of initial state
        page.screenshot(path="verification/theme_initial.png")

        # Click to toggle
        toggle_btn.click()
        page.wait_for_timeout(1000) # wait for transition

        # Take screenshot of toggled state
        page.screenshot(path="verification/theme_toggled.png")

        browser.close()

if __name__ == "__main__":
    verify_theme_toggle()
