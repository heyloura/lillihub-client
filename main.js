import * as mb from "./scripts/server/mb.js";
import * as utility from "./scripts/server/utilities.js";

/******************************************************************************************************************
* README
*
* Creating an APP_SECRET environmental variable. Save the rawKey.
*      const key = await crypto.subtle.generateKey({ name: "AES-CBC", length: 128 },true,["encrypt", "decrypt"]);
*      const rawKey = JSON.stringify(await crypto.subtle.exportKey("jwk", key));
******************************************************************************************************************/
const _appSecret = JSON.parse(Deno.env.get("APP_SECRET") ?? "{}");
const _lillihubToken = Deno.env.get("APP_LILLIHUB_MTOKEN") ?? "";
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
    // - JS libraries, CSS and font resources
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

    if(new URLPattern({ pathname: "/sw.js" }).exec(req.url))
    {
        return new Response(await Deno.readFile("scripts/client/sw.js"), {
            status: 200,
            headers: {
                "content-type": "text/javascript",
            },
        });
    }

    const CHECK_SCRIPT_ROUTE = new URLPattern({ pathname: "/scripts/:id" });
    if(CHECK_SCRIPT_ROUTE.exec(req.url))
    {
        const id = CHECK_SCRIPT_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(await Deno.readFile("scripts/client/" + id), {
            status: 200,
            headers: {
                "content-type": "text/javascript",
            },
        });
    }

    const CHECK_CSS_ROUTE = new URLPattern({ pathname: "/styles/:id" });
    if(CHECK_CSS_ROUTE.exec(req.url))
    {
        const id = CHECK_CSS_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(await Deno.readFile("styles/" + id), {
            status: 200,
            headers: {
                "content-type": "text/css",
            },
        });
    }

    const nonce = crypto.randomUUID(); // this is to protect us from scripts and css
    //********************************************************
    // Now let's see if we have a user or if someone needs to 
    // login
    //********************************************************
    const mbTokenCookie = getCookieValue(req, 'atoken');
    const mbToken = mbTokenCookie ? await decryptMe(getCookieValue(req, 'atoken')) : undefined;

    let user = false;
    const following = [];
    if(mbToken) {
        const mbUser = await mb.getMicroBlogUser(mbToken);

        // grab only the info we need
        if(mbUser) {

            if(_development) {
                //console.log(mbUser);
            }

            user = {};
            user.username = mbUser.username;
            user.name = mbUser.name;
            user.avatar = mbUser.avatar;
            user.plan = mbUser.plan;
            user.ai = mbUser.is_using_ai && mbUser.is_premium;

            //const kv = await Deno.openKv();

            if(new URLPattern({ pathname: "/offline" }).exec(req.url)) {
                return new Response(layout.replaceAll('{{nonce}}', nonce),
                  HTMLHeaders(nonce));
            }

            // -----------------------------------------------------
            // POSTING endpoints
            // -----------------------------------------------------

            //------------------
            // Reply to timeline
            //------------------
            if(new URLPattern({ pathname: "/timeline/reply" }).exec(req.url)) {
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
            
            //-------------
            // Post to blog
            //-------------
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
                const url = value.get('url');

                if(url) {
                    // this is editing a blog post on M.b.
                    const updatePost = {
                        action: "update",
                        url: url,
                        replace: {
                            content: [content],
                            name: [name],
                            category: categories, 
                            "post-status": status == 'draft' ? ['draft'] : ['published']
                        }
                    };
            
                    if(destination) {
                        updatePost["mp-destination"] = destination;
                    }
            
                    if(syndicates) {
                        updatePost["mp-syndicate-to[]"] = syndicates;
                    }
            
                    const posting = await fetch(`https://micro.blog/micropub`, { method: "POST", body: JSON.stringify(updatePost), headers: { "Authorization": "Bearer " + accessTokenValue, "Content-Type": "application/json" } });
                    if (!posting.ok) {
                        console.log(`${user.username} tried to add a post and ${await posting.text()}`);
                    }

                    return new Response(JSON.stringify({"response":{"message":"Post was edited."}}), JSONHeaders());
                }

                if(replyingTo) {
                    const replies = replyingTo.map(function (reply) { return '@' + reply }).join(', ');
                    content = replies + ' ' + content;
                }

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

                }        
            }

            //-------------
            // Upload media
            //-------------
            if((new URLPattern({ pathname: "/media/upload" })).exec(req.url)) {
                const value = await req.formData();
                let destination = '';
        
                const formData = new FormData();
                let fileBlob;  
        
                for (const pair of value.entries()) {
                    const field = pair[0], val = pair[1];
                    if (val instanceof File) {
                      fileBlob = new Blob([await val.arrayBuffer()], { 'type': val.contentType });  
                      formData.append('file', fileBlob, val.name);
                    } else {
                      if(field == 'destination') {
                        console.log('destination')
                        console.log(val)
                        const decoded = decodeURI(val);
                        formData.append("mp-destination", decoded);
                        destination = val;
                      }
                      if(field == 'redirect') {
                        redirect = true;
                      }
                    }
                }
        
                let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const config = await fetching.json();
                const mediaEndpoint = config["media-endpoint"];
        
                fetching = await fetch(mediaEndpoint, { method: "POST", headers: { "Authorization": "Bearer " + mbToken }, body: formData } );
                const uploaded = await fetching.json();
                const result = {};
                result.url = uploaded.url,
                result.ai = user.ai;

                return new Response(JSON.stringify(result), JSONHeaders());
            }

            //-------------
            // Delete media
            //-------------
            if((new URLPattern({ pathname: "/media/delete" })).exec(req.url)) {
                const value = await req.formData();
                const destination = value.get('destination');
                const url = value.get('url');
        
                const formBody = new URLSearchParams();
                formBody.append("mp-destination", destination);
                formBody.append('action', 'delete');
                formBody.append('url', url);
        
                const fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const config = await fetching.json();
                const mediaEndpoint = config["media-endpoint"];
        
                const posting = await fetch(mediaEndpoint, { method: "POST", body: formBody.toString(), headers: { "Authorization": "Bearer " + mbToken, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" } });
                if (!posting.ok) {
                    console.log(`${user.username} tried to delete a media item and ${await posting.text()}`);
                }
        
                return new Response(JSON.stringify({status: 'upload deleted'}), JSONHeaders());
            }

            //----------
            // save Note
            //----------
            const NOTEBOOKS_UPDATE_ROUTE = new URLPattern({ pathname: "/notebooks/note/update" });
            if(NOTEBOOKS_UPDATE_ROUTE.exec(req.url) && user) {
                const value = await req.formData();
                const text = value.get('text');
                const notebook_id = value.get('notebook_id');
                const id = value.get('id');
        
                const form = new URLSearchParams();
                form.append("text", text);
                form.append("notebook_id", notebook_id);
        
                if(id) {
                    form.append("id", id);
                }
                               
                const posting = await fetch('https://micro.blog/notes', {
                    method: "POST",
                    body: form.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                        "Authorization": "Bearer " + mbToken
                    }
                });

                if (!posting.ok) {
                    console.log(`${user.username} tried to update a note and ${await posting.text()}`);
                }
        
                return new Response('note updated', {
                    status: 200,
                    headers: {
                        "content-type": "text/html",
                    },
                });
            }

            //--------------
            // Delete a Note
            //--------------
            const NOTEBOOKS_DELETE_ROUTE = new URLPattern({ pathname: "/notebooks/note/delete" });
            if(NOTEBOOKS_DELETE_ROUTE.exec(req.url) && user) {
                const value = await req.formData();
                const id = value.get('id');
        
                const form = new URLSearchParams();
                form.append("id", id);
                               
                const posting = await fetch(`https://micro.blog/notes/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + mbToken
                    }
                });

                if (!posting.ok) {
                    console.log(`${user.username} tried to delete a note and ${await posting.text()}`);
                }
        
                return new Response('note deleted', {
                    status: 200,
                    headers: {
                        "content-type": "text/html",
                    },
                });
            }

            //--------------------------
            // Follow or Unfollow a user
            //--------------------------
            if((new URLPattern({ pathname: "/users/follow" })).exec(req.url) && user) {
                const value = await req.formData();
                const username = value.get('username');
                let unfollow = value.get('unfollow');
                unfollow = unfollow == 'true';
        
                const posting = await fetch(`https://micro.blog/users/${unfollow ? 'unfollow' : 'follow'}?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + mbToken } });
                const result = `User was ${unfollow ? 'unfollowed' : 'followed'}.`;
                if (!posting.ok) {
                    let error = await posting.text();
                    console.log(`${user.username} tried to un/follow ${username} and ${error}`);
                    result = error;
                }
        
                return new Response(result, {
                    status: 200,
                    headers: {
                        "content-type": "text/html",
                    },
                });    
            }

            //--------------------------
            // Bookmark something
            //--------------------------
            if(new URLPattern({ pathname: "/bookmarks/new" }).exec(req.url)) {
                const value = await req.formData();
                const url = value.get('url');
        
                const formBody = new URLSearchParams();
                formBody.append("h", "entry");
                formBody.append("bookmark-of", url);
        
                const posting = await fetch(`https://micro.blog/micropub`, {
                    method: "POST",
                    body: formBody.toString(),
                    headers: {"Content-Type": "application/x-www-form-urlencoded; charset=utf-8","Authorization": "Bearer " + mbToken}
                });
                let message = 'bookmark added';
                if (!posting.ok) {
                    message = await posting.text();
                    console.log(`${user.username} tried to add a bookmark ${url} and ${message}`);
                }
                return new Response(message, {
                    status: 200,
                    headers: {
                        "content-type": "text/html",
                    },
                });
            }
   
            // -----------------------------------------------------
            // API endpoints
            // -----------------------------------------------------
            if((new URLPattern({ pathname: "/api/media/latest" })).exec(req.url)) {
                let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const config = await fetching.json();
                const mediaEndpoint = config["media-endpoint"];
                
                fetching = await fetch(`${mediaEndpoint}?q=source`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const media = await fetching.json();
                return new Response(JSON.stringify(media.items[0]), JSONHeaders());
            }

            const CHECK_ROUTE = new URLPattern({ pathname: "/api/timeline/check/:id" });
            if(CHECK_ROUTE.exec(req.url)) {
                const id = CHECK_ROUTE.exec(req.url).pathname.groups.id;
                const fetching = await fetch(`https://micro.blog/posts/check?since_id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const results = await fetching.json(); 
                return new Response(JSON.stringify(results),JSONHeaders());
            }

            const MARK_TIMELINE_ROUTE = new URLPattern({ pathname: "/api/timeline/mark/:id" });
            if(MARK_TIMELINE_ROUTE.exec(req.url)) {
                const id = MARK_TIMELINE_ROUTE.exec(req.url).pathname.groups.id;
                const _posting = await fetch(`https://micro.blog/posts/markers?id=${id}&channel=timeline&date_marked=${new Date()}`, { method: "POST", headers: { "Authorization": "Bearer " + mbToken } });
                return new Response('Timeline marked', {
                    status: 200,
                    headers: {
                        "content-type": "text/html",
                    },
                });
            }

            const GET_PARENT_ROUTE = new URLPattern({ pathname: "/api/timeline/parent/:id" });
            if(GET_PARENT_ROUTE.exec(req.url)) {
                const id = GET_PARENT_ROUTE.exec(req.url).pathname.groups.id;
                const fetching = await fetch(`https://micro.blog/posts/conversation?id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const post = await fetching.json();
                return new Response(post.items.slice(0).reverse().map(n => utility.postHTML(n, null, true, id)).join(''), HTMLHeaders());
            }

            // -----------------------------------------------------
            // All other pages
            // -----------------------------------------------------
            const pages = ["pages", "notebooks", "timeline", "users", "discover", "mentions", "following", "bookmarks", "settings", "replies", "blog", "draft", "uploads", "collections", "webmentions"]
            if (pages.some(v => req.url.includes(v)) && !req.url.includes('%3Ca%20href=')) {
                let disableCSP = false;
                const layout = new TextDecoder().decode(await Deno.readFile("layout_2.html"));
                const parts = req.url.split('/');
                let name = parts[parts.length - 1].split('?')[0];
                let id = null;
                let content = '';
                const searchParams = new URLSearchParams(req.url.split('?')[1]);
                const destination = searchParams.get('destination');

                // following
                let fetching = await fetch(`https://micro.blog/users/following/${mbUser.username}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                let following = await fetching.json();

                // check for notebooks route
                if(req.url.includes("details")) {
                    //------------------
                    //  Bookmarks Reader
                    //------------------
                    id = name;
                    name = "details";

                    const searchParams = new URLSearchParams(req.url.split('?')[1]);
                    const hids = searchParams.get('hids');
                    const bid = searchParams.get('bid');
                    const rid = searchParams.get('rid');

                    let reader = '';
                    if(rid) {
                        let fetching = await fetch(`https://micro.blog/hybrid/bookmarks/${rid}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                        const results = await fetching.text(); 
                
                        const page = results;                            
                        const baseURL = page.split('<base href="')[1].split('"')[0];
                        const root = baseURL.split('/');
                        root.pop();
                        const htmlBody = page.split('<body>')[1].split('</body>')[0];
                        reader = htmlBody.split('<div id="content">')[1].split('<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.3/jquery.min.js"></script>')[0];
                        reader = reader.replaceAll('src="',`src="${root.join('/')}/`);
                    }
            
                    if(hids) {
                        let ids = [...new Set(hids.split(','))];
                        let allHighlights = await mb.getAllFromMicroBlog(mbToken,'https://micro.blog/posts/bookmarks/highlights');
                        let matchingHighlights = allHighlights.filter((h) => {return ids.includes(h.id.toString());});
                        for(var i = 0; i < matchingHighlights.length; i++) {
                            var highlight = matchingHighlights[i];
                            reader = reader.replaceAll(highlight.content_text,`<mark>${highlight.content_text}</mark>`);
                        }
                    }
                    const bookmark = (await mb.getAllFromMicroBlog(mbToken, `https://micro.blog/posts/bookmarks`)).filter(b => b.id == bid)[0];

                    fetching = await fetch(`https://micro.blog/posts/bookmarks/tags`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const tags = (await fetching.json())

                    content = `<div id="reader" class="mt-2">${utility.bookmarkReaderHTML(reader, bookmark, tags)}</div>`;
                } else if(req.url.includes("bookmarks")) {
                    //-----------
                    //  Bookmarks
                    //-----------
                    const searchParams = new URLSearchParams(req.url.split('?')[1]);
                    const tag = searchParams.get('tag');
                    id = name;
                    name = tag ? "bookmarks: " + tag : "bookmarks";

                    fetching = await fetch(`https://micro.blog/posts/bookmarks${tag ? `?tag=${tag}` : ''}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const items = (await fetching.json()).items;
                    const allHighlights = await mb.getAllFromMicroBlog(mbToken,'https://micro.blog/posts/bookmarks/highlights');
                    fetching = await fetch(`https://micro.blog/posts/bookmarks/tags`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const tags = (await fetching.json())
    
                    for(let i=0; i< items.length; i++) {
                        const item = items[i];
                        const highlights = allHighlights.filter(h => h.url === item.url);
                        
                        item.title = item.content_html.split('</p>')[0].replace('<p>','');
                        item.reader = item._microblog.links && item._microblog.links.length > 0 ? item._microblog.links[0].id : null;
                        item.highlights = highlights && highlights.length > 0 ? highlights.map(h => h.id) : [];
                    }
                    content = `<div id="bookmarks" class="mt-2">${utility.bookmarksHTML(items, tags, mbUser.is_premium)}</div>`;
                } else if(req.url.includes("settings")) {
                    //----------
                    //  Settings
                    //----------
                    name = "settings";
                    content = `<div id="settings" class="mt-2">${utility.settingsHTML()}</div>`;
                } else if(req.url.includes("discover")) {
                    //----------
                    //  Discover
                    //----------
                    id = name;
                    name = "discover";
                    fetching = await fetch(`https://micro.blog/posts/discover`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    let tagmoji = await fetching.json();
                    // put JSON check here or something.....
                    if(id != 'discover') {
                        fetching = await fetch(`https://micro.blog/posts/discover${id != "original" ? `/${id}` : ''}`, { method: "GET", headers: { "Authorization": "Bearer " + _lillihubToken } } );
                        const posts = await fetching.json();
                        content = `${utility.timelineHeader('discover')}<div id="discover" class="mt-2">${utility.discoverHTML(posts, tagmoji._microblog.tagmoji)}</div>`;
                    } else {
                        fetching = await fetch(`https://micro.blog/posts/timeline?count=40`, { method: "GET", headers: { "Authorization": "Bearer " + _lillihubToken } } );
                        const posts = await fetching.json();
                        content = `${utility.timelineHeader('discover')}
                        <p class="text-center m-2 p-2"><a rel="prefetch" swap-target="#main" swap-history="true" href="/discover/original">View the original discover feed</a></p>
                        <div id="discover" class="mt-2">${utility.discoverHTML(posts, tagmoji._microblog.tagmoji)}</div>`;
                    }
                } else if(req.url.includes("users")) {
                    //-------
                    //  Users
                    //-------
                    id = name;
                    name = "users";
                    fetching = await fetch(`https://micro.blog/posts/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const posts = await fetching.json();
                    const friend = following.filter(f => f.username == id)[0] ?? null;

                    // put JSON check here or something.....
                    content = `${utility.timelineHeader('timeline')}
                    
                    <div class="bg-dark p-2 m-2">
                        <figure class="avatar avatar-lg p-centered">
                            <img src="${posts.author.avatar}" loading="lazy">
                        </figure>
                        <h3 class="title mt-2 text-center">${posts.author.name}</h3>
                        <p class="text-center"><a target="_blank" href="${posts.author.url}">${posts.author.url}</a></p>
                        <p class="text-center">${posts._microblog.bio}</p>
                        ${!friend ? `<p class="text-center"><button data-username="${posts._microblog.username}" class="btn btn-primary followUser">Follow</button></p>
                                    <div id="toast-${posts._microblog.username}-follow" class="toast hide">
                                        <button data-id="${posts._microblog.username}-follow" class="btn btn-clear float-right clearToast"></button>
                                        <div id="toast-username-${posts._microblog.username}-follow">Waiting for server....</div>
                                    </div>` : ''}
                    </div>
                    <div id="user-posts" class="mt-2">${utility.timelineHTML(posts.items.map(n => utility.postHTML(n)).join(''))}</div>
                    ${!friend ? '' : `<details class="p-2 m-2">
                        <summary class="c-hand">Actions</summary>
                        <div class="mt-2"><p><button data-username="${posts._microblog.username}" class="btn btn-danger unfollow">Unfollow</button></p>
                        <p>Or <a href="https://micro.blog/${posts._microblog.username}">Mute, block or report user on Micro.blog</a></p>
                        <div id="toast-${posts._microblog.username}-unfollow" class="toast hide">
                                    <button data-id="${posts._microblog.username}-unfollow" class="btn btn-clear float-right clearToast"></button>
                                    <div id="toast-username-${posts._microblog.username}-unfollow">Waiting for server....</div>
                                </div>
                        </div>
                    </details>`}`;

                } else if(req.url.includes("versions")) {
                    //--------------
                    //  Note Version
                    //--------------
                    id = name;
                    name = "version";
                    fetching = await fetch(`https://micro.blog/notes/${parts[parts.length - 3]}/versions`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const versions = await fetching.json();
                    const version = versions.items.filter(v => v.id == id)[0];
                    // put JSON check here or something.....
                    content = `<p class="text-center">Version ${version.id}</p>
                        <div id="version" class="mt-2">${await utility.noteHTML(version,parts[parts.length - 5],versions.items)}</div>
                        <details class="accordion">
                            <summary class="accordion-header">
                                <i class="icon icon-arrow-right mr-1"></i>
                                Advanced
                            </summary>
                            <div class="accordion-body">
                                <p class="text-center"><button class="overrideNote btn btn-error btn-sm" data-id="${parts[parts.length - 3]}" data-content="${version.content_text}">Revert to this version</button></p>                          
                            </div>
                        </details>
                    `;
                } else if(req.url.includes("notes")) {
                    //-------
                    //  Notes
                    //-------
                    id = name;
                    name = "note";
                    fetching = await fetch(`https://micro.blog/notes/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const note = await fetching.json();
                    fetching = await fetch(`https://micro.blog/notes/${id}/versions`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const versions = await fetching.json();
                    // put JSON check here or something.....
                    content = `<div id="note" class="mt-2">${await utility.noteHTML(note,parts[parts.length - 3],versions.items)}</div>`;
                } else if(req.url.includes("notebooks")) {
                    //-----------
                    //  Notebooks
                    //-----------
                    id = name;  
                    if(id != 'notebooks') {
                        fetching = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                        const notes = await fetching.json();
                        // put JSON check here or something.....
                        content = `<div id="note-list" class="mt-2">${utility.getNotebookHTML(notes.items,id)}</div>`;
                    } else {
                        fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                        const notebooks = await fetching.json();
                        content = notebooks.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map(element =>
                            `<li class="menu-item"><a rel="prefetch" class="notebook-${element.id}" href="/notebooks/${element.id}" swap-target="#main" swap-history="true">${element.title}</a></li>`).join('');
                        content = `<div id="notebook-list" class="menu">${content}</div>`;
                    }
                    name = "notebook";

                } else if(req.url.includes("posts")) {
                    //-------
                    //  Posts
                    //-------
                    id = name;
                    name = "timeline";
                    fetching = await fetch(`https://micro.blog/posts/conversation?id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const post = await fetching.json();
                    const original = post.items.filter(i => i.id == id)[0];
                    // put JSON check here or something.....
                    content = `${utility.timelineHeader('timeline')}<div id="conversationContent"
                        data-name="${original &&  original.author && original.author._microblog && original.author._microblog.username ? original.author._microblog.username : ''}"
                        data-id="${id}"
                        data-avatar="${original &&  original.author && original.author.avatar ? original.author.avatar : ''}"
                        >${post.items.slice(0).reverse().map(n => utility.postHTML(n, null, true, id)).join('')}</div>`;
                } else if(req.url.includes("timeline")) {
                    //----------
                    //  Timeline
                    //----------
                    id = name;
                    name = "timeline";
                    //fetching = await fetch(`https://micro.blog/posts/timeline?count=40${id != "timeline" ? `&before_id=${id}` : ''}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    //const posts = await fetching.json();
                    const posts = await mb.getMicroBlogTimelinePostsChronological(mbToken, id);
                    // content = `${utility.timelineHeader('timeline')}
                    //     <div id="post-list">${utility.timelineHTML(posts.map(n => utility.postHTML(n)).join(''),posts[posts.length -1].id)}</div>`;
                    content = posts.map(p => `
                        <article data-id="${p.id}">
                            <header>
                                <img src="${p.avatar}" loading="lazy">
                            </header>
                            <section>
                                <ul role="menubar">
                                    <li role="menuitem" tabindex="0">Reply</li>
                                    <li role="menuitem" tabindex="0">Bookmark</li>
                                    <li role="menuitem" tabindex="0">Embed</li>
                                    ${p.conversation ? `<li role="menuitem" tabindex="0"><button class="evt-dialog-open" type="button">Conversation</button></li>` : ''}
                                </ul>
                                <span><a href="#">${p.name}</a>${p.mention ? ' ➤ ' : ''}</span>
                                ${p.content}
                                <footer>
                                    <a rel="prefetch" href="/timeline/users/${p.username}" class="text-gray">@${p.username}</a> · <a target="_blank" href="${p.url}" class="text-gray">${p.relative}</a>
                                </footer>
                            </section> 
                        </article>   
                        `).join('');
                } else if(req.url.includes("mentions")) {
                    //----------
                    //  Mentions
                    //----------
                    id = name;
                    name = "mentions";
                    fetching = await fetch(`https://micro.blog/posts/mentions${id != "mentions" ? `?before_id=${id}` : ''}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );

                    const posts = await fetching.json();
                    content = `${utility.timelineHeader('mentions')}
                        <div id="mentions" class="mt-2">
                            <div>
                                ${posts.items.map(n => utility.postHTML(n)).join('')}
                                <p class="text-center m-2 p-2"><a rel="prefetch" swap-target="#main" swap-history="true" href="/mentions/${posts.items[posts.items.length -1].id}">Load More</a></p>
                            </div>
                        </div>`;
                } else if(req.url.includes("replies")) {
                    //----------
                    //  Replies
                    //----------
                    // Using ?before_id= does not work on the replies endpoint
                    id = name;
                    name = "replies";
                    fetching = await fetch(`https://micro.blog/posts/replies`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const posts = await fetching.json();
                    content = `${utility.timelineHeader('replies')}
                        <div id="replies" class="mt-2">
                            <div>
                                ${posts.items.map(n => utility.postHTML(n)).join('')}
                                <p class="text-center m-2 p-2 underlined"><a rel="prefetch" target="_blank" href="https://micro.blog/account/replies">View earlier/manage replies on Micro.blog</a></p>
                            </div>
                        </div>`;
                } else if(req.url.includes("following")) {
                    //----------
                    //  Following
                    //----------
                    id = name;
                    name = "following";
                    fetching = await fetch(`https://micro.blog/users/following/${user.username}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const results = await fetching.json();
            
                    const users = results.sort((a,b) => (a.username > b.username) ? 1 : ((b.username > a.username) ? -1 : 0)).map((item) =>
                        `<tr>
                            <td><figure class="avatar avatar-lg" data-initial="${item.username.substring(0,1)}">
                                    <img src="${item.avatar}" loading="lazy">
                                </figure>
                            </td>
                            <td>
                                <div class="card-title">${item.name}</div>
                                <div class="card-subtitle"><a href="/user/${item.username}" class="text-gray">@${item.username}</a></div>  
                            </td>
                            <td>${item.username.split('@').length == 1 ? '<span class="chip">Micro.blog</span>' : '<span class="chip">Other</span>'}</td>
                        </tr>
                        `
                    ).join('');

                    content = `${utility.timelineHeader('following')}
                    <div id="following" class="mt-2">
                        <div class="form-group">
                            <label class="form-label">Search your followings</label>
                            <input data-element="tr" id="search" type="text" class="form-input search" placeholder="...">
                        </div>
                        <table class="table table-striped">${users}</table>
                    </div>`;
                } else if(req.url.includes("edit")) {
                    //----------
                    //  Following
                    //----------
                    id = name;
                    name = "blog";

                    fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const config = await fetching.json();
                
                    const defaultDestination = config.destination.filter(d => d["microblog-default"])[0] ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;
                    const mpDestination = destination ? destination : defaultDestination;

                    fetching = await fetch(`https://micro.blog/micropub?q=source&properties=content&url=${id}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const post = await fetching.json();

                    content = `${utility.blogHeader('blog')}
                        <div id="editPost" class="mt-2">
                            ${await utility.editHTML(post, following, mbUser.username, mbToken, mpDestination)}
                        </div>`;
                } else if(req.url.includes("uploads")) {
                    //-------
                    //  Blog
                    //-------
                    id = name;
                    name = "uploads";
                    disableCSP = true;

                    const searchParams = new URLSearchParams(req.url.split('?')[1]);
                    const type = searchParams.get('type');
                    const collection = searchParams.get('collection');
                    const q = searchParams.get('q');
                    const offset = searchParams.get('offset');

                    fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const config = await fetching.json();
                
                    const defaultDestination = config.destination.filter(d => d["microblog-default"])[0] ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;
                    const mpDestination = destination ? destination : defaultDestination;

                    fetching = await fetch(`${config["media-endpoint"]}?q=source${offset ? `&offset=${offset}` : ''}&limit=50000&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const results = await fetching.json();

                    let nextPage = false;
                    let items = results.items
                        .filter(p => type ? p.url.includes('.' + type) : true)
                        .filter(p => q ? p.alt ? p.alt.includes(q) : false : true);

                    if(collection) {
                        fetching = await fetch(`${config["media-endpoint"]}?q=source&microblog-collection=https://example.org/collections/${collection}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                        const collectionUploads = await fetching.json();
                        items = collectionUploads.items;
                    }

                    if(items.length > 25) {
                        nextPage = true;
                    }

                    const fileExtensions = results.items.map(obj => {
                        const url = obj.url;
                        const extension = url.split('.').pop();
                        return extension.trim();
                    });
                    const uniqueExtensions = new Set(fileExtensions);

                    fetching = await fetch(`https://micro.blog/micropub?q=source&mp-destination=${encodeURIComponent(mpDestination)}&mp-channel=collections`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const collections = await fetching.json();

                    content = `${utility.blogHeader('uploads')}
                        <div id="uploads" class="mt-2">
                            ${q || collection || type ? `
                                <p class="text-center">Filtering on 
                                    ${q ? ` term: ${q}` : 
                                        collection ? ` collection: ${collections.items.filter(c => c.properties.uid[0] == collection)[0].properties.name[0]}` : 
                                        type ? ` type: ${type}` : ''}
                                    <a class="btn btn-link btn-action" rel="prefetch" swap-target="#main" swap-history="true" href="/uploads?destination=${encodeURIComponent(mpDestination)}" ><i class="icon icon-cross"></i></a>
                                </p>
                                ` : ''}
                            <div>
                                ${utility.getUploadHTML(items.slice(0, 25), config, mpDestination, Array.from(uniqueExtensions), q || type, collections.items)}
                            </div>
                            <p class="text-center">
                                ${offset ? `<a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/uploads?destination=${encodeURIComponent(mpDestination)}&limit=50000${offset ? `&offset=${offset - 25}` : ''}${q ? `&q=${q}` : ''}${type ? `&type=${type}` : ''}" />Previous</a>` :''}
                                ${nextPage ? `<a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/uploads?destination=${encodeURIComponent(mpDestination)}&limit=50000&offset=${offset ? offset + 25 : 25}${q ? `&q=${q}` : ''}${type ? `&type=${type}` : ''}" />Next</a>` : '' }
                            </p>
                        </div>`;

                        // fetching = await fetch(`https://micro.blog/micropub?q=category&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                        // const categories = await fetching.json();
                        // let nextPage = false;
                        // const items = results.items
                        //     .filter(p => req.url.includes("blog") ? p.properties["post-status"][0] == 'published' : p.properties["post-status"][0] == 'draft')
                        //     .filter(p => category ? p.properties.category ? p.properties.category.includes(category) : false : true )
                        
                        // if(items.length > 25) {
                        //     nextPage = true;
                        // }

                        // content = `${utility.blogHeader(req.url.includes("blog") ? 'blog' : 'draft')}
                        //     <div id="blog" class="mt-2">
                        //         <div>
                        //             ${utility.getBlogHTML(items.slice(0, 25),config, mpDestination, categories,q || category || offset)}
                        //         </div>
                        //         <p class="text-center">
                        //             ${offset ? `<a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/blog?destination=${encodeURIComponent(mpDestination)}&limit=50000${offset ? `&offset=${offset - 25}` : ''}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}" />Previous</a>` :''}
                        //             ${nextPage ? `<a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/blog?destination=${encodeURIComponent(mpDestination)}&limit=50000&offset=${offset ? offset + 25 : 25}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}" />Next</a>` : '' }
                        //         </p>
                        //     </div>`;
                } else if(req.url.includes("blog") || req.url.includes("drafts")) {
                    //-------
                    //  Blog
                    //-------
                    id = name;
                    name = "blog";

                    const searchParams = new URLSearchParams(req.url.split('?')[1]);
                    const category = searchParams.get('category');
                    const q = searchParams.get('q');
                    const offset = searchParams.get('offset');

                    fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const config = await fetching.json();
                
                    const defaultDestination = config.destination.filter(d => d["microblog-default"])[0] ? config.destination.filter(d => d["microblog-default"])[0].uid : config.destination[0].uid;
                    const mpDestination = destination ? destination : defaultDestination;

                        //https://micro.blog/micropub?q=source&filter=daughter&limit=3&offset=2
                        fetching = await fetch(`https://micro.blog/micropub?q=source${offset ? `&offset=${offset}` : ''}&limit=50000${q ? `&filter=${encodeURIComponent(q)}` : ''}&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );

                        const results = await fetching.json();

                        fetching = await fetch(`https://micro.blog/micropub?q=category&mp-destination=${encodeURIComponent(mpDestination)}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                        const categories = await fetching.json();
                        let nextPage = false;
                        const items = results.items
                            .filter(p => req.url.includes("blog") ? p.properties["post-status"][0] == 'published' : p.properties["post-status"][0] == 'draft')
                            .filter(p => category ? p.properties.category ? p.properties.category.includes(category) : false : true )
                        
                        if(items.length > 25) {
                            nextPage = true;
                        }

                        content = `${utility.blogHeader(req.url.includes("blog") ? 'blog' : 'draft')}
                            <div id="blog" class="mt-2">
                                <div>
                                    ${utility.getBlogHTML(items.slice(0, 25),config, mpDestination, categories,q || category || offset)}
                                </div>
                                <p class="text-center">
                                    ${offset ? `<a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/blog?destination=${encodeURIComponent(mpDestination)}&limit=50000${offset ? `&offset=${offset - 25}` : ''}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}" />Previous</a>` :''}
                                    ${nextPage ? `<a class="btn btn-link" rel="prefetch" swap-target="#main" swap-history="true" href="/blog?destination=${encodeURIComponent(mpDestination)}&limit=50000&offset=${offset ? offset + 25 : 25}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}" />Next</a>` : '' }
                                </p>
                            </div>`;
                } else if(req.url.includes("pages")) {
                    //-------
                    //  Pages
                    //-------
                    id = name;
                    name = "pages";

                    fetching = await fetch(`https://${user.username}.micro.blog/rsd.xml`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const result = await fetching.text();

                    console.log(result);

                    content = `${utility.blogHeader('pages')}
                        <div id="pages" class="mt-2">
                            <input id="pageXML" type="hidden" value="${result}" />
                        </div>`;
                } 


                
                return new Response(layout.replaceAll('{{nonce}}', nonce)
                    .replaceAll('{{content}}', content)
                    .replaceAll('{{pageName}}', name ? String(name).charAt(0).toUpperCase() + String(name).slice(1) : '')
                    .replaceAll('{{scriptLink}}', name == 'settings' ? `<script src="/scripts/settings.js" type="text/javascript"></script>` : '')
                    .replaceAll('{{editor}}', !req.headers.get("swap-target") ? await utility.getEditor(following, mbUser.username, mbToken, destination) : '')
                    .replaceAll('{{premium}}', mbUser.is_premium ? '' : 'hide')
                , HTMLHeaders(nonce, null, disableCSP));
            }

            return new Response(new TextDecoder().decode(await Deno.readFile("notfound.html")),
            {
                headers: {
                    "content-type": "text/html",
                    status: 404,
                },
            });

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
                    HTMLHeaders(nonce,`atoken=${accessToken};SameSite=Lax;Secure;HttpOnly;Expires=${expiresOn.toUTCString()}`));
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
function HTMLHeaders(uuid, cookie, disable = false) {
    const csp = `default-src 'self' micro.blog *.micro.blog *.gravatar.com 'nonce-${uuid}';media-src *;img-src *`;
    if(disable) {
        return {
            headers: {
                "content-type": "text/html",
                status: 200,
            },
        };    
    }
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