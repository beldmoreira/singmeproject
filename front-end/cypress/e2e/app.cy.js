
describe("tests route POST '/recommendation'", () => {
    it("tests if the app posts a new recommendation with success", async() => {
      cy.visit("http://localhost:3000/")
      cy.get("#name").type("Yebba: Tiny Desk (Home) Concert")
      cy.get("#link").type("https://www.youtube.com/watch?v=aBMGvHHkr9Y")
      cy.intercept("POST","http://localhost:5000/recommendations").as("createRecommendations")
      cy.get("button").click()
      cy.wait("@createRecommendations");
      cy.contains("Yebba: Tiny Desk (Home) Concert").should("be.visible")
      cy.end();
    });
  
    it("tests if the app throws an error when the user tries to create without the necessary content", async()=> {
      cy.visit("http://localhost:3000/")
      cy.intercept("POST","http://localhost:5000/recommendations").as("createRecommendations")
      cy.get("button").click()
      cy.wait("@createRecommendations");
      cy.url().should('equal', 'http://localhost:3000/');
      cy.on("window:alert", (str) => {
      expect(str).to.equal("Error creating recommendation!")
      cy.end();
      })
    })
  
    it("tests if the app throws an error when the user tries to create an already existing recommendation", async()=>{
      cy.visit("http://localhost:3000/")
      cy.get("#name").type("What a Fool Believes | funk Talk Box cover ft. Swatkins & Frankfurt Radio Big Band")
      cy.get("#link").type("https://www.youtube.com/watch?v=l6NR1q0EHMo")
      cy.intercept("POST","http://localhost:5000/recommendations").as("createRecommendations")
      cy.get("button").click()
      cy.wait("@createRecommendations");
      cy.url().should('equal', 'http://localhost:3000/');
      cy.on("window:alert", (str) => {
          expect(str).to.equal("Error creating recommendation!")
      cy.end();
      })
   })
  });

  describe("tests route POST '/recommendations/:id/downvote'", () => {
    it("tests if the app enables the user downvote a recommendation", async() => {
        cy.visit("http://localhost:3000/")
        cy.get("#name").type("What a Fool Believes | funk Talk Box cover ft. Swatkins & Frankfurt Radio Big Band")
        cy.get("#link").type("https://www.youtube.com/watch?v=l6NR1q0EHMo")
        cy.intercept("POST","http://localhost:5000/recommendations/:id/downvote").as("downvoteRecommendation")
        cy.get("#downvote").click()
        cy.wait("@downvoteRecommendation");
        cy.url().should('equal', 'http://localhost:3000/');
        cy.contains("2").should("be.visible")
        cy.end();
    });

    it("should delete recommendation when score is above -5",async() => {
        cy.visit("http://localhost:3000/")
        cy.get("#downvote").click()
        cy.get("#downvote").click()
        cy.url().should('equal', 'http://localhost:3000/');
        cy.contains("This recommendation is not available anymore. Create a new recommendation").should("be.visible");
        cy.end();
    })
});

describe("tests route POST '/recommendations/:id/upvote'", () => {
    it("tests if the app enables the user upvote a recommendation", async() => {
        cy.visit("http://localhost:3000/")
        cy.get("#name").type("What a Fool Believes | funk Talk Box cover ft. Swatkins & Frankfurt Radio Big Band")
        cy.get("#link").type("https://www.youtube.com/watch?v=l6NR1q0EHMo")
        cy.intercept("POST","http://localhost:5000/recommendations/:id/upvote").as("upvoteRecommendation")
        cy.get("#upvote").click()
        cy.wait("@upvoteRecommendation");
        cy.url().should('equal', 'http://localhost:3000/');
        cy.contains("-5").should("be.visible")
        cy.end();
    });
});


describe("tests route GET '/recommendations/random'", () => {
    it("tests if the app gets a random recommendation with success", async() => {
      cy.visit("http://localhost:3000/random")
      cy.intercept("GET","http://localhost:5000/recommendations/random").as("getRandomRecommendations")
      cy.get("button").click()
      cy.wait("@getRandomRecommendations");
      cy.url().should('equal', 'http://localhost:3000/random');
      cy.end();
    });
});

describe("tests route GET '/recommendations'", () => {
    it("tests if the app gets recommendation with success", async() => {
        cy.visit("http://localhost:3000/")
        cy.intercept("GET","http://localhost:5000/recommendations").as("getRecommendations")
        cy.get("button").click()
        cy.wait("@getRecommendations");
        cy.end();
    });
});

describe("tests route GET '/recommendations/top/:amount'", () => {
    it("tests if the app gets the top recommendation with success", async() => {
        cy.visit("http://localhost:3000/top")
        cy.intercept("GET","http://localhost:5000/recommendations/top/:amount").as("getTopRecommendations")
        cy.get("button").click()
        cy.wait("@getTopRecommendations");
        cy.url().should('equal', 'http://localhost:3000/top');
        cy.end();
    });
});

describe("tests route GET '/recommendations/:id'", () => {
    it("tests if the app gets recommendations by its id with success", async() => {
        cy.visit("http://localhost:3000/")
        cy.intercept("GET","http://localhost:5000/recommendations/:id").as("getRecommendationsById")
        cy.get("button").click()
        cy.wait("@getRecommendationsById");
        cy.url().should('equal', 'http://localhost:3000/');
        cy.end();
    });
});








