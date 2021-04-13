const request = require("supertest");
const expect = require("chai").expect;
const app = require('/index');

describe('Testing POSTS/shots endpoint', function () {
    it('respond with valid HTTP status code and description and message', async function (done) {
      // Make POST Request
      const response = await supertest(app).post('/register').send({
        email:"test",
        pass:"abc",
        fname:"name",
        phone:"0333333",
        numBene:"1",
      });

      // Compare response with expectations
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
});