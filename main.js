import * as mb from "./scripts/server/mb.js";

/******************************************************************************************************************
* README
*
* Creating an APP_SECRET environmental variable. Save the rawKey.
*      const key = await crypto.subtle.generateKey({ name: "AES-CBC", length: 128 },true,["encrypt", "decrypt"]);
*      const rawKey = JSON.stringify(await crypto.subtle.exportKey("jwk", key));
******************************************************************************************************************/
//const _appSecret = JSON.parse(Deno.env.get("APP_SECRET") ?? "{}");
const _appSecret = JSON.parse('{"kty":"oct","k":"c2V4g-FQSxzpeCE8E0JcMg","alg":"A128CBC","key_ops":["encrypt","decrypt"],"ext":true}');

const _development = true;

Deno.serve(async (req) => { 
    if(_development) {
        console.log(req.url);
    }

    //********************************************************
    // Let's catch bots first and toss them out if we can...
    //********************************************************
    if((new URLPattern({pathname: "/robots.txt"})).exec(req.url)){
        return new Response(`
            User-agent: *
            Disallow: /
        `, {
            status: 200,
            headers: {
                "content-type": "text/plain",
            },
        });
    }

    const nope = ["robot","spider","facebook","crawler","google","updown.io daemon 2.11","bingbot","bot","duckduckgo"]
    for(let i = 0; i < nope.length; i++) {
        if(!req.headers.get("user-agent") || req.headers.get("user-agent").toLowerCase().includes(nope[i])) {
            return new Response('', {
                status: 401,
            });
        }
    }
    if(req.url == 'https://lillihub.com//wp-includes/wlwmanifest.xml' ||
      req.url == 'https://lillihub.com//xmlrpc.php?rsd' ||
      req.url.includes('wp-content')) {
        return new Response('', {
                status: 404,
            });
    } 

    //********************************************************
    // Okay, let's give the favicon if requested. Otherwise
    // we can run into strange behaviors
    //********************************************************
    if((new URLPattern({ pathname: "/favicon.ico" })).exec(req.url)){
        return new Response(new Uint8Array(await Deno.readFile("static/favicon.ico")), {
            status: 200,
            headers: {
                "content-type": "image/x-icon",
            },
        });
    }

    //********************************************************
    // Now let's give them any common files that the mobile
    // or browser will need for our HTML page
    // - the icon
    // - the webmanifest
    // - the service worker
    // - JS libraries and CSS resources
    //********************************************************
    if((new URLPattern({ pathname: "/lillihub-512.png" })).exec(req.url)){
        return new Response(new Uint8Array(await Deno.readFile("static/lillihub-512.png")), {
            status: 200,
            headers: {
                "content-type": "image/png",
            },
        });
    }

    if((new URLPattern({ pathname: "/logo.png" })).exec(req.url)){
        return new Response(new Uint8Array(await Deno.readFile("static/logo-ai-lillihub-xs.png")), {
            status: 200,
            headers: {
                "content-type": "image/png",
            },
        });
    }

    if((new URLPattern({ pathname: "/manifest.webmanifest" })).exec(req.url))
    {
        return new Response(await Deno.readFile("static/manifest.webmanifest"), {
            status: 200,
            headers: {
                "content-type": "text/json",
            },
        });
    }

    if((new URLPattern({ pathname: "/sw.js" })).exec(req.url))
    {
        return new Response(await Deno.readFile("scripts/server/sw.js"), {
            status: 200,
            headers: {
                "content-type": "text/javascript",
            },
        });
    }

    if((new URLPattern({ pathname: "/timeline.js" })).exec(req.url))
    {
        return new Response(await Deno.readFile("scripts/client/timeline.js"), {
            status: 200,
            headers: {
                "content-type": "text/javascript",
            },
        });
    }

    if((new URLPattern({ pathname: "/settings.js" })).exec(req.url))
        {
            return new Response(await Deno.readFile("scripts/client/settings.js"), {
                status: 200,
                headers: {
                    "content-type": "text/javascript",
                },
            });
        }

    if((new URLPattern({ pathname: "/main.css" })).exec(req.url))
    {
        return new Response(await Deno.readFile("styles/main.css"), {
            status: 200,
            headers: {
                "content-type": "text/css",
            },
        });
    }

    //********************************************************
    // Now let's see if we have a user or if someone needs to 
    // login
    //********************************************************
    const nonce = crypto.randomUUID(); // this is to protect our scripts and css
    const mbTokenCookie = getCookieValue(req, 'atoken');
    const mbToken = mbTokenCookie ? await decryptMe(getCookieValue(req, 'atoken')) : undefined;

    let user = false;
    const following = [];
    if(mbToken) {
        const mbUser = await mb.getMicroBlogUser(mbToken);

        // grab only the info we need
        if(mbUser) {

            if(_development) {
                console.log(mbUser);
            }

            user = {};
            user.username = mbUser.username;
            user.name = mbUser.name;
            user.avatar = mbUser.avatar;
            user.plan = mbUser.plan;

            //const kv = await Deno.openKv();

            const CHECK_ROUTE = new URLPattern({ pathname: "/check/:id" });
            if(CHECK_ROUTE.exec(req.url)) {
                const id = CHECK_ROUTE.exec(req.url).pathname.groups.id;
                const fetching = await fetch(`https://micro.blog/posts/check?since_id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const results = await fetching.json(); 
                return new Response(JSON.stringify(results),JSONHeaders());
            }

            const MARK_TIMELINE_ROUTE = new URLPattern({ pathname: "/mark/timeline/:id" });
            if(MARK_TIMELINE_ROUTE.exec(req.url) && user) {
                const id = MARK_TIMELINE_ROUTE.exec(req.url).pathname.groups.id;
                const _posting = await fetch(`https://micro.blog/posts/markers?id=${id}&channel=timeline&date_marked=${new Date()}`, { method: "POST", headers: { "Authorization": "Bearer " + mbToken } });
                return new Response('Timeline marked', {
                    status: 200,
                    headers: {
                        "content-type": "text/html",
                    },
                });
            }

            const TIMELINE_ROUTE = new URLPattern({ pathname: "/timeline/:id" });
            if(TIMELINE_ROUTE.exec(req.url)) {
                console.log('get posts')
                const id = TIMELINE_ROUTE.exec(req.url).pathname.groups.id;
                const posts = await mb.getMicroBlogTimelinePosts(mbToken, id);
                const html = posts.map(post => postHTML(post)).join('');

                return new Response(`${html}<br/><p class="p-centered">
                    <button class="btn btn-primary loadTimeline" data-id="${posts[posts.length-1].id}">load more</button>
                    <div id="add-${posts[posts.length-1] ? posts[posts.length-1].id : 'error'}"></div>
                    <div class="hide firstPost" data-id="${posts[0].id}"></div>
                    </p>`,HTMLHeaders(nonce));
            }

            // this is called from JavaScript to get the posts
            const POSTS_ROUTE = new URLPattern({ pathname: "/posts/:id" });
            const TAGMOJI_ROUTE = new URLPattern({ pathname: "/posts/discover/:id" });
            if((POSTS_ROUTE.exec(req.url) || TAGMOJI_ROUTE.exec(req.url)) && user) {
                const id = POSTS_ROUTE.exec(req.url) ? POSTS_ROUTE.exec(req.url).pathname.groups.id : 'discover/' + TAGMOJI_ROUTE.exec(req.url).pathname.groups.id;
                const posts = await mb.getMicroBlogUserOrTagmojiPosts(mbToken, id);
                return new Response(posts.map(post => postHTML(post)).join(''),HTMLHeaders());
            }

            const CONVERSATION_ROUTE = new URLPattern({ pathname: "/conversation/:id" });
            if(CONVERSATION_ROUTE.exec(req.url)) {
                const id = CONVERSATION_ROUTE.exec(req.url).pathname.groups.id;
                const searchParams = new URLSearchParams(req.url.split('?')[1]);
                const view = searchParams.get('view');
             
                const posts = await mb.getMicroBlogConversation(mbToken, id);  
                const following = (await mb.getMicroBlogFollowing(mbToken, mbUser.username)).map(i => {return JSON.stringify({username: i.username, avatar: i.avatar})});
                       
                const data = {};
                data.ids = posts.map(i => i.id);
                const follows = following.map(f => {return JSON.parse(f)});
        
                data.conversation = `        
                <div class="panel tile-no-sides">
                <div class="panel-body">
                ${posts.map(i => {
                    const stranger = follows.filter(f => f.username == i.username);
                    const convo = conversationHTML(i, stranger.length == 0, id, posts.length);
                    return convo;
                }).join('')}
                </div>

                <div class="side-padding">
                    <form class="form" id='replybox-form-${id}' data-id="${id}">
                        <div class="form-group">
                            <label class="form-label" for="replybox-textarea-${id}">Message</label>
                            <div class="grow-wrap"><textarea id="replybox-textarea-${id}" class="form-input grow-me textarea" name="content" rows="3"></textarea></div>
                            <input type="hidden" class="form-input" name="id" value="${id}" />
                        </div>
                        <div class="form-group">
                            <button data-id="${id}" type="button" class="btn btn-primary btn-sm replyBtn">Send Reply</button>
                        </div>
                    </form>
                    <div id="toast-${id}" class="toast hide">
                        <button data-id="${id}" class="btn btn-clear float-right clearToast"></button>
                        <div id="toast-content-${id}">Waiting for server....</div>
                    </div>
                </div>
            </div>
                    `;

                if(!view) {
                    return new Response(JSON.stringify(data), JSONHeaders());
                } 
                const nonce = crypto.randomUUID();
                return new Response(await HTML(data.conversation,nonce,'conversation',mbToken),HTMLHeaders(undefined,nonce));
            }

            if(((new URLPattern({ pathname: "/suggestions" })).exec(req.url))) {
                const users = await mb.getMicroBlogFollowing(mbToken, mbUser.username);

                const random = users[Math.floor(Math.random()*users.length)];
                let suggestions = await mb.getMicroBlogFollowing(mbToken, random.username, false);
                suggestions = suggestions.reverse().slice(0, 5);

                console.log(suggestions)

                return new Response(suggestions.map(s => {
                    return `<div class="tile">
                    <div class="tile-icon">
                        <figure class="avatar avatar-lg"><img src="${s.avatar}" alt="Avatar"></figure>
                    </div>
                    <div class="tile-content">
                        <p class="tile-title">${s.name}<br /><span class="tile-subtitle text-gray"><a href="/user/${s.username}">@${s.username}</a></span></p>
                        
                    </div>
                    </div>`}).join(''),HTMLHeaders(nonce));
            }

            if(((new URLPattern({ pathname: "/discover/feed" })).exec(req.url))) {
                const posts = await mb.getMicroBlogDiscoverPosts(mbToken);
                const html = posts.map(p => !p.image ? `
                    <div class="tile">
                        <div class="tile-icon">
                            ${getAvatar(p, 'sm')}
                        </div>
                        <div class="tile-content">
                            <p class="tile-title text-bold">
                                ${p.username}
                            </p>
                            <p class="tile-subtitle">${p.content}</p>
                        </div>
                    </div>
                ` : '').join('');

                return new Response(html,HTMLHeaders(nonce));
            }

            if(((new URLPattern({ pathname: "/discover/photos" })).exec(req.url))) {
                const posts = await mb.getMicroBlogDiscoverPhotoPosts(mbToken);
                const html = posts.map((p, index) => index < 9 ? `<li>
                    <img src="${p.image}" alt="Image 1" class="img-responsive">
                </li>` : '').join('');

                return new Response(`<ul class="discover-gallery">${html}</ul>`,HTMLHeaders(nonce));
            }

            if(((new URLPattern({ pathname: "/settings" })).exec(req.url))) {
                const layout = new TextDecoder().decode(await Deno.readFile("settings.html"));
                return new Response(layout.replaceAll('{{nonce}}', nonce)
                      .replace('{{year}}', new Date().getFullYear()),
                  HTMLHeaders(nonce));
            }


            // Here we have the reply and posting functionality
            if(new URLPattern({ pathname: "/reply" }).exec(req.url)) {
                const value = await req.formData();
                const id = value.get('id');
                const replyingTo = value.getAll('replyingTo[]');
                let content = value.get('content');
        
                if(content != null && content != undefined && content != '' && content != 'null' && content != 'undefined') {
                    const replies = replyingTo.map(function (reply, i) { return '@' + reply }).join(' ');
                    content = replies + ' ' + content;
        
                    const posting = await fetch(`https://micro.blog/posts/reply?id=${id}&content=${encodeURIComponent(content)}`, { method: "POST", headers: { "Authorization": "Bearer " + mbToken } });
                    if (!posting.ok) {
                        console.log(`${user.username} tried to add a reply and ${await posting.text()}`);
                    }
        
                    return new Response('Reply was sent.', {
                        status: 200,
                        headers: {
                            "content-type": "text/html",
                        },
                    });
                }
        
                return new Response('Something went wrong sending the reply.', {
                    status: 200,
                    headers: {
                        "content-type": "text/html",
                    },
                });
            }

            if((new URLPattern({ pathname: "/post/add" })).exec(req.url) && user) {
                const value = await req.formData();
                const destination = value.get('destination');
                const syndicates = value.getAll('syndicate[]');
                const categories = value.getAll('category[]');
                let content = value.get('content');
                const status = value.get('status');
                const name = value.get('name');
                const replyingTo = value.getAll('replyingTo[]');
                const postingType = value.get('postingType');
                const omgApi = value.get('omgApi');
                const omgAddess = value.get('omgAddess');
                const indieToken = value.get('indieToken');
                const microPub = value.get('microPub');

                const replies = replyingTo.map(function (reply) { return '@' + reply }).join(', ');
                content = replies + ' ' + content;

                if(!postingType || postingType === 'mb') {
                    const formBody = new URLSearchParams();
                    formBody.append("mp-destination", destination);
                    formBody.append("h", "entry");
                    formBody.append("content", content);
                   
                    if(name){
                        formBody.append("name", name);
                    }
                    if(categories.length > 0) {
                        categories.forEach((item) => formBody.append("category[]", item));
                    }
                    if(status == 'draft'){
                        formBody.append("post-status", "draft");
                    }
                    if(syndicates.length > 0) {
                        syndicates.forEach((item) => formBody.append("mp-syndicate-to[]", item));
                    } else {
                        formBody.append("mp-syndicate-to[]", "");
                    }
                    
                    const posting = await fetch(`https://micro.blog/micropub`, { method: "POST", body: formBody.toString(), headers: { "Authorization": "Bearer " + mbToken, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" } });
                    if (!posting.ok) {
                        console.log(`${user.username} tried to add a post and ${await posting.text()}`);
                    }
                    return new Response(JSON.stringify({"response":{"message":"Post was sent."}}), JSONHeaders());

                } else if(postingType === 'statuslog') {
                    const posting = await fetch(`https://api.omg.lol/address/${omgAddess}/statuses/`, { method: "POST", body: JSON.stringify({"status": content}), headers: { "Authorization": "Bearer " + omgApi } });
                    if (!posting.ok) {
                        console.log(`${user.username} tried to add a post and ${await posting.text()}`);
                    }
                    const data = await posting.json(); 
                    return new Response(JSON.stringify(data), JSONHeaders());

                } else if(postingType === 'weblog') {
                    const posting = await fetch(`https://api.omg.lol/address/${omgAddess}/weblog/entry/abc123`, { method: "POST", body: content, headers: { "Authorization": "Bearer " + omgApi } });
                    if (!posting.ok) {
                        console.log(`${user.username} tried to add a post and ${await posting.text()}`);
                    }
                    const data = await posting.json(); 
                    return new Response(JSON.stringify(data), JSONHeaders());
                }
                
        
                //return Response.redirect(req.url.replaceAll('/post/add', status == 'draft' ? `/blog?status=draft&destination=${destination}` : `/blog?status=published&destination=${destination}`));
            }



            // -----------------------------------------------------
            // User page
            // -----------------------------------------------------
            const USER_ROUTE = new URLPattern({ pathname: "/user/:id" });
            if(USER_ROUTE.exec(req.url) && user) {
                const id = USER_ROUTE.exec(req.url).pathname.groups.id;
            
                const results = await mb.getMicroBlogUserOrTagmojiPosts(mbToken, id);
                const follows = await mb.getMicroBlogFollowing(mbToken, mbUser.username);
                const stranger = follows.filter(f => f.username == results.username).length == 0;

                const layout = new TextDecoder().decode(await Deno.readFile("user.html"));

                return new Response(layout.replaceAll('{{results._microblog.username}}', results.username)
                    .replaceAll('{{results.author.name}}',results.name)
                    .replaceAll('{{results.author.url}}',results.url)
                    .replaceAll('{{results._microblog.bio}}', results.bio)
                    .replaceAll('{{posts}}', results.map(post => postHTML(post)).join(''))
                    .replaceAll('{{showIfFollowing}}', !stranger ? '' : 'hide')
                    .replaceAll('{{showIfStranger}}', stranger ? '' : 'hide')
                    ,HTMLHeaders(undefined,nonce));
            }


            // -----------------------------------------------------
            // Home page
            // -----------------------------------------------------
            const layout = new TextDecoder().decode(await Deno.readFile("timeline.html"));
            const following = (await mb.getMicroBlogFollowing(mbToken, mbUser.username)).map(i => {return JSON.stringify({username: i.username, avatar: i.avatar})});
            return new Response(layout.replaceAll('{{nonce}}', nonce)
                  .replace('{{username}}', mbUser.username)
                  .replace('{{replyBox}}', getReplyBox('main',following, true)),
              HTMLHeaders(nonce));
        } else {
            return returnBadGateway('Micro.blog did not return a user from the provided token.')
        }
    } else {
        // -----------------------------------------------------
        // We don't have a user, they can only see the homepage,
        // and the authentication routes
        // -----------------------------------------------------
        
        // Is it the redirect back from indieauth?
        if(new URLPattern({ pathname: "/auth" }).exec(req.url)) {
            const stateCookie = getCookieValue(req, 'state');
            const searchParams = new URLSearchParams(req.url.split('?')[1]);
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            if(_development) {
                console.log(`code: ${code}, state: ${state} == ${stateCookie}`);
            }
    
            if(code && stateCookie == state) {
                const formBody = new URLSearchParams();
                formBody.append("code", code);
                formBody.append("client_id", req.url.split('?')[0].replaceAll('auth',''));
                formBody.append("grant_type", "authorization_code");
    
                const fetching = await fetch('https://micro.blog/indieauth/token', {
                    method: "POST",
                    body: formBody.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                        "Accept": "application/json"
                    }
                });

                const response = await fetching.json();
                
                if(!response.error && response.access_token) {
                  const expiresOn = new Date();
                  const accessToken = await encryptMe(response.access_token);
                  expiresOn.setDate( expiresOn.getDate() + 399); //chrome limits to 400 days
                                    
                  const layout = new TextDecoder().decode(await Deno.readFile("loggingIn.html"));
                  return new Response(layout.replaceAll('{{nonce}}', nonce)
                        .replace('{{year}}', new Date().getFullYear()),
                    HTMLHeaders(nonce,`atoken=${accessToken};SameSite=Strict;Secure;HttpOnly;Expires=${expiresOn.toUTCString()}`));
                }

                return returnBadGateway(`Micro.blog indieauth did not return a token. ${response.error} ${response.access_token}`); 
            }
            return new Response(`Something went wrong. No code returned or state does not match cookie value.`,HTMLHeaders()); 
        } 
        
        // Is it the homepage?
        else if((new URLPattern({ pathname: "/" })).exec(req.url))
        {
            const layout = new TextDecoder().decode(await Deno.readFile("signin.html"));
            const state = crypto.randomUUID();
            return new Response(
                layout.replace('{{nonce}}', nonce)
                    .replace('{{state}}', state)
                    .replaceAll('{{appURL}}', req.url.endsWith('/') ? req.url.slice(0, -1) : req.url)
                    .replace('{{year}}', new Date().getFullYear()),
                HTMLHeaders(nonce, `state=${state};HttpOnly;`)
            );
        } else {
            return new Response('', {
                status: 404,
            });
        }
    }
});


//********************************************************
// Helper functions... a developer's best friend
// - getCookieValue: get value from a cookie
// - encryptMe: encrypt a string
// - decryptMe: decrypt a string
// - HTMLHeaders: proper csp protected headers
// - returnBadGateway: response if we have a bad API call
//********************************************************

// Takes a request, gets the cookies, and looks for one 
// that has the passed in name. If found, it returns...
// otherwise it returns an empty string.
function getCookieValue(req, name) {
    const cookies = req.headers.get("cookie") ? req.headers.get("cookie").split('; ') : [];
    let cookieValue = cookies.filter(cookie => cookie.includes(`${name}=`));
    cookieValue = cookieValue.length > 0 ? cookieValue[0].split('=')[1] : '';
    return cookieValue;
}

// Takes a decrypted string and then encrypts it with our secret value
// Uses AES-CBC. Returns and array of comma seperated integers.
async function encryptMe(decrypted)
{
    const iv = await crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey("jwk", _appSecret, "AES-CBC", true, ["encrypt", "decrypt"]);
    const encrypted = await crypto.subtle.encrypt({name: "AES-CBC", iv}, key, new TextEncoder().encode(decrypted));
    const encryptedBytes = new Uint8Array(encrypted);

    return `${iv.toString()}|${encryptedBytes.toString()}`;
}

// Takes an encrypted string, with our secret, and then descrypts it.
// Returns the decrypted string
async function decryptMe(encrypted)
{
    const key = await crypto.subtle.importKey("jwk", _appSecret, "AES-CBC", true, ["encrypt", "decrypt"]);
    const ivPart = encrypted.split('|')[0];
    const encryptedPart = encrypted.split('|')[1];

    const encryptedBytes = Uint8Array.from(encryptedPart.split(',').map(num => parseInt(num)));
    const iv = Uint8Array.from(ivPart.split(',').map(num => parseInt(num)));
   
    const decrypted = await crypto.subtle.decrypt({name: "AES-CBC", iv}, key, encryptedBytes);
    const decryptedBytes = new Uint8Array(decrypted);
    return new TextDecoder().decode(decryptedBytes);
}

// Helper method for returning a proper response header
// can set a cookie if provided
// the uuid is set per request to set a nonce
function HTMLHeaders(uuid, cookie) {
    const csp = `default-src 'self' micro.blog *.micro.blog *.gravatar.com 'nonce-${uuid}';media-src *;img-src *`;
    if(!cookie) {
        return {
            headers: {
                "content-type": "text/html",
                status: 200,
                "Content-Security-Policy": csp
            },
        };
    }
    return {
        headers: {
            "content-type": "text/html",
            status: 200,
            "set-cookie": cookie,
            "Content-Security-Policy": csp
        },
    };
}

function JSONHeaders() {
    return {
        headers: {
            "content-type": "text/json",
            status: 200,
        },
    };
}

// Helper method to return a bad gateway and the reason.
function returnBadGateway(reason) {
    return new Response(reason, {
        status: 502,
        "content-type": "text/html"
    });
}

function getAvatar(p, size) {
    return `<figure class="avatar ${size}" data-initial="${p.username.substring(0,1)}">
            <img src="${p.avatar}" loading="lazy">
        </figure>`;
}

function postHTML(post, marker, stranger) {
    const multipleImgs = !post.linkpost && post.content.split('<img').length > 2;

    if(multipleImgs) {
        post.content = post.content.replaceAll('<img', `<img data-gallery='${post.id}'`);
    }

    // const anchors = post.content.split('<a');
    // if(anchors && anchors.length > 1) {
    //     for(var i = 0; i < anchors.length; i++) {
    //         if(anchors[i].includes('https://micro.blog/') && anchors[i].includes('@')) {
    //             var href = anchors[i].replaceAll("'",'"').split('href="');
    //             if(href[1]) {
    //                 var anchor = href[1].split('"')[0];
    //                 var username = href[1].split('"')[0].replace('https://micro.blog/','');
    //                 post.content = post.content.replaceAll(anchor, '/user/' + username);
    //             }
    //         } 
    //     }
    // }
    post.content.replaceAll('<script', `<div`);
    post.content.replaceAll('</script', `</div`);
    
    //${marker && marker.time_published && (marker.time_published >= post.timestamp) ? 'seen' : ''}
    return `
        <article id="${post.id}" class="card parent ${marker && marker.id == post.id ? 'marked' : ''}" data-reply="${post.username}" data-avatar="${post.avatar}" data-id="${post.id}" data-processed="false" data-marked="${marker && marker.id == post.id ? 'true' : 'false'}" data-url="${post.url}" data-mention="${post.mention}" data-conversation="${post.conversation}" data-timestamp="${post.timestamp}" data-published="${post.published}" data-deletable="${post.deletable}" data-linkpost="${post.linkpost}" data-bookmark="${post.bookmark}" data-favorite="${post.favorite}">
            <header class="card-header">
                ${getAvatar(post, 'avatar-lg')}
                <div class="card-top">
                    <div class="card-title h5">${post.name}</div>
                    <div class="card-subtitle">
                        <a href="/user/${post.username}" class="text-gray">@${post.username}${stranger ? ' <i class="icon icon-people text-gray"></i>' : ''}</a>
                    </div>           
                </div>
                <div class="card-buttons">
                    <div class="dropdown"><a class="btn btn-link" tabindex="0"><i class="icon icon-more-vert"></i></a>
                        <ul class="menu">
                            <li class="divider" data-content="Published: ${post.relative}">
                            <li class="menu-item"><a href="/post?quote=${post.id}">Quote Post</a></li>
                            <li class="menu-item"><button data-url="${post.url}" class="addBookmark">Bookmark Post</button></li>
                            <li class="menu-item"><a href="/conversation/${post.id}?view=true">View Post</a></li>
                        </ul>
                    </div>
                </div>
            </header>
            ${ post.conversation ? `<details class="accordion">
                    <summary data-id="${post.id}" data-reply="${post.username}" data-avatar="${post.avatar}" class="accordion-header text-gray openConversationBtn">
                        <i class="icon icon-arrow-right mr-1"></i>
                        view conversation
                    </summary>
                    <div class="accordion-body">
                        <div class="content" id="content-${post.id}">
                            <span class="loading d-block"></span>
                        </div>
                    </div>
                </details>` : ''}
            <main id="main-${post.id}" data-id="${post.id}">${post.content}</main>
            ${multipleImgs ? `<div data-id="${post.id}" class='gallery'></div>` : ''}
            ${!post.conversation ? `
                <details class="accordion">
                    <summary  data-reply="${post.username}" data-avatar="${post.avatar}" class="accordion-header text-gray">
                        <i class="icon icon-arrow-right mr-1"></i>
                        Be the first to reply
                    </summary>
                    <div class="accordion-body">
                        <div class="side-padding">
                            <form class="form" id='replybox-form-${post.id}-main' data-id="${post.id}">
                                <div class="form-group">
                                    <div class="grow-wrap"><textarea id="replybox-textarea-${post.id}-main" class="form-input grow-me textarea" name="content" rows="3">@${post.username}</textarea></div>
                                    <input type="hidden" class="form-input" name="id" value="${post.id}" />
                                </div>
                                <div class="form-group">
                                    <button data-id="${post.id}-main" type="button" class="btn btn-primary btn-sm replyBtn">Send Reply</button>
                                </div>
                            </form>
                             <div id="toast-${post.id}-main" class="toast hide">
                                <button data-id="${post.id}-main" class="btn btn-clear float-right clearToast"></button>
                                <div id="toast-content-${post.id}-main">Waiting for server....</div>
                            </div>
                        </div>
                    </div>
                </details>` : '' }
        </article>
    `;
}

function conversationHTML(post, stranger, parent, length) {
    const p = post;

    const multipleImgs = !p.linkpost && p.content.split('<img').length > 2;

    if(multipleImgs) {
        p.content = p.content.replaceAll('<img', `<img data-gallery='${p.id}-${parent}'`);
    }
    return `
        <div class="tile mb-2 mt-2 pt-2 ${p.id == parent ? 'highlight' : ''}" id="convo-${p.id}-${parent}" data-id="${p.id}" data-parent="${parent}" data-stranger="${stranger}">
            <div class="tile-icon ">
                <figure class="avatar avatar-sm " data-initial="${p.username.substring(0,1)}">
                    <img src="${p.avatar}" loading="lazy">
                </figure>
            </div>
            <div class="tile-content">
                <p class="tile-title">
                    ${p.name} <a class="text-gray" href="/user/${p.username}">@${p.username}</a>${stranger ? ' <i class="icon icon-people text-gray"></i>' : ''}
                    <button type="button" class="addToReply btn btn-sm btn-link btn-icon float-right" data-target="replybox-textarea-${parent}" data-id="${p.username}">
                        <i data-target="replybox-textarea-${parent}" data-id="${p.username}" class="icon icon-share addToReply"></i>
                    </button>
                </p>
                ${p.content}
                ${multipleImgs ? `<div data-id="${p.id}-${parent}" class='gallery'></div>` : ''}
            </div>
        </div>
    `;


//     <article class="card parent" id="convo-${p.id}-${parent}" data-id="${p.id}" data-parent="${parent}" data-stranger="${stranger}">
//     <header class="card-header">
//             ${getAvatar(p, 'avatar-sm')}
//             <div class="card-title card-top">
//                 ${p.name} <a class="text-gray" href="/user/${p.username}">@${p.username}</a>${stranger ? ' <i class="icon icon-people text-gray"></i>' : ''}
//             </div>
//             <div class="card-buttons convoBtns">
//                 <button data-id="${parent}" class="btn btn-link float-right openConversationBtn">${length} <i data-id="${parent}" class="icon icon-message openConversationBtn"></i></button>
//             </div>
//         </div>
//     </header>
//     <main>${p.content}</main>
//     ${multipleImgs ? `<div data-id="${p.id}-${parent}" class='gallery'></div>` : ''}
// </article>
}

function getReplyBox(id, repliers, boxOnly = false) {  
    if(boxOnly) {
        return `<div id="replybox-${id}" class="form-group">
                    <div class="form-autocomplete">
                    <div id="replybox-input-container-${id}" class="form-autocomplete-input form-input">
                        <div id="replybox-chips-${id}">
                        </div>
                        <input id="replybox-input-${id}" data-id="${id}" class="form-input replierInput" type="text" placeholder="Begin typing to find users" value="">
                    </div>
                    <ul id="replybox-menu-${id}" class="menu hide">
                        ${repliers.map(r => {
                            const replier = JSON.parse(r);
                            return `<li class="menu-item" class="hide" data-name="${replier.username}" data-avatar="${replier.avatar}"></li>`}).join('')}
                    </ul>
                    </div>
                </div>
                ${repliers.map(function (ur) {
                    const person = JSON.parse(ur);
                    return `<input id="replybox-checkbox-${id}-${person.username}" class="hide" type='checkbox' name='replyingTo[]' value='${person.username}'/>`
                }).join(' ')}
                `;
    }
    const author = JSON.parse(repliers[0]);
    return `
        <form class="form" id='replybox-form-${id}' data-id="${id}">
            ${repliers.map(function (ur) {
                const person = JSON.parse(ur);
                return `<input id="replybox-checkbox-${id}-${person.username}" class="hide" ${person.username.trim() == author.username.trim() ? 'checked="checked"' : ''} type='checkbox' name='replyingTo[]' value='${person.username}'/>`
            }).join(' ')}
            <div id="replybox-${id}" class="form-group">
                <label class="form-label">Repling to:</label>
                <div class="form-autocomplete">
                <div id="replybox-input-container-${id}" class="form-autocomplete-input form-input">
                    <div id="replybox-chips-${id}">
                        <span id="chip-${id}-${author.username}" class="chip"><img class="avatar avatar-sm" src="${author.avatar}" />@${author.username}<a data-name="${author.username}" data-id="${id}" class="btn btn-clear replierRemoveChip" href="#" aria-label="Close" role="button"></a></span>
                    </div>

                    <input id="replybox-input-${id}" data-id="${id}" class="form-input replierInput" type="text" placeholder="" value="">
                </div>
                <ul id="replybox-menu-${id}" class="menu hide">
                    ${repliers.map(r => {
                        const replier = JSON.parse(r);
                        return `<li class="menu-item" class="hide" data-name="${replier.username}" data-avatar="${replier.avatar}"></li>`}).join('')}
                </ul>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="input-example-3">Message</label>
                <div class="grow-wrap"><textarea id="replybox-textarea-${id}" class="form-input grow-me" name="content" rows="3"></textarea></div>
                <input type="hidden" class="form-input" name="id" value="${id}" />
            </div>
            <div class="form-group">
                <button data-id="${id}" type="button" class="btn btn-primary replyBtn">Send Reply</button>
            </div>
        </form>
    `;
}
















//********************************************************
// import { serve } from "https://deno.land/std@0.214.0/http/server.ts";

// import { getCookieValue, decryptMe, encryptMe } from "./scripts/server/utilities.js";
// import { getMicroBlogLoggedInUser } from "./scripts/server/mb.js";
// import { HTMLPage, CSSThemeColors } from "./layouts/templates.js"
// import { SettingsTemplate } from "./layouts/settings.js"
// import { SingleTemplate } from "./layouts/single.js";
// import { UsersTemplate } from "./layouts/users.js";
// import { MentionsTemplate } from "./layouts/mentions.js";
// import { RepliesTemplate } from "./layouts/replies.js";
// import { BookmarksTemplate } from "./layouts/bookmarks.js";
// import { BookshelvesTemplate } from "./layouts/bookshelves.js";
// import { BookshelfTemplate } from "./layouts/bookshelf.js";
// import { EditorTemplate } from "./layouts/editor.js";
// import { BlogTemplate } from "./layouts/blog.js";
// import { MediaTemplate } from "./layouts/media.js";
// import { NotebooksTemplate } from "./layouts/notebooks.js";
// import { NotesTemplate } from "./layouts/notes.js";
// import { NoteTemplate } from "./layouts/note.js";
// import { TimelineTemplate } from "./layouts/timeline.js";
// import { DiscoverTemplate } from "./layouts/discover.js";
// import { TagmojiTemplate } from "./layouts/tagmoji.js";
// import { UserTemplate } from "./layouts/user.js";
// import { ConversationsTemplate } from "./layouts/conversations.js";
// import { ConversationTemplate } from "./layouts/conversation.js";
// import { BookTemplate } from "./layouts/book.js";

// const _replyFormTemplate = new TextDecoder().decode(await Deno.readFile("templates/_reply_form.html"));

// const FAVICON_ROUTE = new URLPattern({ pathname: "/favicon.ico" });
// const WEBMANIFEST_ROUTE = new URLPattern({ pathname: "/manifest.webmanifest" });
// const SERVICEWORKER_ROUTE = new URLPattern({ pathname: "/sw.js" });
// const LILLIHUB_ICON_ROUTE = new URLPattern({ pathname: "/lillihub-512.png" });

// const HOME_ROUTE = new URLPattern({ pathname: "/" });
// const CONVERSATIONS_ROUTE = new URLPattern({ pathname: "/conversations" });
// const DISCOVER_ROUTE = new URLPattern({ pathname: "/discover" });
// const DISCOVERTAG_ROUTE = new URLPattern({ pathname: "/discover/:id" });
// const USER_ROUTE = new URLPattern({ pathname: "/user/:id" });
// const USERPHOTOS_ROUTE = new URLPattern({ pathname: "/user/photos/:id" });
// const FOLLOWING_ROUTE = new URLPattern({ pathname: "/users/following" });
// const MUTED_ROUTE = new URLPattern({ pathname: "/users/muted" });
// const BLOCKED_ROUTE = new URLPattern({ pathname: "/users/blocked" });
// const MENTIONS_ROUTE = new URLPattern({ pathname: "/mentions" });
// const REPLIES_ROUTE = new URLPattern({ pathname: "/replies" });
// const BOOKMARKS_ROUTE = new URLPattern({ pathname: "/bookmarks" });
// const BOOKSHELVES_ROUTE = new URLPattern({ pathname: "/bookshelves" });
// const BOOKSHELF_ROUTE = new URLPattern({ pathname: "/bookshelves/shelf/:id" });
// const BOOK_ROUTE = new URLPattern({ pathname: "/bookshelves/shelf/:shelfid/book/:id" });
// const NOTEBOOKS_ROUTE = new URLPattern({ pathname: "/notes" });
// const NOTES_ROUTE = new URLPattern({ pathname: "/notes/:id" });
// const UPDATE_NOTES_ROUTE = new URLPattern({ pathname: "/notes/:id/update" });
// const SETTINGS_ROUTE = new URLPattern({ pathname: "/settings" });
// const POST_ROUTE = new URLPattern({ pathname: "/post" });
// const TIMELINE_POST_ROUTE = new URLPattern({ pathname: "/timeline/:id" });
// const POSTS_ROUTE = new URLPattern({ pathname: "/posts" });
// const MEDIA_ROUTE = new URLPattern({ pathname: "/media" });
// const LOGOUT_ROUTE = new URLPattern({ pathname: "/logout" });
// const AUTH_ROUTE = new URLPattern({ pathname: "/auth" });
// const ROBOT_ROUTE = new URLPattern({pathname: "/robots.txt"})

// const ADD_REPLY = new URLPattern({ pathname: "/replies/add" });
// const UNFOLLOW_USER = new URLPattern({ pathname: "/users/unfollow" });
// const FOLLOW_USER = new URLPattern({ pathname: "/users/follow" });
// const MUTE_USER = new URLPattern({ pathname: "/users/mute" });
// const BLOCK_USER = new URLPattern({ pathname: "/users/block" });
// const FAVORTIE_USER_TOGGLE = new URLPattern({ pathname: "/users/favorite/toggle" });
// const FAVORTIE_FEED_TOGGLE = new URLPattern({ pathname: "/feed/favorite/toggle" });
// const PIN_TIMELINE_POST = new URLPattern({ pathname: "/timeline/favorite/toggle" });
// const BOOK_MOVE = new URLPattern({ pathname: "/book/move" });
// const BOOK_CHANGE_COVER= new URLPattern({ pathname: "/book/change" });
// const BOOK_REMOVE= new URLPattern({ pathname: "/book/remove" });
// const BOOKMARKS_UPDATE_TAGS = new URLPattern({ pathname: "/bookmarks/update" });
// const BOOKMARKS_NEW = new URLPattern({ pathname: "/bookmarks/new" });
// const BOOKMARKS_UNBOOKMARK = new URLPattern({ pathname: "/bookmarks/unbookmark" });
// const SETTINGS_DARKTHEME = new URLPattern({ pathname: "/settings/darktheme" });
// const SETTINGS_CONTENTFILTERS = new URLPattern({ pathname: "/settings/contentfilters" });
// const SETTINGS_TIMELINE = new URLPattern({ pathname: "/settings/timeline" });
// const ADD_NOTE = new URLPattern({ pathname: "/note/update" });
// const DELETE_NOTE = new URLPattern({ pathname: "/note/delete" });
// const ADD_NOTEBOOK = new URLPattern({ pathname: "/notebook/add" });
// const ADD_POST = new URLPattern({ pathname: "/post/add" });
// const EDIT_POST = new URLPattern({ pathname: "/post/edit" });
// const UPLOAD_MEDIA_ROUTE = new URLPattern({ pathname: "/media/upload" });
// const DELETE_MEDIA_ROUTE = new URLPattern({ pathname: "/media/delete" });
// const GET_CONVERSATION_ROUTE = new URLPattern({ pathname: "/conversation/:id" });
// const ADD_BOOK = new URLPattern({ pathname: "/book/add" });



// const SESSION = {};

// async function handler(req) {  
//     if(ROBOT_ROUTE.exec(req.url)){
//         return new Response(`
//             User-agent: *
//             Disallow: /
//         `, {
//             status: 200,
//             headers: {
//                 "content-type": "text/plain",
//             },
//         });
//     }

//     var nope = ["robot","spider","facebook","crawler","google","updown.io daemon 2.11","bingbot","bot","duckduckgo"]
//     for(var i = 0; i < nope.length; i++) {
//         if(!req.headers.get("user-agent") || req.headers.get("user-agent").toLowerCase().includes(nope[i])) {
//             //console.log('bot?', req.url, req.headers.get("user-agent") );
//             return new Response('', {
//                 status: 401,
//             });
//         }
//     }
//     if(req.url == 'https://lillihub.com//wp-includes/wlwmanifest.xml' ||
//       req.url == 'https://lillihub.com//xmlrpc.php?rsd' ||
//       req.url.includes('wp-content')) {
//         return new Response('', {
//                 status: 404,
//             });
//     }


//     /********************************************************
//      * Requests that resolve before authentication checks
//      ********************************************************/
//     if(FAVICON_ROUTE.exec(req.url)){
//         return new Response(new Uint8Array(await Deno.readFile("static/favicon.ico")), {
//             status: 200,
//             headers: {
//                 "content-type": "image/x-icon",
//             },
//         });
//     }

//     if(LILLIHUB_ICON_ROUTE.exec(req.url)){
//         return new Response(new Uint8Array(await Deno.readFile("static/lillihub-512.png")), {
//             status: 200,
//             headers: {
//                 "content-type": "image/png",
//             },
//         });
//     }

//     if(WEBMANIFEST_ROUTE.exec(req.url))
//     {
//         return new Response(await Deno.readFile("static/manifest.webmanifest"), {
//             status: 200,
//             headers: {
//                 "content-type": "text/json",
//             },
//         });
//     }

//     if(SERVICEWORKER_ROUTE.exec(req.url))
//     {
//         return new Response(await Deno.readFile("scripts/server/sw.js"), {
//             status: 200,
//             headers: {
//                 "content-type": "text/javascript",
//             },
//         });
//     }

//     /********************************************************
//      * Check if request comes from an authenticated user
//      ********************************************************/
//     let user = false;
//     const accessToken = getCookieValue(req, 'atoken');
//     const accessTokenValue = accessToken ? await decryptMe(getCookieValue(req, 'atoken')) : undefined;
    
//     if(accessTokenValue) {
//         const mbUser = await getMicroBlogLoggedInUser(accessTokenValue);
//         user = {};
//         user.username = mbUser.username;
//         user.name = mbUser.name;
//         user.avatar = mbUser.avatar;
//         user.plan = mbUser.plan;

//         console.log('---------------------->', user.username, req.url.split('?')[0])
//         //check to see if we have user settings in-memory...
//         if(!SESSION[user.username]) {
//             const kv = await Deno.openKv();
//             const userKV = await kv.get([user.username, 'global']);
//             if(userKV && !userKV.value) {
//                 const starterFavs = { favorites: ['manton', 'jean', 'news', 'help'], feeds: [], display: 'both' };
//                 await kv.set([user.username, 'global'], starterFavs);
//                 user.lillihub = starterFavs;
//             } else {   
//                 user.lillihub = userKV.value;
//             }

//             SESSION[user.username] = user;
//         } else {
//             user.lillihub = SESSION[user.username].lillihub;
//         }
//     } else {
//         //console.log(req.url, req.headers.get("user-agent"));
//     }
   
//     /********************************************************
//      * Authenticated Only Routes
//      ********************************************************/
//     if(HOME_ROUTE.exec(req.url) && user) {
//         return new Response(await TimelineTemplate(user, accessTokenValue, req), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(CONVERSATIONS_ROUTE.exec(req.url) && user) {
//         return new Response(await ConversationsTemplate(user, accessTokenValue, req), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(SETTINGS_ROUTE.exec(req.url) && user) {
//         return new Response(await SettingsTemplate(user), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(TIMELINE_POST_ROUTE.exec(req.url) && user) {
//         const id = TIMELINE_POST_ROUTE.exec(req.url).pathname.groups.id;

//         return new Response(await SingleTemplate(user, accessTokenValue, id), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(FOLLOWING_ROUTE.exec(req.url) && user) {
//         return new Response(await UsersTemplate(user, accessTokenValue, 'following', `https://micro.blog/users/following/${user.username}`), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(MUTED_ROUTE.exec(req.url) && user) {
//         return new Response(await UsersTemplate(user, accessTokenValue, 'muted', `https://micro.blog/users/muting`), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(BLOCKED_ROUTE.exec(req.url)) {
//         return new Response(await UsersTemplate(user, accessTokenValue, 'blocked', `https://micro.blog/users/blocking`), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(MENTIONS_ROUTE.exec(req.url) && user) {
//         return new Response(await MentionsTemplate(user, accessTokenValue), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(REPLIES_ROUTE.exec(req.url) && user) {
//         return new Response(await RepliesTemplate(user, accessTokenValue), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(BOOKMARKS_ROUTE.exec(req.url) && user) {
//         return new Response(await BookmarksTemplate(user, accessTokenValue, req), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(BOOKSHELVES_ROUTE.exec(req.url) && user) {
//         return new Response(await BookshelvesTemplate(user, accessTokenValue), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(BOOKSHELF_ROUTE.exec(req.url) && user) {
//         const id = BOOKSHELF_ROUTE.exec(req.url).pathname.groups.id;

//         return new Response(await BookshelfTemplate(user, accessTokenValue, id), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(BOOK_ROUTE.exec(req.url) && user) {
//         const id = BOOK_ROUTE.exec(req.url).pathname.groups.id;
//         const shelfid = BOOK_ROUTE.exec(req.url).pathname.groups.shelfid;

//         return new Response(await BookTemplate(user, accessTokenValue, shelfid, id), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(POST_ROUTE.exec(req.url) && user) {
//         return new Response(await EditorTemplate(user, accessTokenValue, req), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(POSTS_ROUTE.exec(req.url) && user) {
//         return new Response(await BlogTemplate(user, accessTokenValue, req), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(MEDIA_ROUTE.exec(req.url) && user) {
//         return new Response(await MediaTemplate(user, accessTokenValue, req), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(NOTEBOOKS_ROUTE.exec(req.url) && user) {
//         if(user.plan != 'premium') {
//             return new Response(HTMLPage(`Notebooks`,`<div class="container><p><b>You need to be a premium micro.blog user to access notebooks</b></p></div>"`, user), {
//                 status: 200,
//                 headers: {
//                     "content-type": "text/html",
//                 },
//             });
//         }

//         return new Response(await NotebooksTemplate(user, accessTokenValue), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(NOTES_ROUTE.exec(req.url) && user) {
//         const id = NOTES_ROUTE.exec(req.url).pathname.groups.id;

//         if(user.plan != 'premium') {
//             return new Response(HTMLPage(`Notebooks`,`<div class="container><p><b>You need to be a premium micro.blog user to access notebooks</b></p></div>"`, user), {
//                 status: 200,
//                 headers: {
//                     "content-type": "text/html",
//                 },
//             });
//         }

//         return new Response(await NotesTemplate(user, accessTokenValue, id), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(UPDATE_NOTES_ROUTE.exec(req.url) && user) {
//         if(user.plan != 'premium') {
//             return new Response(HTMLPage(`Notebooks`,`<div class="container><p><b>You need to be a premium micro.blog user to access notebooks</b></p></div>"`, user), {
//                 status: 200,
//                 headers: {
//                     "content-type": "text/html",
//                 },
//             });
//         }

//         const id = UPDATE_NOTES_ROUTE.exec(req.url).pathname.groups.id;

//         return new Response(await NoteTemplate(user, accessTokenValue, id, req), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(GET_CONVERSATION_ROUTE.exec(req.url) && user) {
//         const id = GET_CONVERSATION_ROUTE.exec(req.url).pathname.groups.id;

//         return new Response(await ConversationTemplate(id, user, accessTokenValue), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     /********************************************************
//      * Authenticated Only Actions
//      ********************************************************/

//     if(ADD_REPLY.exec(req.url) && user) {
//         const value = await req.formData();
//         const id = value.get('id');
//         const checkboxes = value.get('checkboxes');
//         const replyingTo = value.getAll('replyingTo[]');
//         let content = value.get('content');

//         if(content != null && content != undefined && content != '' && content != 'null' && content != 'undefined') {
//             const replies = replyingTo.map(function (reply, i) { return '@' + reply }).join(' ');
//             content = replies + ' ' + content;

//             const posting = await fetch(`https://micro.blog/posts/reply?id=${id}&content=${encodeURIComponent(content)}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
//             if (!posting.ok) {
//                 console.log(`${user.username} tried to add a reply and ${await posting.text()}`);
//             }

//             return new Response(_replyFormTemplate
//                     .replaceAll('{{id}}', id)
//                     .replaceAll('{{CSSThemeColors}}', CSSThemeColors(user.lillihub.darktheme))
//                     .replaceAll('{{checkboxes}}', atob(checkboxes))
//                     .replaceAll('{{checkboxes64}}', checkboxes)
//                     .replaceAll('{{buttonText}}','Send Another Reply')
//                     .replaceAll('{{backgroundColor}}','var(--mantle)')
//                     .replaceAll('{{response}}','Reply was sent.'), {
//                 status: 200,
//                 headers: {
//                     "content-type": "text/html",
//                 },
//             });
//         }
//     }

//     if(UNFOLLOW_USER.exec(req.url) && user) {
//         const value = await req.formData();
//         const username = value.get('username');

//         const posting = await fetch(`https://micro.blog/users/unfollow?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
//         if (!posting.ok) { 
//             console.log(`${user.username} tried to unfollow ${username} and ${await posting.text()}`);
//         }

//         return new Response(await UserTemplate(user, accessTokenValue, username), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(FOLLOW_USER.exec(req.url) && user) {
//         const value = await req.formData();
//         const username = value.get('username');

//         const posting = await fetch(`https://micro.blog/users/follow?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
//         if (!posting.ok) {
//             console.log(`${user.username} tried to follow ${username} and ${await posting.text()}`);
//         }

//         return new Response(`<p></p>`, {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });    
//     }

//     if(MUTE_USER.exec(req.url) && user) {
//         const value = await req.formData();
//         const username = value.get('username');

//         const posting = await fetch(`https://micro.blog/users/mute?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
//         if (!posting.ok) {
//             console.log(`${user.username} tried to mute ${username} and ${await posting.text()}`);
//         }

//         return new Response(await UserTemplate(user, accessTokenValue, username), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(BLOCK_USER.exec(req.url) && user) {
//         const value = await req.formData();
//         const username = value.get('username');

//         const posting = await fetch(`https://micro.blog/users/block?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
//         if (!posting.ok) {
//             console.log(`${user.username} tried to block ${username} and ${await posting.text()}`);
//         }

//         return new Response(await UserTemplate(user, accessTokenValue, username), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(BOOK_CHANGE_COVER.exec(req.url) && user) {
//         const value = await req.formData();
//         const location = value.get('location');
//         const shelfId = value.get('shelfId');
//         const id = value.get('id');

//         const formBody = new URLSearchParams();
//         formBody.append("cover_url", location);

//         const posting = await fetch(`https://micro.blog/books/bookshelves/${shelfId}/cover/${id}`, {
//             method: "POST",
//             body: formBody.toString(),
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
//                 "Authorization": "Bearer " + accessTokenValue
//             }
//         });

//         return Response.redirect(req.url.replaceAll('/book/change', `/bookshelves/shelf/${shelfId}/book/${id}`));
//     }

//     if(BOOK_MOVE.exec(req.url) && user) {
//         const value = await req.formData();
//         const shelf = value.getAll('shelf[]');
//         const id = value.get('id');

//         const formBody = new URLSearchParams();
//         formBody.append("book_id", id);

//         const posting = await fetch(`https://micro.blog/books/bookshelves/${shelf[0]}/assign`, {
//             method: "POST",
//             body: formBody.toString(),
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
//                 "Authorization": "Bearer " + accessTokenValue
//             }
//         });

//         return Response.redirect(req.url.replaceAll('/book/move', `/bookshelves/shelf/${shelf[0]}`));
//     }

//     if(BOOK_REMOVE.exec(req.url) && user) {
//         const value = await req.formData();
//         const shelfId = value.get('shelfId');
//         const id = value.get('id');

//         const posting = await fetch(`https://micro.blog/books/bookshelves/${shelfId}/remove/${id}`, {
//             method: "DELETE",
//             headers: {
//                 "Authorization": "Bearer " + accessTokenValue
//             }
//         });

//         return Response.redirect(req.url.replaceAll('/book/remove', `/bookshelves/shelf/${shelfId}`));
//     }

//     if(ADD_BOOK.exec(req.url) && user) {
//         const value = await req.formData();
//         const shelf = value.getAll('shelf[]');
//         const title = value.get('title');
//         const author = value.get('author');
//         const isbn = value.get('isbn');

//         const posting = await fetch(`https://micro.blog/books?bookshelf_id=${shelf[0]}&isbn=${isbn}&title=${title}&author=${author}`, {
//             method: "POST",
//             headers: {
//                 "Authorization": "Bearer " + accessTokenValue
//             }
//         });

//         return Response.redirect(req.url.replaceAll('/book/add', `/bookshelves/shelf/${shelf[0]}`));
//     }

//     if(BOOKMARKS_NEW.exec(req.url) && user) {
//         const value = await req.formData();
//         const url = value.get('url');
//         const redirect = value.get('redirect');
//         const tags = value.get('tags');

//         const formBody = new URLSearchParams();
//         formBody.append("h", "entry");
//         formBody.append("bookmark-of", url);

//         const posting = await fetch(`https://micro.blog/micropub`, {
//             method: "POST",
//             body: formBody.toString(),
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
//                 "Authorization": "Bearer " + accessTokenValue
//             }
//         });
//         if (!posting.ok) {
//             console.log(`${user.username} tried to add a bookmark ${url} and ${await posting.text()}`);
//             return new Response(`<p>Error :-(</p>`, {
//                 status: 200,
//                 headers: {
//                     "content-type": "text/html",
//                 },
//             });
//         }

//         if(user.plan == 'premium' && tags) {
//             const fetchingBookmarks = await fetch(`https://micro.blog/posts/bookmarks`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } } );
//             const bookmark = (await fetchingBookmarks.json()).items[0];
           
//             const formBodyTags = new URLSearchParams();
//             formBodyTags.append("tags", tags);
           
//             const postingTags = await fetch(`https://micro.blog/posts/bookmarks/${bookmark.id}`, {
//                 method: "POST",
//                 body: formBodyTags.toString(),
//                 headers: {
//                     "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
//                     "Authorization": "Bearer " + accessTokenValue
//                 }
//             });
//             const responseTags = await postingTags.text();
//             if (!responseTags.ok) {
//                 console.log(`${user.username} tried to add tags to a new bookmark and ${await posting.text()}`);
//                 return new Response(`<p>Error :-(</p>`, {
//                     status: 200,
//                     headers: {
//                         "content-type": "text/html",
//                     },
//                 });
//             }
//         }

//         if(redirect && redirect == 'true') {
//             return new Response(HTMLPage(`Redirect`, `<h3 class="container">Bookmark has been added. Redirecting back...</h3>`, user, req.url.replaceAll('/new','')), {
//                 status: 200,
//                 headers: {
//                     "content-type": "text/html",
//                 },
//             });
//         }
       
//         return new Response(`<p>Bookmarked</p>`, {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(BOOKMARKS_UNBOOKMARK.exec(req.url) && user) {
//         const value = await req.formData();
//         const id = value.get('id');

//         const posting = await fetch(`https://micro.blog/posts/bookmarks/${id}`, {
//             method: "DELETE",
//             headers: {
//                 "Authorization": "Bearer " + accessTokenValue
//             }
//         });
//         if (!posting.ok) {
//             console.log(`${user.username} tried to unbookmark and ${await posting.text()}`);
//         }

//         return new Response(HTMLPage(`Redirect`, `<h3 class="container">Bookmark has been removed. Redirecting back...</h3>`, user, req.url.replaceAll('/unbookmark','')), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(BOOKMARKS_UPDATE_TAGS.exec(req.url) && user) {
//         const value = await req.formData();
//         const tags = value.getAll('tags[]') ? value.getAll('tags[]') : [];
//         const newTag = value.get('newTag');
//         const id = value.get('id');

//         if(newTag) {
//             tags.push(newTag);
//         }

//         if(user.plan == 'premium') {
//             const fetching = await fetch(`https://micro.blog/posts/bookmarks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } } );
//             const bookmark = await fetching.json();

//             if(bookmark.items && bookmark.items.length > 0) {
//                 const formBody = new URLSearchParams();

//                 formBody.append("tags", tags ? tags.join('') : '');

//                 // request access_token
//                 const posting = await fetch(`https://micro.blog/posts/bookmarks/${id}`, {
//                     method: "POST",
//                     body: formBody.toString(),
//                     headers: {
//                         "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
//                         "Authorization": "Bearer " + accessTokenValue
//                     }
//                 });
//                 if (!posting.ok) {
//                     console.log(`${user.username} tried to change tags and ${await posting.text()}`);
//                 }
//             }
//         }

//         return new Response(HTMLPage(`Redirect`, `<h3 class="container">Bookmark tags have been updated. Redirecting back...</h3>`, user, req.url.replaceAll('/update','')), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(ADD_POST.exec(req.url) && user) {
//         const value = await req.formData();
//         const destination = value.get('destination');
//         const syndicates = value.getAll('syndicate[]');
//         const categories = value.getAll('category[]');
//         const content = value.get('content');
//         const status = value.get('status');
//         const name = value.get('name');

//         const formBody = new URLSearchParams();
//         formBody.append("mp-destination", destination);
//         formBody.append("h", "entry");
//         formBody.append("content", content);
       
//         if(name){
//             formBody.append("name", name);
//         }
//         if(categories.length > 0) {
//             categories.forEach((item) => formBody.append("category[]", item));
//         }
//         if(status == 'draft'){
//             formBody.append("post-status", "draft");
//         }
//         if(syndicates.length > 0) {
//             syndicates.forEach((item) => formBody.append("mp-syndicate-to[]", item));
//         } else {
//             formBody.append("mp-syndicate-to[]", "");
//         }

//         const posting = await fetch(`https://micro.blog/micropub`, { method: "POST", body: formBody.toString(), headers: { "Authorization": "Bearer " + accessTokenValue, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" } });
//         if (!posting.ok) {
//             console.log(`${user.username} tried to add a post and ${await posting.text()}`);
//             return new Response(HTMLPage(`Redirect`, `<h3 class="container">An error was encountered while posting. Redirecting back...</h3>`, user, req.url.replaceAll('/unbookmark','')), {
//                 status: 200,
//                 headers: {
//                     "content-type": "text/html",
//                 },
//             });
//         }

//         return Response.redirect(req.url.replaceAll('/post/add', `/posts?destination=${destination}`));
//     }

//     if(EDIT_POST.exec(req.url) && user) {
//         const value = await req.formData();
//         const destination = value.get('destination');
//         const categories = value.getAll('category[]');
//         const syndicates = value.getAll('syndicate[]');
//         const content = value.get('content');
//         const status = value.get('status');
//         const name = value.get('name');
//         const url = value.get('url');

//         const updatePost = {
//             action: "update",
//             url: url,
//             replace: {
//                 content: [content],
//                 name: [name],
//                 category: categories, 
//                 "post-status": status == 'draft' ? ['draft'] : ['published']
//             }
//         };

//         if(destination) {
//             updatePost["mp-destination"] = destination;
//         }

//         if(syndicates) {
//             updatePost["mp-syndicate-to[]"] = syndicates;
//         }

//         const posting = await fetch(`https://micro.blog/micropub`, { method: "POST", body: JSON.stringify(updatePost), headers: { "Authorization": "Bearer " + accessTokenValue, "Content-Type": "application/json" } });
//         if (!posting.ok) {
//             console.log(`${user.username} tried to update a post and ${await posting.text()}`);
//             return new Response(HTMLPage(`Redirect`, `<h3 class="container">An error was encountered while updating a post. Redirecting back...</h3>`, user, req.url.replaceAll('/edit','')), {
//                 status: 200,
//                 headers: {
//                     "content-type": "text/html",
//                 },
//             });
//         }

//         return Response.redirect(req.url.replaceAll('/post/edit', `/posts?destination=${destination}`));
//     }

//     if(UPLOAD_MEDIA_ROUTE.exec(req.url) && user) {
//         const value = await req.formData();
//         let redirect = false;
//         let destination = '';

//         const formData = new FormData();
//         let fileBlob;  

//         for (const pair of value.entries()) {
//             const field = pair[0], val = pair[1];
//             if (val instanceof File) {
//               fileBlob = new Blob([await val.arrayBuffer()], { 'type': val.contentType });  
//               formData.append('file', fileBlob, val.name);
//             } else {
//               if(field == 'destination') {
//                 const decoded = decodeURI(val);
//                 formData.append("mp-destination", decoded);
//                 destination = val;
//               }
//               if(field == 'redirect') {
//                 redirect = true;
//               }
//             }
//         }

//         let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } } );
//         const config = await fetching.json();
//         const mediaEndpoint = config["media-endpoint"];

//         fetching = await fetch(mediaEndpoint, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue }, body: formData } );
//         const uploaded = await fetching.json();

//         if(redirect) {
//             return Response.redirect(req.url.replaceAll('/media/upload', `/media?destination=${destination}`));
//         }
//         else
//         {
//             return new Response(uploaded.url, {
//                 status: 200,
//                 headers: {
//                     "content-type": "text/plain",
//                 },
//             });
//         }
//     }

//     if(DELETE_MEDIA_ROUTE.exec(req.url) && user) {
//         const value = await req.formData();
//         const destination = value.get('destination');
//         const url = value.get('url');

//         const formBody = new URLSearchParams();
//         formBody.append("mp-destination", destination);
//         formBody.append('action', 'delete');
//         formBody.append('url', url);

//         const fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } } );
//         const config = await fetching.json();
//         const mediaEndpoint = config["media-endpoint"];

//         const posting = await fetch(mediaEndpoint, { method: "POST", body: formBody.toString(), headers: { "Authorization": "Bearer " + accessTokenValue, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" } });
//         if (!posting.ok) {
//             console.log(`${user.username} tried to delete a media item and ${await posting.text()}`);
//         }

//         return Response.redirect(req.url.replaceAll('/media/delete', `/media?destination=${destination}`));
//     }

//     if(PIN_TIMELINE_POST.exec(req.url) && user) {
//         const value = await req.formData();
//         const id = value.get('id');
//         const kv = await Deno.openKv();

//         if(id)
//         {
//             const index = user.lillihub.favorites.indexOf(id);
//             if (index > -1) {            
//                 user.lillihub.favorites = user.lillihub.favorites.filter(function(el) { return el != id; });
//             } else {
//                 user.lillihub.favorites.push(id);
//             }
//         }

//         await kv.set([user.username, 'global'], user.lillihub);
//         SESSION[user.username] = user;

//         return Response.redirect(req.url.replaceAll('/timeline/favorite/toggle', `/timeline/${id}`));
//     }

//     if(FAVORTIE_USER_TOGGLE.exec(req.url) && user) {
//         const value = await req.formData();
//         const username = value.get('id');
//         const following = value.get('following');
//         const kv = await Deno.openKv();

//         if(username)
//         {
//             const index = user.lillihub.favorites.indexOf(username);
//             if (index > -1) {            
//                 user.lillihub.favorites = user.lillihub.favorites.filter(function(el) { return el != username; });
//             } else {
//                 user.lillihub.favorites.push(username);
//             }
//         }

//         await kv.set([user.username, 'global'], user.lillihub);
//         SESSION[user.username] = user;

//         if(!following) {
//             return Response.redirect(req.url.replaceAll('/users/favorite/toggle', `/user/${username}`));
//         }
//         return Response.redirect(req.url.replaceAll('/users/favorite/toggle', `/users/following`));
//     }

//     if(FAVORTIE_FEED_TOGGLE.exec(req.url) && user) {
//         const value = await req.formData();
//         const feed = value.get('id');
//         const kv = await Deno.openKv();

//         if(feed)
//         {
//             const index = user.lillihub.feeds.indexOf(feed);
//             if (index > -1) {            
//                 user.lillihub.feeds = user.lillihub.feeds.filter(function(el) { return el != feed; });
//             } else {
//                 user.lillihub.feeds.push(feed);
//             }
//         }

//         await kv.set([user.username, 'global'], user.lillihub);
//         SESSION[user.username] = user;

//         return Response.redirect(req.url.replaceAll('/feed/favorite/toggle', `/discover/${feed}`));
//     }

//     if(SETTINGS_DARKTHEME.exec(req.url) && user) {
//         const value = await req.formData();
//         const enableDarkMode = value.get('enableDarkMode');
//         const kv = await Deno.openKv();

//         if(enableDarkMode)
//         {
//             user.lillihub.darktheme = true;
            
//         } else {
//             user.lillihub.darktheme = false;
//         }

//         await kv.set([user.username, 'global'], user.lillihub);
//         SESSION[user.username] = user;
        
//         return Response.redirect(req.url.replaceAll('/settings/darktheme', `/settings`));
//     }

//     if(SETTINGS_CONTENTFILTERS.exec(req.url) && user) {
//         const value = await req.formData();
//         const exclude = value.get('exclude');
//         const kv = await Deno.openKv();

//         if(exclude)
//         {
//             user.lillihub.exclude = exclude;
            
//         } else {
//             user.lillihub.exclude = '';
//         }

//         await kv.set([user.username, 'global'], user.lillihub);
//         SESSION[user.username] = user;
        
//         return Response.redirect(req.url.replaceAll('/settings/contentfilters', `/settings`));
//     }

//     if(SETTINGS_TIMELINE.exec(req.url) && user) {
//         const value = await req.formData();
//         user.lillihub.display = value.get('display');
//         const kv = await Deno.openKv();
//         await kv.set([user.username, 'global'], user.lillihub);
        
//         SESSION[user.username] = user;

//         return Response.redirect(req.url.replaceAll('/settings/timeline', `/settings`));
//     }

//     if(ADD_NOTE.exec(req.url) && user) {
//         const value = await req.formData();
//         const text = value.get('text');
//         const notebook_id = value.get('notebook_id');
//         const id = value.get('id');

//         const form = new URLSearchParams();
//         form.append("text", text);
//         form.append("notebook_id", notebook_id);

//         if(id) {
//             form.append("id", id);
//         }
                       
//         const posting = await fetch('https://micro.blog/notes', {
//             method: "POST",
//             body: form.toString(),
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
//                 "Authorization": "Bearer " + accessTokenValue
//             }
//         });

//         if (!posting.ok) {
//             console.log('ADD_NOTE', await posting.text());
//             return ReturnIframeResponse('Unsuccessful.');
//         }

//         return ReturnIframeResponse(`Note saved.`);
//     }

//     if(DELETE_NOTE.exec(req.url) && user) {
//         const value = await req.formData();
//         const id = value.get('id');
//         const notebookId = value.get('notebookId');

//         const posting = await fetch(`https://micro.blog/notes/${id}`, {
//             method: "DELETE",
//             headers: {
//                 "Authorization": "Bearer " + accessTokenValue
//             }
//         });

//         return Response.redirect(req.url.replaceAll('/note/delete', `/notes/${notebookId}`));
//     }

//     if(ADD_NOTEBOOK.exec(req.url) && user) {
//         const value = await req.formData();
//         const name = value.get('name');

//         const form = new URLSearchParams();
//         form.append("name", name);

//         const posting = await fetch('https://micro.blog/notes/notebooks', {
//             method: "POST",
//             body: form.toString(),
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
//                 "Authorization": "Bearer " + accessTokenValue
//             }
//         });

//         return Response.redirect(req.url.replaceAll('/notebook/add', '/notes'));
//     }

 








//     /********************************************************
//      * Unauthenticated Routes
//      * NOTE: All routes must create and set a state cookie
//      ********************************************************/
//     // Defalut page for unauthenticated user
//     if(DISCOVER_ROUTE.exec(req.url) || (HOME_ROUTE.exec(req.url) && !user)) {
//         const uuid = crypto.randomUUID();
//         return new Response(await DiscoverTemplate(user, accessTokenValue, uuid, req.url), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//                 "set-cookie": `state=${uuid};HttpOnly;`
//             },
//         });
//     }
   
//     if(DISCOVERTAG_ROUTE.exec(req.url) && user) {
//         const id = DISCOVERTAG_ROUTE.exec(req.url).pathname.groups.id;

//         return new Response(await TagmojiTemplate(user, accessTokenValue, id), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(USER_ROUTE.exec(req.url) && user) {
//         const id = USER_ROUTE.exec(req.url).pathname.groups.id;
        
//         return new Response(await UserTemplate(user, accessTokenValue, id), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(USERPHOTOS_ROUTE.exec(req.url) && user) {
//         const id = USERPHOTOS_ROUTE.exec(req.url).pathname.groups.id;

//         return new Response(await UserTemplate(user, accessTokenValue, id, true), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     //For more info about indieAuth see: https://indieauth.spec.indieweb.org/
//     if(AUTH_ROUTE.exec(req.url)) {
       
//         // get state from cookie
//         const stateCookie = getCookieValue(req, 'state');

//         // get code + state from M.b.
//         const searchParams = new URLSearchParams(req.url.split('?')[1]);
//         const code = searchParams.get('code');
//         const state = searchParams.get('state');

//         if(code && stateCookie == state) {
//             const formBody = new URLSearchParams();
//                 formBody.append("code", code);
//                 formBody.append("client_id", req.url.split('?')[0].replaceAll('/auth',''));
//                 formBody.append("grant_type", "authorization_code");

//             // request access_token
//             const fetching = await fetch('https://micro.blog/indieauth/token', {
//                 method: "POST",
//                 body: formBody.toString(),
//                 headers: {
//                     "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
//                     "Accept": "application/json"
//                 }
//             });
//             const response = await fetching.json();

//             if(!response.error) {
//                 const accessToken = await encryptMe(response.access_token);
//                 const mbUser = await getMicroBlogLoggedInUser(response.access_token);
//                 const user = {};
//                 user.username = mbUser.username;
//                 user.name = mbUser.name;
//                 user.avatar = mbUser.avatar;
//                 user.plan = mbUser.plan;

//                 const kv = await Deno.openKv();
               
//                 const userKV = await kv.get([user.username, 'global']);
//                 if(userKV && !userKV.value) {
//                     const starterFavs = { favorites: ['manton', 'jean', 'news', 'help'], feeds: [], display: 'both' };
//                     await kv.set([user.username, 'global'], starterFavs);
//                     user.lillihub = starterFavs;
//                 } else {   
//                     user.lillihub = userKV.value;
//                 }

//                 SESSION[user.username] = user;
//                 let expiresOn = new Date();
//                 expiresOn.setDate( expiresOn.getDate() + 399); //chrome limits to 400 days
//                 const page =  new Response(HTMLPage(`Redirect`, `<h3 class="container">You have been logged in. Redirecting to your timeline</h3>`, user, req.url.split('?')[0].replaceAll('/auth','')), {
//                     status: 200,
//                     headers: {
//                         "content-type": "text/html",
//                         "set-cookie": `atoken=${accessToken};SameSite=Strict;Secure;HttpOnly;Expires=${expiresOn.toUTCString()}`
//                     },
//                 });
//                 return page;
//             }
//         }

//         // change this to an error response
//         return new Response(HTMLPage(`auth`, `<h1>Authentication Error</h1>`), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//             },
//         });
//     }

//     if(LOGOUT_ROUTE.exec(req.url)) {
//         return new Response(HTMLPage(`Logout`, `<h1>You have been logged out.</h1>`), {
//             status: 200,
//             headers: {
//                 "content-type": "text/html",
//                 "set-cookie": `atoken=undefined;SameSite=Strict;Secure;HttpOnly;Expires=Thu, 01 Jan 1970 00:00:00 GMT`
//             },
//         });
//     }
   
//     /********************************************************
//      * Not Found Route
//      ********************************************************/
//     return new Response('', {
//         status: 404,
//     });
// }

// serve(handler);
