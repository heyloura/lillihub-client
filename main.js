/******************************************************************************************************************
* README
*
* Creating an APP_SECRET environmental variable. Save the rawKey.
*      const key = await crypto.subtle.generateKey({ name: "AES-CBC", length: 128 },true,["encrypt", "decrypt"]);
*      const rawKey = JSON.stringify(await crypto.subtle.exportKey("jwk", key));
******************************************************************************************************************/

//********************************************************
import { serve } from "https://deno.land/std@0.214.0/http/server.ts";

import { getCookieValue, decryptMe, encryptMe } from "./scripts/server/utilities.js";
import { getMicroBlogLoggedInUser } from "./scripts/server/mb.js";
import { HTMLPage, CSSThemeColors } from "./layouts/templates.js"
import { SettingsTemplate } from "./layouts/settings.js"
import { SingleTemplate } from "./layouts/single.js";
import { UsersTemplate } from "./layouts/users.js";
import { MentionsTemplate } from "./layouts/mentions.js";
import { RepliesTemplate } from "./layouts/replies.js";
import { BookmarksTemplate } from "./layouts/bookmarks.js";
import { BookshelvesTemplate } from "./layouts/bookshelves.js";
import { BookshelfTemplate } from "./layouts/bookshelf.js";
import { EditorTemplate } from "./layouts/editor.js";
import { BlogTemplate } from "./layouts/blog.js";
import { MediaTemplate } from "./layouts/media.js";
import { NotebooksTemplate } from "./layouts/notebooks.js";
import { NotesTemplate } from "./layouts/notes.js";
import { NoteTemplate } from "./layouts/note.js";
import { TimelineTemplate } from "./layouts/timeline.js";
import { DiscoverTemplate } from "./layouts/discover.js";
import { TagmojiTemplate } from "./layouts/tagmoji.js";
import { UserTemplate } from "./layouts/user.js";

const _replyFormTemplate = new TextDecoder().decode(await Deno.readFile("templates/_reply_form.html"));

const FAVICON_ROUTE = new URLPattern({ pathname: "/favicon.ico" });
const WEBMANIFEST_ROUTE = new URLPattern({ pathname: "/manifest.webmanifest" });
const SERVICEWORKER_ROUTE = new URLPattern({ pathname: "/sw.js" });
const LILLIHUB_ICON_ROUTE = new URLPattern({ pathname: "/lillihub-512.png" });

const HOME_ROUTE = new URLPattern({ pathname: "/" });
const DISCOVER_ROUTE = new URLPattern({ pathname: "/discover" });
const DISCOVERTAG_ROUTE = new URLPattern({ pathname: "/discover/:id" });
const USER_ROUTE = new URLPattern({ pathname: "/user/:id" });
const USERPHOTOS_ROUTE = new URLPattern({ pathname: "/user/photos/:id" });
const FOLLOWING_ROUTE = new URLPattern({ pathname: "/users/following" });
const MUTED_ROUTE = new URLPattern({ pathname: "/users/muted" });
const BLOCKED_ROUTE = new URLPattern({ pathname: "/users/blocked" });
const MENTIONS_ROUTE = new URLPattern({ pathname: "/mentions" });
const REPLIES_ROUTE = new URLPattern({ pathname: "/replies" });
const BOOKMARKS_ROUTE = new URLPattern({ pathname: "/bookmarks" });
const BOOKSHELVES_ROUTE = new URLPattern({ pathname: "/bookshelves" });
const BOOKSHELF_ROUTE = new URLPattern({ pathname: "/bookshelves/shelf/:id" });
const NOTEBOOKS_ROUTE = new URLPattern({ pathname: "/notes" });
const NOTES_ROUTE = new URLPattern({ pathname: "/notes/:id" });
const UPDATE_NOTES_ROUTE = new URLPattern({ pathname: "/notes/:id/update" });
const SETTINGS_ROUTE = new URLPattern({ pathname: "/settings" });
const POST_ROUTE = new URLPattern({ pathname: "/post" });
const TIMELINE_POST_ROUTE = new URLPattern({ pathname: "/timeline/:id" });
const POSTS_ROUTE = new URLPattern({ pathname: "/posts" });
const MEDIA_ROUTE = new URLPattern({ pathname: "/media" });
const LOGOUT_ROUTE = new URLPattern({ pathname: "/logout" });
const AUTH_ROUTE = new URLPattern({ pathname: "/auth" });

