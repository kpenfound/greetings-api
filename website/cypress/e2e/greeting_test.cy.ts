// https://on.cypress.io/api

describe("Greetings API", () => {
  it("should display a greeting", () => {
    cy.visit("/");
    cy.get("h1").should("contain", "Greetings Daggernauts");
  });

  it("should change the greeting when the button is clicked", () => {
    cy.visit("/");
    cy.get("#greetingDisplay").should(
      "contain",
      "Click the button to see a greeting!",
    );
    cy.get("#randomGreetingButton").click();
    cy.get("#greetingDisplay").should(
      "not.contain",
      "Click the button to see a greeting!",
    );
  });

  it("should display the globe container after clicking the button", () => {
    cy.visit("/");

    // Mock the API response to ensure predictable testing
    cy.intercept("GET", "http://localhost:8080/random", {
      statusCode: 200,
      body: {
        greeting: "Hello, World!",
        locale: "US",
      },
    }).as("getGreeting");

    // Initially, globe container should be hidden
    cy.get("#globeContainer").should("not.be.visible");
    cy.get("#locationInfo").should("not.be.visible");

    // Click the button to get a greeting
    cy.get("#randomGreetingButton").click();

    // Wait for the response and check that globe and location info are visible
    cy.get("#globeContainer").should("be.visible");
    cy.get("#locationInfo").should("be.visible");
  });

  it("should display location information correctly", () => {
    cy.visit("/");

    // Mock the API response to ensure predictable testing
    cy.intercept("GET", "http://localhost:8080/random", {
      statusCode: 200,
      body: {
        greeting: "Hello, World!",
        locale: "US",
      },
    }).as("getGreeting");

    // Click the button
    cy.get("#randomGreetingButton").click();

    // Wait for the API call
    cy.wait("@getGreeting");

    // Check that location info shows the correct country
    cy.get("#locationInfo").should("contain", "United States");
  });

  it("should handle API response with locale field", () => {
    cy.visit("/");

    // Mock an API response with locale
    cy.intercept("GET", "http://localhost:8080/random", {
      statusCode: 200,
      body: {
        greeting: "Bonjour, Monde !",
        locale: "FR",
      },
    }).as("getFrenchGreeting");

    // Click the button
    cy.get("#randomGreetingButton").click();

    // Wait for the API call
    cy.wait("@getFrenchGreeting");

    // Check that the greeting is displayed
    cy.get("#greetingDisplay").should("contain", "Bonjour, Monde !");

    // Check that location info shows France
    cy.get("#locationInfo").should("contain", "France");
  });

  it("should handle unknown locale gracefully", () => {
    cy.visit("/");

    // Mock an API response with an unknown locale
    cy.intercept("GET", "http://localhost:8080/random", {
      statusCode: 200,
      body: {
        greeting: "Hello, World!",
        locale: "XX",
      },
    }).as("getUnknownLocale");

    // Click the button
    cy.get("#randomGreetingButton").click();

    // Wait for the API call
    cy.wait("@getUnknownLocale");

    // Check that location info shows fallback text
    cy.get("#locationInfo").should("contain", "Location: XX");
  });
});
