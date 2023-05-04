import chai from 'chai';
import chaiHttp from 'chai-http';
const expect = chai.expect;
const should = chai.should();
import server from "../../../server";

chai.use(chaiHttp);

describe('Event Routes', () => {
    it('should return all events', (done) => {
        chai.request(server)
        .get('/events/get/all')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            done();
        });
    });

    it('should create an event', (done) => {
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
        })
        .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            done();
        });
    });

    it('should return 400 if missing required fields', (done) => {
        chai.request(server)
        .post('/events/create')
        .send({
            missing: 'required',
        })
        .end((err, res) => {
            res.should.have.status(400);
            done();
        });
    });
});