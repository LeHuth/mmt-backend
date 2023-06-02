/*
import chai from 'chai';
import chaiHttp from 'chai-http';
const expect = chai.expect;
const should = chai.should();
import server from "../../../server";
import jwt from "jsonwebtoken";
import process from "process";

chai.use(chaiHttp);

describe('create event, get by id and delete by id', () => {
    let id = ''
    let token = '';
    it('should a auth token', (done) => {
        chai.request(server)
            .post('/users/user/login')
            .send({
                email: 'organizer@mail.de',
                password: 'organizer'
            }).end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            token = res.body.token;
            done();
        });
    });
    it('should return event with given id', (done) => {
        // @ts-ignore
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user.id;
        // Create a test event
        chai.request(server)
            .post('/events/create').set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Event',
                description: 'This is a test event.',
                date: new Date(),
                time: '12:00',
                location: 'Test Location',
                category: 'TestCategory',
                tags: ['tag1', 'tag2'],
                organizer: userId,
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
            .delete(`/events/delete/${id}`).set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
})*/
