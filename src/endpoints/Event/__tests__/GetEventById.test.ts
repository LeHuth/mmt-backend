import chai from 'chai';
import chaiHttp from 'chai-http';
const expect = chai.expect;
const should = chai.should();
import server from "../../../server";

chai.use(chaiHttp);

describe('create event, get by id and delete by id', () => {
    let id = ''
    it('should return event with given id', (done) => {
        // Create a test event
        chai.request(server)
            .post('/events/create')
            .send({
                title: 'Test Event',
                description: 'This is a test event.',
                date: new Date(),
                time: '12:00',
                location: 'Test Location',
                category: 'TestCategory',
                tags: ['tag1', 'tag2'],
                organizer: 'Test Organizer',
                image: 'test-image-url',
                ticketInfo: {
                    ticketTypes: [
                        {
                            name: 'General Admission',
                        }
                    ],
                    name: 'General Admission',
                    price: 20,
                    available: 100,
                }
            }).end((err, res) => {
                // Get the id of the test event
                id = res.body._id;
                // Get the event by id
                done();
            });
    })
    it('should give event by id', (done) => {
        chai.request(server)
            .get(`/events/get/${id}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body._id.should.equal(id);
                done();
            });
    });

    it('should delete the event',  (done) => {
        chai.request(server)
            .delete(`/events/delete/${id}`)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
})