const ADD_REPLY = new URLPattern({ pathname: "/replies/add" });
const UNFOLLOW_USER = new URLPattern({ pathname: "/users/unfollow" });
const FOLLOW_USER = new URLPattern({ pathname: "/users/follow" });
const MUTE_USER = new URLPattern({ pathname: "/users/mute" });
const BLOCK_USER = new URLPattern({ pathname: "/users/block" });
const FAVORTIE_USER_TOGGLE = new URLPattern({ pathname: "/users/favorite/toggle" });
const PIN_TIMELINE_POST = new URLPattern({ pathname: "/timeline/favorite/toggle" });
const BOOKMARKS_UPDATE_TAGS = new URLPattern({ pathname: "/bookmarks/update" });
const BOOKMARKS_NEW = new URLPattern({ pathname: "/bookmarks/new" });
const BOOKMARKS_UNBOOKMARK = new URLPattern({ pathname: "/bookmarks/unbookmark" });
const SETTINGS_DARKTHEME = new URLPattern({ pathname: "/settings/darktheme" });
const SETTINGS_CONTENTFILTERS = new URLPattern({ pathname: "/settings/contentfilters" });
const SETTINGS_TIMELINE = new URLPattern({ pathname: "/settings/timeline" });
const ADD_NOTE = new URLPattern({ pathname: "/note/update" });
const DELETE_NOTE = new URLPattern({ pathname: "/note/delete" });
const ADD_NOTEBOOK = new URLPattern({ pathname: "/notebook/add" });
const ADD_POST = new URLPattern({ pathname: "/post/add" });
const UPLOAD_MEDIA_ROUTE = new URLPattern({ pathname: "/media/upload" });
const DELETE_MEDIA_ROUTE = new URLPattern({ pathname: "/media/delete" });


const SESSION = {};

