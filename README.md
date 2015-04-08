# EpikkoMall-BackEnd

> EpikkoMall-BackEnd with koa. (work in progress)

__How to use it?__

Install node version 0.11.14
Install mongodb (latest version) 
Run the following commands

```sh

$ git clone https://github.com/Fcruz1/EpikkoMall-BackEnd

$ cd EpikkoMall-BackEnd

$ npm install

$ npm start

```

Default host for backend is http://localhost:3000.


```
__Use following Enpoints to check__

GET /product -> List all the products.

GET /product/:product_id -> List single products.

POST /product -> JSON data to insert a new product to db.

PUT /product/:product_id -> JSON data to update a product.

DELETE /product/:product_id -> Removes the product with the specified product_id.

GET /store/:store_id -> List the required store.

POST /store -> JSON data to insert a new store to db.

PUT /store/:store_id -> JSON data to update a store.

DELETE /store/:store_id -> Removes the store with the specified store_id.

```

                          SEEDING THE DATABASE

```
To make sure needed basic configurations are in database, you must run initialize the database. This command must be executed at the same instance the API server is located:

> cd db

> node --harmony setup.js db:init

> cd ..

```


__TODO:__

* HEAD

