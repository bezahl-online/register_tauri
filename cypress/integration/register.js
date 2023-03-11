context('KassaTest', () => {
    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.viewport(1080, 1920)
        cy.visit('http://localhost:3000')
    })
    xdescribe('test adding and removing articles', () => {
        xit('should add the article to and remove it from the receipt and leave us with a page saying "Bitte Ware scannen"', () => {
            cy.contains("Bitte Ware scannen!")
            cy.contains('Zucker').click()
            cy.contains('Feinkristallzucker')
            cy.get('.ximg').click()
            cy.contains("Bitte Ware scannen!")
        })
        it('should add multiple article the receipt with the correct sum"', () => {
            cy.contains("Bitte Ware scannen!")
            cy.contains('Zucker').click()
            cy.contains('Marmelade').click()
            cy.contains('Feinkristallzucker')
            cy.get('.item').should('contain', '1.40')
            cy.get('.item').should('contain', '3.90')
            cy.get('.totals').should('contain', '5.30')
        })
    })
    describe('test adding and removing articles', () => {
        it('should add the article to and remove it from the receipt and leave us with a page saying "Bitte Ware scannen"', () => {
            cy.get('.zahlen')
            cy.contains('Zucker').click()
            cy.contains('Feinkristallzucker').debug()
            cy.contains("Kartenzahlung").click()
            cy.get('.modal-header').should('contain', 'Bitte wählen Sie eine Zahlungsart')
            cy.get('.Vorgang').should('contain', 'EC Zahlung gestartet')
            cy.get('.Vorgang').should('contain', 'Zahlung erfolgreich')
            cy.contains('Rechnung').parent().get(".buttons")
                .should('contain', 'Drucken')
                .should('contain', 'Download')
            cy.get('.invoice').find('.buttons').eq(1).click()
            cy.get('.invoice_qr').find('canvas')
            cy.get('.invoice_qr').parent().parent().find('button').click()
            cy.get('.invoice').find('.buttons').contains('Schließen').debug()
        })
    })

})