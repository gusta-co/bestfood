require("dotenv").config();
const express = require("express");
const db = require('./db/index')
const cors = require("cors");

const morgan = require("morgan");

const app = express();

app.use(express.json()); //get middleware from post

app.use(cors()); //multiple servers sharing info

app.get("/" , (req,res) => {
    res.send("<h1>HOME PAGE</h1>");
});

//Get all Restaurants
app.get("/api/v1/restaurants", async (req, res, next) => { //api by convension, v1 by 1st version and restaurant table name

    try
    {
        const restaurants = await db.query("select * from restaurants left join (select restaurant_id, count(*), trunc(avg(rating),2) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id order by id");
    

        res.status(200)
        .json({
                status: "success",
                data: 
                    {
                        restaurants: restaurants.rows

                    }
            });
    }
    catch (err)
    {
        console.log(err);
    }
    
});

//Get a Single Restaurant
app.get("/api/v1/restaurants/:id", async (req,res) => 
{
    try
    {
        const restaurants = await db.query("select * from restaurants where id = $1" ,[req.params.id]);
    
        const restaurantReviews = await db.query("select * from reviews where restaurant_id = $1" ,[req.params.id]);

        const average_rating = await db.query("select avg(rating) from reviews where restaurant_id = $1" ,[req.params.id]);
    
        res.status(200)
        .json({
                status: "success",
                data: 
                    {
                        restaurants: restaurants.rows[0],
                        reviews: restaurantReviews.rows,
                        average_rating: average_rating.rows[0]
                    },
            });
    }
    catch (err)
    {
        console.log(err);
    }
});



//Create a Restaurante
app.post("/api/v1/restaurants", async (req, res) => {
    try 
    {
            const newRestaurant = await db.query("INSERT INTO restaurants (name, location, price_range) VALUES($1, $2, $3) returning *"
            , [req.body.name, req.body.location, req.body.price_range]);
            console.log(newRestaurant);
            res.status(200).json({
            status: "succes",
            data: {
                        restaurant: newRestaurant.rows[0]
                    }  
            });
    } 
    catch (err) 
    {
        console.log(err);
    }
});


// Update Restaurants
app.put("/api/v1/restaurants/:id", async (req, res) => 
{
    try 
    {
        const updateRestaurant = await db.query("UPDATE restaurants SET name = $1, location = $2, price_range = $3 WHERE ID = $4 returning *",[req.body.name, req.body.location, req.body.price_range, req.params.id]);
        res.status(200).json({
            status: "succes",
            data: {
                    restaurantUpdated: updateRestaurant.rows
                  }
        });
    }
    catch (err) 
    {
        console.log(err);
    }
});


//Delete Restaurant
app.delete("/api/v1/restaurants/:id", async (req, res) => {
    try 
    {
        const deleteRestaurant = await db.query("DELETE FROM restaurants WHERE id = $1 returning name" ,[req.params.id]);
        res.status(200).json({
            status: "succes",
            data: {
                    deleted_restaurant: deleteRestaurant.rows
                  }
        });
    } 
    catch (err) 
    {
        console.log(err);   
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});



//sendReview
app.post("/api/v1/restaurants/:id" , async (req,res) => {

    try
    {
        const review = await db.query("INSERT INTO reviews(restaurant_id, name, review, rating) VALUES($1, $2, $3, $4) returning *", [req.params.id, req.body.name, req.body.review, req.body.rating]);

        res.status(200).json({
            status: "succes",
            data: {
                    review: review.rows
                  }
        });
    }
    catch (err)
    {
        console.log(err);
    }

});


