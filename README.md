# Lillihub - An unofficial Micro.Blog web client
Lillihub is a simple, lightweight micro.blog web client with a light/dark mode and responsive design. It is built using [Deno](https://deno.com/), HTML, CSS, and a sprinkle of vanilla JavaScript. It is delightfully usable without JavaScript being enabled.

The goal of this project was to make a web app that covered common use cases of Micro.Blog. With this app you can:
    
- Browse your timeline feed
- View user profiles
- Comment on posts
- Create and manage blog posts
- Upload images and manage your blog media
- Follow/Block/Mute users
- Manage your Micro.Blog bookshelves
- Manage your Micro.Blog bookmarks
- Keep track of emoji tags, discover feed, and official Micro.Blog accounts easier

I hope people enjoy using the app as much as I did building it ❤️🐸

# Details stored by Lillihub

An encrypted cookie with the Micro.blog app token is stored on the user browser. 
Some user details are saved to Deno Deploy's KV storage. This includes the username, the last time the app was accessed by the user, a list of post ids, and lillihub user preferences.

# Contributing


# Running Locally
You will need to have [Deno](https://deno.com/) installed and available on your `$PATH`. Then run the command `deno run --allow-env --allow-net --allow-read --unstable-kv main.js`. This will run the webserver on your `localhost`. There is no build step.

You will also need an `.env` file with the `APP_URL` pointing to your `localhost`. In my case it was
`localhost:8080`

Once the application is running you will need to sign in and authenticate with Micro.Blog. If you have your `localhost` configured with a SSL certificate you should be all set to login using the login button.
Otherwise you will need edit the URL that Micro.Blog returns to `http://` and not `https://`.

*Note:* You many need to allow the connection to micro.blog in your terminal

# Deploying to Deno Deploy with the Github Integration
Clone the repository and then create an account on [Deno Deploy](https://deno.com/deploy) and from the Deno Deploy dashboard, 
click the "New Project" button and choose the option to "Select a repository". Follow the on-screen instructions to deploy your existing application.

You **will** then need to set the environmental variable `APP_URL` by going to the settings tab and adding it to the environmental variable section.
Deno deploy offers all projects a `.deno.dev` domain. You can copy and paste that domain as the `APP_URL` if you are not
using a custom one.

You **will** also need to create an APP_SECRET environmental variable. You can use the following code to generate the rawKey in JSON string format, you will need to save it.

```
const key = await crypto.subtle.generateKey({ name: "AES-CBC", length: 128 },true,["encrypt", "decrypt"]);
const rawKey = JSON.stringify(await crypto.subtle.exportKey("jwk", key));
```

# FAQ

## Why are you loading in the CSS/JavaScript and serving it with the page?
This is to keep the number of requests being called to Deno Deploy low since there is request limit on the free plan. This could also be resolved by hosting the resources on a CDN. 