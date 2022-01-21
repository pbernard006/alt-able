/* eslint-disable */
const supertest = require("supertest");
// const assert = require('assert');
const app = require("../server");

describe("LAUNCH /", function() {
    it("Le serveur est vivant", function(done) {
      supertest(app)
        .get("/hello")
        .expect(200)
        .end(function(err){
          if (err) done(err);
          done();
        });
    });
    // it("Réponse 404 pour une route api inexistante",function(done){
    //   supertest(app)
    //     .get("/api/nowhere")
    //     .expect(404)
    //     .end(function(err,res){
    //       if (err) {
    //         return done (err)
    //       }
    //       done()
    //   })
    // })
  });
