const express = require('express');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const path = require('path');

const mongoose = require('mongoose');
const Campground = require('../models/campground');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
  .then(() => {
    console.log("CONNECTION OPEN!!")
  })
  .catch(err => {
    console.log("OH NO ERROR!!!")
    console.log(err)
  })
} 

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 300 ;i++){
        const  random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() *20) + 10;
        const camp = new Campground({
          //YOUR AUTHOR ID
          author: '66f704fc9cdb81ba5a1218ce',
          location: `${cities[random1000].city}, ${cities[random1000].state}`,
          title: `${sample(descriptors)} ${sample(places)}`,
          description: 'This is our description of the camp project we have which we will turn to a food resturant finder soon',
          price ,
          geometry: {
            type: 'Point', 
            coordinates: [ 
              cities[random1000].longitude,
              cities[random1000].latitude,
             ]
          },
          images:  [
            {
              url: 'https://res.cloudinary.com/dtdy5mfww/image/upload/v1727885338/YelpCamp/cci8sa8op1oom7ok4qqc.jpg',
              filename: 'YelpCamp/cci8sa8op1oom7ok4qqc',
              
            },
            {
              url: 'https://res.cloudinary.com/dtdy5mfww/image/upload/v1727885335/YelpCamp/glaa1qq3sfintap7i1hc.png',
              filename: 'YelpCamp/glaa1qq3sfintap7i1hc',
      
            }
          ],

        })
        await camp.save();
    }
}

seedDB().then(() => {
  mongoose.connection.close();
})
