const express = require( 'express' );
const path = require( 'path' );
const app = express( );
const bodyParser = require( 'body-parser' );
const mongoose = require( 'mongoose' );

mongoose.connect ('mongodb://localhost:27017/CoffeeAPI', {
    useNewUrlParser: true
});
app.use(express.static(path.join(_dirname, 'public')));
//Creates a model of imported objects from coffee.js
var Country = require( './app/models/coffee' ).country;
var Region = require( './app/models/coffee' ).region;
app.use( bodyParser.urlencoded({
    extended: true
}));
const port = process.env.PORT || 8080;
const router = express.Router();
//middleware starts here
//function fired with every api call
router.use( function ( req, res, next ) {
    console.log( 'Something is happening' );
    next();
});
//catch all routes
router.get( '/', function ( req, res ) {
    res.json({
        message: 'hooray. welcome to our api'
    });
});
//routes for api
//link for lists of countries///////////////////////////////////////
router.route ( '/country' )
//method to add country to the list
    .post( function ( req, res ) {
        var country = new Country();
        //assign name to the country
        country.name = req.body.name;
        //save new country
        country.save ( function (err) {
            //if error
            if ( err ) 
                res.send( err );
            //on successful response
            res.json( {
                message: 'Country Created'
            });
        })
    })
    //method to get the list of all countries
    .get ( function ( req, res ) {
        //find all countries and pass instance of the town to the function
        Country.find( function ( err, country ) {
            //if error
            if ( err )
                res.send( err );
                //on success print out object that contains all countries
                res.json( country );
        });
    });
//====================================
//route to the specific country by id
router.route( '/country/:country_id' )
//method that allows you to get information about specific country by id
    .get( function ( req, res ) {
        //find country by id and pass country instance to the function
        Country.findById( req.params.country_id, function ( err, country ) {
            //if error
            if ( err )
                res.send( err );
                //on success return country object
                res.json( country );
        })
    })
//method that allows you to edit country object
    .put( function ( req, res ) {
    //find country by id, pass country instance to function
        Country.findById( req.params.country_id, function ( err, country ){
        //if error
            if ( err )
                res.send ( err );
                //assign new name to the country
                country.name = req.body.name;
                //save edited instance of country
                country.save( function ( err ) {
                    //return message on success
                    res.json({
                        message: 'Country Updated!'
                });
            })
    })
})
//delete country from the list
.delete( function ( req, res ){
    Country.remove({
        _id: req.params.country._id
    }, function ( err, country ) {
        if ( err )
            res.send( err );
            //return message on success
            res.json({
                message: 'Successfully Deleted'
            });
    });
});
/////////////////Route to all regions of a specific company///
router.route( '/country/:country_id/regions' )
    //add new region to the list
    .post( function( req, res ){
        //find country by id
        Country.findById( req.params.country_id, function ( err, country ){
            //if error
            if ( err ) 
                res.send( err );
                //create a new instance of region
                let region = new Region();
                //assign name to new region
                region.name = req.body.name;
                //add region to country.regions array
                country.regions.push( region )
                //save new instance of a region
                region.save( function ( err ) {
                    if ( err )
                        res.send( err );
                })
                //save updated country
                country.save( function ( err ){
                    if ( err ) 
                    res.send( err );
                    //print message on success
                    res.json({
                        message: "Country Updated, Region Added"
                    })
                })
        } )
    })
//////get the list of regions of specific country
.get( function ( req, res ){
    //find country by id
    Country.findById( req.params.country_id, function ( err, country){
        if ( err ) 
            res.send ( err );
    })
    //populate information about name so it will print out 
    //name and id of the object
    .populate( 'regions', 'name' )
    //execute and pass country instance 
    .exec( function ( err, country ){
        //if err
        if ( err ) 
            res.send( err )
            //on success print out array of regions to the specific country
            res.json( country.regions )
    })
})
/////////////////////////////////////////////////////////////////
//routes to specific region of specific country
router.route( '/country/:country_id/:region_id' )
//edit information about specific region of specific country
    .put( function ( req, res ){
        //find region by id and pass instance of the region to the function
        Region.findById( req.params.region_id, function( err, region ){
            // if error
            if ( err )
                res.send( err );
                //assign new name of the region
                region.name = req.body.name;
                //save instance of the region
                region.save( function( err ){
                    //if err
                    if ( err ) 
                        res.send( err );
                        //print message on sucess
                        res.json({
                            message: "Region Updated"
                        });
                })
        })
    })
/////////delete specific regions in specific countries
.delete( function ( req, res) {
    //delete on region by id
    Region.deleteOne({
        _id: req.params.region_id
    }, function ( err, region ) {
        //if error
        if ( err )
            res.send( err );
    });
    //find country id and send instance to the function
    Country.findById( req.params.country_id, function( err, country ) {
        //if error
        if ( err )
            res.send( err )
            //loop through the array of regions in the country
            for (var i = 0; i < country.regions.length; i ++)
            //if we find desired region in array
            if ( country.regions[i] == req.params.region_id) {
                //cut out one region on index i, i where to start, 1 how many to delete
                country.regions.splice( i, 1 )
            }
    }
    //save edited country model
    country.save( function( err ) {
        //if err
        if ( err )
            res.send( err );
            //on success print out message
            res.json({
                message: "Country Updated"
            });
        });
    });
});
//////////////////register our routes
app.use( '/api', router );
//start the server
app.listen( port );
console.log("Magic happens on port" + port);


