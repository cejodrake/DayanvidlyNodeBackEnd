
const moment = require('moment');

const { Rental } = require('../../models/rental');

const { Movie } = require('../../models/movie');
const { User } = require('../../models/user');

const mongoose = require('mongoose');
const request = require('supertest');


describe('/api/returns', () => {


    let server;
    let customerId;
    let movieId;
    let rental;
    let token;

    const exec = () => {
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });
    };

    beforeEach(async () => {
        server = require('../../index');
        token = new User().generateAuthToken();
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();


        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345'
            },
            movie: {
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2

            },


        });
        await rental.save();
    });

    afterEach(async () => {

        await server.close();
        await Rental.remove({});
    })

    it('should  return 401 if cliente is not looged in ', async () => {

        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    })

    it('should  return 400 if cliente is not provided in ', async () => {
        customerId = '';

        const res = await exec();

        expect(res.status).toBe(400);

    });

    it('should  return 400 if movieId is not provided  ', async () => {
        movieId = '';
        const res = await exec();
        expect(res.status).toBe(400);

    });

    it('should  return 404 if  no rental found for this coustomer /movie ', async () => {
        await Rental.remove({});
        const res = await exec();
        expect(res.status).toBe(404);

    });
    it('should  return 400 if  rental  already processed ', async () => {

        rental.dateReturned = new Date();

        await rental.save();

        const res = await exec();
        expect(res.status).toBe(400);

    });
    /*
    
        it('should  return 200 if  we have a valid request', async () => {
    
            const res = await exec();
    
            expect(res.status).toBe(200);
    
        });*/

    it('should  set the returnDate if input is valid', async () => {

        await exec();
        const rentalInDB = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDB.dateReturned;

        expect(diff).toBeLessThan(10 * 1000);

    });

    it('Calculate the rentalFee if input is valid ', async () => {

        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();

        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14);

    });

    /* it('should increase the movie stock if input is valid ', async () => {
 
         await exec();
         const movieInDB = await Movie.findById(movieId);
         expect(movieInDB.numberInStock).toBe(movie.numberInStock + 1);
 
     });*/
});


