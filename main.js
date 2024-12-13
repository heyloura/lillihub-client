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
const deployURL = 'https://sad-bee-43--version3.deno.dev/';
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

            /********************************
                TIMELINE BASED ROUTES
            *********************************/
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


            if((new URLPattern({ pathname: "/timeline/mentions" })).exec(req.url) && user) {
                const layout = new TextDecoder().decode(await Deno.readFile("mentions.html"));
                return new Response(layout.replaceAll('{{nonce}}', nonce),
                  HTMLHeaders(nonce));
            }


            if(new URLPattern({ pathname: "/timeline/following" }).exec(req.url) && user) {
                let fetching = await fetch(`https://micro.blog/users/following/${user.username}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                let results = await fetching.json();
        
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
        
                const layout = new TextDecoder().decode(await Deno.readFile("following.html"));

                return new Response(layout.replaceAll('{{nonce}}', nonce)
                    .replaceAll('{{users}}', users)
                    ,HTMLHeaders(nonce));
            } 







            /********************************
                BOOKMARKS BASED ROUTES
            *********************************/
            const READER_ROUTE = new URLPattern({ pathname: "/bookmarks/reader/:id" });
            if(READER_ROUTE.exec(req.url)) {
                const id = READER_ROUTE.exec(req.url).pathname.groups.id;
                // const searchParams = new URLSearchParams(req.url.split('?')[1]);
                // const idsParam = searchParams.get('ids');
                // const title = searchParams.get('title');
            
                let fetching = await fetch(`https://micro.blog/hybrid/bookmarks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const results = await fetching.text(); 
        
                const page = results;
                // let highlightCount = 0;
                    
                const baseURL = page.split('<base href="')[1].split('"')[0];
                const root = baseURL.split('/');
                root.pop();
                const htmlBody = page.split('<body>')[1].split('</body>')[0];
                let content = htmlBody.split('<div id="content">')[1].split('<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.3/jquery.min.js"></script>')[0];
                content = content.replaceAll('src="',`src="${root.join('/')}/`);
        
                // if(idsParam) {
                //     let ids = [...new Set(idsParam.split(','))];
                //     let allHighlights = await getAllFromMicroBlog('https://micro.blog/posts/bookmarks/highlights', mbToken);
                //     let matchingHighlights = allHighlights.filter((h) => {return ids.includes(h.id.toString());});
                //     highlightCount = matchingHighlights.length;
                //     for(var i = 0; i < matchingHighlights.length; i++) {
                //     var highlight = matchingHighlights[i];
                //     content = content.replaceAll(highlight.content_text,`<mark>${highlight.content_text}</mark>`);
                //     }
                // }
                
                // let script = `

                //     <script nonce=${nonce}>

                //     </script>`;
        
                // fetching = await fetch(`https://micro.blog/posts/bookmarks/tags`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                // const tags = await fetching.json();

                const data = {};
                data.content = content;
                return new Response(JSON.stringify(data), JSONHeaders());
            }
        
            if(new URLPattern({ pathname: "/bookmarks/highlights" }).exec(req.url)) {
                const nonce = crypto.randomUUID();
                const allHighlights = await mb.getAllFromMicroBlog(mbToken, 'https://micro.blog/posts/bookmarks/highlights');
                return new Response(`<textarea rows="20">${JSON.stringify(allHighlights)}</textarea>`,HTMLHeaders(nonce));
            }

            if(new URLPattern({ pathname: "/bookmarks/bookmarks" }).exec(req.url)) {
                const searchParams = new URLSearchParams(req.url.split('?')[1]);
                const tag = searchParams.get('tag');
                const items = await mb.getAllFromMicroBlog(mbToken, `https://micro.blog/posts/bookmarks${tag ? `?tag=${tag}` : ''}`);
                const allHighlights = await mb.getAllFromMicroBlog(mbToken, 'https://micro.blog/posts/bookmarks/highlights');

                for(let i=0; i< items.length; i++) {
                    const item = items[i];
                    const highlights = allHighlights.filter(h => h.url === item.url);
                    
                    item.title = item.content_html.split('</p>')[0].replace('<p>','');
                    item.reader = item._microblog.links && item._microblog.links.length > 0 ? item._microblog.links[0].id : null;
                    item.highlights = highlights && highlights.length > 0 ? highlights.map(h => h.id) : [];
                }
                return new Response(items.map(b => utility.bookmarkHTML(b)).join(''),HTMLHeaders(nonce));
            }
        
            if(new URLPattern({ pathname: "/bookmarks" }).exec(req.url)) {        
                // let bookmarks = [];
                // const fetching = await fetch(`https://micro.blog/posts/bookmarks/tags`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                // const tags = await fetching.json();
                // let tagDatalist = `<datalist id="bookmarkTags">${user && user.is_premium && tags && tags.length > 0 ? `
                //     ${tags.sort().map(t => `<option value="${t}"></option>`).join('')}`  : ''}</datalist>
                // ${user && user.is_premium && tags && tags.length > 0 ? `
                //     ${tags.sort().map(t => `<span class="chip ${tag == t ? 'bg-primary' : ''}"><a ${tag == t ? 'class="text-light"' : ''} href="/bookmarks?tag=${t}">${t}</a></span>`).join('')}`  : ''}`;
        
                // return new Response(await HTML(`              
                // 

                const layout = new TextDecoder().decode(await Deno.readFile("bookmarks.html"));
                return new Response(layout.replaceAll('{{nonce}}', nonce),HTMLHeaders(nonce));
            }
        
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
            // POSTING endpoints
            // -----------------------------------------------------
            
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

            //----------
            // save Note
            //----------
            const NOTEBOOKS_UPDATE_ROUTE = new URLPattern({ pathname: "/notebooks/note/update" });
            if(NOTEBOOKS_UPDATE_ROUTE.exec(req.url) && user) {
                console.log('saving note')
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

                console.log(form.toString())
                               
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


            // -----------------------------------------------------
            // All other pages
            // -----------------------------------------------------
            const pages = ["notebooks", "timeline", "users", "discover", "mentions", "following", "bookmarks", "settings"]
            if (pages.some(v => req.url.includes(v)) && !req.url.includes('%3Ca%20href=')) {
                const layout = new TextDecoder().decode(await Deno.readFile("layout.html"));
                const parts = req.url.split('/');
                let name = parts[parts.length - 1].split('?')[0];
                let id = null;
                let content = '';

                // get notebooks for sidebar
                let fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const notebooks = await fetching.json();

                // following
                fetching = await fetch(`https://micro.blog/users/following/${mbUser.username}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                let following = await fetching.json();

                console.log(following);
                
                // tagmoji
                fetching = await fetch(`https://micro.blog/posts/discover`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                let tagmoji = await fetching.json();

                // get editor

                // check for notebooks route
                if(req.url.includes("custom")) {
                    name = "discover";
                    fetching = await fetch(`https://micro.blog/posts/timeline?count=40`, { method: "GET", headers: { "Authorization": "Bearer " + _lillihubToken } } );
                    const posts = await fetching.json();
                    // put JSON check here or something.....
                    content = `<div id="discover" class="mt-2">${utility.discoverHTML(posts, tagmoji._microblog.tagmoji)}</div>`;
                } else if(req.url.includes("settings")) {
                    name = "settings";
                    content = `<div id="settings" class="mt-2">${utility.settingsHTML()}</div>`;
                }else if(req.url.includes("discover")) {
                    id = name;
                    name = "discover";
                    fetching = await fetch(`https://micro.blog/posts/discover${id != "discover" ? `/${id}` : ''}`, { method: "GET", headers: { "Authorization": "Bearer " + _lillihubToken } } );
                    const posts = await fetching.json();
                    // put JSON check here or something.....
                    content = `<div id="discover" class="mt-2">${utility.discoverHTML(posts, tagmoji._microblog.tagmoji)}</div>`;
                } else if(req.url.includes("users")) {
                    id = name;
                    name = "users";
                    fetching = await fetch(`https://micro.blog/posts/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const posts = await fetching.json();
                    // put JSON check here or something.....
                    content = `<div id="user-posts" class="mt-2">${utility.timelineHTML(posts.items.map(n => utility.postHTML(n)).join(''))}</div>`;
                } else if(req.url.includes("notes") && req.url.includes("new")) {
                    id = name;
                    name = "note";
                    //fetching = await fetch(`https://micro.blog/notes/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    // const note = await fetching.json();
                    // fetching = await fetch(`https://micro.blog/notes/${id}/versions`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    // const versions = await fetching.json();
                    // // put JSON check here or something.....
                    //content = `<div id="note" class="mt-2">${utility.noteHTML(note,null,versions.items)}</div>`;
                } else if(req.url.includes("notes")) {
                    id = name;
                    name = "note";
                    fetching = await fetch(`https://micro.blog/notes/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const note = await fetching.json();
                    fetching = await fetch(`https://micro.blog/notes/${id}/versions`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const versions = await fetching.json();
                    // put JSON check here or something.....
                    content = `<div id="note" class="mt-2">${utility.noteHTML(note,null,versions.items)}</div>`;
                } else if(req.url.includes("notebooks")) {
                    id = name;
                    name = "notebook";
                    fetching = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const notes = await fetching.json();
                    // put JSON check here or something.....
                    content = `<div id="note-list" class="mt-2">${utility.getNotebookHTML(notes.items,id)}</div>`;
                } else if(req.url.includes("posts")) {
                    id = name;
                    name = "timeline";
                    fetching = await fetch(`https://micro.blog/posts/conversation?id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const post = await fetching.json();
                    // put JSON check here or something.....
                    content = `<div id="post-${id}" class="mt-2 timeline post"><div class=""><p><em>Conversation</em></p></div>${post.items.slice(0).reverse().map(n => utility.postHTML(n, null, true, id)).join('')}</div>`;
                } else if(req.url.includes("timeline")) {
                    id = name;
                    name = "timeline";
                    fetching = await fetch(`https://micro.blog/posts/timeline?count=40${id != "timeline" ? `&before_id=${id}` : ''}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const posts = await fetching.json();
                    content = `<div id="post-list" class="mt-2">${utility.timelineHTML(posts.items.map(n => utility.postHTML(n)).join(''),posts.items[posts.items.length -1].id)}</div>`;
                }
                
                return new Response(layout.replaceAll('{{nonce}}', nonce)
                    .replaceAll('{{pages}}', content)
                    .replaceAll('{{notebooks}}', notebooks.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map(element =>
                        `<li class="menu-item"><a rel="prefetch" class="notebook-${element.id}" href="/notebooks/${element.id}" swap-target="#main" swap-history="true">${element.title}</a></li>`).join(''))
                    .replaceAll('{{pageName}}', name ? String(name).charAt(0).toUpperCase() + String(name).slice(1) : '')
                    .replaceAll('{{scriptLink}}', name == 'settings' ? `<script src="/scripts/settings.js" type="text/javascript"></script>` : '')
                    .replaceAll('{{editor}}', utility.getEditor(following))
                , HTMLHeaders(nonce));
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