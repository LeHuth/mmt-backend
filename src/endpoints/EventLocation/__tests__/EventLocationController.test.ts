import chai from 'chai';
import chaiHttp from 'chai-http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import server from '../../../server'; // Pfad zu Ihrem Server
import EventLocationModel from '../EventLocationModel'; // Pfad zu Ihrem EventLocationModel

chai.use(chaiHttp);
const { expect } = chai;

describe('Event Location Controller', function () {
    let mongoServer:MongoMemoryServer ;

    before(async function () {
        // Starten Sie eine In-Memory-Instanz von MongoDB
        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getUri();

        // Verbinden Sie die Mongoose-Instanz mit der In-Memory-Instanz von MongoDB
        await mongoose.connect(mongoUri);
    });

    after(async function () {
        // Schließen Sie die Verbindung zur Datenbank und stoppen Sie die In-Memory-Instanz von MongoDB
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    beforeEach(async function () {
        // Bereiten Sie die Testdaten vor
        const eventData = [
            {
                name: 'Event 1',
                address: '123 Test St',
                latitude: 12.345,
                longitude: 54.321
            },
            {
                name: 'Event 2',
                address: '456 Test St',
                latitude: 23.456,
                longitude: 65.432
            }
        ];
        await EventLocationModel.create(eventData);
    });

    afterEach(async function () {
        // Löschen Sie die Testdaten
        await EventLocationModel.deleteMany({});
    });

    describe('POST /event-location', function () {
        it('should create an event location', function (done) {
            const eventLocation = {
                name: 'Test Event',
                address: '789 Test St',
                latitude: 34.567,
                longitude: 76.543
            };
            chai.request(server)
                .post('/event-location')
                .send(eventLocation)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.property('name').eql('Test Event');
                    done();
                });
        });

        it('should not create an event location without name', function (done) {
            const eventLocation = {
                address: '789 Test St',
                latitude: 34.567,
                longitude: 76.543
            };
            chai.request(server)
                .post('/event-location')
                .send(eventLocation)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    done();
                });
        });
    });

    describe('GET /event-location', function () {
        it('should get all event locations', function (done) {
          chai.request(server)
            .get('/event-location')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('array');
              expect(res.body.length).to.equal(2); // Anpassen je nach Anzahl der Testdaten
              done();
            });
        });
      
        it('should get a specific event location', function (done) {
          // Annahme: Vorheriges POST-Request hat ein Event Location-Objekt mit der ID "eventLocationId" erstellt
          const eventLocationId = 'eventLocationId';
      
          chai.request(server)
            .get(`/event-location/${eventLocationId}`)
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('object');
              expect(res.body).to.have.property('_id').eql(eventLocationId);
              done();
            });
        });
      
        it('should return 404 for a non-existing event location', function (done) {
          const nonExistingEventLocationId = 'nonExistingEventLocationId';
      
          chai.request(server)
            .get(`/event-location/${nonExistingEventLocationId}`)
            .end((err, res) => {
              expect(res).to.have.status(404);
              done();
            });
        });
      });
      
      describe('PUT /event-location/:id', function () {
        it('should update a specific event location', function (done) {
          // Annahme: Vorheriges POST-Request hat ein Event Location-Objekt mit der ID "eventLocationId" erstellt
          const eventLocationId = 'eventLocationId';
      
          const updatedEventLocation = {
            name: 'Updated Event',
            address: '123 Updated St',
            latitude: 56.789,
            longitude: 87.654
          };
      
          chai.request(server)
            .put(`/event-location/${eventLocationId}`)
            .send(updatedEventLocation)
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('object');
              expect(res.body).to.have.property('_id').eql(eventLocationId);
              expect(res.body).to.have.property('name').eql('Updated Event');
              done();
            });
        });
      
        it('should return 404 for updating a non-existing event location', function (done) {
          const nonExistingEventLocationId = 'nonExistingEventLocationId';
      
          const updatedEventLocation = {
            name: 'Updated Event',
            address: '123 Updated St',
            latitude: 56.789,
            longitude: 87.654
          };
      
          chai.request(server)
            .put(`/event-location/${nonExistingEventLocationId}`)
            .send(updatedEventLocation)
            .end((err, res) => {
              expect(res).to.have.status(404);
              done();
            });
        });
      });
      
      describe('DELETE /event-location/:id', function () {
        it('should delete a specific event location', function (done) {
          // Annahme: Vorheriges POST-Request hat ein Event Location-Objekt mit der ID "eventLocationId" erstellt
          const eventLocationId = 'eventLocationId';
      
          chai.request(server)
            .delete(`/event-location/${eventLocationId}`)
            .end((err, res) => {
              expect(res).to.have.status(200);
              // Überprüfen, ob das gelöschte Objekt zurückgegeben wurde oder nicht
              expect(res.body).to.be.an('object');
              expect(res.body).to.have.property('_id').eql(eventLocationId);
      
              // Überprüfen, ob das Objekt tatsächlich gelöscht wurde, indem es erneut abgefragt wird
              chai.request(server)
                .get(`/event-location/${eventLocationId}`)
                .end((err, res) => {
                  expect(res).to.have.status(404);
                  done();
                });
            });
        });
      
        it('should return 404 for deleting a non-existing event location', function (done) {
          const nonExistingEventLocationId = 'nonExistingEventLocationId';
      
          chai.request(server)
            .delete(`/event-location/${nonExistingEventLocationId}`)
            .end((err, res) => {
              expect(res).to.have.status(404);
              done();
            });
        });
      });      
});