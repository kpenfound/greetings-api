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
});