async function handler(req) {  

    /********************************************************
     * Requests that resolve before authentication checks
     ********************************************************/
    if(FAVICON_ROUTE.exec(req.url)){
        return new Response(new Uint8Array(await Deno.readFile("static/favicon.ico")), {
            status: 200,
            headers: {
                "content-type": "image/x-icon",
            },
        });
    }

    if(LILLIHUB_ICON_ROUTE.exec(req.url)){
        return new Response(new Uint8Array(await Deno.readFile("static/lillihub-512.png")), {
            status: 200,
            headers: {
                "content-type": "image/png",
            },
        });
    }

    if(WEBMANIFEST_ROUTE.exec(req.url))
    {
        return new Response(await Deno.readFile("static/manifest.webmanifest"), {
            status: 200,
            headers: {
                "content-type": "text/json",
            },
        });
    }

    if(SERVICEWORKER_ROUTE.exec(req.url))
    {
        return new Response(await Deno.readFile("scripts/server/sw.js"), {
            status: 200,
            headers: {
                "content-type": "text/javascript",
            },
        });
    }

    /********************************************************
     * Check if request comes from an authenticated user
     ********************************************************/
    let user = false;
    const accessToken = getCookieValue(req, 'access_token');
    const accessTokenValue = accessToken ? await decryptMe(getCookieValue(req, 'access_token')) : undefined;
    
    if(accessTokenValue) {
        const mbUser = await getMicroBlogLoggedInUser(accessTokenValue);
        user = {};
        user.username = mbUser.username;
        user.name = mbUser.name;
        user.avatar = mbUser.avatar;
        user.plan = mbUser.plan;

        //check to see if we have user settings in-memory...
        if(!SESSION[user.username]) {
            const kv = await Deno.openKv();
            const userKV = await kv.get([user.username, 'global']);
            if(userKV && !userKV.value) {
                const starterFavs = { favorites: ['manton', 'jean', 'news', 'help'], feeds: [] };
                await kv.set([user.username, 'global'], starterFavs);
                user.lillihub = starterFavs;
            } else {   
                user.lillihub = userKV.value;
            }

            SESSION[user.username] = user;
        } else {
            user.lillihub = SESSION[user.username].lillihub;
        }
    }
   
    /********************************************************
     * Authenticated Only Routes
     ********************************************************/
    if(HOME_ROUTE.exec(req.url) && user) {
        return new Response(await TimelineTemplate(SESSION, user, accessTokenValue, req), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(SETTINGS_ROUTE.exec(req.url) && user) {
        return new Response(await SettingsTemplate(user), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(TIMELINE_POST_ROUTE.exec(req.url) && user) {
        const id = TIMELINE_POST_ROUTE.exec(req.url).pathname.groups.id;

        return new Response(await SingleTemplate(user, accessTokenValue, id), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(FOLLOWING_ROUTE.exec(req.url) && user) {
        return new Response(await UsersTemplate(user, accessTokenValue, 'following', `https://micro.blog/users/following/${user.username}`), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(MUTED_ROUTE.exec(req.url) && user) {
        return new Response(await UsersTemplate(user, accessTokenValue, 'muted', `https://micro.blog/users/muting`), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(BLOCKED_ROUTE.exec(req.url)) {
        return new Response(await UsersTemplate(user, accessTokenValue, 'blocked', `https://micro.blog/users/blocking`), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(MENTIONS_ROUTE.exec(req.url) && user) {
        return new Response(await MentionsTemplate(user, accessTokenValue), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(REPLIES_ROUTE.exec(req.url) && user) {
        return new Response(await RepliesTemplate(user, accessTokenValue), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(BOOKMARKS_ROUTE.exec(req.url) && user) {
        return new Response(await BookmarksTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(BOOKSHELVES_ROUTE.exec(req.url) && user) {
        return new Response(await BookshelvesTemplate(user, accessTokenValue), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(BOOKSHELF_ROUTE.exec(req.url) && user) {
        const id = BOOKSHELF_ROUTE.exec(req.url).pathname.groups.id;

        return new Response(await BookshelfTemplate(user, accessTokenValue, id), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(POST_ROUTE.exec(req.url) && user) {
        return new Response(await EditorTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(POSTS_ROUTE.exec(req.url) && user) {
        return new Response(await BlogTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(MEDIA_ROUTE.exec(req.url) && user) {
        return new Response(await MediaTemplate(user, accessTokenValue, req), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(NOTEBOOKS_ROUTE.exec(req.url) && user) {
        if(user.plan != 'premium') {
            return new Response(HTMLPage(`Notebooks`,`<div class="container><p><b>You need to be a premium micro.blog user to access notebooks</b></p></div>"`, user), {
                status: 200,
                headers: {
                    "content-type": "text/html",
                },
            });
        }

        return new Response(await NotebooksTemplate(user, accessTokenValue), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(NOTES_ROUTE.exec(req.url) && user) {
        const id = NOTES_ROUTE.exec(req.url).pathname.groups.id;

        if(user.plan != 'premium') {
            return new Response(HTMLPage(`Notebooks`,`<div class="container><p><b>You need to be a premium micro.blog user to access notebooks</b></p></div>"`, user), {
                status: 200,
                headers: {
                    "content-type": "text/html",
                },
            });
        }

        return new Response(await NotesTemplate(user, accessTokenValue, id), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }


    if(UPDATE_NOTES_ROUTE.exec(req.url) && user) {
        if(user.plan != 'premium') {
            return new Response(HTMLPage(`Notebooks`,`<div class="container><p><b>You need to be a premium micro.blog user to access notebooks</b></p></div>"`, user), {
                status: 200,
                headers: {
                    "content-type": "text/html",
                },
            });
        }

        const id = UPDATE_NOTES_ROUTE.exec(req.url).pathname.groups.id;

        return new Response(await NoteTemplate(user, accessTokenValue, id, req), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

















    /********************************************************
     * Authenticated Only Actions
     ********************************************************/

    if(ADD_REPLY.exec(req.url) && user) {
        const value = await req.formData();
        const id = value.get('id');
        const checkboxes = value.get('checkboxes');
        const replyingTo = value.getAll('replyingTo[]');
        let content = value.get('content');

        if(content != null && content != undefined && content != '' && content != 'null' && content != 'undefined') {
            const replies = replyingTo.map(function (reply, i) { return '@' + reply }).join(' ');
            content = replies + ' ' + content;

            const posting = await fetch(`https://micro.blog/posts/reply?id=${id}&content=${encodeURIComponent(content)}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
            if (!posting.ok) {
                console.log(`${user.username} tried to add a reply and ${await posting.text()}`);
            }

            return new Response(_replyFormTemplate
                    .replaceAll('{{id}}', id)
                    .replaceAll('{{CSSThemeColors}}', CSSThemeColors(user.lillihub.darktheme))
                    .replaceAll('{{checkboxes}}', atob(checkboxes))
                    .replaceAll('{{checkboxes64}}', checkboxes)
                    .replaceAll('{{buttonText}}','Send Another Reply')
                    .replaceAll('{{response}}','Reply was sent.'), {
                status: 200,
                headers: {
                    "content-type": "text/html",
                },
            });
        }
    }

    if(UNFOLLOW_USER.exec(req.url) && user) {
        const value = await req.formData();
        const username = value.get('username');

        const posting = await fetch(`https://micro.blog/users/unfollow?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
        if (!posting.ok) { 
            console.log(`${user.username} tried to unfollow ${username} and ${await posting.text()}`);
        }

        return new Response(await UserTemplate(user, accessTokenValue, username), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(FOLLOW_USER.exec(req.url) && user) {
        const value = await req.formData();
        const username = value.get('username');

        const posting = await fetch(`https://micro.blog/users/follow?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
        if (!posting.ok) {
            console.log(`${user.username} tried to follow ${username} and ${await posting.text()}`);
        }

        return new Response(`<p></p>`, {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });    
    }

    if(MUTE_USER.exec(req.url) && user) {
        const value = await req.formData();
        const username = value.get('username');

        const posting = await fetch(`https://micro.blog/users/mute?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
        if (!posting.ok) {
            console.log(`${user.username} tried to mute ${username} and ${await posting.text()}`);
        }

        return new Response(await UserTemplate(user, accessTokenValue, username), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(BLOCK_USER.exec(req.url) && user) {
        const value = await req.formData();
        const username = value.get('username');

        const posting = await fetch(`https://micro.blog/users/block?username=${username}`, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue } });
        if (!posting.ok) {
            console.log(`${user.username} tried to block ${username} and ${await posting.text()}`);
        }

        return new Response(await UserTemplate(user, accessTokenValue, username), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(BOOKMARKS_NEW.exec(req.url) && user) {
        const value = await req.formData();
        const url = value.get('url');
        const redirect = value.get('redirect');
        const tags = value.get('tags');

        const formBody = new URLSearchParams();
        formBody.append("h", "entry");
        formBody.append("bookmark-of", url);

        const posting = await fetch(`https://micro.blog/micropub`, {
            method: "POST",
            body: formBody.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                "Authorization": "Bearer " + accessTokenValue
            }
        });
        if (!posting.ok) {
            console.log(`${user.username} tried to add a bookmark ${url} and ${await posting.text()}`);
            return new Response(`<p>Error :-(</p>`, {
                status: 200,
                headers: {
                    "content-type": "text/html",
                },
            });
        }

        if(user.plan == 'premium' && tags) {
            const fetchingBookmarks = await fetch(`https://micro.blog/posts/bookmarks`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } } );
            const bookmark = (await fetchingBookmarks.json()).items[0];
           
            const formBodyTags = new URLSearchParams();
            formBodyTags.append("tags", tags);
           
            const postingTags = await fetch(`https://micro.blog/posts/bookmarks/${bookmark.id}`, {
                method: "POST",
                body: formBodyTags.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                    "Authorization": "Bearer " + accessTokenValue
                }
            });
            const responseTags = await postingTags.text();
            if (!responseTags.ok) {
                console.log(`${user.username} tried to add tags to a new bookmark and ${await posting.text()}`);
                return new Response(`<p>Error :-(</p>`, {
                    status: 200,
                    headers: {
                        "content-type": "text/html",
                    },
                });
            }
        }

        if(redirect && redirect == 'true') {
            return new Response(HTMLPage(`Redirect`, `<h3 class="container">Bookmark has been added. Redirecting back...</h3>`, user, req.url.replaceAll('/new','')), {
                status: 200,
                headers: {
                    "content-type": "text/html",
                },
            });
        }
       
        return new Response(`<p>Bookmarked</p>`, {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(BOOKMARKS_UNBOOKMARK.exec(req.url) && user) {
        const value = await req.formData();
        const id = value.get('id');

        const posting = await fetch(`https://micro.blog/posts/bookmarks/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + accessTokenValue
            }
        });
        if (!posting.ok) {
            console.log(`${user.username} tried to unbookmark and ${await posting.text()}`);
        }

        return new Response(HTMLPage(`Redirect`, `<h3 class="container">Bookmark has been removed. Redirecting back...</h3>`, user, req.url.replaceAll('/unbookmark','')), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(BOOKMARKS_UPDATE_TAGS.exec(req.url) && user) {
        const value = await req.formData();
        const tags = value.getAll('tags[]') ? value.getAll('tags[]') : [];
        const newTag = value.get('newTag');
        const id = value.get('id');

        if(newTag) {
            tags.push(newTag);
        }

        if(user.plan == 'premium') {
            const fetching = await fetch(`https://micro.blog/posts/bookmarks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } } );
            const bookmark = await fetching.json();

            if(bookmark.items && bookmark.items.length > 0) {
                const formBody = new URLSearchParams();

                formBody.append("tags", tags ? tags.join('') : '');

                // request access_token
                const posting = await fetch(`https://micro.blog/posts/bookmarks/${id}`, {
                    method: "POST",
                    body: formBody.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                        "Authorization": "Bearer " + accessTokenValue
                    }
                });
                if (!posting.ok) {
                    console.log(`${user.username} tried to change tags and ${await posting.text()}`);
                }
            }
        }

        return new Response(HTMLPage(`Redirect`, `<h3 class="container">Bookmark tags have been updated. Redirecting back...</h3>`, user, req.url.replaceAll('/update','')), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(ADD_POST.exec(req.url) && user) {
        const value = await req.formData();
        const destination = value.get('destination');
        const syndicates = value.getAll('syndicate[]');
        const categories = value.getAll('category[]');
        const content = value.get('content');
        const status = value.get('status');
        const name = value.get('name');

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

        const posting = await fetch(`https://micro.blog/micropub`, { method: "POST", body: formBody.toString(), headers: { "Authorization": "Bearer " + accessTokenValue, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" } });
        if (!posting.ok) {
            console.log(`${user.username} tried to add a post and ${await posting.text()}`);
            return new Response(HTMLPage(`Redirect`, `<h3 class="container">An error was encountered while posting. Redirecting back...</h3>`, user, req.url.replaceAll('/unbookmark','')), {
                status: 200,
                headers: {
                    "content-type": "text/html",
                },
            });
        }

        return Response.redirect(req.url.replaceAll('/post/add', `/posts?destination=${destination}`));
    }

    if(UPLOAD_MEDIA_ROUTE.exec(req.url) && user) {
        const value = await req.formData();
        let redirect = false;
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
                formData.append("mp-destination", val);
                destination = val;
              }
              if(field == 'redirect') {
                redirect = true;
              }
            }
        }

        let fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } } );
        const config = await fetching.json();
        const mediaEndpoint = config["media-endpoint"];

        fetching = await fetch(mediaEndpoint, { method: "POST", headers: { "Authorization": "Bearer " + accessTokenValue }, body: formData } );
        const uploaded = await fetching.json();

        if(redirect) {
            return Response.redirect(req.url.replaceAll('/media/upload', `/media?destination=${destination}`));
        }
        else
        {
            return new Response(uploaded.url, {
                status: 200,
                headers: {
                    "content-type": "text/plain",
                },
            });
        }
    }

    if(DELETE_MEDIA_ROUTE.exec(req.url) && user) {
        const value = await req.formData();
        const destination = value.get('destination');
        const url = value.get('url');

        const formBody = new URLSearchParams();
        formBody.append("mp-destination", destination);
        formBody.append('action', 'delete');
        formBody.append('url', url);

        const fetching = await fetch(`https://micro.blog/micropub?q=config`, { method: "GET", headers: { "Authorization": "Bearer " + accessTokenValue } } );
        const config = await fetching.json();
        const mediaEndpoint = config["media-endpoint"];

        const posting = await fetch(mediaEndpoint, { method: "POST", body: formBody.toString(), headers: { "Authorization": "Bearer " + accessTokenValue, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" } });
        if (!posting.ok) {
            console.log(`${user.username} tried to delete a media item and ${await posting.text()}`);
        }

        return Response.redirect(req.url.replaceAll('/media/delete', `/media?destination=${destination}`));
    }

    if(PIN_TIMELINE_POST.exec(req.url) && user) {
        const value = await req.formData();
        const id = value.get('id');
        const kv = await Deno.openKv();

        if(id)
        {
            const index = user.lillihub.favorites.indexOf(id);
            if (index > -1) {            
                user.lillihub.favorites = user.lillihub.favorites.filter(function(el) { return el != id; });
            } else {
                user.lillihub.favorites.push(id);
            }
        }

        await kv.set([user.username, 'global'], user.lillihub);
        SESSION[user.username] = user;

        return Response.redirect(req.url.replaceAll('/timeline/favorite/toggle', `/timeline/${id}`));
    }

    if(FAVORTIE_USER_TOGGLE.exec(req.url) && user) {
        const value = await req.formData();
        const username = value.get('username');
        const following = value.get('following');
        const kv = await Deno.openKv();

        if(username)
        {
            const index = user.lillihub.favorites.indexOf(username);
            if (index > -1) {            
                user.lillihub.favorites = user.lillihub.favorites.filter(function(el) { return el != username; });
            } else {
                user.lillihub.favorites.push(username);
            }
        }

        await kv.set([user.username, 'global'], user.lillihub);
        SESSION[user.username] = user;

        if(!following) {
            return Response.redirect(req.url.replaceAll('/users/favorite/toggle', `/user/${username}`));
        }
        return Response.redirect(req.url.replaceAll('/users/favorite/toggle', `/users/following`));
    }

    if(SETTINGS_DARKTHEME.exec(req.url) && user) {
        const value = await req.formData();
        const enableDarkMode = value.get('enableDarkMode');
        const kv = await Deno.openKv();

        if(enableDarkMode)
        {
            user.lillihub.darktheme = true;
            
        } else {
            user.lillihub.darktheme = false;
        }

        await kv.set([user.username, 'global'], user.lillihub);
        SESSION[user.username] = user;
        
        return Response.redirect(req.url.replaceAll('/settings/darktheme', `/settings`));
    }

    if(SETTINGS_CONTENTFILTERS.exec(req.url) && user) {
        const value = await req.formData();
        const exclude = value.get('exclude');
        const kv = await Deno.openKv();

        if(exclude)
        {
            user.lillihub.exclude = exclude;
            
        } else {
            user.lillihub.exclude = '';
        }

        await kv.set([user.username, 'global'], user.lillihub);
        SESSION[user.username] = user;
        
        return Response.redirect(req.url.replaceAll('/settings/contentfilters', `/settings`));
    }

    if(SETTINGS_TIMELINE.exec(req.url) && user) {
        const value = await req.formData();
        user.lillihub.display = value.get('display');
        const kv = await Deno.openKv();
        await kv.set([user.username, 'global'], user.lillihub);
        
        SESSION[user.username] = user;

        return Response.redirect(req.url.replaceAll('/settings/timeline', `/`));
    }

    if(ADD_NOTE.exec(req.url) && user) {
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
                "Authorization": "Bearer " + accessTokenValue
            }
        });

        if (!posting.ok) {
            console.log('ADD_NOTE', await posting.text());
            return ReturnIframeResponse('Unsuccessful.');
        }

        return ReturnIframeResponse(`Note saved.`);
    }

    if(DELETE_NOTE.exec(req.url) && user) {
        const value = await req.formData();
        const id = value.get('id');

        const posting = await fetch(`https://micro.blog/notes/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + accessTokenValue
            }
        });

        if (!posting.ok) {
            console.log('DELETE_NOTE', await posting.text());
            return ReturnIframeResponse('Unsuccessful.');
        }

        return ReturnIframeResponse(`Note deleted.`);
    }

    if(ADD_NOTEBOOK.exec(req.url) && user) {
        const value = await req.formData();
        const name = value.get('name');

        const form = new URLSearchParams();
        form.append("name", name);

        const posting = await fetch('https://micro.blog/notes/notebooks', {
            method: "POST",
            body: form.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                "Authorization": "Bearer " + accessTokenValue
            }
        });

        if (!posting.ok) {
            console.log('ADD_NOTEBOOK', await posting.text());
            return ReturnIframeResponse('Unsuccessful.');
        }

        return Response.redirect(req.url.replaceAll('/notes', ''));
    }










    /********************************************************
     * Unauthenticated Routes
     * NOTE: All routes must create and set a state cookie
     ********************************************************/
    // Defalut page for unauthenticated user
    if(DISCOVER_ROUTE.exec(req.url) || (HOME_ROUTE.exec(req.url) && !user)) {
        const uuid = crypto.randomUUID();
        return new Response(await DiscoverTemplate(user, accessTokenValue, uuid, req.url), {
            status: 200,
            headers: {
                "content-type": "text/html",
                "set-cookie": `state=${uuid};HttpOnly;`
            },
        });
    }
   
    if(DISCOVERTAG_ROUTE.exec(req.url)) {
        const id = DISCOVERTAG_ROUTE.exec(req.url).pathname.groups.id;

        return new Response(await TagmojiTemplate(user, accessTokenValue, id), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(USER_ROUTE.exec(req.url)) {
        const id = USER_ROUTE.exec(req.url).pathname.groups.id;
        
        return new Response(await UserTemplate(user, accessTokenValue, id), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(USERPHOTOS_ROUTE.exec(req.url)) {
        const id = USERPHOTOS_ROUTE.exec(req.url).pathname.groups.id;

        return new Response(await UserTemplate(user, accessTokenValue, id, true), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    //For more info about indieAuth see: https://indieauth.spec.indieweb.org/
    if(AUTH_ROUTE.exec(req.url)) {
       
        // get state from cookie
        const stateCookie = getCookieValue(req, 'state');

        // get code + state from M.b.
        const searchParams = new URLSearchParams(req.url.split('?')[1]);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if(code && stateCookie == state) {
            const formBody = new URLSearchParams();
                formBody.append("code", code);
                formBody.append("client_id", req.url.split('?')[0].replaceAll('/auth',''));
                formBody.append("grant_type", "authorization_code");

            // request access_token
            const fetching = await fetch('https://micro.blog/indieauth/token', {
                method: "POST",
                body: formBody.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                    "Accept": "application/json"
                }
            });
            const response = await fetching.json();

            if(!response.error) {
                const accessToken = await encryptMe(response.access_token);
                const mbUser = await getMicroBlogLoggedInUser(response.access_token);
                const user = {};
                user.username = mbUser.username;
                user.name = mbUser.name;
                user.avatar = mbUser.avatar;
                user.plan = mbUser.plan;

                const kv = await Deno.openKv();
               
                const userKV = await kv.get([user.username, 'global']);
                if(userKV && !userKV.value) {
                    const starterFavs = { favorites: ['manton', 'jean', 'news', 'help'], feeds: [] };
                    console.log('kv.set AUTH_ROUTE');
                    await kv.set([user.username, 'global'], starterFavs);
                    user.lillihub = starterFavs;
                } else {   
                    user.lillihub = userKV.value;
                }

                SESSION[user.username] = user;
                const expiresOn = new Date(Date.now() + (12096e5 * 2)); // four weeks
                const page =  new Response(HTMLPage(`Redirect`, `<h3 class="container">You have been logged in. Redirecting to your timeline</h3>`, user, req.url.split('?')[0].replaceAll('/auth','')), {
                    status: 200,
                    headers: {
                        "content-type": "text/html",
                        "set-cookie": `access_token=${accessToken};SameSite=Strict;Secure;HttpOnly;Expires=${expiresOn}`
                    },
                });
                return page;
            }
        }

        // change this to an error response
        return new Response(HTMLPage(`auth`, `<h1>Authentication Error</h1>`), {
            status: 200,
            headers: {
                "content-type": "text/html",
            },
        });
    }

    if(LOGOUT_ROUTE.exec(req.url)) {
        return new Response(HTMLPage(`Logout`, `<h1>You have been logged out.</h1>`), {
            status: 200,
            headers: {
                "content-type": "text/html",
                "set-cookie": `access_token=undefined;SameSite=Strict;Secure;HttpOnly;Expires=Thu, 01 Jan 1970 00:00:00 GMT`
            },
        });
    }
   
    /********************************************************
     * Not Found Route
     ********************************************************/
    return new Response(HTMLPage(`auth`, `<h1>Sorry, we couldn't find that...</h1>`), {
        status: 200,
        headers: {
            "content-type": "text/html",
        },
    });
}

serve(handler);

/********************************************************
* Default Responses
********************************************************/
function ReturnIframeResponse(text) {
    console.log('ReturnIframeResponse',text);
    return new Response(IFramePage(`<span class="text-light">${text}</span>`), {
        status: 200,
        headers: {
            "content-type": "text/html",
        },
    });
}

function IFramePage(contentHTML) {
    return `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body {
                            background: rgba(48,55,66,1);
                            color: #fff;
                            font-family: -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;
                            font-size: .8rem;
                            overflow-x: hidden;
                            text-rendering: optimizeLegibility;
                        }
                    </style>
                </head>
                <body>
                    ${contentHTML}
                </body>
            </html>`;
}
