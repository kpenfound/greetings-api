/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

describe('index.html', () => {
  let dom;
  let document;
  let button;
  let greetingDisplay;

  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' });
    document = dom.window.document;
    button = document.getElementById('randomGreetingButton');
    greetingDisplay = document.getElementById('greetingDisplay');
  });

  test('clicking the button updates the greeting', async () => {
    // Mock the fetch function
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ greeting: 'Hello from the test!' }),
      })
    );

    button.click();

    // Wait for the greeting to update
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(greetingDisplay.textContent).toBe('Hello from the test!');
  });
});