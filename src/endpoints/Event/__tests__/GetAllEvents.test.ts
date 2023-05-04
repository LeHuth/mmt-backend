import chai from 'chai';
import chaiHttp from 'chai-http';
const expect = chai.expect;
const should = chai.should();
import server from "../../../server";


chai.use(chaiHttp);

describe('getAllEvents', () => {
    it('should return all events', (done) => {
        chai.request(server)
        .get('/events/get/all')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            done();
        });
    });
});