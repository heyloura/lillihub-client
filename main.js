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

    const CHECK_HTML_ROUTE = new URLPattern({ pathname: "*.html" });
    if(CHECK_HTML_ROUTE.exec(req.url))
    {
        return new Response(await Deno.readFile(CHECK_HTML_ROUTE.pathname), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    // const CHECK_FONT_ROUTE = new URLPattern({ pathname: "/font/:id" });
    // if(CHECK_FONT_ROUTE.exec(req.url))
    // {
    //     const id = CHECK_FONT_ROUTE.exec(req.url).pathname.groups.id;

    //     if(id.includes('.eot')) {
    //         return new Response(await Deno.readFile("static/font/" + id), {
    //             status: 200,
    //             headers: {
    //                 "content-type": "application/vnd.ms-fontobject",
    //             },
    //         });
    //     }
    //     if(id.includes('.svg')) {
    //         return new Response(await Deno.readFile("static/font/" + id), {
    //             status: 200,
    //             headers: {
    //                 "content-type": "image/svg+xml",
    //             },
    //         });
    //     }
    //     if(id.includes('.ttf')) {
    //         return new Response(await Deno.readFile("static/font/" + id), {
    //             status: 200,
    //             headers: {
    //                 "content-type": "font/ttf",
    //             },
    //         });
    //     }
    //     if(id.includes('.woff2')) {
    //         return new Response(await Deno.readFile("static/font/" + id), {
    //             status: 200,
    //             headers: {
    //                 "content-type": "font/woff2",
    //             },
    //         });
    //     }
    //     if(id.includes('.woff')) {
    //         return new Response(await Deno.readFile("static/font/" + id), {
    //             status: 200,
    //             headers: {
    //                 "content-type": "font/woff",
    //             },
    //         });
    //     }
    // } // end font route 

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
                //console.log(mbUser);
            }

            user = {};
            user.username = mbUser.username;
            user.name = mbUser.name;
            user.avatar = mbUser.avatar;
            user.plan = mbUser.plan;

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

            if(((new URLPattern({ pathname: "/timeline/discover/feed" })).exec(req.url))) {
                const posts = await mb.getMicroBlogTimelinePosts(_lillihubToken, 0);
                const following = (await mb.getMicroBlogFollowing(mbToken, mbUser.username));
                const html = posts.map(post => {
                    const stranger = following.filter(f => f.username == post.username);
                    const result = postHTML(post, null, stranger.length == 0);
                    return result;
                }).join('');
                return new Response(html,HTMLHeaders(nonce));
            }

            if(((new URLPattern({ pathname: "/timeline/discover/custom" })).exec(req.url))) {
                const posts = await mb.getMicroBlogTimelinePosts(_lillihubToken, 0);
                const following = (await mb.getMicroBlogFollowing(mbToken, mbUser.username));
                const html = posts.map(post => {
                    const stranger = following.filter(f => f.username == post.username);
                    const result = postHTML(post, null, stranger.length == 0);
                    return result;
                }).join('');
                return new Response(html,HTMLHeaders(nonce));
            }

            const DISCOVER_ROUTE = new URLPattern({ pathname: "/timeline/discover/:id" });
            if(((new URLPattern({ pathname: "/timeline/discover" }).exec(req.url)) || DISCOVER_ROUTE.exec(req.url)) && user) {
                let id = '';
                if(DISCOVER_ROUTE.exec(req.url)) {
                    id = DISCOVER_ROUTE.exec(req.url).pathname.groups.id;
                }
                
                const layout = new TextDecoder().decode(await Deno.readFile("discover.html"));
                let fetching = await fetch(`https://micro.blog/posts/discover`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                let results = await fetching.json();
                const tagmojiChips = results._microblog.tagmoji.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)).map((item) =>
                    `<span class="chip ${id && item.name == id ? 'bg-primary' : ''}"><a class="${id && item.name == id ? 'text-secondary' : ''}" href="/timeline/discover/${item.name}">${item.emoji} ${item.title}</a></span>`
                ).join('');
                const tagmojiMenu = results._microblog.tagmoji.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)).map((item) =>
                    `<li class="menu-item ${id && item.name == id ? 'active' : ''}"><a class="${id && item.name == id ? 'text-secondary' : ''}" href="/timeline/discover/${item.name}">${item.emoji} ${item.title}</a></span>`
                ).join('');
                return new Response(layout.replaceAll('{{nonce}}', nonce)
                    .replaceAll('{{tagmojiChips}}', tagmojiChips)
                    .replaceAll('{{tagmojiMenu}}', tagmojiMenu),
                  HTMLHeaders(nonce));
            }
            

            // if(((new URLPattern({ pathname: "/timeline/mentions/mentions" })).exec(req.url))) {
            //     const posts = await mb.getMicroBlogTimelinePosts(_lillihubToken, 0);
            //     const following = (await mb.getMicroBlogFollowing(mbToken, mbUser.username));
            //     const html = posts.map(post => {
            //         const stranger = following.filter(f => f.username == post.username);
            //         const result = postHTML(post, null, stranger.length == 0);
            //         return result;
            //     }).join('');
            //     return new Response(html,HTMLHeaders(nonce));
            // }

            if((new URLPattern({ pathname: "/timeline/mentions" })).exec(req.url) && user) {
                const layout = new TextDecoder().decode(await Deno.readFile("mentions.html"));
                return new Response(layout.replaceAll('{{nonce}}', nonce),
                  HTMLHeaders(nonce));
            }

            // if(((new URLPattern({ pathname: "/timeline/discover/photos" })).exec(req.url))) {
            //     const posts = await mb.getMicroBlogDiscoverPhotoPosts(mbToken);
            //     const html = posts.map((p, index) => index < 9 ? `<li>
            //         <img src="${p.image}" alt="Image 1" class="img-responsive">
            //     </li>` : '').join('');

            //     return new Response(`<ul class="discover-gallery">${html}</ul>`,HTMLHeaders(nonce));
            // }

            const CHECK_ROUTE = new URLPattern({ pathname: "/timeline/check/:id" });
            if(CHECK_ROUTE.exec(req.url)) {
                const id = CHECK_ROUTE.exec(req.url).pathname.groups.id;
                const fetching = await fetch(`https://micro.blog/posts/check?since_id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const results = await fetching.json(); 
                return new Response(JSON.stringify(results),JSONHeaders());
            }

            const MARK_TIMELINE_ROUTE = new URLPattern({ pathname: "/timeline/mark/:id" });
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

            // this is called from client side JavaScript to get posts
            const POSTS_ROUTE = new URLPattern({ pathname: "/timeline/posts/:id" });
            const TAGMOJI_ROUTE = new URLPattern({ pathname: "/timeline/posts/discover/:id" });
            if((POSTS_ROUTE.exec(req.url) || TAGMOJI_ROUTE.exec(req.url)) && user) {
                const id = POSTS_ROUTE.exec(req.url) ? POSTS_ROUTE.exec(req.url).pathname.groups.id : 'discover/' + TAGMOJI_ROUTE.exec(req.url).pathname.groups.id;
                const posts = await mb.getMicroBlogUserOrTagmojiPosts(mbToken, id);
                const following = (await mb.getMicroBlogFollowing(mbToken, mbUser.username));
                const html = posts.map(post => {
                    const stranger = following.filter(f => f.username == post.username);
                    const result = postHTML(post, null, stranger.length == 0);
                    return result;
                }).join('');
                return new Response(html,HTMLHeaders(nonce));
            }

            const CONVERSATION_ROUTE = new URLPattern({ pathname: "/timeline/conversation/:id" });
            if(CONVERSATION_ROUTE.exec(req.url)) {
                const id = CONVERSATION_ROUTE.exec(req.url).pathname.groups.id;
                const searchParams = new URLSearchParams(req.url.split('?')[1]);
                
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
                </div>`;

                return new Response(JSON.stringify(data), JSONHeaders());
            }

            const USER_ROUTE = new URLPattern({ pathname: "/timeline/user/:id" });
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
                    ,HTMLHeaders(nonce));
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

            const TIMELINE_ROUTE = new URLPattern({ pathname: "/timeline/:id" });
            if(TIMELINE_ROUTE.exec(req.url)) {
                const id = TIMELINE_ROUTE.exec(req.url).pathname.groups.id;
                const posts = await mb.getMicroBlogTimelinePosts(mbToken, id);
                const html = posts.map(post => postHTML(post)).join('');

                return new Response(`${html}<br/><p class="p-centered">
                    <button class="btn btn-primary loadTimeline" data-id="${posts[posts.length-1].id}">load more</button>
                    <div id="add-${posts[posts.length-1] ? posts[posts.length-1].id : 'error'}"></div>
                    <div class="hide firstPost" data-id="${posts[0].id}"></div>
                    </p>`,HTMLHeaders(nonce));
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








            /********************************
                NOTES BASED ROUTES
            *********************************/




            const NOTEBOOK_FETCH_ROUTE = new URLPattern({ pathname: "/notebooks/notebooks/:id" });
            if(NOTEBOOK_FETCH_ROUTE.exec(req.url)) {
                let fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                let results = await fetching.json();

                let id = NOTEBOOK_FETCH_ROUTE.exec(req.url).pathname.groups.id;
                if(id == 0) {
                    id = results.items[0].id;
                }
                
                fetching = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                results = await fetching.json();
                //console.log(results.items);
                return new Response(JSON.stringify(results.items.map(i => {i.notebook_id = id; return i;})), JSONHeaders());
                //return new Response(results.items.map(i => utility.noteHTML(i, id)).join(''),HTMLHeaders(nonce));
            }

            const NOTEBOOK_ROUTE = new URLPattern({ pathname: "/notebooks/:id" });
            if(new URLPattern({ pathname: "/notebooks" }).exec(req.url) || NOTEBOOK_ROUTE.exec(req.url)) {
                let fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                let results = await fetching.json();

                let id = results.items[0].id;
                if(NOTEBOOK_ROUTE.exec(req.url)) {
                    id = NOTEBOOK_ROUTE.exec(req.url).pathname.groups.id;
                }

                const layout = new TextDecoder().decode(await Deno.readFile("notebooks.html"));
                const notebooks = results.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item) =>
                    `<li class="menu-item"><a class="notebook-${item.id}" href="/notebooks/${item.id}">${item.title}</a></span>`
                ).join('');
                return new Response(layout.replaceAll('{{nonce}}', nonce)
                    .replaceAll('{{notebooks}}', notebooks)
                    .replaceAll('{{notebookId}}', id),
                    HTMLHeaders(nonce));
            }




















            if(((new URLPattern({ pathname: "/settings" })).exec(req.url))) {
                const layout = new TextDecoder().decode(await Deno.readFile("settings.html"));
                return new Response(layout.replaceAll('{{nonce}}', nonce)
                      .replace('{{year}}', new Date().getFullYear()),
                  HTMLHeaders(nonce));
            }


            // Here we have the reply and posting functionality


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



            if((new URLPattern({ pathname: "/timeline" })).exec(req.url) && user) {
                const layout = new TextDecoder().decode(await Deno.readFile("timeline.html"));
                const following = (await mb.getMicroBlogFollowing(mbToken, mbUser.username)).map(i => {return JSON.stringify({username: i.username, avatar: i.avatar})});
                return new Response(layout.replaceAll('{{nonce}}', nonce)
                      .replace('{{username}}', mbUser.username)
                      .replace('{{replyBox}}', getReplyBox('main',following, true)),
                  HTMLHeaders(nonce));
            }


            // -----------------------------------------------------
            // Home page
            // -----------------------------------------------------
            return Response.redirect(`${deployURL}timeline`);

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
    const csp = `default-src 'self' micro.blog *.micro.blog *.gravatar.com *.previewbox.link 'nonce-${uuid}';media-src *;img-src *`;
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
    //     for(let i = 0; i < anchors.length; i++) {
    //         if(!anchors[i].includes('@') && anchors[i].includes('href=')) {
    //             //onst anchor = anchors[i].split('</a>')[0];
    //             let href = anchors[i].replaceAll("'",'"').split('href="');
    //             //console.log('Anchor:')
    //             //console.log(anchors[i])
    //             if(href[1]) {
    //                 href = href[1].split('"')[0];
    //                 // console.log(href)
    //                 const previewbox = `<previewbox-link dark href="${href}"></previewbox-link>`;
    //                 console.log(previewbox);
    //                 post.content = post.content + previewbox;
    //                 // var username = href[1].split('"')[0].replace('https://micro.blog/','');
    //                 // post.content = post.content.replaceAll(anchor, '/user/' + username);
    //             }
    //         } 
    //         // if(anchors[i].includes('https://micro.blog/') && anchors[i].includes('@')) {
    //         //     var href = anchors[i].replaceAll("'",'"').split('href="');
    //         //     if(href[1]) {
    //         //         var anchor = href[1].split('"')[0];
    //         //         var username = href[1].split('"')[0].replace('https://micro.blog/','');
    //         //         post.content = post.content.replaceAll(anchor, '/user/' + username);
    //         //     }
    //         // } 

    //         //<previewbox-link href="https://web-highlights.com"></previewbox-link>
    //     }
    // }
    
    post.content.replaceAll('<script', `<div`);
    post.content.replaceAll('</script', `</div`);
    
    //${marker && marker.time_published && (marker.time_published >= post.timestamp) ? 'seen' : ''}
    return `
        <article id="${post.id}" class="openConversationBtn card ripple parent ${marker && marker.id == post.id ? 'marked' : ''}" data-reply="${post.username}" data-avatar="${post.avatar}" data-id="${post.id}" data-processed="false" data-marked="${marker && marker.id == post.id ? 'true' : 'false'}" data-url="${post.url}" data-mention="${post.mention}" data-conversation="${post.conversation}" data-timestamp="${post.timestamp}" data-published="${post.published}" data-deletable="${post.deletable}" data-linkpost="${post.linkpost}" data-bookmark="${post.bookmark}" data-favorite="${post.favorite}">
            <header class="card-header">
                ${getAvatar(post, 'avatar-lg')}
                <div class="card-top">
                    <div class="card-title h5">${post.name}</div>
                    <div class="card-subtitle">
                        <a href="/timeline/user/${post.username}" class="text-gray">
                            ${stranger ? '<i class="icon icon-people text-gray"></i> ' : ''}
                            @${post.username}
                        </a> · 
                        <a target="_blank" href="${post.url}" class="text-gray">${post.relative}</a>
                        ${post.conversation && !post.mention ? '&nbsp;·&nbsp;<i class="icon icon-message text-gray"></i>' : ''}
                    </div>           
                </div>
                <!--<div class="card-buttons">
                    <div class="dropdown dropdown-right"><a class="btn btn-link dropdown-toggle" tabindex="0"><i class="icon icon-more-vert"></i></a>
                        <ul class="menu">
                            <li class="divider" data-content="Published: ${post.relative}">
                            <li class="menu-item"><a href="/post?quote=${post.id}" class="btn-link btn">Quote Post</a></li>
                            <li class="menu-item"><button data-url="${post.url}" class="addBookmark btn-link btn">Bookmark Post</button></li>
                            <li class="menu-item"><a href="/conversation/${post.id}?view=true" class="btn-link btn">View Post</a></li>
                        </ul>
                    </div>
                </div>-->
            </header>
            <main id="main-${post.id}" data-id="${post.id}">${post.content}</main>
            ${multipleImgs ? `<div data-id="${post.id}" class='gallery'></div>` : ''}
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
                <figure class="avatar avatar-lg" data-initial="${p.username.substring(0,1)}">
                    <img src="${p.avatar}" loading="lazy">
                </figure>
            </div>
            <div class="tile-content">
                <p class="tile-title">
                    ${p.name} <a class="text-gray" href="/timeline/user/${p.username}">@${p.username}</a>
                    <br/><a class="text-gray" href="${p.url}">${p.relative}</a>${stranger ? ' <i class="icon icon-people text-gray"></i>' : ''}
                    <button type="button" class="addToReply btn btn-sm btn-link btn-icon float-right" data-target="replybox-textarea-${parent}" data-id="${p.username}">
                        <i data-target="replybox-textarea-${parent}" data-id="${p.username}" class="icon icon-share addToReply"></i>
                    </button>
                </p>
                ${p.content}
                ${multipleImgs ? `<div data-id="${p.id}-${parent}" class='gallery'></div>` : ''}
            </div>
        </div>
    `;
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