// https://on.cypress.io/api

describe("Greetings API", () => {
  it("should display a greeting", () => {
    cy.visit("/");
    cy.get("h1").should("contain", "Greetings Daggernauts");
  });
});
