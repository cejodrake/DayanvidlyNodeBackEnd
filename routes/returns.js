//const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');
const moment = require('moment');
const express = require('express');
const router = express.Router();
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');


router.post('/', auth, async (req, res, ) => {
    if (!req.body.customerId) return res.status(400).send('customerId no Provider');
    if (!req.body.movieId) return res.status(400).send('Movie is not provider');

    const rental = await Rental.findOne({
        'customer._id': req.body.customerId,
        'movie._id': req.body.movieId
    });

    if (!rental) return res.status(404).send('Rentals not exits for this Customer');

    if (rental.dateReturned) return res.status(400).send('return already processed');

    rental.dateReturned = new Date();

    const rentalDays = moment().diff(rental.dateOut, 'days');

    rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;

    await rental.save();

    await Movie.update({ _id: rental.movie._id }, {
        $inc: { numberInStock: 1 }
    });


    return res.status(200).send();


});


module.exports = router;